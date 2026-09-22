import { useEffect, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';

/** Live system preferences, with a still first frame until motion is allowed. */
export function useAccessibilityMotion() {
  const [reduceMotion, setReduceMotion] = useState(true);
  const [isAppActive, setIsAppActive] = useState(AppState.currentState === 'active');

  useEffect(() => {
    let mounted = true;
    let receivedChange = false;
    const motionSubscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => {
      receivedChange = true;
      setReduceMotion(value);
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(value => {
      if (mounted && !receivedChange) setReduceMotion(value);
    }).catch(() => { /* Keep the still pose if the preference cannot be read. */ });
    const appSubscription = AppState.addEventListener('change', value => {
      setIsAppActive(value === 'active');
    });
    setIsAppActive(AppState.currentState === 'active');
    return () => {
      mounted = false;
      motionSubscription?.remove();
      appSubscription.remove();
    };
  }, []);

  return { reduceMotion, isAppActive };
}
