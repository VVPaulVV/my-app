import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet } from 'react-native';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Keep the splash screen visible while we fetch resources
try {
    SplashScreen.preventAutoHideAsync().catch(() => { });
} catch (e) { }

interface Props {
    onAnimationFinish: (isFinished: boolean) => void;
}

export function AnimatedSplashScreen({ onAnimationFinish }: Props) {
    const logoScale = useSharedValue(0.3);
    const logoOpacity = useSharedValue(0);
    const containerOpacity = useSharedValue(1);

    useEffect(() => {
        // Start animation sequence
        logoOpacity.value = withTiming(1, { duration: 800 });
        logoScale.value = withTiming(1, {
            duration: 1000,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        }, (finished) => {
            if (finished) {
                // Wait a bit, then fade out the whole container
                containerOpacity.value = withDelay(500, withTiming(0, { duration: 600 }, (isDone) => {
                    if (isDone) {
                        runOnJS(onAnimationFinish)(true);
                    }
                }));
            }
        });

        // Hide the native splash screen after a short delay to ensure our custom one is rendered
        const timer = setTimeout(async () => {
            try {
                await SplashScreen.hideAsync();
            } catch (e) {
                console.warn('Failed to hide splash screen:', e);
            }
        }, 500); // Increased delay slightly for stability

        return () => clearTimeout(timer);
    }, []);

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <Animated.View style={[styles.logoContainer, logoStyle]}>
                <Image
                    source={require('../assets/images/logo-final.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    logoContainer: {
        width: width * 0.7,
        height: width * 0.7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
});
