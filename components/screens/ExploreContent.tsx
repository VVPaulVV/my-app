import { SightCard } from '@/components/SightCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { ACTIVITIES } from '@/data/activities';
import { MUSEUMS } from '@/data/museums';
import { RESTAURANTS } from '@/data/restaurants';
import { SIGHTS } from '@/data/sights';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/i18n';
import Mapbox from '@rnmapbox/maps';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CATEGORIES } from '@/data/categories';

export type ExploreContentProps = {
    category: string;
    setCategory: (cat: string) => void;
};

// Helper to get color
const getCategoryColor = (type: string) => {
    return CATEGORIES.find(c => c.nameKey === type)?.color || '#888';
};

const CITY_CENTER = [7.7506, 48.5818]; // Near Cathedral
const ALSACE_CENTER = [7.70, 48.56]; // Approximate center of Alsace

export function ExploreContent({ category, setCategory }: ExploreContentProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [search, setSearch] = useState('');
    const [isMapVisible, setIsMapVisible] = useState(false);
    // Map Filter State: "sights" | "restaurants" | "museums" | "activities"
    const [mapFilter, setMapFilter] = useState('sights');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const allItems = useMemo(() => [
        ...(SIGHTS as any[]).map(i => ({ ...i, type: 'sights' })),
        ...(RESTAURANTS as any[]).map(i => ({ ...i, type: 'restaurants' })),
        ...(MUSEUMS as any[]).map(i => ({ ...i, type: 'museums' })),
        ...(ACTIVITIES as any[]).map(i => ({ ...i, type: 'activities' }))
    ], []);

    const filteredItems = useMemo(() => {
        return allItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.location.toLowerCase().includes(search.toLowerCase());

            // List view still respects the generic 'category' prop if needed, 
            // but requirements say default mode is Sights, so we use passed prop.
            const itemCategory = item.category?.toLowerCase();
            const filterCategory = category.toLowerCase();

            const matchesCategory = itemCategory === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [allItems, search, category]);

    // Clear selection when filter changes
    const handleFilterChange = (newFilter: string) => {
        setMapFilter(newFilter);
        setSelectedItem(null);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {/* ... FlatList ... */}
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
                            <TouchableOpacity
                                style={[styles.mapButton, { backgroundColor: theme.primary }]}
                                onPress={() => setIsMapVisible(true)}
                            >
                                <IconSymbol name="map.fill" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                renderItem={({ item }) => (
                    <SightCard
                        sight={item}
                        onPress={() => router.push(`/sight/${item.id}` as any)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            {/* Explore Map Modal */}
            <Modal
                visible={isMapVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsMapVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: theme.background }}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Explore Map</Text>
                        <TouchableOpacity onPress={() => setIsMapVisible(false)} style={styles.closeButton}>
                            <IconSymbol name="xmark.circle.fill" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                        <Mapbox.MapView
                            style={{ flex: 1 }}
                            styleURL={Mapbox.StyleURL.Street}
                            onPress={() => setSelectedItem(null)} // Deselect on map click
                        >
                            <Mapbox.Camera
                                defaultSettings={{
                                    centerCoordinate: ALSACE_CENTER,
                                    zoomLevel: 9
                                }}
                                zoomLevel={13}
                                centerCoordinate={CITY_CENTER}
                                animationMode="flyTo"
                                animationDuration={2000}
                            />

                            {/* Render Custom Pins for ALL items */}
                            {allItems.map((item) => {
                                const isSelected = mapFilter === item.type;
                                // If not selected, do not render at all (Hiding pins completely as requested)
                                if (!isSelected) return null;

                                const color = getCategoryColor(item.type);
                                const isFocused = selectedItem?.id === item.id;

                                if (!item.coordinates) return null;

                                return (
                                    <Mapbox.PointAnnotation
                                        key={`${item.id}-${item.type}`}
                                        id={item.id}
                                        coordinate={[item.coordinates.longitude, item.coordinates.latitude]}
                                        title={item.name}
                                        onSelected={() => setSelectedItem(item)}
                                    >
                                        <View style={[
                                            styles.marker,
                                            {
                                                backgroundColor: color,
                                                transform: [{ scale: isFocused ? 1.3 : 1 }] // Scale up if focused
                                            }
                                        ]}>
                                            <View style={styles.markerInner} />
                                        </View>
                                    </Mapbox.PointAnnotation>
                                );
                            })}
                        </Mapbox.MapView>

                        {/* Floating Filter Bar - Hidden when item is selected */}
                        {!selectedItem && (
                            <View style={styles.filterContainer} pointerEvents="box-none">
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                    {['sights', 'restaurants', 'museums', 'activities'].map((f) => {
                                        const isActive = mapFilter === f;
                                        const color = getCategoryColor(f);

                                        return (
                                            <TouchableOpacity
                                                key={f}
                                                style={[
                                                    styles.filterChip,
                                                    {
                                                        backgroundColor: isActive ? color : theme.cardBackground,
                                                        borderColor: color,
                                                        borderWidth: 1,
                                                        zIndex: 101, // Boost individual button zIndex
                                                        elevation: 101
                                                    }
                                                ]}
                                                onPress={() => handleFilterChange(f)}
                                            >
                                                <Text style={[
                                                    styles.filterText,
                                                    { color: isActive ? '#222' : color }
                                                ]}>
                                                    {i18n.t(f)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}

                        {selectedItem && (
                            <Animated.View
                                style={[styles.infoCardContainer, { bottom: 40 }]}
                                entering={SlideInDown.duration(500).easing(Easing.out(Easing.exp))}
                                exiting={SlideOutDown.duration(300)}
                            >
                                <SightCard
                                    sight={selectedItem}
                                    onPress={() => {
                                        setIsMapVisible(false); // Close map
                                        router.push(`/sight/${selectedItem.id}` as any);
                                    }}
                                />
                                <TouchableOpacity
                                    style={styles.closeCardButton}
                                    onPress={() => setSelectedItem(null)}
                                >
                                    <IconSymbol name="xmark.circle.fill" size={24} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </Animated.View>
                        )}
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
        paddingBottom: 40,
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
        bottom: 30,
        left: 0,
        right: 0,
        zIndex: 100, // Ensure buttons are clickable above the map
        elevation: 100,
    },
    filterScroll: {
        paddingHorizontal: 20,
        paddingVertical: 12, // Added padding to prevent shadow clipping
        gap: 10,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    filterText: {
        fontWeight: '600',
        textTransform: 'capitalize',
    },
    marker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3
    },
    markerInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FFF'
    },
    infoCardContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        zIndex: 200,
        elevation: 200,
    },
    closeCardButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: '#FFF',
        borderRadius: 15,
        zIndex: 201,
        elevation: 201,
    }
});
