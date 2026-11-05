import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AnimatedSplashOverlay } from '../components/animated-icon';
import { useThemeMode } from '../hooks/use-theme';
import { AppProvider } from '../store/app-store';

SplashScreen.preventAutoHideAsync().catch((error) => {
  console.error('Unable to keep the splash screen visible while loading fonts.', error);
});

export default function RootLayout() {
  const colorScheme = useThemeMode();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  if (fontError) throw fontError;

  return (
    <AppProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="challenge/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="profile-edit/[field]" options={{ headerShown: false, presentation: 'card' }} />
        </Stack>
        <AnimatedSplashOverlay ready={fontsLoaded} />
      </View>
    </AppProvider>
  );
}
