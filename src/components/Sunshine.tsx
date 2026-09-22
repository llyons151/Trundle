import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';

// Local illustration colors: warm light, independent of the app's moss controls.
export function Sunshine() {
  const id = `sun-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <View pointerEvents="none" accessible={false} style={styles.sun}>
      <Svg width="120" height="120" viewBox="0 0 120 120">
        <Defs>
          <RadialGradient id={`${id}-halo`}>
            <Stop offset="0" stopColor="#FFE8A6" stopOpacity="0.95" />
            <Stop offset="0.3" stopColor="#F5CA72" stopOpacity="0.5" />
            <Stop offset="0.62" stopColor="#EFC779" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#EFC779" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id={`${id}-sun`} x1="0" y1="0" x2="0.7" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="0.5" stopColor="#FFF8DE" />
            <Stop offset="1" stopColor="#F2D18B" />
          </LinearGradient>
        </Defs>
        <Circle cx="60" cy="60" r="60" fill={`url(#${id}-halo)`} />
        <G fill={`url(#${id}-sun)`} stroke="#CDA35B" strokeWidth="0.65">
          {Array.from({ length: 8 }, (_, index) => (
            <Rect key={index} x="57.3" y="35" width="5.4" height="10" rx="2.7" transform={`rotate(${index * 45} 60 60)`} />
          ))}
          <Circle cx="60" cy="60" r="12.5" />
        </G>
        <Circle cx="56.5" cy="56.5" r="5" fill="#FFFFFF" opacity="0.3" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  sun: { position: 'absolute', width: 120, height: 120, top: -32, left: -32 },
});
