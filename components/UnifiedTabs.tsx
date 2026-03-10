import { GlassView } from '@/components/ui/GlassView';
import { getCategoryColor } from '@/constants/categoryColors';
import { Colors } from '@/constants/theme';
import { CATEGORIES } from '@/data/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFavorites } from '@/hooks/use-favorites';
import i18n from '@/i18n';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExploreContent } from './screens/ExploreContent';
import { HomeContent } from './screens/HomeContent';
import { ItineraryContent } from './screens/ItineraryContent';
import { MapContent } from './screens/MapContent';
import { TransportContent, TransportRef } from './screens/TransportContent';
import { IconSymbol } from './ui/icon-symbol';


const SCREEN_WIDTH = Dimensions.get('window').width;
const TAB_COUNT = 5;



const MemoizedHome = React.memo(HomeContent);
const MemoizedExplore = React.memo(ExploreContent);
const MemoizedTransport = React.memo(TransportContent);
const MemoizedItinerary = React.memo(ItineraryContent);
const MemoizedFullMap = React.memo(MapContent);


export function UnifiedTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const params = useLocalSearchParams<{ category: string; poiId?: string }>();

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const { favorites } = useFavorites();


    const [activeIndex, setActiveIndex] = useState(() => {
        if (params.category === 'map') return 0;
        return 1;
    });
    const [category, setCategory] = useState<string>('sights');
    const [transportLoaded, setTransportLoaded] = useState(false);
    const [pendingMapOpen, setPendingMapOpen] = useState(false);
    const [locale, setLocale] = useState(i18n.locale);


    const activeIndexRef = React.useRef(params.category === 'map' ? 0 : 1);
    const transportRef = React.useRef<TransportRef>(null);


    const translateX = useSharedValue(params.category === 'map' ? 0 : -SCREEN_WIDTH);
    const contextX = useSharedValue(0);


    const updateActiveTab = React.useCallback((index: number) => {
        if (index !== activeIndexRef.current) {
            setActiveIndex(index);
            activeIndexRef.current = index;
            if (index === 4) {
                setTransportLoaded(true);
            }

            // Sync with URL params to ensure "back" works correctly
            if (index === 0) {
                if (params.category !== 'map') {
                    router.setParams({ category: 'map' });
                }
            } else {
                // Clear the map param if we are on any other tab
                if (params.category === 'map') {
                    router.setParams({ category: undefined });
                }
            }
        }
    }, [router, params.category]);

    const switchTab = React.useCallback((index: number) => {

        translateX.value = withSpring(-index * SCREEN_WIDTH, {
            damping: 25,
            stiffness: 150,
            mass: 0.8
        });
        updateActiveTab(index);
    }, [translateX, updateActiveTab]);

    const navigateTo = React.useCallback((path: string, cat?: string) => {
        // If category is map, always go to full map (index 0)
        let index = path === '/' ? 1 : path === '/explore' ? 2 : path === '/itinerary' ? 3 : path === '/transport' ? 4 : 1;

        if (path === '/batorama') {
            if (pathname !== '/batorama') {
                router.push('/batorama');
            }
            return;
        }

        if (cat === 'map') {
            index = 0;
        }


        if (index !== activeIndexRef.current) {
            translateX.value = withSpring(-index * SCREEN_WIDTH, {
                damping: 25,
                stiffness: 150,
                mass: 0.8
            });
            updateActiveTab(index);
        }

        if (cat && cat !== 'map') {
            setCategory(cat);
        }
    }, [translateX, pathname, router, updateActiveTab]);

    const handleLanguageChange = (newLocale: string) => {
        setLocale(newLocale);
    };








    useEffect(() => {
        if (pathname === '/batorama') return;
        navigateTo(pathname, params.category as string);
    }, [pathname, params.category, navigateTo]);

    const pan = Gesture.Pan()
        .enabled(activeIndex !== 0)
        .activeOffsetX([-20, 20])
        .failOffsetY([-5, 5])
        .onStart(() => {
            contextX.value = translateX.value;
        })
        .onUpdate((event) => {
            const newTranslate = contextX.value + event.translationX;


            if (newTranslate > 0) {

                translateX.value = Math.pow(newTranslate, 0.7);
            } else if (newTranslate < -(TAB_COUNT - 1) * SCREEN_WIDTH) {

                const overscroll = newTranslate + (TAB_COUNT - 1) * SCREEN_WIDTH;
                translateX.value = -(TAB_COUNT - 1) * SCREEN_WIDTH - Math.pow(Math.abs(overscroll), 0.7);
            } else {
                translateX.value = newTranslate;
            }
        })
        .onEnd((event) => {
            const velocity = event.velocityX;
            const translation = event.translationX;

            const currentIndex = -Math.round(contextX.value / SCREEN_WIDTH);
            let targetIndex = currentIndex;

            const isSwipeLeft = translation < -SCREEN_WIDTH * 0.25 || velocity < -500;
            const isSwipeRight = translation > SCREEN_WIDTH * 0.25 || velocity > 500;

            if (isSwipeLeft) {
                targetIndex = currentIndex + 1;
            } else if (isSwipeRight) {
                targetIndex = currentIndex - 1;
            }

            const clampedIndex = Math.max(0, Math.min(TAB_COUNT - 1, targetIndex));


            translateX.value = withSpring(-clampedIndex * SCREEN_WIDTH, {
                damping: 25,
                stiffness: 150,
                mass: 0.8,
                velocity: velocity
            });

            runOnJS(updateActiveTab)(clampedIndex);
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));


    const renderTabItem = (index: number, iconName: any, label: string) => {
        const isActive = activeIndex === index;
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                style={[
                    styles.tabItem,
                    isActive && { backgroundColor: 'rgba(201, 82, 74, 0.12)', borderRadius: 12 }
                ]}
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
                {isActive && <View style={[styles.activeDot, { backgroundColor: theme.tint }]} />}
            </TouchableOpacity>
        );
    };

    const categoriesAnimatedStyle = useAnimatedStyle(() => {
        const isExplore = Math.abs(translateX.value + 2 * SCREEN_WIDTH) < SCREEN_WIDTH * 0.5;
        const shouldHide = activeIndex === 0;

        return {
            transform: [{
                translateY: withTiming(shouldHide ? 200 : (isExplore ? -36 : 0), {
                    duration: shouldHide ? 350 : 250,
                }),
            }],
            opacity: withTiming(shouldHide ? 0 : (isExplore ? 1 : 0), {
                duration: 200,
            }),
            pointerEvents: (shouldHide || !isExplore) ? 'none' : 'auto',
        };
    });

    const tabBarAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{
            translateY: withTiming(0, {
                duration: 500,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            }),
        }],
        opacity: withTiming(1, {
            duration: 450,
            easing: Easing.ease,
        }),
    }));

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <GestureHandlerRootView style={styles.contentContainer}>
                <GestureDetector gesture={pan}>
                    <Animated.View
                        style={[styles.slider, animatedStyle]}
                    >
                        <View style={{ width: SCREEN_WIDTH }}>
                            {(activeIndex === 0 || transportLoaded) ? (
                                <MemoizedFullMap key={`fullmap-${locale}`} theme={theme} onNavigate={navigateTo} onClose={() => navigateTo('/')} router={router} isFocused={activeIndex === 0} favorites={favorites} focusId={params.poiId} />
                            ) : (
                                <View style={{ flex: 1, backgroundColor: theme.background }} />
                            )}
                        </View>
                        <View style={{ width: SCREEN_WIDTH }}>
                            <MemoizedHome key={`home-${locale}`} onNavigate={navigateTo} onLanguageChange={handleLanguageChange} />
                        </View>
                        <View style={{ width: SCREEN_WIDTH }}>
                            {/* Explore */}
                            <MemoizedExplore key={`explore-${locale}`} category={category} setCategory={setCategory} />
                        </View>
                        <View style={{ width: SCREEN_WIDTH }}>
                            <MemoizedItinerary key={`itinerary-${locale}`} />
                        </View>
                        <View style={{ width: SCREEN_WIDTH }}>
                            {/* Transport */}
                            {activeIndex === 4 || transportLoaded ? <MemoizedTransport key={`transport-${locale}`} ref={transportRef} /> : <View style={{ flex: 1 }} />}
                        </View>

                    </Animated.View>
                </GestureDetector>

                { }
                <Animated.View
                    pointerEvents={activeIndex === 2 ? 'auto' : 'none'}
                    style={[
                        styles.categoriesOverlay,
                        categoriesAnimatedStyle,
                        { zIndex: 5, bottom: 74 + insets.bottom, backgroundColor: 'transparent' }
                    ]}
                >
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                        {CATEGORIES.map(cat => {
                            const isActive = category === cat.nameKey;
                            const catColor = getCategoryColor(cat.nameKey);
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[
                                        styles.categoryPill,
                                        {
                                            borderColor: isActive ? catColor : theme.border,
                                            backgroundColor: isActive ? catColor : theme.cardBackground
                                        }
                                    ]}
                                    onPress={() => setCategory(category === cat.nameKey ? '' : cat.nameKey)}
                                >
                                    <Text style={[
                                        styles.categoryPillText,
                                        { color: isActive ? '#F5F0EB' : theme.textSecondary }
                                    ]}>{i18n.t(cat.nameKey)}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </Animated.View>

                { }
                <Animated.View
                    pointerEvents={'auto'}
                    style={[
                        styles.tabBar,
                        tabBarAnimatedStyle,
                        {
                            backgroundColor: theme.cardBackground,
                            zIndex: 10,
                            bottom: 10 + insets.bottom,
                        }
                    ]}
                >
                    <GlassView style={{ ...StyleSheet.absoluteFillObject }} />
                    {renderTabItem(0, 'map.fill', i18n.t('map') || 'Map')}
                    {renderTabItem(1, 'house.fill', i18n.t('home'))}
                    {renderTabItem(2, 'paperplane.fill', i18n.t('explore'))}
                    {renderTabItem(3, 'map.fill', i18n.t('itinerary'))}
                    {renderTabItem(4, 'tram.fill', i18n.t('transport'))}
                </Animated.View>

            </GestureHandlerRootView>
        </View>
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
        width: SCREEN_WIDTH * 5,
    },
    tabBar: {
        position: 'absolute',
        left: 10,
        right: 10,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(28, 26, 24, 0.45)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.07)',
        borderTopColor: 'rgba(255, 255, 255, 0.11)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 16,
        overflow: 'hidden',
    },
    innerHighlight: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.06)',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        paddingHorizontal: 8,
        minWidth: 60,
    },
    tabLabel: {
        fontSize: 10,
        marginTop: 2,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 2,
    },
    categoriesOverlay: {
        position: 'absolute',
        left: 10,
        right: 10,
        height: 56,
        backgroundColor: 'transparent',
        borderRadius: 12,
        overflow: 'hidden',
    },
    categoriesScroll: {
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 10,
    },
    categoryPill: {
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    categoryPillText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.08,
    }
});
