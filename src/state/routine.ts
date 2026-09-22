export type Nap = { id: string; start: number; end: number };
export type RestSchedule = { bedtime: number; morning: number; naps: Nap[]; napUntil: number | null };
export const inWindow = (minute: number, start: number, end: number) => start < end ? minute >= start && minute < end : minute >= start || minute < end;
export function napFits(nap: Nap, schedule: Pick<RestSchedule, 'bedtime' | 'morning' | 'naps'>) {
  if (nap.start === nap.end) return false;
  // Minute precision matches the time pickers; also handles windows crossing midnight.
  for (let minute = 0; minute < 1440; minute++) {
    if (inWindow(minute, nap.start, nap.end) && (inWindow(minute, schedule.bedtime, schedule.morning) || schedule.naps.some(other => other.id !== nap.id && inWindow(minute, other.start, other.end)))) return false;
  }
  return true;
}
export function restState(schedule: RestSchedule, now: Date) {
  const minute = now.getHours() * 60 + now.getMinutes();
  if (inWindow(minute, schedule.bedtime, schedule.morning)) return { kind: 'bedtime' as const, end: schedule.morning };
  // Combine an immediate nap with any daily nap it reaches, so the displayed
  // wake time never promises a break in the middle of another rest window.
  const manualEnd = new Date(schedule.napUntil ?? 0);
  let remaining = schedule.napUntil && schedule.napUntil > now.getTime()
    ? Math.max(0.001, (manualEnd.getHours() * 60 + manualEnd.getMinutes() - minute + 1440) % 1440) : 0;
  for (let pass = 0; pass <= schedule.naps.length; pass++) {
    for (const nap of schedule.naps) {
      const startsIn = inWindow(minute, nap.start, nap.end) ? 0 : (nap.start - minute + 1440) % 1440;
      if (startsIn === 0 || (remaining > 0 && startsIn <= remaining)) {
        remaining = Math.max(remaining, (nap.end - minute + 1440) % 1440);
      }
    }
  }
  if (remaining > 0) {
    const untilBedtime = (schedule.bedtime - minute + 1440) % 1440;
    return { kind: 'nap' as const, end: (minute + Math.floor(Math.min(remaining, untilBedtime))) % 1440 };
  }
  return { kind: 'awake' as const, end: schedule.bedtime };
}
