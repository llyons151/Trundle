import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse, Path, Polygon } from 'react-native-svg';

// Trundle is a puppet, not a film strip: one body image plus two jointed legs, posed
// every frame from a few numbers. The body is pixel-identical in every frame, so
// nothing can shimmer, and the feet are solved against the ground, so they don't slide.
const body = require('../../assets/mascot/trundle-body.png');

// Everything below is in the pixel space of trundle-body.png.
const IMG_W = 1346;
const IMG_H = 1169;
const BODY_BOTTOM = 1150;

const HIP_Y = 1075;
const HIP_DX = 150;
const THIGH = 125;
const SHIN = 166;
const LEG = THIGH + SHIN;
// Hip height when he's sat on the ground with his legs tucked up behind him.
const TUCKED = BODY_BOTTOM - HIP_Y;
const GROUND_Y = HIP_Y + LEG;
const FLOOR_PAD = 14;
const BOX_H = GROUND_Y + FLOOR_PAD;

// Half a stride: how far in front of and behind the hip each foot lands.
const STRIDE = LEG * Math.sin((24 * Math.PI) / 180);
const KNEE_BEND = 58;
const HIP_LIFT = 14;

const THIGH_BOX = { w: 200, h: 185, pivotX: 100, pivotY: 28 };
const SHIN_BOX = { w: 270, h: 220, pivotX: 100, pivotY: 24 };

// Shoulders sit just inside his outline at his widest point, so the joint is hidden.
const SHOULDER_Y = 800;
const SHOULDER_DX = 437;
const ARM_BOX = { w: 180, h: 290, pivotX: 90, pivotY: 26 };
// The arm art is drawn at the legs' scale, then sized up so the fists read at a glance.
const ARM_SCALE = 1.3;
const ARM_HANG = 38;
const ARM_SWING = 15;

const EYE_CX = 667;
const EYE_CY = 765;
const EYE_GAP = 125;
const EYE_RX = 30;
const EYE_RY = 44;
const MOUTH = 'M 629 850 Q 667 892 705 850';
const FACE_COLOR = '#17191A';
const OUTLINE = '#110F14';

// Sampled from the body art, so the limbs read as the same stone. The far leg is the
// same rock in the body's shadow.
type Tones = { lit: string; base: string; shade: string; deep: string };
const STONE: Tones = { lit: '#A3A2A8', base: '#7F818B', shade: '#62646F', deep: '#494A54' };
const STONE_FAR: Tones = { lit: '#70717B', base: '#5A5C66', shade: '#454650', deep: '#35363E' };
const MOSS = { base: '#668028', lit: '#90AD3A' };

const CROUCH_MS = 160;
const RISE_MS = 440;
const DEFAULT_CYCLE_MS = 1100;

// Height of the component for a given `size` (its width).
export const TRUNDLE_ASPECT = BOX_H / IMG_W;
// How far up from the bottom his feet are, as a share of the height.
export const TRUNDLE_FLOOR = FLOOR_PAD / BOX_H;
// How long he takes to get from resting to on his feet.
export const STAND_UP_MS = CROUCH_MS + RISE_MS;

// Where a foot is along its stride, -1 (behind) to 1 (in front), for u in 0..1. The
// first half is the foot planted and carried backwards at constant speed, matching the
// ground; the second half is it swinging forward through the air.
function footX(u: number) {
  'worklet';
  if (u < 0.5) return 1 - 4 * u;
  return -Math.cos((u - 0.5) * 2 * Math.PI);
}

// How far through its swing a foot is: 0 on the ground, 1 at the top of the step.
function footLift(u: number) {
  'worklet';
  if (u < 0.5) return 0;
  return Math.sin((u - 0.5) * 2 * Math.PI);
}

type Props = {
  size: number;
  // 'rest' is the legless rock. Switching to 'walk' has him stand up and set off;
  // switching back has him stop and sit down.
  // 'stand' keeps his feet planted while preserving idle and tap animations.
  mode?: 'rest' | 'stand' | 'walk';
  // How fast the ground moves under him, in points per second. His step rate is
  // derived from it so his planted foot travels with the ground.
  groundSpeed?: number;
};

export function Trundle({ size, mode = 'rest', groundSpeed }: Props) {
  const k = size / IMG_W;
  const height = BOX_H * k;
  const hopHeight = size * 0.16;
  const shadowSize = size * 0.6;
  const cycleMs = groundSpeed ? ((4 * STRIDE * k) / groundSpeed) * 1000 : DEFAULT_CYCLE_MS;

  const phase = useSharedValue(0);
  const stand = useSharedValue(mode === 'rest' ? 0 : 1);
  const gait = useSharedValue(mode === 'walk' ? 1 : 0);
  const facing = useSharedValue(mode === 'walk' ? 1 : 0);
  const breath = useSharedValue(0);
  const blink = useSharedValue(1);
  const tilt = useSharedValue(0);
  const lift = useSharedValue(0);
  const squash = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
    blink.value = withRepeat(
      withSequence(
        withDelay(3200, withTiming(0.08, { duration: 70 })),
        withTiming(1, { duration: 100 }),
      ),
      -1,
    );
    tilt.value = withRepeat(
      withSequence(
        withDelay(5200, withTiming(-4, { duration: 160 })),
        withTiming(4, { duration: 220 }),
        withTiming(-2, { duration: 180 }),
        withTiming(0, { duration: 160 }),
      ),
      -1,
    );
  }, [breath, blink, tilt]);

  useEffect(() => {
    phase.value = 0;
    phase.value = withRepeat(withTiming(1, { duration: cycleMs, easing: Easing.linear }), -1);
  }, [phase, cycleMs]);

  useEffect(() => {
    if (mode === 'walk') {
      facing.value = withTiming(1, { duration: STAND_UP_MS, easing: Easing.inOut(Easing.quad) });
      // Crouch, spring up onto his legs, then ease into the walk.
      squash.value = withSequence(
        withTiming(0.8, { duration: CROUCH_MS }),
        withTiming(-0.5, { duration: 200 }),
        withTiming(0, { duration: 260 }),
      );
      stand.value = withDelay(
        CROUCH_MS,
        withTiming(1, { duration: RISE_MS, easing: Easing.out(Easing.back(1.7)) }),
      );
      gait.value = withDelay(STAND_UP_MS, withTiming(1, { duration: 500 }));
    } else if (mode === 'stand') {
      facing.value = withDelay(350, withTiming(0, { duration: 420 }));
      gait.value = withTiming(0, { duration: 350 });
      stand.value = withTiming(1, { duration: RISE_MS });
    } else {
      facing.value = withDelay(350, withTiming(0, { duration: 420 }));
      gait.value = withTiming(0, { duration: 350 });
      stand.value = withDelay(
        350,
        withTiming(0, { duration: 420, easing: Easing.inOut(Easing.quad) }),
      );
    }
  }, [mode, stand, gait, squash, facing]);

  // The whole pose for this frame. Hip height comes from the planted leg, which is
  // what keeps that foot on the ground while the body bobs.
  const pose = useDerivedValue(() => {
    const near = phase.value;
    const far = (phase.value + 0.5) % 1;
    const reach = STRIDE * gait.value;
    const nearX = footX(near) * reach;
    const farX = footX(far) * reach;
    const plantedX = near < 0.5 ? nearX : farX;
    const legScale = interpolate(stand.value, [0, 1], [TUCKED / LEG, 1]);
    return {
      nearAngle: Math.asin(nearX / LEG),
      farAngle: Math.asin(farX / LEG),
      nearLift: footLift(near) * gait.value,
      farLift: footLift(far) * gait.value,
      legScale,
      hipHeight: legScale * Math.sqrt(LEG * LEG - plantedX * plantedX),
    };
  });

  const hop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    lift.value = withSequence(
      withTiming(0, { duration: 90 }),
      withTiming(-hopHeight, { duration: 220, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }),
    );
    squash.value = withSequence(
      withTiming(1, { duration: 90 }),
      withTiming(-0.6, { duration: 220 }),
      withTiming(-0.2, { duration: 170 }),
      withTiming(1, { duration: 60 }),
      withTiming(0, { duration: 240, easing: Easing.out(Easing.back(2)) }),
    );
  };

  const figureStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value + (LEG - pose.value.hipHeight) * k }],
  }));

  const bodyStyle = useAnimatedStyle(() => {
    const step = Math.cos(phase.value * 4 * Math.PI) * gait.value;
    const sway = Math.sin(phase.value * 2 * Math.PI) * gait.value;
    // The idle head wobble belongs to the resting rock; on his feet it's the walk's sway.
    const wobble = tilt.value * (1 - stand.value);
    return {
      transform: [
        { rotate: `${wobble + 2.2 * sway}deg` },
        { scaleX: (1 - 0.008 * breath.value) * (1 + 0.09 * squash.value) * (1 - 0.08 * facing.value) },
        { scaleY: (1 + 0.025 * breath.value) * (1 - 0.13 * squash.value) * (1 - 0.014 * step) },
      ],
    };
  });

  const nearThighStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 90 * k * facing.value },
      { rotate: `${-pose.value.nearAngle - (HIP_LIFT * Math.PI * pose.value.nearLift) / 180}rad` },
      { scaleX: interpolate(stand.value, [0, 0.5], [0.5, 1], 'clamp') },
      { scaleY: pose.value.legScale },
    ],
  }));
  const nearShinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${KNEE_BEND * pose.value.nearLift}deg` }],
  }));
  const farThighStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -90 * k * facing.value },
      { rotate: `${-pose.value.farAngle - (HIP_LIFT * Math.PI * pose.value.farLift) / 180}rad` },
      { scaleX: interpolate(stand.value, [0, 0.5], [0.5, 1], 'clamp') },
      { scaleY: pose.value.legScale },
    ],
  }));
  const farShinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${KNEE_BEND * pose.value.farLift}deg` }],
  }));

  // Tucked limbs shrink and fade so nothing pokes out from under the resting rock.
  const limbsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(stand.value, [0.05, 0.3], [0, 1], 'clamp'),
  }));
  const leftArmStyle = useAnimatedStyle(() => {
    const swing = Math.sin(phase.value * 2 * Math.PI) * gait.value;
    const grown = Math.max(0, stand.value);
    return {
      transform: [
        { translateX: 145 * k * facing.value },
        { rotate: `${(ARM_HANG * (1 - facing.value) + ARM_SWING * swing) * grown}deg` },
        { scale: grown },
      ],
    };
  });
  const rightArmStyle = useAnimatedStyle(() => {
    const swing = Math.sin(phase.value * 2 * Math.PI) * gait.value;
    const grown = Math.max(0, stand.value);
    return {
      transform: [
        { translateX: -100 * k * facing.value },
        { rotate: `${(-ARM_HANG * (1 - facing.value) - ARM_SWING * swing) * grown}deg` },
        { scale: grown },
      ],
    };
  });

  // Shift and foreshorten the whole face around its own center to turn him right.
  // Facing is separate from gait so he turns before taking his first step.
  const faceStyle = useAnimatedStyle(() => ({
    transformOrigin: [EYE_CX * k, EYE_CY * k, 0],
    transform: [
      { translateX: 235 * k * facing.value },
      { scaleX: 1 - 0.4 * facing.value },
    ],
  }));

  const eyesStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: blink.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => {
    const airborne = interpolate(lift.value, [-hopHeight, 0], [1, 0]);
    const spread = (1 - 0.3 * airborne) * (1 - 0.12 * stand.value);
    return {
      opacity: 1 - 0.45 * airborne,
      transform: [{ scaleX: spread }, { scaleY: 0.13 * spread }],
    };
  });

  const eyesBox = {
    left: (EYE_CX - EYE_GAP - EYE_RX) * k,
    top: (EYE_CY - EYE_RY) * k,
    width: (EYE_GAP * 2 + EYE_RX * 2) * k,
    height: EYE_RY * 2 * k,
  };

  return (
    <Pressable
      onPress={hop}
      accessibilityRole="button"
      accessibilityLabel="Trundle"
      accessibilityHint="Makes him hop"
      style={{ width: size, height }}
    >
      <Animated.View
        style={[
          styles.shadow,
          {
            width: shadowSize,
            height: shadowSize,
            borderRadius: shadowSize / 2,
            left: (size - shadowSize) / 2,
            top: GROUND_Y * k - shadowSize / 2,
          },
          shadowStyle,
        ]}
      />
      <Animated.View style={[{ width: size, height }, figureStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, limbsStyle]}>
          <Arm k={k} shoulderX={EYE_CX + SHOULDER_DX} style={rightArmStyle} />
          <Arm k={k} shoulderX={EYE_CX - SHOULDER_DX} style={leftArmStyle} />
          <Leg k={k} hipX={EYE_CX + HIP_DX} tones={STONE_FAR} thigh={farThighStyle} shin={farShinStyle} />
          <Leg k={k} hipX={EYE_CX - HIP_DX} tones={STONE} mossy thigh={nearThighStyle} shin={nearShinStyle} />
        </Animated.View>

        <Animated.View
          style={[
            styles.part,
            { width: size, height: IMG_H * k, transformOrigin: [size / 2, BODY_BOTTOM * k, 0] },
            bodyStyle,
          ]}
        >
          {/* Bundled images default to their intrinsic size, so the size must be explicit. */}
          <Image source={body} style={{ width: size, height: IMG_H * k }} resizeMode="contain" />
          <Animated.View style={[StyleSheet.absoluteFill, faceStyle]}>
            <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${IMG_W} ${IMG_H}`}>
              <Path
                d={MOUTH}
                stroke={FACE_COLOR}
                strokeWidth={15}
                strokeLinecap="round"
                fill="none"
              />
            </Svg>
            <Animated.View style={[styles.part, eyesBox, eyesStyle]}>
              <Svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${EYE_GAP * 2 + EYE_RX * 2} ${EYE_RY * 2}`}
              >
                <Ellipse cx={EYE_RX} cy={EYE_RY} rx={EYE_RX} ry={EYE_RY} fill={FACE_COLOR} />
                <Ellipse
                  cx={EYE_GAP * 2 + EYE_RX}
                  cy={EYE_RY}
                  rx={EYE_RX}
                  ry={EYE_RY}
                  fill={FACE_COLOR}
                />
              </Svg>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

type LegProps = {
  k: number;
  hipX: number;
  tones: Tones;
  mossy?: boolean;
  thigh: object;
  shin: object;
};

const THIGH_OUTLINE = '30,14 150,8 184,62 172,150 120,174 40,166 14,92';
const FOOT_OUTLINE = '40,16 150,10 180,72 238,110 254,176 230,198 30,198 10,150 18,70';

// A leg made of two boulders, hinged at the hip and the knee. The hip sits inside the
// body's outline, so the joint is always hidden behind him.
function Leg({ k, hipX, tones, mossy, thigh, shin }: LegProps) {
  return (
    <Animated.View
      style={[
        styles.part,
        {
          left: (hipX - THIGH_BOX.pivotX) * k,
          top: (HIP_Y - THIGH_BOX.pivotY) * k,
          width: THIGH_BOX.w * k,
          height: THIGH_BOX.h * k,
          transformOrigin: [THIGH_BOX.pivotX * k, THIGH_BOX.pivotY * k, 0],
        },
        thigh,
      ]}
    >
      <Animated.View
        style={[
          styles.part,
          {
            left: (THIGH_BOX.pivotX - SHIN_BOX.pivotX) * k,
            top: (THIGH_BOX.pivotY + THIGH - SHIN_BOX.pivotY) * k,
            width: SHIN_BOX.w * k,
            height: SHIN_BOX.h * k,
            transformOrigin: [SHIN_BOX.pivotX * k, SHIN_BOX.pivotY * k, 0],
          },
          shin,
        ]}
      >
        <Svg width="100%" height="100%" viewBox={`0 0 ${SHIN_BOX.w} ${SHIN_BOX.h}`}>
          <Polygon points={FOOT_OUTLINE} fill={tones.base} />
          <Polygon points="40,16 150,10 138,62 62,68" fill={tones.lit} />
          <Polygon points="40,16 62,68 52,142 10,150 18,70" fill={tones.lit} opacity={0.6} />
          <Polygon points="180,72 238,110 254,176 230,198 172,198 160,122" fill={tones.shade} />
          <Polygon points="52,142 160,122 172,198 30,198 10,150" fill={tones.deep} />
          <Polygon points="138,62 180,72 160,122" fill={tones.shade} opacity={0.55} />
          {mossy && (
            <>
              <Polygon points="176,74 236,108 226,126 204,118 196,134 178,112" fill={MOSS.base} />
              <Polygon points="176,74 214,96 196,104" fill={MOSS.lit} />
            </>
          )}
          <Path d="M 92 70 L 104 100 L 94 118 L 108 140" stroke={OUTLINE} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Polygon points={FOOT_OUTLINE} fill="none" stroke={OUTLINE} strokeWidth={17} strokeLinejoin="round" />
        </Svg>
      </Animated.View>
      <Svg width="100%" height="100%" viewBox={`0 0 ${THIGH_BOX.w} ${THIGH_BOX.h}`}>
        <Polygon points={THIGH_OUTLINE} fill={tones.base} />
        <Polygon points="30,14 150,8 124,52 54,58" fill={tones.lit} />
        <Polygon points="30,14 54,58 46,122 14,92" fill={tones.lit} opacity={0.6} />
        <Polygon points="150,8 184,62 172,150 134,122 124,52" fill={tones.shade} />
        <Polygon points="46,122 134,122 172,150 120,174 40,166" fill={tones.deep} />
        <Polygon points={THIGH_OUTLINE} fill="none" stroke={OUTLINE} strokeWidth={17} strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

const ARM_OUTLINE = '62,10 118,10 126,120 150,150 170,208 142,262 88,280 34,256 12,200 30,148 54,122';

// A short stone arm ending in a boulder fist, hinged at the shoulder.
function Arm({ k, shoulderX, style }: { k: number; shoulderX: number; style: object }) {
  return (
    <Animated.View
      style={[
        styles.part,
        {
          left: (shoulderX - ARM_BOX.pivotX * ARM_SCALE) * k,
          top: (SHOULDER_Y - ARM_BOX.pivotY * ARM_SCALE) * k,
          width: ARM_BOX.w * ARM_SCALE * k,
          height: ARM_BOX.h * ARM_SCALE * k,
          transformOrigin: [ARM_BOX.pivotX * ARM_SCALE * k, ARM_BOX.pivotY * ARM_SCALE * k, 0],
        },
        style,
      ]}
    >
      <Svg width="100%" height="100%" viewBox={`0 0 ${ARM_BOX.w} ${ARM_BOX.h}`}>
        <Polygon points={ARM_OUTLINE} fill={STONE.base} />
        <Polygon points="62,10 88,10 84,128 54,122" fill={STONE.lit} />
        <Polygon points="54,122 84,128 70,186 12,200 30,148" fill={STONE.lit} />
        <Polygon points="126,120 150,150 170,208 124,196 110,140" fill={STONE.shade} />
        <Polygon points="70,186 124,196 170,208 142,262 88,280 34,256 12,200" fill={STONE.deep} />
        <Polygon points={ARM_OUTLINE} fill="none" stroke={OUTLINE} strokeWidth={17} strokeLinejoin="round" />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  part: {
    position: 'absolute',
  },
});
