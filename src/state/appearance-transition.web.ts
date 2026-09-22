const STYLE_ID = 'trundle-appearance-transition';
let transitionGeneration = 0;

export function beginAppearanceTransition(duration: number): () => void {
  const generation = ++transitionGeneration;
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    // Limit this to colors. Orbit transforms, scrolling, and press feedback keep
    // their own timing; no transition: all or per-frame stylesheet generation.
    style.textContent = `
      html[data-trundle-appearance-transition] #root,
      html[data-trundle-appearance-transition] #root * {
        transition-property: color, background-color, border-color, fill, stroke, stop-color;
        transition-duration: var(--trundle-appearance-duration);
        transition-timing-function: ease-in-out;
      }
      @media (prefers-reduced-motion: reduce) {
        html[data-trundle-appearance-transition] #root,
        html[data-trundle-appearance-transition] #root * { transition-duration: 0s; }
      }
    `;
    document.head.appendChild(style);
  }
  document.documentElement.style.setProperty('--trundle-appearance-duration', `${duration}ms`);
  document.documentElement.setAttribute('data-trundle-appearance-transition', '');
  return () => {
    // CSS starts when the browser paints React's commit, slightly after the
    // store's timer starts. Let those transitions finish before removing their
    // rules; cancelling them early can leave a stale composited background.
    const transitions = document.getAnimations().filter(animation => animation instanceof CSSTransition);
    void Promise.allSettled(transitions.map(animation => animation.finished)).then(() => {
      if (generation !== transitionGeneration) return;
      document.documentElement.removeAttribute('data-trundle-appearance-transition');
      document.documentElement.style.removeProperty('--trundle-appearance-duration');
    });
  };
}
