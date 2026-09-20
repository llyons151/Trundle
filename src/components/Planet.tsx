import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Polygon, RadialGradient, Stop } from 'react-native-svg';

import { colors } from '../theme';
import { STAND_UP_MS, TRUNDLE_ASPECT, TRUNDLE_FLOOR, Trundle } from './Trundle';

// How far his feet sink into the planet's edge, as a share of the planet's size, so he
// reads as standing on the surface rather than balanced on the tangent point.
const SINK = 0.03;
// His step rate is derived from this, so it sets how brisk the walk feels.
const SECONDS_PER_TURN = 12;

// Low-poly continents in a 200x200 box, faceted like Trundle's own body: a base
// shape plus one lit and one shaded facet each.
const LAND: { points: string; fill: string }[] = [
  { points: '28,62 44,40 66,30 90,34 104,50 98,72 80,84 70,100 48,98 32,84', fill: colors.planetLand },
  { points: '44,40 66,30 70,56', fill: colors.planetLandLit },
  { points: '28,62 44,40 50,70', fill: colors.planetLandLit },
  { points: '80,84 98,72 104,50 86,62', fill: colors.planetLandShade },
  { points: '48,98 70,100 66,82', fill: colors.planetLandShade },
  { points: '122,44 146,36 170,50 184,78 180,108 160,122 138,116 126,96 132,74 118,60', fill: colors.planetLand },
  { points: '122,44 146,36 142,62', fill: colors.planetLandLit },
  { points: '146,36 170,50 158,70', fill: colors.planetLandLit },
  { points: '160,122 180,108 166,94', fill: colors.planetLandShade },
  { points: '138,116 160,122 150,100', fill: colors.planetLandShade },
  { points: '60,128 84,120 108,126 124,146 116,170 92,184 66,176 52,154', fill: colors.planetLand },
  { points: '60,128 84,120 80,146', fill: colors.planetLandLit },
  { points: '84,120 108,126 100,148', fill: colors.planetLandLit },
  { points: '92,184 116,170 100,160', fill: colors.planetLandShade },
  { points: '66,176 92,184 84,164', fill: colors.planetLandShade },
  { points: '150,146 164,142 170,156 156,164', fill: colors.planetLand },
  { points: '20,118 32,112 38,126 26,134', fill: colors.planetLand },
  { points: '100,8 118,12 112,26 96,22', fill: colors.planetLand },
];

const SEA_FACETS = [
  '104,50 122,44 118,60 132,74 110,84',
  '70,100 80,84 110,84 108,126 84,120',
  '124,146 138,116 160,122 150,146',
];

type Props = {
  size: number;
  // False while the user is on a blocked app: he sits down and the world stops turning.
  moving?: boolean;
};

// The world Trundle walks around. The surface spins under him like a wheel while the
// light stays put, which is what sells it as a lit sphere instead of a flat disc.
export function Planet({ size, moving = true }: Props) {
  const mascotSize = size * 0.68;
  const mascotHeight = mascotSize * TRUNDLE_ASPECT;
  const planetTop = mascotHeight * (1 - TRUNDLE_FLOOR) - size * SINK;
  // Speed of the surface where he's standing, in points per second.
  const groundSpeed = (Math.PI * size) / SECONDS_PER_TURN;
  const turn = useSharedValue(0);

  useEffect(() => {
    if (!moving) {
      cancelAnimation(turn);
      return;
    }
    // He travels right, so the ground under him moves left. It waits for him to get
    // to his feet first.
    turn.value = withDelay(
      STAND_UP_MS,
      withRepeat(
        withTiming(turn.value - 360, {
          duration: SECONDS_PER_TURN * 1000,
          easing: Easing.linear,
        }),
        -1,
      ),
    );
    return () => cancelAnimation(turn);
  }, [moving, turn]);

  const surfaceStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${turn.value}deg` }],
  }));

  return (
    <View style={{ width: size, height: planetTop + size }}>
      <View
        style={[
          styles.disc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            top: planetTop,
          },
        ]}
      >
        <Animated.View style={[StyleSheet.absoluteFill, surfaceStyle]}>
          <Svg width={size} height={size} viewBox="0 0 200 200">
            {SEA_FACETS.map((points) => (
              <Polygon key={points} points={points} fill={colors.planetSeaLit} />
            ))}
            {LAND.map(({ points, fill }) => (
              <Polygon key={points} points={points} fill={fill} />
            ))}
          </Svg>
        </Animated.View>

        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="shade" cx="32%" cy="28%" r="85%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.2} />
              <Stop offset="0.45" stopColor="#000000" stopOpacity={0} />
              <Stop offset="1" stopColor="#000000" stopOpacity={0.72} />
            </RadialGradient>
          </Defs>
          <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#shade)" />
        </Svg>
      </View>

      <View style={{ position: 'absolute', left: (size - mascotSize) / 2, top: 0 }}>
        <Trundle size={mascotSize} mode={moving ? 'walk' : 'rest'} groundSpeed={groundSpeed} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  disc: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: colors.planetSea,
  },
});
