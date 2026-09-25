import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useReducedMotion } from 'react-native-reanimated';

import { Nocturne } from '@/constants/nocturne';

import * as haptic from './haptics';

/** How long the whole grid takes to fill, regardless of size. */
const FILL_MS = 1800;
/** Smallest square that still reads as a square on a phone. */
export const MIN_SQUARE = 7;
const MAX_SQUARE = 28;

const popIn = {
  from: { opacity: 0, transform: [{ scale: 0.2 }] },
  '60%': { opacity: 1, transform: [{ scale: 1.12 }] },
  to: { opacity: 1, transform: [{ scale: 1 }] },
};

export type GridFit = { size: number; gap: number; columns: number; rows: number };

/**
 * The biggest square size that fits `count` squares in `width` × `height`,
 * or null if even MIN_SQUARE squares would clip.
 */
export function fitSquares(count: number, width: number, height: number): GridFit | null {
  if (count <= 0 || width <= 0 || height <= 0) return null;
  for (let size = MAX_SQUARE; size >= MIN_SQUARE; size -= 1) {
    const gap = Math.max(2, Math.round(size * 0.25));
    const columns = Math.min(count, Math.floor((width + gap) / (size + gap)));
    if (columns < 1) continue;
    const rows = Math.ceil(count / columns);
    if (rows * size + (rows - 1) * gap <= height) return { size, gap, columns, rows };
  }
  return null;
}

type Props = {
  squares: number;
  fit: GridFit;
  startDelay?: number;
  onFilled?: () => void;
};

/**
 * One square per hour or per day on the phone in bed over a year, sized by `fitSquares`.
 * Squares pop in row by row with a light tick per row, then a final thud.
 * Each square runs a native CSS animation, so no per-frame JS work.
 */
export function RevealGrid({ squares, fit, startDelay = 0, onFilled }: Props) {
  const reduced = useReducedMotion();
  const { size, gap, columns, rows } = fit;

  useEffect(() => {
    if (squares === 0) {
      onFilled?.();
      return;
    }
    if (reduced) {
      const id = setTimeout(() => {
        haptic.thud();
        onFilled?.();
      }, startDelay);
      return () => clearTimeout(id);
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Cap the ticks so a tall grid of tiny squares doesn't buzz nonstop.
    const ticks = Math.min(rows, 12);
    const perTick = FILL_MS / ticks;
    for (let tick = 0; tick < ticks; tick += 1) {
      timers.push(setTimeout(haptic.tick, startDelay + tick * perTick));
    }
    timers.push(
      setTimeout(() => {
        haptic.thud();
        onFilled?.();
      }, startDelay + FILL_MS + 250),
    );
    return () => timers.forEach(clearTimeout);
    // onFilled is intentionally excluded: the animation should run once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squares, rows, startDelay, reduced]);

  return (
    <View
      style={[
        styles.grid,
        { width: columns * size + (columns - 1) * gap, height: rows * size + (rows - 1) * gap },
      ]}
      accessible
      accessibilityLabel={`${squares} squares`}
    >
      <Squares count={squares} fit={fit} startDelay={startDelay} animate={!reduced} />
    </View>
  );
}

const Squares = memo(function Squares({
  count,
  fit,
  startDelay,
  animate,
}: {
  count: number;
  fit: GridFit;
  startDelay: number;
  animate: boolean;
}) {
  const { size, gap, columns } = fit;
  const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  const radius = Math.max(2, Math.round(size * 0.22));
  return (
    <>
      {items.map((i) => (
        <Animated.View
          key={i}
          style={[
            {
              width: size,
              height: size,
              borderRadius: radius,
              backgroundColor: Nocturne.square,
              marginRight: (i + 1) % columns === 0 ? 0 : gap,
              marginBottom: gap,
            },
            animate && {
              animationName: popIn,
              animationDuration: '420ms',
              animationDelay: `${Math.round(startDelay + (i * FILL_MS) / count)}ms`,
              animationFillMode: 'both',
              animationTimingFunction: 'ease-out',
            },
          ]}
        />
      ))}
    </>
  );
});

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignContent: 'flex-start', alignSelf: 'center', overflow: 'visible' },
});
