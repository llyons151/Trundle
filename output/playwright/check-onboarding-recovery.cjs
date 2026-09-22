async (page) => {
  const results = [];
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const base = { displayName: 'Test', bedtime: 1320, morning: 420, scheduled: [], always: [], naps: [], napUntil: null };
  const button = name => page.getByRole('button', { name, exact: true });
  async function fresh() {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(prefs => { localStorage.removeItem('trundle.onboarding.v1'); localStorage.setItem('trundle.preferences.v1', JSON.stringify(prefs)); }, base);
    await page.reload(); await button('Set up our routine').click();
  }
  async function panelFits(label) {
    const dialog = page.getByRole('dialog'); await dialog.waitFor();
    await dialog.evaluate(async el => { await Promise.all(el.getAnimations({ subtree: true }).map(animation => animation.finished.catch(() => {}))); });
    const measurements = await dialog.evaluate(el => { const body = el.lastElementChild; return { h: el.getBoundingClientRect().height, scroll: body.scrollHeight - body.clientHeight, w: body.scrollWidth - body.clientWidth }; });
    assert(measurements.h <= 568 && measurements.scroll <= 2 && measurements.w <= 2, `${label} panel overflow ${JSON.stringify(measurements)}`);
  }
  await fresh();
  await button('Edit bedtime, 10:00 PM').click();
  await panelFits('time picker');
  await page.getByRole('combobox').first().selectOption('7');
  await button('Done').click();
  assert(await button('Choose bedtime apps').isDisabled(), 'Equal times were accepted');
  await button('Edit bedtime, 7:00 AM').click();
  await page.getByRole('combobox').first().selectOption('23');
  await button('Done').click();
  await button('Choose bedtime apps').click();
  await page.getByRole('checkbox', { name: 'Instagram, bedtime list', exact: true }).click();
  await button('Always-blocked list & access').click();
  await panelFits('options');
  await button('Always-blocked list (optional) · 0').click();
  await panelFits('always blocked');
  await page.getByRole('checkbox', { name: 'Instagram, always blocked list', exact: true }).click();
  await button('More apps').click();
  await page.getByRole('checkbox', { name: 'YouTube, always blocked list', exact: true }).click();
  await button('Done').click();
  await page.reload();
  await page.getByRole('checkbox', { name: 'Instagram, bedtime list', exact: true }).waitFor();
  assert(await page.getByRole('checkbox', { name: 'Instagram, bedtime list', exact: true }).getAttribute('aria-checked') === 'true', 'Draft lost on reload');
  results.push('time editing; equal-time validation; optional always-blocked pages; draft reload');
  await button('Meet your morning').click();
  await button('How it works & walking alternatives').click();
  await panelFits('morning explanation');
  await button('What if walking doesn’t work for me?').click();
  await panelFits('walking alternatives');
  await button('Keep exploring').click();
  await button('Review our routine').click();
  await page.getByRole('button', { name: /^Edit bedtime\. / }).click();
  await button('Edit bedtime, 11:00 PM').click();
  await page.getByRole('combobox').first().selectOption('22');
  await button('Done').click();
  await button('Back to review').click();
  await page.getByTestId('onboarding-review').waitFor();
  results.push('morning panels fit; review edits return directly to review');
  // Inject a real browser-storage failure, then recover through the visible action.
  await page.evaluate(() => {
    window.__onboardingOriginalSet = Storage.prototype.setItem;
    window.__failOnboarding = true;
    Storage.prototype.setItem = function(key, value) {
      if (window.__failOnboarding && key === 'trundle.onboarding.v1') throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return window.__onboardingOriginalSet.call(this, key, value);
    };
  });
  await button('Save & explore the preview').click();
  await button('Retry saving').waitFor(); await panelFits('save error');
  assert(await page.getByTestId('onboarding-review').count(), 'Failed marker incorrectly exited onboarding');
  await page.evaluate(() => { window.__failOnboarding = false; });
  await button('Retry saving').click();
  await button('Open your profile').waitFor();
  let prefs = await page.evaluate(() => JSON.parse(localStorage.getItem('trundle.preferences.v1')));
  assert(prefs.always.includes('instagram') && prefs.always.includes('youtube') && prefs.scheduled.includes('instagram'), 'Lists were merged or lost');
  results.push('failed completion stays on review; retry succeeds; both app lists remain independent');
  await button('Open your profile').click();
  await button('Replay onboarding').click();
  await button('Set up our routine').waitFor();
  prefs = await page.evaluate(() => JSON.parse(localStorage.getItem('trundle.preferences.v1')));
  assert(prefs.always.includes('youtube'), 'Replay erased saved preferences');
  await button('Set up our routine').click();
  await button('Explore first').click();
  await button('Continue setting up our routine').waitFor();
  await page.reload();
  await button('Continue setting up our routine').click();
  await page.getByTestId('onboarding-schedule').waitFor();
  results.push('development replay preserves preferences; explore/resume survives reload');
  // Failed optimistic draft write must retain the checked control and recover.
  await button('Choose bedtime apps').click();
  await page.evaluate(() => {
    window.__onboardingOriginalSet = Storage.prototype.setItem;
    window.__failOnboarding = true;
    Storage.prototype.setItem = function(key, value) {
      if (window.__failOnboarding && key === 'trundle.onboarding.v1') throw new Error('Storage unavailable');
      return window.__onboardingOriginalSet.call(this, key, value);
    };
  });
  await page.getByRole('checkbox', { name: 'TikTok, bedtime list', exact: true }).click();
  await button('Retry saving').waitFor();
  await page.evaluate(() => { window.__failOnboarding = false; });
  await button('Retry saving').click();
  await button('Meet your morning').waitFor();
  await page.reload();
  assert(await page.getByRole('checkbox', { name: 'TikTok, bedtime list', exact: true }).getAttribute('aria-checked') === 'true', 'Retried draft not saved');
  results.push('failed selection save keeps draft; visible retry persists it');
  // Corrupted onboarding recovery never clears committed preferences.
  await page.evaluate(() => localStorage.setItem('trundle.onboarding.v1', '{'));
  await page.reload();
  await button('Start setup again').click();
  await button('Set up our routine').waitFor();
  prefs = await page.evaluate(() => JSON.parse(localStorage.getItem('trundle.preferences.v1')));
  assert(prefs.displayName === 'Test' && prefs.always.includes('youtube'), 'Corruption recovery cleared preferences');
  results.push('corrupted progress recovery preserves committed settings');
  return results;
}
