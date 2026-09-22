import { Host, Picker } from '@expo/ui';
import DateTimePicker from '@expo/ui/community/datetime-picker';
import { Platform, View } from 'react-native';
import { useTheme } from '../theme';

// Expo's datetime picker intentionally returns null on web in SDK 57.
// Keep the browser preview usable with separate hour and minute selectors.
export function TimePicker({ minutes, onChange, disabled }: { minutes: number; onChange: (minutes: number) => void; disabled: boolean }) {
  const ui = useTheme();
  const value = new Date();
  value.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  if (Platform.OS !== 'web') return <DateTimePicker value={value} mode="time" display="spinner" themeVariant={ui.dark ? 'dark' : 'light'} accentColor={ui.colors.accentStrong} disabled={disabled} onChange={(_, next) => { if (next) onChange(next.getHours() * 60 + next.getMinutes()); }} />;
  return <Host colorScheme={ui.dark ? 'dark' : 'light'} matchContents><View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
    <Picker selectedValue={Math.floor(minutes / 60)} enabled={!disabled} onValueChange={hour => onChange(hour * 60 + minutes % 60)} testID="routine-hour-picker">
      {Array.from({ length: 24 }, (_, hour) => <Picker.Item key={hour} value={hour} label={`${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`} />)}
    </Picker>
    <Picker selectedValue={minutes % 60} enabled={!disabled} onValueChange={minute => onChange(Math.floor(minutes / 60) * 60 + minute)} testID="routine-minute-picker">
      {Array.from({ length: 60 }, (_, minute) => <Picker.Item key={minute} value={minute} label={`${String(minute).padStart(2, '0')} minutes`} />)}
    </Picker>
  </View></Host>;
}
