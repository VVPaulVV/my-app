import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AnimatedSplashScreen } from '@/components/AnimatedSplashScreen';
import { FavoritesProvider } from '@/components/FavoritesContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Mapbox from '@rnmapbox/maps';
import { useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Initialize Mapbox with token
Mapbox.setAccessToken('pk.eyJ1Ijoic3BlY3RydWgiLCJhIjoiY21rNG5sNmh3MDF6NjNkczl5cGM3Ynl2aSJ9.U3vf9ao95WB7Xxx4n2Ihug');

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);

  // We use a separate state to handle the splash screen removal to ensures 
  // the Stack doesn't unmount/remount unexpectedly
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FavoritesProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', headerShown: true }} />
              <Stack.Screen name="batorama" />
              <Stack.Screen name="sight/[id]" />
            </Stack>

            {!isAnimationFinished && (
              <AnimatedSplashScreen
                onAnimationFinish={(finished) => {
                  console.log('Splash animation finished');
                  setIsAnimationFinished(finished);
                }}
              />
            )}
          </View>
          <StatusBar style="auto" />
        </ThemeProvider>
      </FavoritesProvider>
    </GestureHandlerRootView>
  );
}
