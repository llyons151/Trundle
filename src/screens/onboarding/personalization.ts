import type { SetupAnswers } from '../../state/onboarding-model';

export const goalLabels = { rest: 'Quieter evenings', morning: 'Less scrolling in the morning', present: 'More time for myself' };
export const ritualLabels = { read: 'Read a few pages', stretch: 'Have a gentle stretch', quiet: 'Enjoy a quiet moment' };
export const habitLabels = { bedtime: 'At bedtime', morning: 'First thing in the morning', both: 'At both ends of the day' };
export function personalInsight(answers: SetupAnswers) {
  if (answers.habit === 'bedtime') return { title: 'Give the evening\na stopping point.', body: 'One more video can turn into a later night. A bedtime for your apps gives you a place to pause.', detail: 'You choose when the day winds down.' };
  if (answers.habit === 'morning') return { title: 'Start with yourself.\nThe feed can wait.', body: 'When the phone is the first thing you reach for, a small morning ritual offers another place to begin.', detail: 'Get moving before opening your bedtime apps.' };
  return { title: 'A quieter ending.\nA gentler beginning.', body: 'Give scrolling a boundary at night and yourself a little space in the morning.', detail: 'One daily rhythm, with room for real life.' };
}
export function ritualCue(answers: SetupAnswers) {
  const activity = answers.ritual === 'read' ? 'read a few pages' : answers.ritual === 'stretch' ? 'have a gentle stretch' : answers.ritual === 'quiet' ? 'enjoy a quiet moment' : 'take a moment for myself';
  return `When Trundle goes to bed, I’ll put my phone down and ${activity}.`;
}
