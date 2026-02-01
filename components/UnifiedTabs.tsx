import { Colors } from '@/constants/theme';
import { CATEGORIES } from '@/data/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/i18n';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';
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
    const params = useLocalSearchParams<{ category: string }>();

    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];


    const [activeIndex, setActiveIndex] = useState(1);
    const [category, setCategory] = useState<string>('sights');
    const [transportLoaded, setTransportLoaded] = useState(false);
    const [pendingMapOpen, setPendingMapOpen] = useState(false);
    const [locale, setLocale] = useState(i18n.locale);


    const activeIndexRef = React.useRef(1);
    const transportRef = React.useRef<TransportRef>(null);


    const translateX = useSharedValue(-SCREEN_WIDTH);
    const contextX = useSharedValue(0);


    const updateActiveTab = React.useCallback((index: number) => {
        if (index !== activeIndexRef.current) {
            setActiveIndex(index);
            activeIndexRef.current = index;
            if (index === 3) {
                setTransportLoaded(true);
            }
        }
    }, []);

    const switchTab = React.useCallback((index: number) => {

        translateX.value = withSpring(-index * SCREEN_WIDTH, {
            damping: 25,
            stiffness: 150,
            mass: 0.8
        });
        updateActiveTab(index);
    }, [translateX, updateActiveTab]);

    const navigateTo = React.useCallback((path: string, cat?: string) => {
        const index = path === '/' ? 1 : path === '/explore' ? 2 : path === '/itinerary' ? 3 : path === '/transport' ? 4 : 1;

        if (index !== activeIndexRef.current) {
            translateX.value = withSpring(-index * SCREEN_WIDTH, {
                damping: 25,
                stiffness: 150,
                mass: 0.8
            });
            setActiveIndex(index);
            activeIndexRef.current = index;

            if (index === 4) {
                setTransportLoaded(true);
                if (cat === 'map') {
                    setPendingMapOpen(true);
                }
            }
        } else if (index === 4 && cat === 'map') {
            transportRef.current?.openMap();
        }

        if (cat && cat !== 'map') {
            setCategory(cat);
        }
    }, [translateX]);

    const handleLanguageChange = (newLocale: string) => {
        setLocale(newLocale);
    };


    useEffect(() => {
        if (pendingMapOpen && transportLoaded && activeIndex === 2) {
            setTimeout(() => {
                transportRef.current?.openMap();
                setPendingMapOpen(false);
            }, 100);
        }
    }, [pendingMapOpen, transportLoaded, activeIndex]);





    useEffect(() => {
        const index = pathname === '/' ? 0 : pathname === '/explore' ? 1 : pathname === '/transport' ? 2 : 0;
        if (index !== activeIndex && pathname !== '/') {

        }

        activeIndexRef.current = activeIndex;
    }, [activeIndex, pathname]);


    useEffect(() => {
        if (params.category && params.category !== category) {
            setCategory(params.category);
        }
    }, [params.category]);

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
        const isExplore = Math.abs(translateX.value + 2 * SCREEN_WIDTH) < SCREEN_WIDTH * 0.5;

        const translateYValue = isExplore ? -36 : 0;

        return {
            transform: [{ translateY: withTiming(translateYValue, { duration: 250 }) }],
            opacity: withTiming(isExplore ? 1 : 0, { duration: 200 }),
        };
    });

    const tabBarAnimatedStyle = useAnimatedStyle(() => {
        // activeIndex 0 is full screen map
        // We want to hide it for the full map view only
        const shouldHide = activeIndex === 0;

        return {
            transform: [{
                translateY: withTiming(shouldHide ? 150 : 0, { duration: 300 })
            }],
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
                            <MemoizedFullMap key={`fullmap-${locale}`} theme={theme} onClose={() => navigateTo('/')} router={router} allPoiItems={(ExploreContent as any).allItems || []} />
                        </View>
                        <View style={{ width: SCREEN_WIDTH }}>
                            <MemoizedHome key={`home-${locale}`} onNavigate={navigateTo} onLanguageChange={handleLanguageChange} />
                        </View>
                        <View style={{ width: SCREEN_WIDTH }}>
                            { }
                            <MemoizedExplore key={`explore-${locale}`} category={category} setCategory={setCategory} />
                        </View>
                        <View style={{ width: SCREEN_WIDTH }}>
                            <MemoizedItinerary key={`itinerary-${locale}`} />
                        </View>
                        <View style={{ width: SCREEN_WIDTH }}>
                            { }
                            {activeIndex === 4 || transportLoaded ? <MemoizedTransport key={`transport-${locale}`} ref={transportRef} /> : <View style={{ flex: 1 }} />}
                        </View>
                    </Animated.View>
                </GestureDetector>

                { }
                <Animated.View
                    pointerEvents={activeIndex === 2 ? 'auto' : 'none'}
                    style={[
                        styles.categoriesOverlay,
                        { backgroundColor: theme.cardBackground },
                        categoriesAnimatedStyle,
                        { zIndex: 5 } // Ensure it's above other content but below full overlays if needed
                    ]}
                >
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

                { }
                <Animated.View style={[styles.tabBar, {
                    backgroundColor: theme.cardBackground,
                    borderTopColor: theme.border,
                    zIndex: 10,
                    // Remove opacity since we are translating it out
                    // opacity: activeIndex === 0 ? 0 : 1, 
                    ...Platform.select({
                        ios: {
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: -2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                        },
                        android: {
                            elevation: 12,
                        }
                    })
                }, tabBarAnimatedStyle]}>
                    {renderTabItem(1, 'house.fill', i18n.t('home'))}
                    {renderTabItem(2, 'paperplane.fill', i18n.t('explore'))}
                    {renderTabItem(3, 'map.fill', 'Plan')}
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
        width: SCREEN_WIDTH * TAB_COUNT,
    },
    tabBar: {
        position: 'absolute',
        bottom: 15,
        left: 10,
        right: 10,
        flexDirection: 'row',
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'space-around',
        borderTopWidth: 0,

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
        height: 75,
        zIndex: 5,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        borderWidth: 0,
        paddingTop: 8,
    },
    categoriesScroll: {
        paddingHorizontal: 20,
        alignItems: 'flex-start',
        gap: 24,
    },
    categoryPill: {
        paddingVertical: 8,

    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    }
});
