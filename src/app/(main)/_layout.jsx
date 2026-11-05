import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AppText as Text } from '../../components/app-text';
import { Typography } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';
import { useAppStore } from '../../store/app-store';

const tabItems = [
  { name: 'index', title: 'Home', icon: '⌂' },
  { name: 'explore', title: 'Explore', icon: '▤' },
  { name: 'progress', title: 'Progress', icon: '↗' },
  { name: 'rank', title: 'Rank', icon: '♛' },
  { name: 'profile', title: 'Profile', icon: '●' },
];

export default function MainTabsLayout() {
  const theme = useTheme();
  const { isReady, isAuthenticated, user } = useAppStore();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/auth" />;
  }

  if (!user.interests?.length) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primaryLight,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          height: 68,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: theme.backgroundSecondary,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: Typography.button,
          fontWeight: '600',
          marginTop: 1,
        },
        tabBarIconStyle: {
          marginTop: 1,
        },
      }}
    >
      {tabItems.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.title,
            tabBarAccessibilityLabel: item.title,
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ color, fontSize: item.name === 'profile' ? 19 : 23, fontWeight: focused ? '800' : '500', lineHeight: 25 }}>
                {item.icon}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
