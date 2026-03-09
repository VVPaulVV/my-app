import { SightCard } from '@/components/SightCard';
import { Colors } from '@/constants/theme';
import { MUSEUMS } from '@/data/museums';
import { RESTAURANTS } from '@/data/restaurants';
import { SIGHTS } from '@/data/sights';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/i18n';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CATEGORIES } from '@/data/categories';

export type ExploreContentProps = {
    category: string;
    setCategory: (cat: string) => void;
};


const getCategoryColor = (type: string) => {
    return CATEGORIES.find(c => c.nameKey === type)?.color || '#888';
};

const getCategoryIcon = (type: string) => {
    switch (type) {
        case 'sights': return 'star.fill';
        case 'restaurants': return 'fork.knife';
        case 'museums': return 'building.columns.fill';
        default: return 'map.fill';
    }
};

const CITY_CENTER = [7.7506, 48.5818];
const ALSACE_CENTER = [7.70, 48.56];

export function ExploreContent({ category, setCategory }: ExploreContentProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();

    const [search, setSearch] = useState('');

    const allItems = useMemo(() => [
        ...(SIGHTS as any[]).map(i => ({ ...i, type: 'sights' })),
        ...(RESTAURANTS as any[]).map(i => ({ ...i, type: 'restaurants' })),
        ...(MUSEUMS as any[]).map(i => ({ ...i, type: 'museums' }))
    ], []);

    const normalize = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";


    const checkSearchMatch = (item: any, searchInput: string) => {
        if (!searchInput) return true;

        const name = normalize(item.name);
        const location = normalize(item.location);
        const desc = normalize(item.description || item.shortDescription);
        const tagsMatch = item.tags && item.tags.some((t: string) => normalize(t).includes(searchInput));

        return name.includes(searchInput) ||
            location.includes(searchInput) ||
            desc.includes(searchInput) ||
            tagsMatch;
    };

    const filteredItems = useMemo(() => {
        const searchInput = normalize(search);

        if (!searchInput) {

            const filterCategory = category.toLowerCase();
            return allItems.filter(item => {

                const itemCat = (item.type || item.category || '').toLowerCase();
                return itemCat === filterCategory;
            });
        }


        return allItems.filter(item => checkSearchMatch(item, searchInput));
    }, [allItems, search, category]);




    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            { }
            <FlatList
                data={filteredItems}
                keyExtractor={item => item.id}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={true}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>
                            {category ? i18n.t(category as any) : i18n.t('exploreTitle')}
                        </Text>

                        <View style={styles.searchRow}>
                            <View style={[styles.searchBar, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                <TextInput
                                    placeholder={i18n.t('searchPlaceholder')}
                                    placeholderTextColor={theme.icon}
                                    style={[styles.searchInput, { color: theme.text }]}
                                    value={search}
                                    onChangeText={setSearch}
                                />
                            </View>

                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <SightCard
                        sight={item}
                        onPress={() => router.push(`/sight/${item.id}` as any)}
                    />
                )}
                contentContainerStyle={[styles.listContent, { paddingBottom: 120 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                key={`grid-2`}
            />

            { }

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 12,
        paddingBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 16,
        fontFamily: 'System',
    },
    searchRow: {
        flexDirection: 'row',
        gap: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
    },
    mapButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    listContent: {
        padding: 12,
        paddingTop: 0,
        paddingBottom: 120,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    modalHeader: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    filterContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        zIndex: 100,
        elevation: 100,
    },
    filterScroll: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,

    },
    filterText: {
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    marker: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        paddingTop: 0,
    },
    markerInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFF'
    },
    infoCardContainer: {
        position: 'absolute',
        bottom: 50,
        left: 16,
        right: 16,
        zIndex: 200,
        elevation: 200,
    },
    mapCard: {
        flexDirection: 'row',
        height: 120,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
    },
    mapCardImageContainer: {
        width: 110,
        height: '100%',
    },
    mapCardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    mapCardContent: {
        flex: 1,
        padding: 12,
        justifyContent: 'space-between',
    },
    mapCardHeader: {
        paddingRight: 20,
    },
    mapCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    mapCardDesc: {
        fontSize: 12,
        lineHeight: 16,
        marginBottom: 8,
    },
    mapCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    miniChip: {
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    miniChipText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#222',
        letterSpacing: 0.5,
    },
    cardCloseBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        opacity: 0.9,
    },
    floatingCloseBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
        elevation: 150,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    mapSearchPill: {
        position: 'absolute',
        top: 50,
        left: 74,
        right: 20,
        height: 44,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 5,
        borderWidth: 1,
    },
    mapSearchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
        height: '100%',
        paddingVertical: 0,
    }
});
