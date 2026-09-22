import { Host } from '@expo/ui';
import { DatePicker } from '@expo/ui/swift-ui';
import { datePickerStyle, disabled as disabledModifier, frame, tint } from '@expo/ui/swift-ui/modifiers';
import { useMemo, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';

// Reserve the wheel's space in Yoga before SwiftUI measures it. A matchContents
// Host inside an auto-sized sheet can collapse or lay out over the footer.
const WHEEL_HEIGHT = 216;

export function TimePicker({ minutes, onChange, disabled }: { minutes: number; onChange: (minutes: number) => void; disabled: boolean }) {
  const ui = useTheme();
  const { width } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);
  const wheelWidth = measuredWidth ?? Math.min(width, ui.layout.maxWidth) - 48;
  // This is a recurring wall-clock time, not today's date (which may contain a
  // DST gap). Keep the value stable across unrelated parent renders.
  const selection = useMemo(() => new Date(2020, 0, 15, Math.floor(minutes / 60), minutes % 60), [minutes]);
  return <View onLayout={({ nativeEvent }) => setMeasuredWidth(nativeEvent.layout.width)} style={{ width: '100%', height: WHEEL_HEIGHT, flexShrink: 0 }}>
    <Host colorScheme={ui.dark ? 'dark' : 'light'} ignoreSafeArea="all" style={{ width: wheelWidth, height: WHEEL_HEIGHT }}>
      <DatePicker
        selection={selection}
        displayedComponents={['hourAndMinute']}
        onDateChange={date => { if (!disabled) onChange(date.getHours() * 60 + date.getMinutes()); }}
        modifiers={[datePickerStyle('wheel'), frame({ width: wheelWidth, height: WHEEL_HEIGHT }), tint(ui.colors.accentStrong), disabledModifier(disabled)]}
        testID="native-time-wheel"
      />
    </Host>
  </View>;
}
