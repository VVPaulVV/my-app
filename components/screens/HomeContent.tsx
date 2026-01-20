import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { ACTIVITIES } from '@/data/activities';
import { CATEGORIES } from '@/data/categories';
import { MUSEUMS } from '@/data/museums';
import { RESTAURANTS } from '@/data/restaurants';
import { SIGHTS } from '@/data/sights';
import { Tip, TIPS } from '@/data/tips';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFavorites } from '@/hooks/use-favorites';
import i18n, { SUPPORTED_LANGUAGES, tData } from '@/i18n';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- Specialized Component to Isolate Animation State ---
const ExpandedTipOverlay = React.memo(({ tip, onClose }: { tip: Tip | null, onClose: () => void }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const transition = useSharedValue(0);
    const [visible, setVisible] = useState(false);
    const [activeTip, setActiveTip] = useState<Tip | null>(null);

    useEffect(() => {
        if (tip) {
            setActiveTip(tip);
            setVisible(true);
            transition.value = withTiming(1, {
                duration: 350,
                easing: Easing.bezier(0.33, 1, 0.68, 1)
            });
        } else {
            transition.value = withTiming(0, {
                duration: 250,
                easing: Easing.linear
            }, (finished) => {
                if (finished) {
                    runOnJS(setVisible)(false);
                    runOnJS(setActiveTip)(null);
                }
            });
        }
    }, [tip]);

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: transition.value,
    }));

    const cardStyle = useAnimatedStyle(() => ({
        opacity: transition.value,
        transform: [
            { scale: 0.95 + 0.05 * transition.value },
            { translateY: 20 * (1 - transition.value) }
        ],
    }));

    if (!visible || !activeTip) return null;

    return (
        <Animated.View
            pointerEvents={tip ? 'auto' : 'none'}
            style={[StyleSheet.absoluteFill, { zIndex: 1000 }]}
        >
            <View style={styles.expandedTipOverlay}>
                <Pressable style={styles.expandedTipPressable} onPress={onClose}>
                    <Animated.View style={[styles.expandedTipBackdrop, backdropStyle]} />
                </Pressable>

                <Animated.View
                    style={[
                        styles.expandedTipCard,
                        { backgroundColor: theme.cardBackground },
                        cardStyle
                    ]}
                >
                    <View style={[styles.expandedTipIconContainer, { backgroundColor: activeTip.color }]}>
                        <IconSymbol name={activeTip.icon as any} size={32} color="#2D2A26" />
                    </View>

                    <TouchableOpacity style={styles.closeExpandedTip} onPress={onClose}>
                        <IconSymbol name="xmark.circle.fill" size={28} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <Text style={[styles.expandedTipTitle, { color: theme.text }]}>
                        {tData(activeTip, 'title')}
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={[styles.expandedTipContent, { color: theme.textSecondary }]}>
                            {tData(activeTip, 'content')}
                        </Text>
                    </ScrollView>

                    <View style={[styles.expandedTipFooter, { borderTopColor: theme.border }]}>
                        <IconSymbol name="sparkles" size={16} color={theme.primary} />
                        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                            {i18n.t('didYouKnow') || 'Did you know?'}
                        </Text>
                    </View>
                </Animated.View>
            </View>
        </Animated.View>
    );
});

export function HomeContent({ onNavigate, onLanguageChange }: { onNavigate: (path: string, cat?: string) => void, onLanguageChange?: (lang: string) => void }) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { favorites } = useFavorites();

    const favoriteSights = [...SIGHTS, ...MUSEUMS, ...RESTAURANTS, ...ACTIVITIES]
        .filter(item => favorites.includes(item.id));

    const featuredSight = SIGHTS.find(s => s.id === 'cathedral');

    const ExploreSection = ({ title, data, categoryId }: { title: string, data: any[], categoryId: string }) => {
        const { isFavorite, toggleFavorite } = useFavorites();

        return (
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
                    <TouchableOpacity onPress={() => onNavigate('/explore', categoryId)}>
                        <Text style={{ color: theme.primary, fontWeight: '600' }}>{i18n.t('seeAll')}</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
                    {data.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.horizontalCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                            onPress={() => router.push(`/sight/${item.id}` as any)}
                        >
                            <Image source={item.image} style={styles.cardImage} />

                            <Pressable
                                style={styles.favoriteBadgeSmall}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(item.id);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                            >
                                <IconSymbol
                                    name={isFavorite(item.id) ? "heart.fill" : "heart"}
                                    size={14}
                                    color={isFavorite(item.id) ? "#FF4B4B" : "#FFF"}
                                />
                            </Pressable>

                            <View style={styles.cardContent}>
                                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{tData(item, 'name')}</Text>
                                <View style={styles.cardMeta}>
                                    <IconSymbol name="mappin.and.ellipse" size={12} color={theme.primary} />
                                    <Text style={[styles.cardLocation, { color: theme.textSecondary }]} numberOfLines={1}>{tData(item, 'location')}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);
    const [selectedTip, setSelectedTip] = useState<Tip | null>(null);

    const handleOpenTip = (tip: Tip) => {
        setSelectedTip(tip);
    };

    const handleCloseTip = () => {
        setSelectedTip(null);
    };

    const handleLanguageSelect = async (langCode: string) => {
        await import('@/i18n').then(module => module.saveLanguage(langCode));
        setCurrentLanguage(langCode);
        setLanguageModalVisible(false);
        if (onLanguageChange) onLanguageChange(langCode);
    };

    const exploreCategories = [
        { id: 'sights', name: i18n.t('sights'), icon: 'camera.fill', color: CATEGORIES.find(c => c.id === 'sights')?.color || '#FFB3B3', route: '/explore?category=sights' },
        { id: 'restaurants', name: i18n.t('restaurants'), icon: 'fork.knife', color: CATEGORIES.find(c => c.id === 'restaurants')?.color || '#FFE082', route: '/explore?category=restaurants' },
        { id: 'museums', name: i18n.t('museums'), icon: 'building.columns.fill', color: CATEGORIES.find(c => c.id === 'museums')?.color || '#E1BEE7', route: '/explore?category=museums' },
        { id: 'activities', name: i18n.t('activities'), icon: 'sparkles', color: CATEGORIES.find(c => c.id === 'activities')?.color || '#B3E5FC', route: '/explore?category=activities' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: theme.textSecondary }]}>{i18n.t('welcome')}</Text>
                        <Text style={[styles.title, { color: theme.text }]}>Strasbourg</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setLanguageModalVisible(true)}
                        style={[styles.avatarContainer, { borderColor: theme.border }]}
                    >
                        <Image
                            source={require('@/assets/images/sights/petite-france.jpg')}
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>

                {/* Hero Card */}
                {featuredSight && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={styles.heroCard}
                        onPress={() => router.push(`/sight/${featuredSight.id}` as any)}
                    >
                        <Image source={featuredSight.image} style={styles.heroImage} />
                        <View style={styles.heroOverlay}>
                            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                                <Text style={styles.badgeText}>{i18n.t('mustSee') || 'MUST SEE'}</Text>
                            </View>
                            <Text style={styles.heroTitle}>{tData(featuredSight, 'name')}</Text>
                            <Text style={styles.heroSubtitle}>{tData(featuredSight, 'shortDescription')}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Daily Tips (Stories style) */}
                <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('dailyTips')}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipsScroll}>
                    {TIPS.map((tip) => (
                        <TouchableOpacity
                            key={tip.id}
                            activeOpacity={0.8}
                            onPress={() => {
                                handleOpenTip(tip);
                            }}
                            style={[styles.tipCard, { backgroundColor: tip.color + '40', borderColor: tip.color }]}
                        >
                            <View style={[styles.tipIconContainer, { backgroundColor: tip.color }]}>
                                <IconSymbol name={tip.icon as any} size={24} color="#2D2A26" />
                            </View>
                            <Text style={[styles.tipTitle, { color: theme.text }]}>{tData(tip, 'title')}</Text>
                            <Text style={[styles.tipContent, { color: theme.textSecondary }]} numberOfLines={3}>
                                {tData(tip, 'content')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Favorites Section */}
                {favoriteSights.length > 0 && (
                    <ExploreSection title={i18n.t('favorites') || 'Favorites'} data={favoriteSights} categoryId="favorites" />
                )}
                {/* Explore Categories */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('exploreTitle')}</Text>
                </View>
                <View style={styles.exploreGrid}>
                    {exploreCategories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.exploreButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                            onPress={() => onNavigate('/explore', cat.id)}
                        >
                            <View style={[styles.exploreIcon, { backgroundColor: cat.color + '40' }]}>
                                <IconSymbol name={cat.icon as any} size={22} color="#2D2A26" />
                            </View>
                            <Text style={[styles.exploreLabel, { color: theme.text }]}>{i18n.t(cat.id) || cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Quick Actions */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('quickActions')}</Text>
                </View>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                        onPress={() => onNavigate('/transport')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#E0F2F1' }]}>
                            <IconSymbol name="tram.fill" size={24} color="#00796B" />
                        </View>
                        <Text style={[styles.actionLabel, { color: theme.text }]}>{i18n.t('transport')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                        onPress={() => Linking.openURL('tel:+33388150100')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                            <IconSymbol name="phone.fill" size={24} color="#EF6C00" />
                        </View>
                        <Text style={[styles.actionLabel, { color: theme.text }]}>{i18n.t('emergency') || 'Emergency'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                        onPress={() => onNavigate('/explore')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                            <IconSymbol name="map.fill" size={24} color="#7B1FA2" />
                        </View>
                        <Text style={[styles.actionLabel, { color: theme.text }]}>{i18n.t('map') || 'Map'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Language Selection Modal */}
            <Modal
                visible={languageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>{i18n.t('selectLanguage')}</Text>
                            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                                <IconSymbol name="xmark.circle.fill" size={24} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={SUPPORTED_LANGUAGES}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.languageItem,
                                        { borderBottomColor: theme.border },
                                        currentLanguage === item.code && { backgroundColor: theme.primary + '20' }
                                    ]}
                                    onPress={() => handleLanguageSelect(item.code)}
                                >
                                    <Text style={[
                                        styles.languageText,
                                        { color: theme.text },
                                        currentLanguage === item.code && { color: theme.primary, fontWeight: '700' }
                                    ]}>
                                        {item.name}
                                    </Text>
                                    {currentLanguage === item.code && (
                                        <IconSymbol name="checkmark" size={20} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                            style={{ maxHeight: 400 }}
                        />
                        <View style={{ padding: 16 }}>
                            <Text style={{ textAlign: 'center', color: theme.textSecondary, fontSize: 12 }}>
                                {i18n.t('languageName') === 'English' ?
                                    'Note: You may need to restart the app for changes to fully apply.' :
                                    'Note: Redémarrez l\'application pour appliquer les changements.'}
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Expanded Tip Overlay */}
            <ExpandedTipOverlay tip={selectedTip} onClose={handleCloseTip} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    title: {
        fontSize: 34,
        fontWeight: '800',
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        padding: 2,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 25,
    },
    heroCard: {
        width: '100%',
        height: 240,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 30,
        backgroundColor: '#eee',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    heroImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    heroOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
        padding: 20,
    },
    heroTitle: {
        color: 'white',
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 4,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 14,
        fontWeight: '500',
    },
    badge: {
        position: 'absolute',
        top: 20,
        left: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    sectionContainer: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
    },
    horizontalScroll: {
        paddingRight: 20,
    },
    horizontalCard: {
        width: 200,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 16,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 120,
    },
    cardContent: {
        padding: 12,
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardLocation: {
        fontSize: 11,
        marginLeft: 4,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        borderRadius: 20,
        padding: 20,
        maxHeight: '80%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700'
    },
    languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1
    },
    languageText: {
        fontSize: 16
    },
    exploreGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    exploreButton: {
        width: (SCREEN_WIDTH - 52) / 2,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 12,
    },
    exploreIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    exploreLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    quickActionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    actionButton: {
        width: (SCREEN_WIDTH - 64) / 3,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    tipsScroll: {
        paddingRight: 20,
        marginBottom: 30,
    },
    tipCard: {
        width: 160,
        height: 180,
        padding: 16,
        borderRadius: 24,
        marginRight: 12,
        borderWidth: 1,
        justifyContent: 'center',
    },
    tipIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    tipTitle: {
        fontSize: 14,
        fontWeight: '800',
        marginBottom: 6,
    },
    tipContent: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '500',
    },
    favoriteBadgeSmall: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 6,
        borderRadius: 12,
    },
    expandedTipOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 16,
        paddingBottom: 90,
    },
    expandedTipPressable: {
        ...StyleSheet.absoluteFillObject,
    },
    expandedTipBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    expandedTipCard: {
        width: '100%',
        maxHeight: '60%',
        padding: 30,
        borderRadius: 32,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        position: 'relative',
    },
    expandedTipIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    closeExpandedTip: {
        position: 'absolute',
        top: 24,
        right: 24,
    },
    expandedTipTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 16,
    },
    expandedTipContent: {
        fontSize: 17,
        lineHeight: 26,
        fontWeight: '500',
    },
    expandedTipFooter: {
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
