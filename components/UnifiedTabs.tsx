import { Colors } from '@/constants/theme';
import { CATEGORIES } from '@/data/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/i18n';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { ExploreContent } from './screens/ExploreContent';
import { HomeContent } from './screens/HomeContent';
import { TransportContent, TransportRef } from './screens/TransportContent';
import { IconSymbol } from './ui/icon-symbol';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_COUNT = 3;

// Memoize content components to prevent unnecessary re-renders
const MemoizedHome = React.memo(HomeContent);
const MemoizedExplore = React.memo(ExploreContent);
const MemoizedTransport = React.memo(TransportContent);

export function UnifiedTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useLocalSearchParams<{ category: string }>();

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // State
    const [activeIndex, setActiveIndex] = useState(0);
    const [category, setCategory] = useState<string>('sights');
    const [transportLoaded, setTransportLoaded] = useState(false);
    const [pendingMapOpen, setPendingMapOpen] = useState(false);

    // Ref for stable callbacks
    const activeIndexRef = React.useRef(0);
    const transportRef = React.useRef<TransportRef>(null);

    // 0 = Home, 1 = Explore, 2 = Transport
    const translateX = useSharedValue(0);
    const contextX = useSharedValue(0);

    // Stable navigation callbacks
    const switchTab = React.useCallback((index: number) => {
        if (index !== activeIndexRef.current) {
            translateX.value = withSpring(-index * SCREEN_WIDTH, {
                damping: 25,
                stiffness: 150,
                mass: 0.8
            });
            setActiveIndex(index);
            activeIndexRef.current = index;

            if (index === 2) {
                setTransportLoaded(true);
            }
        }
    }, [translateX]);

    const navigateTo = React.useCallback((path: string, cat?: string) => {
        const index = path === '/' ? 0 : path === '/explore' ? 1 : path === '/transport' ? 2 : 0;

        if (index !== activeIndexRef.current) {
            translateX.value = withSpring(-index * SCREEN_WIDTH, {
                damping: 25,
                stiffness: 150,
                mass: 0.8
            });
            setActiveIndex(index);
            activeIndexRef.current = index;

            if (index === 2) {
                setTransportLoaded(true);
                if (cat === 'map') {
                    setPendingMapOpen(true);
                }
            }
        } else if (index === 2 && cat === 'map') {
            transportRef.current?.openMap();
        }

        if (cat && cat !== 'map') {
            setCategory(cat);
        }
    }, [translateX]);

    // Handle map opening loop
    useEffect(() => {
        if (pendingMapOpen && transportLoaded && activeIndex === 2) {
            setTimeout(() => {
                transportRef.current?.openMap();
                setPendingMapOpen(false);
            }, 100);
        }
    }, [pendingMapOpen, transportLoaded, activeIndex]);

    // Update activeIndex ONLY when arriving via deep link or back/forward
    // Not during active swipe/click which already updated the state
    // Update activeIndex ONLY when arriving via deep link or back/forward
    // Not during active swipe/click which already updated the state
    useEffect(() => {
        const index = pathname === '/' ? 0 : pathname === '/explore' ? 1 : pathname === '/transport' ? 2 : 0;
        if (index !== activeIndex && pathname !== '/') {
            // ... (keep existing logic if any, currently empty)
        }
        // Ensure ref is in sync on mount/update
        activeIndexRef.current = activeIndex;
    }, [activeIndex, pathname]);

    // Sync category with params for deep links
    useEffect(() => {
        if (params.category && params.category !== category) {
            setCategory(params.category);
        }
    }, [params.category]);

    const pan = Gesture.Pan()
        .activeOffsetX([-20, 20]) // Only activate if horizontal swipe is explicit
        .failOffsetY([-5, 5])     // Fail IMMEDIATELY if vertical movement is detected to allow scrolling
        .onStart(() => {
            contextX.value = translateX.value;
        })
        .onUpdate((event) => {
            translateX.value = contextX.value + event.translationX;
        })
        .onEnd((event) => {
            const velocity = event.velocityX;
            const translation = event.translationX;

            // Determine the starting index based on the context (snap point where gesture started)
            const startIndex = -Math.round(contextX.value / SCREEN_WIDTH);

            let targetIndex = startIndex;

            // Logic:
            // 1. If dragged more than 30% of screen width, go to next/prev
            // 2. OR if flicked fast enough (> 500) and in the right direction

            // Analyze movement
            const isSwipeLeft = translation < -SCREEN_WIDTH * 0.25 || velocity < -500;
            const isSwipeRight = translation > SCREEN_WIDTH * 0.25 || velocity > 500;

            if (isSwipeLeft) {
                targetIndex = startIndex + 1;
            } else if (isSwipeRight) {
                targetIndex = startIndex - 1;
            }

            // STRICT CLAMPING: Ensure we only move one tab at a time relative to valid bounds
            const clampedIndex = Math.max(0, Math.min(TAB_COUNT - 1, targetIndex));

            runOnJS(switchTab)(clampedIndex);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    // --- Render Tab Item Helper ---
    const renderTabItem = (index: number, iconName: any, label: string) => {
        const isActive = activeIndex === index;
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={styles.tabItem}
                onPress={() => switchTab(index)}
            >
                <IconSymbol
                    name={iconName}
                    size={22}
                    color={isActive ? theme.tint : theme.icon}
                />
                <Text style={[
                    styles.tabLabel,
                    { color: isActive ? theme.tint : theme.icon }
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    const categoriesAnimatedStyle = useAnimatedStyle(() => {
        const isExplore = Math.abs(translateX.value + SCREEN_WIDTH) < SCREEN_WIDTH * 0.5;
        // Slide up slightly less (lowered position)
        const translateYValue = isExplore ? -36 : 0;

        return {
            transform: [{ translateY: withTiming(translateYValue, { duration: 250 }) }],
            opacity: withTiming(isExplore ? 1 : 0, { duration: 200 }),
        };
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <GestureHandlerRootView style={styles.contentContainer}>
                <GestureDetector gesture={pan}>
                    <Animated.View
                        style={[styles.slider, animatedStyle]}
                    >
                        <View style={{ width: SCREEN_WIDTH }}>
                            <MemoizedHome onNavigate={navigateTo} />
                        </View>
                        <View style={{ width: SCREEN_WIDTH }}>
                            {/* Explore is the middle tab, keep it mounted for smooth swiping */}
                            <MemoizedExplore category={category} setCategory={setCategory} />
                        </View>
                        <View style={{ width: SCREEN_WIDTH }}>
                            {/* Only lazy load Transport (Map) as it's the heaviest component, then keep alive */}
                            {activeIndex === 2 || transportLoaded ? <MemoizedTransport ref={transportRef} /> : <View style={{ flex: 1 }} />}
                        </View>
                    </Animated.View>
                </GestureDetector>
            </GestureHandlerRootView>

            {/* Animated Categories Overlay (Behind Tab Bar) */}
            <Animated.View style={[
                styles.categoriesOverlay,
                { backgroundColor: theme.cardBackground },
                categoriesAnimatedStyle
            ]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat.id}
                            style={styles.categoryPill}
                            onPress={() => setCategory(category === cat.nameKey ? '' : cat.nameKey)}
                        >
                            <Text style={[
                                styles.categoryPillText,
                                { color: category === cat.nameKey ? cat.color : theme.text }
                            ]}>{i18n.t(cat.nameKey)}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Animated.View>

            {/* Custom Bottom Tab Bar */}
            <View style={[styles.tabBar, {
                backgroundColor: theme.cardBackground,
                borderTopColor: theme.border,
                zIndex: 10, // Ensure it's above the categories
                ...Platform.select({
                    ios: {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    },
                    android: {
                        elevation: 8,
                    }
                })
            }]}>
                {renderTabItem(0, 'house.fill', 'Home')}
                {renderTabItem(1, 'paperplane.fill', i18n.t('explore'))}
                {renderTabItem(2, 'tram.fill', i18n.t('transport'))}
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    slider: {
        flex: 1,
        flexDirection: 'row',
        width: SCREEN_WIDTH * TAB_COUNT,
    },
    tabBar: {
        position: 'absolute',
        bottom: 15,
        left: 10,
        right: 10,
        flexDirection: 'row',
        height: 60,
        borderRadius: 30, // Pill shape
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopWidth: 0, // Remove top border for floating look
        // Shadow will be applied inline based on platform
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        minWidth: 60,
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 4,
        fontWeight: '500',
    },
    categoriesOverlay: {
        position: 'absolute',
        bottom: 15,
        left: 10,
        right: 10,
        height: 75, // Wider on Y scale (taller)
        zIndex: 5,
        borderTopLeftRadius: 25, // Slightly more rounded for taller look
        borderTopRightRadius: 25,
        borderWidth: 0,
        paddingTop: 8,
    },
    categoriesScroll: {
        paddingHorizontal: 20, // Increased from 20 for wider corner spacing
        alignItems: 'flex-start',
        gap: 24, // Slightly more gap for the taller drawer
    },
    categoryPill: {
        paddingVertical: 8,
        // Removed backgrounds and borders for text-only look
    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '800', // Bolder for textual prominence
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});
