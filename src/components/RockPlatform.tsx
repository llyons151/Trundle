import { Image, StyleSheet, View } from 'react-native';

import { TRUNDLE_ASPECT, TRUNDLE_FLOOR, Trundle } from './Trundle';

const rock = require('../assets/rock-platform.png');
const ROCK_ASPECT = 1086 / 1448;
// The central landing surface is 440 pixels down in the supplied artwork.
const SURFACE_Y = 440 / 1448;

export function RockPlatform({ size }: { size: number }) {
  const mascotSize = size * 0.46;
  const feetY = mascotSize * TRUNDLE_ASPECT * (1 - TRUNDLE_FLOOR);
  const rockTop = feetY - size * SURFACE_Y;

  return (
    <View style={{ width: size, height: rockTop + size * ROCK_ASPECT }}>
      <Image
        source={rock}
        accessible={false}
        resizeMode="contain"
        style={{ position: 'absolute', top: rockTop, width: size, height: size * ROCK_ASPECT }}
      />
      <View style={[styles.mascot, { left: (size - mascotSize) / 2 }]}>
        <Trundle size={mascotSize} mode="stand" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mascot: {
    position: 'absolute',
    top: 0,
  },
});
