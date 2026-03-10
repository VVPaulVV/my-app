import { BlurView } from '@react-native-community/blur';
import React from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

interface GlassViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
}

const BLUR_AMOUNT = { light: 8, medium: 18, strong: 32 };

export function GlassView({ children, style, intensity = 'medium' }: GlassViewProps) {
  return (
    <View style={[styles.container, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="dark"
          blurAmount={BLUR_AMOUNT[intensity]}
          reducedTransparencyFallbackColor="rgba(22,20,18,0.92)"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
      )}
      <View style={[StyleSheet.absoluteFill, styles.tint]} pointerEvents="none" />
      <View style={styles.topEdge} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  androidFallback: {
    backgroundColor: 'rgba(22, 20, 18, 0.93)',
  },
  tint: {
    backgroundColor: 'rgba(22, 20, 18, 0.35)',
  },
  topEdge: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
});
