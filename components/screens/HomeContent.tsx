import { WeatherWidget } from '@/components/WeatherWidget';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

import { BATORAMA_DATA } from '@/data/batorama';
import { EMERGENCY_DATA, EmergencyInfo } from '@/data/emergency';
import { SIGHTS } from '@/data/sights';


import { useColorScheme } from '@/hooks/use-color-scheme';

import i18n, { SUPPORTED_LANGUAGES, tData } from '@/i18n';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GuideContent } from './GuideContent';

import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');


const EmergencyModal = React.memo(({ info, onClose }: { info: EmergencyInfo | null, onClose: () => void }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const transition = useSharedValue(0);
    const [visible, setVisible] = useState(false);
    const [activeInfo, setActiveInfo] = useState<EmergencyInfo | null>(null);

    useEffect(() => {
        if (info) {
            setActiveInfo(info);
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
                    runOnJS(setActiveInfo)(null);
                }
            });
        }
    }, [info]);

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

    if (!visible || !activeInfo) return null;

    return (
        <Animated.View
            pointerEvents={info ? 'auto' : 'none'}
            style={[StyleSheet.absoluteFill, { zIndex: 1000 }]}
        >
            <View style={styles.expandedTipOverlay}>
                <Pressable style={styles.expandedTipPressable} onPress={onClose}>
                    <Animated.View style={[styles.expandedTipBackdrop, backdropStyle]} />
                </Pressable>

                <Animated.View
                    style={[
                        styles.expandedTipCard,
                        { backgroundColor: theme.cardBackground, maxHeight: '75%' },
                        cardStyle
                    ]}
                >
                    <View style={[styles.expandedTipIconContainer, { backgroundColor: activeInfo.color }]}>
                        <IconSymbol name={activeInfo.icon as any} size={32} color={theme.background} />
                    </View>

                    <TouchableOpacity style={styles.closeExpandedTip} onPress={onClose}>
                        <IconSymbol name="xmark.circle.fill" size={28} color={theme.textSecondary} />
                    </TouchableOpacity>

                    <Text style={[styles.expandedTipTitle, { color: theme.text }]}>
                        {tData(activeInfo, 'title')}
                    </Text>

                    <Text style={[styles.expandedTipContent, { color: theme.textSecondary, fontSize: 15, marginBottom: 20 }]}>
                        {tData(activeInfo, 'description')}
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {tData(activeInfo, 'content').map((item: any, index: number) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.emergencyItem, { borderBottomColor: theme.border }]}
                                onPress={() => {
                                    if (item.action) {
                                        Linking.openURL(item.action);
                                    }
                                }}
                                disabled={!item.action}
                            >
                                <View style={styles.emergencyItemLeft}>
                                    <Text style={[styles.emergencyLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                                    <Text style={[styles.emergencyValue, { color: theme.text }]}>{item.value}</Text>
                                </View>
                                {item.action && (
                                    <View style={[styles.emergencyActionIcon, { backgroundColor: activeInfo.color + '20' }]}>
                                        <IconSymbol
                                            name={item.action.startsWith('tel:') ? "phone.fill" : (item.action.startsWith('http') ? "globe" : "arrow.up.right")}
                                            size={16}
                                            color={activeInfo.color}
                                        />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={[styles.expandedTipFooter, { borderTopColor: theme.border }]}>
                        <IconSymbol name="info.circle.fill" size={16} color={theme.primary} />
                        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                            {i18n.t('necessaryInfo') || 'Necessary Information'}
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

    const insets = useSafeAreaInsets();

    const featuredSight = SIGHTS.find(s => s.id === 'cathedral');


    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [isGuideVisible, setIsGuideVisible] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.locale);
    const [selectedEmergency, setSelectedEmergency] = useState<EmergencyInfo | null>(null);




    const handleOpenEmergency = (info: EmergencyInfo) => {
        setSelectedEmergency(info);
    };

    const handleCloseEmergency = () => {
        setSelectedEmergency(null);
    };

    const handleLanguageSelect = async (langCode: string) => {
        await import('@/i18n').then(module => module.saveLanguage(langCode));
        setCurrentLanguage(langCode);
        setLanguageModalVisible(false);
        if (onLanguageChange) onLanguageChange(langCode);
    };



    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + insets.bottom }]} showsVerticalScrollIndicator={false}>
                { }
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: theme.tint }]}>{i18n.t('welcome').toUpperCase()}</Text>
                        <Text style={[styles.title, { color: theme.text }]}>Strasbourg</Text>
                        <WeatherWidget />
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

                { }
                {featuredSight && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[styles.heroCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                        onPress={() => router.push(`/sight/${featuredSight.id}` as any)}
                    >
                        <View style={styles.glowOverlay} />
                        <Image source={featuredSight.image} style={styles.heroImage} />
                        <View style={styles.heroOverlay}>
                            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                                <Text style={[styles.badgeText, { color: theme.background }]}>{i18n.t('mustSee') || 'MUST SEE'}</Text>
                            </View>
                            <Text style={[styles.heroTitle, { color: theme.background }]} numberOfLines={2}>{tData(featuredSight, 'name')}</Text>
                            <Text style={styles.heroSubtitle} numberOfLines={2}>{tData(featuredSight, 'shortDescription')}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                { }
                <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{i18n.t('necessaryInfo')}</Text>
                </View>
                <View style={styles.necessaryLayout}>
                    <View style={styles.emergencyColumn}>
                        {EMERGENCY_DATA.map((info) => (
                            <TouchableOpacity
                                key={info.id}
                                activeOpacity={0.8}
                                onPress={() => handleOpenEmergency(info)}
                                style={[
                                    styles.emergencyCardSmall,
                                    {
                                        backgroundColor: theme.cardBackground,
                                        borderColor: theme.border,
                                        shadowColor: info.color
                                    }
                                ]}
                            >
                                <View style={[styles.emergencyIconContainerSmall, { backgroundColor: info.color + '15' }]}>
                                    <IconSymbol name={info.icon as any} size={22} color={info.color} />
                                </View>
                                <View style={styles.emergencyCardContent}>
                                    <Text style={[styles.emergencyCardTitleSmall, { color: theme.text }]} numberOfLines={1}>
                                        {tData(info, 'title')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setIsGuideVisible(true)}
                        style={[
                            styles.guideCard,
                            {
                                backgroundColor: theme.cardBackground,
                                borderColor: theme.border,
                                shadowColor: '#FF9800'
                            }
                        ]}
                    >
                        <View style={[styles.guideIconContainer, { backgroundColor: '#FF980015' }]}>
                            <IconSymbol name="book.fill" size={32} color="#FF9800" />
                        </View>
                        <Text style={[styles.guideCardTitle, { color: theme.text }]}>
                            {i18n.t('guideTitle') || 'Ticket Guide'}
                        </Text>
                        <Text style={[styles.guideCardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                            {i18n.t('howToBuy') || 'How to buy & validate'}
                        </Text>
                        <View style={styles.guideCardFooter}>
                            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>{i18n.t('seeAll')}</Text>
                            <IconSymbol name="chevron.right" size={14} color={theme.primary} />
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{i18n.t('popularActivity') || 'Popular Activity'}</Text>
                </View>

                {BATORAMA_DATA && (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={[styles.heroCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                        onPress={() => onNavigate('/batorama')}
                    >
                        <View style={styles.glowOverlay} />
                        <Image source={BATORAMA_DATA.image} style={styles.heroImage} />

                        <View style={styles.heroOverlay}>

                            <Text style={[styles.heroTitle, { color: theme.background }]}>{tData(BATORAMA_DATA, 'name')}</Text>
                            <Text style={styles.heroSubtitle}>
                                {((BATORAMA_DATA.translations as any)[i18n.locale] || BATORAMA_DATA.translations.en).tagline}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}



                { }
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{i18n.t('quickActions')}</Text>
                </View>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                        onPress={() => onNavigate('/explore', 'map')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                            <IconSymbol name="map.fill" size={24} color="#7B1FA2" />
                        </View>
                        <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>{i18n.t('map') || 'Map'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                        onPress={() => onNavigate('/transport')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#E0F2F1' }]}>
                            <IconSymbol name="tram.fill" size={24} color="#00796B" />
                        </View>
                        <Text style={[styles.actionLabel, { color: theme.textSecondary }]}>{i18n.t('transport')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            { }
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

            { }
            <EmergencyModal info={selectedEmergency} onClose={handleCloseEmergency} />

            <Modal
                visible={isGuideVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsGuideVisible(false)}
            >
                <View style={styles.guideModalBackdrop}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsGuideVisible(false)} />
                    <View style={styles.guideModalContent}>
                        <GuideContent onClose={() => setIsGuideVisible(false)} />
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.15,
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
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 30,
        padding: 16,
        position: 'relative',
    },
    glowOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(201,82,74,0.10)',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 16,
        left: 16,
        borderRadius: 6,
    },
    heroOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
        padding: 20,
        borderRadius: 6,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '300',
        letterSpacing: 0.01,
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
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.12,
        textTransform: 'uppercase',
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
        borderRadius: 6,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 12,
    },
    exploreIcon: {
        width: 44,
        height: 44,
        borderRadius: 6,
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
        gap: 12,
        marginBottom: 30,
    },
    actionButton: {
        width: (SCREEN_WIDTH - 52) / 2,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    actionLabel: {
        fontSize: 9,
    },
    tipsScroll: {
        paddingRight: 20,
        marginBottom: 30,
    },
    tipCard: {
        width: 160,
        height: 180,
        padding: 16,
        borderRadius: 8,
        marginRight: 12,
        borderWidth: 1,
        justifyContent: 'center',
    },
    tipIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 6,
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
        borderRadius: 8,
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
    },
    emergencyContainer: {
        marginBottom: 30,
        gap: 12,
    },
    necessaryLayout: {
        flexDirection: 'row',
        marginBottom: 30,
        gap: 12,
    },
    websiteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 20,
    },

    emergencyColumn: {
        flex: 1,
        gap: 12,
    },
    emergencyCardSmall: {
        flex: 1,
        height: 64,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    emergencyIconContainerSmall: {
        width: 40,
        height: 40,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    emergencyCardTitleSmall: {
        fontSize: 14,
        fontWeight: '700',
    },
    emergencyCardContent: {
        flex: 1,
    },
    guideCard: {

        flex: 1,
        padding: 20,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'space-between',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    guideIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    guideCardTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    guideCardDesc: {
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '500',
        marginBottom: 12,
    },
    guideCardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    guideModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    guideModalContent: {
        height: '85%',
        width: '100%',
    },
    emergencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    emergencyItemLeft: {
        flex: 1,
    },
    emergencyLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    emergencyValue: {
        fontSize: 17,
        fontWeight: '700',
    },
    emergencyActionIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    }
});


