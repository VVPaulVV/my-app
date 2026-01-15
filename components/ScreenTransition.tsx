import { usePathname, useRouter } from 'expo-router';
import React, { useLayoutEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

const TAB_ROUTES = ['/', '/explore', '/transport'];

const TAB_ORDER: Record<string, number> = {
    '/': 0,
    '/explore': 1,
    '/transport': 2,
};

const SCREEN_WIDTH = Dimensions.get('window').width;
let globalLastIndex = 0;

interface Props {
    children: React.ReactNode;
    associatedPath: string;
}

export function ScreenTransition({ children, associatedPath }: Props) {
    const pathname = usePathname();
    const router = useRouter();

    const myIndex = TAB_ORDER[associatedPath] ?? 0;
    const currentIndex = TAB_ORDER[pathname] ?? 0;
    const isActive = pathname === associatedPath;

    const opacity = useSharedValue(0);
    const translateX = useSharedValue(0);

    // --- STANDARD TRANSITION LOGIC ---
    useLayoutEffect(() => {
        if (isActive) {
            const isDifferentTab = myIndex !== globalLastIndex;
            const direction = myIndex > globalLastIndex ? 1 : -1;

            if (isDifferentTab) {
                // Start slightly to the side
                translateX.value = direction * (SCREEN_WIDTH * 0.3);
                opacity.value = 1;

                // Snap to center
                translateX.value = withSpring(0, {
                    damping: 25,
                    stiffness: 200, // Increased stiffness for faster snap
                    mass: 0.8
                });

                globalLastIndex = myIndex;
            } else {
                translateX.value = 0;
                opacity.value = 1;
            }
        } else {
            opacity.value = 0;
        }
    }, [isActive, myIndex]);

    const switchTab = (direction: 'left' | 'right') => {
        const nextIndex = direction === 'left' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex >= 0 && nextIndex < TAB_ROUTES.length) {
            router.push(TAB_ROUTES[nextIndex] as any);
        }
    };

    // --- INSTANT PAN GESTURE ---
    const pan = Gesture.Pan()
        .activeOffsetX([-5, 5]) // Super sensitive: Starts after moving just 5 pixels
        .onUpdate((event) => {
            // MOVE THE SCREEN WITH FINGER (Real-time feedback)
            // We limit the movement so you can't drag it completely off screen
            translateX.value = event.translationX * 0.5;
        })
        .onEnd((event) => {
            // If dragged far enough (> 60px) OR flicked fast enough (> 400 speed)
            const draggedFar = Math.abs(event.translationX) > 60;
            const flickedFast = Math.abs(event.velocityX) > 400;

            if (draggedFar || flickedFast) {
                // Animate off-screen in the direction of the swipe
                const exitDirection = event.translationX > 0 ? 1 : -1;
                translateX.value = withSpring(exitDirection * SCREEN_WIDTH, { velocity: event.velocityX });

                // Trigger route change
                const direction = event.translationX > 0 ? 'right' : 'left';
                runOnJS(switchTab)(direction);
            } else {
                // If swipe was too weak, snap back to center
                translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        flex: 1,
        opacity: opacity.value,
        transform: [{ translateX: translateX.value }],
    }));

    if (!isActive) {
        return <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.container, animatedStyle]}>
                    {children}
                </Animated.View>
            </GestureDetector>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        overflow: 'hidden'
    },
});