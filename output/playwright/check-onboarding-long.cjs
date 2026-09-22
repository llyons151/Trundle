async (page) => {
  const assert = (ok, message) => { if (!ok) throw Error(message); };
  const steps = ['welcome','goal','habit','insight','bedtime','schedule','morning-time','morning','apps','always','access','ritual','plan','review'];
  const results = [];
  for (const [width,height] of [[320,568],[375,667],[390,760],[390,844],[768,1024]]) {
    await page.setViewportSize({width,height});
    await page.evaluate(() => {
      localStorage.removeItem('trundle.onboarding.v1');
      localStorage.setItem('trundle.preferences.v1', JSON.stringify({displayName:'',bedtime:1320,morning:420,scheduled:[],always:[],naps:[],napUntil:null}));
    });
    await page.reload();
    for (const step of steps) {
      const root = page.getByTestId(`onboarding-${step}`); await root.waitFor();
      if (step === 'goal') await page.getByRole('radio',{name:'Quieter evenings',exact:true}).click();
      if (step === 'habit') await page.getByRole('radio',{name:'At bedtime',exact:true}).click();
      if (step === 'ritual') await page.getByRole('radio',{name:'Read a few pages',exact:true}).click();
      if (step === 'apps') await page.getByRole('checkbox',{name:'Instagram, bedtime list',exact:true}).click();
      if (step === 'always') await page.getByRole('checkbox',{name:'Instagram, always blocked list',exact:true}).click();
      if (step === 'morning') {
        await page.getByRole('button',{name:'Try 84 demo steps',exact:true}).click();
        await page.getByRole('button',{name:'Preview waking Trundle',exact:true}).click();
      }
      const layout = await root.evaluate(el => {
        const content = el.children[3]; const footer = el.children[4];
        return {overflowX:el.scrollWidth-el.clientWidth,overflowY:el.scrollHeight-el.clientHeight,contentOverflow:content.scrollHeight-content.clientHeight,
          footerBottom:footer.getBoundingClientRect().bottom, scrolling:[...el.querySelectorAll('*')].filter(n => ['scroll','auto'].includes(getComputedStyle(n).overflowY)&&n.scrollHeight>n.clientHeight+1).length};
      });
      assert(layout.overflowX<=1 && layout.overflowY<=1 && layout.contentOverflow<=2 && layout.scrolling===0 && layout.footerBottom<=height+1, `${width}x${height} ${step}: ${JSON.stringify(layout)}`);
      if (width===320 || (width===390 && height===844)) await page.screenshot({path:`output/playwright/long-${step}-${width}.png`});
      if (step === 'plan') assert((await root.innerText()).includes('read a few pages'), 'Personal ritual missing from plan');
      await root.locator(':scope > div').nth(4).getByRole('button').click();
    }
    await page.getByRole('button',{name:'Open your profile',exact:true}).waitFor();
    const saved = await page.evaluate(()=>JSON.parse(localStorage.getItem('trundle.onboarding.v1')));
    assert(saved.status==='completed' && saved.answers.ritual==='read', 'Completion/answers not saved');
    assert((await page.locator('body').innerText()).includes('read a few pages'), 'Ritual missing from dashboard');
    await page.reload(); await page.getByRole('button',{name:'Open your profile',exact:true}).waitFor();
    results.push(`${width}x${height}: 14 pages fit without scrolling; personalization and completion persisted`);
  }
  console.log(results.join('\n'));
}
