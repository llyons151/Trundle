// Native palettes are interpolated by the theme store. Metro selects the CSS
// implementation on web so browser animation never needs per-frame React renders.
export function beginAppearanceTransition(_duration: number): () => void {
  return () => {};
}
