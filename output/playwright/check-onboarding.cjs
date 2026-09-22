async (page) => {
  const results = [];
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const base = { displayName: '', bedtime: 1320, morning: 420, scheduled: [], always: [], naps: [], napUntil: null };
  async function fresh(width, height) {
    await page.setViewportSize({ width, height });
    await page.evaluate(prefs => {
      localStorage.removeItem('trundle.onboarding.v1');
      localStorage.setItem('trundle.preferences.v1', JSON.stringify(prefs));
    }, base);
    await page.reload();
    await page.getByRole('button', { name: 'Set up our routine', exact: true }).waitFor();
  }
  async function checkPage(step, width, height) {
    const root = page.getByTestId(`onboarding-${step}`);
    await root.waitFor();
    const layout = await root.evaluate(el => {
      const content = el.children[3];
      return { height: el.getBoundingClientRect().height, viewport: innerHeight,
        overflowX: el.scrollWidth - el.clientWidth, overflowY: el.scrollHeight - el.clientHeight,
        contentOverflow: content.scrollHeight - content.clientHeight,
        scrolling: [...el.querySelectorAll('*')].filter(node => {
          const s = getComputedStyle(node);
          return ['scroll', 'auto'].includes(s.overflowY) && node.scrollHeight > node.clientHeight + 1;
        }).length };
    });
    assert(layout.overflowX <= 1 && layout.overflowY <= 1 && layout.contentOverflow <= 2 && layout.scrolling === 0, `${width}x${height} ${step}: ${JSON.stringify(layout)}`);
    const button = root.getByRole('button').filter({ hasText: /Set up our routine|Choose bedtime apps|Meet your morning|Review our routine|Save & explore the preview/ }).last();
    const box = await button.boundingBox();
    assert(box && box.y >= 0 && box.y + box.height <= height, `${step}: primary button outside viewport`);
    await page.screenshot({ path: `output/playwright/onboarding-${step}-${width}.png` });
    results.push(`${width}x${height} ${step}: fits; no scrolling`);
  }
  for (const [width, height] of [[320,568],[390,844],[768,1024]]) {
    await fresh(width, height);
    await checkPage('welcome', width, height);
    await page.getByRole('button', { name: 'Set up our routine', exact: true }).click();
    await checkPage('schedule', width, height);
    await page.getByRole('button', { name: 'Choose bedtime apps', exact: true }).click();
    await checkPage('apps', width, height);
    await page.getByRole('checkbox', { name: 'Instagram, bedtime list', exact: true }).click();
    await page.getByRole('button', { name: 'More apps', exact: true }).click();
    assert(await page.getByText('1 selected', { exact: true }).count(), 'Selection lost across app pages');
    await page.getByRole('button', { name: 'Meet your morning', exact: true }).click();
    await checkPage('morning', width, height);
    await page.getByRole('button', { name: 'Try 84 demo steps', exact: true }).click();
    await page.getByRole('button', { name: 'Preview waking Trundle', exact: true }).click();
    assert(await page.getByText('Awake. A fresh start.', { exact: true }).count(), 'Demo did not reach awake');
    await page.getByRole('button', { name: 'Review our routine', exact: true }).click();
    await checkPage('review', width, height);
    await page.getByRole('button', { name: 'Save & explore the preview', exact: true }).click();
    await page.getByRole('button', { name: 'Open your profile', exact: true }).waitFor();
    const saved = await page.evaluate(() => ({ prefs: JSON.parse(localStorage.getItem('trundle.preferences.v1')), setup: JSON.parse(localStorage.getItem('trundle.onboarding.v1')) }));
    assert(saved.setup.status === 'completed' && saved.prefs.scheduled.includes('instagram'), 'Completion not saved');
    assert(!('steps' in saved.prefs), 'Demo steps leaked into preferences');
    await page.reload();
    await page.getByRole('button', { name: 'Open your profile', exact: true }).waitFor();
    results.push(`${width}: completion survives reload; demo isolated`);
  }
  console.log(JSON.stringify(results, null, 2));
}
