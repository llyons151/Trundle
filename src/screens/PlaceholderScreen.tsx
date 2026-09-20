import { StyleSheet, Text, View } from 'react-native';

import { useTheme, useThemedStyles, type Theme } from '../theme';

// Stand-in for tabs that haven't been built yet.
export function PlaceholderScreen({ title }: { title: string }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.fill}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>Coming soon</Text>
    </View>
  );
}

const createStyles = ({ colors, fonts }: Theme) => StyleSheet.create({
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.bg,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 44,
    color: colors.text,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSoft,
  },
});
