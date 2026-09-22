import { useEffect, useRef, useState } from 'react';
import { BackHandler } from 'react-native';
import { onboarding, useOnboarding } from '../../state/onboarding';
import { ONBOARDING_STEPS, type OnboardingStep } from '../../state/onboarding-model';
import { formatTime, savePreferences, usePreferences } from '../../state/preferences';
import { napFits } from '../../state/routine';
import { OnboardingLayout } from './components/onboarding-layout';
import { WelcomeScreen } from './welcome-screen';
import { ScheduleScreen } from './schedule-screen';
import { SelectAppsScreen } from './select-apps-screen';
import { MorningWalkScreen } from './morning-walk-screen';
import { ReadyScreen } from './ready-screen';
import { QuestionScreen } from './question-screen';
import { StoryScreen } from './story-screen';
import { AlwaysScreen } from './always-screen';
import { PlanScreen } from './plan-screen';
import { personalInsight } from './personalization';

const copy = {
  welcome: { title: 'A little less scrolling.\nA little more living.', description: 'Meet Trundle. A little companion for quieter nights and mornings.', action: 'Find our rhythm' },
  goal: { title: 'What would you like\nmore room for?', description: 'Choose what matters most. We’ll keep it at the heart of your plan.', action: 'Continue' },
  habit: { title: 'When does scrolling\npull you in?', description: 'Think about the moment you’d most like to change.', action: 'Continue' },
  insight: { title: 'Make a little space.', description: 'Let’s start with the moments you chose.', action: 'Meet your bedtime' },
  bedtime: { title: 'A bedtime for him.\nA pause for you.', description: 'A stopping point you choose ahead of time.', action: 'Choose our bedtime' },
  schedule: { title: 'When shall we\nwind down?', description: 'Bedtime starts the overnight block, every day.', action: 'Set our morning' },
  'morning-time': { title: 'When does your\nmorning begin?', description: 'This starts step counting. It isn’t an alarm or an automatic unlock.', action: 'Meet your morning' },
  morning: { title: 'Small steps.\nA fresh start.', description: 'A 200-step good morning for you and Trundle.', action: 'Choose bedtime apps' },
  apps: { title: 'What can wait\nuntil morning?', description: 'These apps rest at bedtime and during naps.', action: 'Continue' },
  always: { title: 'Anything you’d like\nto keep off limits?', description: 'Optional. A separate list for any time of day.', action: 'Continue' },
  access: { title: 'Your choices.\nYour control.', description: 'Here’s what the full routine will need.', action: 'Build my evening ritual' },
  ritual: { title: 'What could you do\ninstead of scrolling?', description: 'Choose a small thing to try when Trundle goes to bed.', action: 'See my plan' },
  plan: { title: 'This is your\nlittle daily rhythm.', description: 'Built from your choices. Yours to change.', action: 'Review the details' },
  review: { title: 'Ready for a\nquieter routine?', description: 'Check your choices before saving.', action: 'Save & explore the preview' },
} satisfies Record<OnboardingStep, { title: string; description: string; action: string }>;

export function OnboardingFlow() {
  const { record, busy, error, saving } = useOnboarding();
  const preferences = usePreferences();
  const [returnStep, setReturnStep] = useState<OnboardingStep | null>(null);
  const retryAction = useRef<() => void>(() => { void onboarding.flush(); });
  const step = record?.step ?? 'welcome';
  const index = ONBOARDING_STEPS.indexOf(step);
  const goBack = () => {
    if (busy) return;
    retryAction.current = goBack;
    if (returnStep) { void onboarding.goTo(returnStep).then(ok => { if (ok) setReturnStep(null); }); }
    else if (index > 0) void onboarding.goTo(ONBOARDING_STEPS[index - 1]);
  };
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (busy) return true;
      if (index === 0) return false;
      goBack();
      return true;
    });
    return () => subscription.remove();
  });
  if (!record) return null;
  const { draft, answers = {} } = record;
  const insight = personalInsight(answers);
  const proposed = { ...preferences.values, ...draft };
  const validation = draft.bedtime === draft.morning ? 'Choose different bedtime and morning times.'
    : proposed.naps.some(nap => !napFits(nap, proposed)) ? 'These times overlap a saved nap. Adjust the times, or explore first to edit your naps in Routine.' : '';
  const next = async () => {
    retryAction.current = () => { void next(); };
    if (step === 'review') { await onboarding.complete(savePreferences); return; }
    if (returnStep) { if (await onboarding.goTo(returnStep)) setReturnStep(null); }
    else await onboarding.goTo(ONBOARDING_STEPS[index + 1]);
  };
  const edit = async (target: OnboardingStep) => { const origin = step; retryAction.current = () => { void edit(target); }; if (await onboarding.goTo(target)) setReturnStep(origin); };
  const explore = () => { retryAction.current = explore; void onboarding.defer(); };

  return <OnboardingLayout key={step} step={step} {...copy[step]}
    title={step === 'insight' ? insight.title : copy[step].title}
    description={step === 'morning' ? `Walk 200 steps from ${formatTime(draft.morning)} to wake him.` : step === 'insight' && !answers.habit ? 'A daily rhythm you can make your own.' : copy[step].description}
    action={returnStep ? (returnStep === 'plan' ? 'Back to my plan' : 'Back to review') : ['goal', 'habit', 'ritual'].includes(step) && !answers[step as keyof typeof answers] ? 'Choose later' : step === 'always' && draft.always.length === 0 ? 'Keep this list empty' : copy[step].action}
    onContinue={() => { void next(); }} onBack={index > 0 ? goBack : undefined}
    onExplore={explore} busy={busy}
    disabled={(step === 'schedule' || step === 'morning-time' || step === 'review') && !!validation}
    saving={saving} error={[error, step === 'review' && error ? preferences.error : ''].filter(Boolean).join(' ')} onRetry={() => { if (onboarding.getSnapshot().dirty) void onboarding.flush(); else retryAction.current(); }}>
    {step === 'welcome' && <WelcomeScreen />}
    {(step === 'schedule' || step === 'morning-time') && <ScheduleScreen field={step === 'schedule' ? 'bedtime' : 'morning'} draft={draft} onChange={onboarding.updateDraft} disabled={busy} validation={validation} />}
    {(step === 'goal' || step === 'habit' || step === 'ritual') && <QuestionScreen field={step} answers={answers} onChange={onboarding.updateAnswers} disabled={busy} />}
    {step === 'insight' && <StoryScreen body={insight.body} detail={insight.detail} sleeping={answers.habit === 'bedtime'} />}
    {step === 'bedtime' && <StoryScreen sleeping icon="moon" body="At bedtime, Trundle settles in and your chosen apps take a break. The rest of your phone stays available." detail="Bedtime apps stay blocked until your morning walk is complete." />}
    {step === 'always' && <AlwaysScreen draft={draft} onChange={onboarding.updateDraft} disabled={busy} />}
    {step === 'access' && <StoryScreen icon="shield" body="Screen Time access will allow app blocking. Motion access will allow morning step counting." detail="This preview asks for neither. Your choices are saved locally; nothing is blocked." />}
    {step === 'plan' && <PlanScreen answers={answers} draft={draft} disabled={busy} onEdit={target => { void edit(target); }} />}
    {step === 'apps' && <SelectAppsScreen draft={draft} onChange={onboarding.updateDraft} disabled={busy} />}
    {step === 'morning' && <MorningWalkScreen morning={draft.morning} disabled={busy} />}
    {step === 'review' && <ReadyScreen draft={draft} disabled={busy} onEdit={target => { void edit(target); }} validation={validation} />}
  </OnboardingLayout>;
}
