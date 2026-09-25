import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

/**
 * Every onboarding screen sits under the same night sky: blue light from the
 * top-right corner, seen through frosted glass and fading to black. The blur and
 * frost are baked into the image so the bottom stays true black. The moon itself
 * is a separate layer (below) so it can move.
 */
const MOON_TOP = 64;

/** Legacy spacing for "featured" screens: their content starts this far down. */
export const moonSize = (width: number) => Math.min(width * 0.52, 260);

/** Where featured screens start their content, clear of the light at the top. */
export const moonBottom = (width: number) => MOON_TOP + moonSize(width);

/**
 * The sky image's pixel size, and where its moon sat before it was painted out
 * (measured from its edge). The moon is now its own layer at that spot, so the opener's
 * moon and the corner moon are the same image.
 */
const SKY = { width: 590, height: 1278 };
const BAKED_MOON = { cx: 624, cy: -40, r: 217 };

/** How long the moon takes to move between the opener and its resting place. */
export const FLIGHT_MS = 1400;

/**
 * Where the moon rests after the opener. Being auditioned:
 * - 'top': tucked into the top-right corner, where the sky's light comes from.
 * - 'bottom': rising out of the bottom of the screen with a glow around it (the user asked
 *   for this glow), under a sky flipped so its light comes from below.
 */
const MOON_REST: 'top' | 'bottom' = 'bottom';

/** moon-glow.png: the moon's disc is half the image's width, with its glow around it. */
const GLOW_PAD = 2;

/**
 * moon-frosted.png is moon.webp recoloured to the sky's moon and lightly blurred, with
 * room around it for the blur: the moon's disc is 2/3 of the image's width.
 */
const FROST_PAD = 1.5;

/** Where the baked moon lands on screen, given the image is cover-fit to the top right. */
function bakedMoon(width: number, height: number) {
  const scale = Math.max(width / SKY.width, height / SKY.height);
  const r = BAKED_MOON.r * scale;
  return {
    left: width - (SKY.width - BAKED_MOON.cx) * scale - r,
    top: BAKED_MOON.cy * scale - r,
    size: r * 2,
  };
}

/** Rising out of the bottom: centred, with the top part of the disc showing. */
function risingMoon(width: number, height: number) {
  const size = width * 0.9;
  return { left: (width - size) / 2, top: height - size * 0.36, size };
}

/**
 * raccoon-back.png: his silhouette sitting with his back to us, small and centred in the
 * bottom of the moon, softened to sit behind the same frost. He rides the moon, so when
 * it settles low he drops off-screen with it. Placement is in moon diameters from the
 * disc's top-left corner.
 */
const RACCOON = { x: 0.3872, y: 0.7953, w: 0.181, h: 0.2024 };

/** The opener's moon: big, centred in the upper part of the screen, above the text. */
function heroMoon(width: number, height: number) {
  const size = Math.min(width * 0.72, height * 0.34);
  return { left: (width - size) / 2, top: height * 0.32 - size / 2, size };
}

/**
 * One sky and one moon for all of onboarding. On the opener the moon is big and centred;
 * when the user moves on it flies to its resting place (MOON_REST), resizing as it
 * goes, and stays there for every later screen. Going back to the opener plays it in reverse.
 */
export function NightSky({ opening = false }: { opening?: boolean }) {
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();
  // 0 = the opener's big moon, 1 = settled into the sky.
  const progress = useSharedValue(opening ? 0 : 1);

  useEffect(() => {
    const target = opening ? 0 : 1;
    progress.value = reduced
      ? target
      : withTiming(target, { duration: FLIGHT_MS, easing: Easing.bezier(0.65, 0, 0.35, 1) });
  }, [opening, reduced, progress]);

  const from = heroMoon(width, height);
  const to = MOON_REST === 'bottom' ? risingMoon(width, height) : bakedMoon(width, height);

  const moonStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const size = interpolate(p, [0, 1], [from.size, to.size]);
    const inset = (size * (FROST_PAD - 1)) / 2;
    return {
      left: interpolate(p, [0, 1], [from.left, to.left]) - inset,
      top: interpolate(p, [0, 1], [from.top, to.top]) - inset,
      width: size * FROST_PAD,
      height: size * FROST_PAD,
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const size = interpolate(p, [0, 1], [from.size, to.size]);
    const inset = (size * (GLOW_PAD - 1)) / 2;
    return {
      left: interpolate(p, [0, 1], [from.left, to.left]) - inset,
      top: interpolate(p, [0, 1], [from.top, to.top]) - inset,
      width: size * GLOW_PAD,
      height: size * GLOW_PAD,
      opacity: p,
    };
  });

  // He rides the moon everywhere it goes, scaling with it.
  const raccoonStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const size = interpolate(p, [0, 1], [from.size, to.size]);
    return {
      left: interpolate(p, [0, 1], [from.left, to.left]) + RACCOON.x * size,
      top: interpolate(p, [0, 1], [from.top, to.top]) + RACCOON.y * size,
      width: RACCOON.w * size,
      height: RACCOON.h * size,
    };
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image
        source={require('../../../assets/onboarding/night-sky-moonless.png')}
        style={[StyleSheet.absoluteFill, MOON_REST === 'bottom' && styles.flipped]}
        contentFit="cover"
        contentPosition="top right"
        accessible={false}
      />
      {MOON_REST === 'bottom' ? (
        <Animated.View style={[styles.moon, glowStyle]}>
          <Image
            source={require('../../../assets/onboarding/moon-glow.png')}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            accessible={false}
          />
        </Animated.View>
      ) : null}
      <Animated.View style={[styles.moon, moonStyle]}>
        <Image
          source={require('../../../assets/onboarding/moon-frosted.png')}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          accessible={false}
        />
      </Animated.View>
      <Animated.View style={[styles.moon, raccoonStyle]}>
        <Image
          source={require('../../../assets/onboarding/raccoon-back.png')}
          style={StyleSheet.absoluteFill}
          contentFit="contain"
          accessible={false}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  moon: { position: 'absolute' },
  flipped: { transform: [{ scaleY: -1 }] },
});
