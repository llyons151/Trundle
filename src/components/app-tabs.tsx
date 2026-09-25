import { Tabs, type BottomTabBarProps } from "expo-router/js-tabs";
import { SymbolView, type SymbolViewProps } from "expo-symbols";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

type SymbolName = SymbolViewProps["name"];

// Each tab has an outline icon and a filled icon for when it is selected.
const TABS: Record<
  string,
  { label: string; icon: SymbolName; selectedIcon: SymbolName }
> = {
  index: {
    label: "Home",
    icon: { ios: "house", android: "home", web: "home" },
    selectedIcon: { ios: "house.fill", android: "home", web: "home" },
  },
  apps: {
    label: "Apps",
    icon: { ios: "square.grid.2x2", android: "apps", web: "apps" },
    selectedIcon: { ios: "square.grid.2x2.fill", android: "apps", web: "apps" },
  },
  nap: {
    label: "Nap",
    icon: { ios: "moon.zzz.fill", android: "bedtime", web: "bedtime" },
    selectedIcon: { ios: "moon.zzz.fill", android: "bedtime", web: "bedtime" },
  },
  routine: {
    label: "Routine",
    icon: { ios: "alarm", android: "alarm", web: "alarm" },
    selectedIcon: { ios: "alarm.fill", android: "alarm", web: "alarm" },
  },
  profile: {
    label: "You",
    icon: { ios: "person", android: "person", web: "person" },
    selectedIcon: { ios: "person.fill", android: "person", web: "person" },
  },
};

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={({ navigation }) => ({
        headerShown: false,
        sceneStyle: {
          backgroundColor: 'transparent',
          // Web keeps visited tabs mounted; hide their content behind the shared backdrop.
          display: navigation.isFocused() ? 'flex' : 'none',
        },
      })}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="apps" />
      <Tabs.Screen name="nap" />
      <Tabs.Screen name="routine" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

function TabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // The backdrop shows the page color through the rounded top corners.
  return (
    <View>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.tabBar,
            paddingBottom: Math.max(insets.bottom, Spacing.two),
          },
        ]}
      >
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const tab = TABS[route.name];
            if (!tab) return null;

            const focused = state.index === index;
            const isNap = route.name === "nap";

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="tab"
                accessibilityLabel={tab.label}
                accessibilityState={{ selected: focused }}
                style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
              >
                {isNap ? (
                  <View
                    style={[
                      styles.napButton,
                      {
                        backgroundColor: focused
                          ? theme.napButtonSelected
                          : theme.napButton,
                      },
                    ]}
                  >
                    <SymbolView
                      name={tab.icon}
                      size={NAP_ICON_SIZE}
                      tintColor={theme.napButtonIcon}
                    />
                  </View>
                ) : (
                  <SymbolView
                    name={focused ? tab.selectedIcon : tab.icon}
                    size={ICON_SIZE}
                    tintColor={focused ? theme.tabIconSelected : theme.tabIcon}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const TAB_HEIGHT = 48;
const ICON_SIZE = 22;
const NAP_ICON_SIZE = 18;

const styles = StyleSheet.create({
  // Docked to the screen edge; the device's own corners round the bottom.
  bar: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: "center",
    paddingTop: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  row: {
    width: "100%",
    maxWidth: 520,
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    height: TAB_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.6,
  },
  napButton: {
    width: 60,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
