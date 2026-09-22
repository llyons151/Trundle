import { memo, useId } from 'react';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

const crescent = 'M40 7C25 3 11 14 8 29C4 46 17 59 33 58C43 58 52 52 56 43C42 48 27 39 26 25C25 17 31 10 40 7Z';

// Small, original vector illustrations: warm rays and softly faceted moonstone.
// The restrained detail remains legible in both the scene and its tiny toggle.
export const CelestialIcon = memo(function CelestialIcon({ kind, size }: { kind: 'sun' | 'moon'; size: number }) {
  const id = `celestial-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const sun = kind === 'sun';
  return <Svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
    <Defs>
      <LinearGradient id={`${id}-face`} x1="0" y1="0" x2="0.8" y2="1">
        <Stop offset="0" stopColor={sun ? '#FFF1B3' : '#FFF9E9'} />
        <Stop offset="0.5" stopColor={sun ? '#F5CB6B' : '#E4E9DC'} />
        <Stop offset="1" stopColor={sun ? '#E5A653' : '#AABDC1'} />
      </LinearGradient>
      <ClipPath id={`${id}-clip`}>
        {sun ? <Circle cx="32" cy="32" r="16" /> : <Path d={crescent} />}
      </ClipPath>
    </Defs>
    {sun && <G fill="#E8B765">
      {Array.from({ length: 8 }, (_, index) => <Rect key={index} x="29.5" y="3" width="5" height="9" rx="2.5" transform={`rotate(${index * 45} 32 32)`} />)}
    </G>}
    {sun ? <Circle cx="32" cy="32" r="16" fill={`url(#${id}-face)`} /> : <Path d={crescent} fill={`url(#${id}-face)`} />}
    <G clipPath={`url(#${id}-clip)`}>
      {sun ? <>
        <Path d="M15 29L29 17L35 31L23 40Z" fill="#FFF8D4" opacity="0.35" />
        <Path d="M35 31L48 27L46 43L32 49L23 40Z" fill="#DA934D" opacity="0.15" />
        <Path d="M21 23Q26 18 31 20" fill="none" stroke="#FFF8D9" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      </> : <>
        <Path d="M9 24L24 15L29 35L16 43Z" fill="#FFFFFF" opacity="0.26" />
        <Path d="M16 43L29 35L44 48L34 60Z" fill="#97ADB5" opacity="0.22" />
        <Path d="M8 31L16 43L13 52L3 44Z" fill="#879EA9" opacity="0.2" />
        <Circle cx="15.5" cy="31" r="3.4" fill="#A2B5B9" opacity="0.55" />
        <Circle cx="24" cy="47" r="4.2" fill="#93A9AF" opacity="0.45" />
        <Circle cx="37" cy="52" r="1.8" fill="#8AA1AB" opacity="0.4" />
        <Path d="M12.5 32Q13.5 35 16.5 34" fill="none" stroke="#F9F7E6" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      </>}
    </G>
  </Svg>;
});
