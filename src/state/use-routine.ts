import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { usePreferences } from './preferences';
import { restState } from './routine';

export function useRoutine() {
  const { values } = usePreferences();
  const [rest, setRest] = useState(() => restState(values, new Date()));
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(timer);
      const now = new Date();
      const next = restState(values, now);
      setRest(previous => previous.kind === next.kind && previous.end === next.end ? previous : next);
      // Scheduled times have minute precision. Immediate naps may expire
      // between minute boundaries, so wake exactly at that deadline as well.
      const nextMinute = 60000 - (now.getTime() % 60000);
      const untilNapEnds = values.napUntil && values.napUntil > now.getTime()
        ? values.napUntil - now.getTime() : Infinity;
      timer = setTimeout(refresh, Math.min(nextMinute, untilNapEnds) + 20);
    };
    refresh();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
      else clearTimeout(timer);
    });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, [values]);
  return rest;
}
