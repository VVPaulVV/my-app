import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { ACTIVITIES } from '@/data/activities';
import { MUSEUMS } from '@/data/museums';
import { RESTAURANTS } from '@/data/restaurants';
import { SIGHTS } from '@/data/sights';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/i18n';
import { useRouter } from 'expo-router';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function HomeContent({ onNavigate }: { onNavigate: (path: string, cat?: string) => void }) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const featuredSight = SIGHTS.find(s => s.id === 'cathedral');

    const ExploreSection = ({ title, data, categoryId }: { title: string, data: any[], categoryId: string }) => (
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
                        <View style={styles.cardContent}>
                            <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
                            <View style={styles.cardMeta}>
                                <IconSymbol name="mappin.and.ellipse" size={12} color={theme.primary} />
                                <Text style={[styles.cardLocation, { color: theme.textSecondary }]} numberOfLines={1}>{item.location}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const exploreCategories = [
        { id: 'sights', name: 'Sights', icon: 'camera.fill', color: '#FFD1D1', route: '/explore?category=sights' },
        { id: 'restaurants', name: 'Restaurants', icon: 'fork.knife', color: '#C1E1C1', route: '/explore?category=restaurants' },
        { id: 'museums', name: 'Museums', icon: 'building.columns.fill', color: '#A0C4FF', route: '/explore?category=museums' },
        { id: 'activities', name: 'Activities', icon: 'sparkles', color: '#FFE5B4', route: '/explore?category=activities' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: theme.textSecondary }]}>Bienvenue à</Text>
                        <Text style={[styles.title, { color: theme.text }]}>Strasbourg</Text>
                    </View>
                    <View style={[styles.avatarContainer, { borderColor: theme.border }]}>
                        <Image
                            source={require('@/assets/images/sights/petite-france.jpg')}
                            style={styles.avatar}
                        />
                    </View>
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
                            <Text style={styles.heroTitle}>{featuredSight.name}</Text>
                            <Text style={styles.heroSubtitle}>{featuredSight.shortDescription}</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Explore Categories */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Explore</Text>
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
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
                </View>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                        onPress={() => onNavigate('/transport', 'map')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                            <IconSymbol name="map.fill" size={24} color="#1976D2" />
                        </View>
                        <Text style={[styles.actionLabel, { color: theme.text }]}>Map</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                        onPress={() => onNavigate('/transport')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#F1F8E9' }]}>
                            <IconSymbol name="tram.fill" size={24} color="#388E3C" />
                        </View>
                        <Text style={[styles.actionLabel, { color: theme.text }]}>Tickets</Text>
                    </TouchableOpacity>
                </View>

                {/* Museum Section */}
                <ExploreSection title={i18n.t('museums')} data={MUSEUMS} categoryId="museums" />

                {/* Restaurant Section */}
                <ExploreSection title={i18n.t('restaurants')} data={RESTAURANTS} categoryId="restaurants" />

                {/* Activity Section */}
                <ExploreSection title={i18n.t('activities')} data={ACTIVITIES} categoryId="activities" />

                {/* Bottom Spacer */}
                <View style={{ height: 40 }} />
            </ScrollView>
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
    }
});
