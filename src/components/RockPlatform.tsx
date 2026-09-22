import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BundledImage } from './BundledImage';

import { TRUNDLE_ASPECT, TRUNDLE_FLOOR, Trundle } from './Trundle';

const rock = require('../assets/rock-platform.png');
const ROCK_ASPECT = 1086 / 1448;
// The central landing surface is 440 pixels down in the supplied artwork.
const SURFACE_Y = 440 / 1448;

export const RockPlatform = memo(function RockPlatform({ size, active = true, sleeping = false }: { size: number; active?: boolean; sleeping?: boolean }) {
  const mascotSize = size * 0.46;
  const feetY = mascotSize * TRUNDLE_ASPECT * (1 - TRUNDLE_FLOOR);
  const rockTop = feetY - size * SURFACE_Y;

  return (
    <View style={{ width: size, height: rockTop + size * ROCK_ASPECT }}>
      <BundledImage
        source={rock}
        accessible={false}
        contentFit="contain"
        style={{ position: 'absolute', top: rockTop, width: size, height: size * ROCK_ASPECT }}
      />
      <View style={[styles.mascot, { left: (size - mascotSize) / 2 }]}>
        <Trundle size={mascotSize} mode={sleeping ? "rest" : "stand"} sleeping={sleeping} active={active} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  mascot: {
    position: 'absolute',
    top: 0,
  },
});
