import { Colors } from '@/constants/theme';
import { BATORAMA_DATA } from '@/data/batorama';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/i18n';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '../ui/icon-symbol';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function BatoramaContent() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();
    const locale = i18n.locale;
    const data = (BATORAMA_DATA.translations as any)[locale] || BATORAMA_DATA.translations.en;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.title, { color: theme.text }]}>{data.name}</Text>
                        <Text style={[styles.tagline, { color: theme.primary }]}>{data.tagline}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                        onPress={() => router.back()}
                    >
                        <IconSymbol name="xmark" size={20} color={theme.text} />
                    </TouchableOpacity>
                </View>

                {/* Hero Image */}
                <View style={[styles.heroContainer, { backgroundColor: theme.cardBackground, borderRadius: 8, overflow: 'hidden' }]}>
                    <Image source={BATORAMA_DATA.image} style={[styles.heroImage, { height: 160 }]} resizeMode="contain" />

                    <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                        <IconSymbol name="star.fill" size={14} color={theme.background} />
                        <Text style={[styles.badgeText, { color: theme.background }]}>{data.mustDo}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>
                        {data.description}
                    </Text>
                </View>

                {/* Circuits */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{i18n.t('highlights')}</Text>
                    {data.circuits.map((circuit: any) => (
                        <View
                            key={circuit.id}
                            style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border, padding: 0, overflow: 'hidden' }]}
                        >
                            {circuit.image && (
                                <Image source={circuit.image} style={styles.circuitImage} />
                            )}
                            <View style={{ padding: 20 }}>
                                <View style={styles.cardHeader}>
                                    <View style={[
                                        styles.iconContainer,
                                        { backgroundColor: circuit.id === 'red-tour' ? '#e74c3c20' : '#34495e20' }
                                    ]}>
                                        <IconSymbol
                                            name="ferry.fill"
                                            size={24}
                                            color={circuit.id === 'red-tour' ? '#e74c3c' : '#34495e'}
                                        />
                                    </View>


                                    <View style={styles.cardHeaderText}>
                                        <Text style={[styles.cardTitle, { color: theme.text }]}>{circuit.name}</Text>
                                        <View style={styles.durationRow}>
                                            <IconSymbol name="info.circle" size={14} color={theme.textSecondary} />
                                            <Text style={[styles.durationText, { color: theme.textSecondary }]}>{circuit.duration}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                                    {circuit.description}
                                </Text>

                                <View style={styles.highlightsList}>
                                    {circuit.highlights.map((h: any, idx: number) => (
                                        <View key={idx} style={styles.highlightItem}>
                                            <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.highlightTitle, { color: theme.text }]}>{h.title}</Text>
                                                <Text style={[styles.highlightDesc, { color: theme.textSecondary }]}>{h.description}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>

                    ))}
                </View>

                {/* Info and Access */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{data.access.title}</Text>
                    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <InfoItem icon="figure.walk" label={data.access.labels.onFoot} value={data.access.onFoot} theme={theme} />
                        <InfoItem icon="bus.fill" label={data.access.labels.bus} value={data.access.bus} theme={theme} />
                        <InfoItem icon="tram.fill" label={data.access.labels.tram} value={data.access.tram} theme={theme} />
                        <InfoItem icon="mappin.and.ellipse" label={data.access.labels.departure} value={data.access.piers} theme={theme} />
                        <View style={[styles.divider, { backgroundColor: theme.border }]} />
                        <InfoItem icon="building.2" label={data.access.labels.shop} value={data.access.shop} theme={theme} />
                    </View>
                </View>

                {/* Hours */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>{data.hours.title}</Text>
                    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <InfoItem icon="info.circle" label={data.hours.labels.boarding} value={data.hours.piers} theme={theme} />
                        <InfoItem icon="info.circle" label={data.hours.labels.shop} value={data.hours.shop} theme={theme} />
                    </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={[styles.mainButton, { backgroundColor: theme.primary }]}
                    onPress={() => Linking.openURL(BATORAMA_DATA.website)}
                >
                    <Text style={[styles.mainButtonText, { color: theme.background }]}>{i18n.t('reserveOnline') || 'Book Online'}</Text>
                    <IconSymbol name="arrow.up.right" size={20} color={theme.background} />
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

function InfoItem({ icon, label, value, theme }: any) {
    return (
        <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.primary + '15' }]}>
                <IconSymbol name={icon} size={18} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{value}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    header: {
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    tagline: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 4,
    },
    heroContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    heroImage: {
        width: '100%',
        height: 220,
        borderRadius: 8,
    },
    badge: {
        position: 'absolute',
        top: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        gap: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '800',
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
    },
    card: {
        borderRadius: 8,
        padding: 20,
        borderWidth: 1,
        marginBottom: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    durationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    durationText: {
        fontSize: 13,
        fontWeight: '600',
    },
    cardDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
        fontWeight: '500',
    },
    circuitImage: {
        width: '100%',
        height: 150,
        backgroundColor: '#eee',
    },

    highlightsList: {
        gap: 16,
    },
    highlightItem: {
        flexDirection: 'row',
        gap: 12,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 8,
    },
    highlightTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 2,
    },
    highlightDesc: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 16,
    },
    infoIcon: {
        width: 36,
        height: 36,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
    },
    divider: {
        height: 1,
        marginVertical: 4,
        marginBottom: 16,
    },
    mainButton: {
        flexDirection: 'row',
        height: 64,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 20,
    },
    mainButtonText: {
        fontSize: 18,
        fontWeight: '800',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    }
});
