async (page) => {
  await page.setViewportSize({width:320,height:568});
  await page.evaluate(()=>{
    const record=JSON.parse(localStorage.getItem('trundle.onboarding.v1'));
    record.status='completed';record.answers={goal:'rest',habit:'both',ritual:'read'};
    localStorage.setItem('trundle.onboarding.v1',JSON.stringify(record));
  });
  await page.reload();
  await page.getByRole('button',{name:'Edit evening ritual',exact:true}).click();
  await page.getByTestId('onboarding-ritual').waitFor();
  await page.getByRole('radio',{name:'Enjoy a quiet moment',exact:true}).click();
  await page.getByRole('button',{name:'See my plan',exact:true}).click();
  await page.getByRole('button',{name:'Review the details',exact:true}).click();
  await page.getByRole('button',{name:'Save & explore the preview',exact:true}).click();
  const ritual=page.getByRole('button',{name:'Edit evening ritual',exact:true});await ritual.waitFor();
  if(!(await ritual.innerText()).includes('enjoy a quiet moment')) throw Error('Home did not show the edited ritual');
  return 'Home ritual editing reopens at step 12, retains the routine, and saves back to Home';
}
