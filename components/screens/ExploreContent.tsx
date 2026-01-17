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
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Image, Modal, Animated as RNAnimated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, LinearTransition, SlideInDown, SlideOutDown } from 'react-native-reanimated';
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

const getCategoryIcon = (type: string) => {
    switch (type) {
        case 'sights': return 'star.fill';
        case 'restaurants': return 'fork.knife';
        case 'museums': return 'building.columns.fill';
        case 'activities': return 'figure.walk';
        default: return 'map.fill';
    }
};

const CITY_CENTER = [7.7506, 48.5818]; // Near Cathedral
const ALSACE_CENTER = [7.70, 48.56]; // Approximate center of Alsace

// --- Map Marker Component ---
const MapMarker = ({ item, isFocused, color, icon, onSelect }: any) => {
    // Use standard React Native Animated for better compatibility with Mapbox
    const scaleAnim = useRef(new RNAnimated.Value(1)).current;

    useEffect(() => {
        RNAnimated.spring(scaleAnim, {
            toValue: isFocused ? 1.5 : 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true, // Native driver usually works for transform
        }).start();
    }, [isFocused]);

    return (
        <Mapbox.PointAnnotation
            id={item.id}
            coordinate={[item.coordinates.longitude, item.coordinates.latitude]}
            title={item.name}
            onSelected={onSelect}
        >
            <RNAnimated.View style={[
                styles.marker,
                {
                    backgroundColor: color,
                    zIndex: isFocused ? 999 : 1,
                    transform: [{ scale: scaleAnim }]
                },
            ]}>
                <IconSymbol name={icon as any} size={14} color="#FFF" />
            </RNAnimated.View>
        </Mapbox.PointAnnotation>
    );
};

export function ExploreContent({ category, setCategory }: ExploreContentProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [search, setSearch] = useState('');
    const [isMapVisible, setIsMapVisible] = useState(false);
    // Map Filter State: "all" | "sights" | "restaurants" | "museums" | "activities"
    const [mapFilter, setMapFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [cameraCenter, setCameraCenter] = useState(CITY_CENTER);

    const allItems = useMemo(() => [
        ...(SIGHTS as any[]).map(i => ({ ...i, type: 'sights' })),
        ...(RESTAURANTS as any[]).map(i => ({ ...i, type: 'restaurants' })),
        ...(MUSEUMS as any[]).map(i => ({ ...i, type: 'museums' })),
        ...(ACTIVITIES as any[]).map(i => ({ ...i, type: 'activities' }))
    ], []);

    const filteredItems = useMemo(() => {
        const normalize = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
        const searchInput = normalize(search);

        if (!searchInput) {
            // If no search, respect the active category tab
            const filterCategory = category.toLowerCase();
            return allItems.filter(item => {
                // Use item.type which we explicitly set, as fallback for data.category
                const itemCat = (item.type || item.category || '').toLowerCase();
                return itemCat === filterCategory;
            });
        }

        // Global Search Mode
        return allItems.filter(item => {
            const name = normalize(item.name);
            const location = normalize(item.location);
            const desc = normalize(item.description || item.shortDescription);
            // Check tags if they exist
            const tagsMatch = item.tags && item.tags.some((t: string) => normalize(t).includes(searchInput));

            return name.includes(searchInput) ||
                location.includes(searchInput) ||
                desc.includes(searchInput) ||
                tagsMatch;
        });
    }, [allItems, search, category]);

    // Clear selection when filter changes
    const handleFilterChange = (newFilter: string) => {
        setMapFilter(newFilter);
        setSelectedItem(null);
        setCameraCenter(CITY_CENTER);
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
                                onPress={() => {
                                    setMapFilter('all');      // Reset filter to All
                                    setSelectedItem(null);    // Clear any selection
                                    setCameraCenter(CITY_CENTER); // Reset camera
                                    setIsMapVisible(true);
                                }}
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
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                key={`grid-2`} // Force remount if columns change (good practice)
            />

            {/* Explore Map Modal */}
            <Modal
                visible={isMapVisible}
                animationType="fade"
                presentationStyle="overFullScreen"
                onRequestClose={() => setIsMapVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: theme.background }}>
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
                                zoomLevel={selectedItem ? 15 : 13}
                                centerCoordinate={cameraCenter}
                                animationMode="flyTo"
                                animationDuration={1000}
                            />

                            {/* Render Custom Pins for ALL items */}
                            {allItems.map((item) => {
                                const isSelected = mapFilter === 'all' || mapFilter === item.type;
                                // If not selected, do not render at all (Hiding pins completely as requested)
                                if (!isSelected || !item.coordinates) return null;

                                const color = getCategoryColor(item.type);
                                const isFocused = selectedItem?.id === item.id;
                                const icon = getCategoryIcon(item.type);

                                return (
                                    <MapMarker
                                        key={`${item.id}-${item.type}`}
                                        item={item}
                                        isFocused={isFocused}
                                        color={color}
                                        icon={icon}
                                        onSelect={() => {
                                            setSelectedItem(item);
                                            setCameraCenter([item.coordinates!.longitude, item.coordinates!.latitude]);
                                        }}
                                    />
                                );
                            })}
                        </Mapbox.MapView>

                        {/* Floating Filter Bar - Hidden when item is selected */}
                        {/* Floating Close Button */}
                        <TouchableOpacity
                            style={[
                                styles.floatingCloseBtn,
                                { backgroundColor: theme.cardBackground, shadowColor: '#000' }
                            ]}
                            onPress={() => setIsMapVisible(false)}
                        >
                            <IconSymbol name="xmark" size={20} color={theme.text} />
                        </TouchableOpacity>

                        {/* Floating Filter Bar - Hidden when item is selected */}
                        {!selectedItem && isMapVisible && (
                            <Animated.View
                                style={styles.filterContainer}
                                pointerEvents="box-none"
                                entering={SlideInDown.delay(100).duration(400).easing(Easing.out(Easing.exp))}
                                exiting={SlideOutDown.duration(300)}
                                layout={LinearTransition}
                            >
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                    {['all', 'sights', 'restaurants', 'museums', 'activities'].map((f) => {
                                        const isActive = mapFilter === f;
                                        const color = f === 'all' ? '#222' : getCategoryColor(f);
                                        const activeBg = f === 'all' ? '#222' : color;

                                        return (
                                            <TouchableOpacity
                                                key={f}
                                                style={[
                                                    styles.filterChip,
                                                    {
                                                        backgroundColor: isActive ? activeBg : theme.cardBackground,
                                                        borderColor: activeBg,
                                                        borderWidth: 1,
                                                        zIndex: 101, // Boost individual button zIndex
                                                        elevation: 101
                                                    }
                                                ]}
                                                onPress={() => handleFilterChange(f)}
                                            >
                                                <Text style={[
                                                    styles.filterText,
                                                    { color: isActive ? '#FFF' : (f === 'all' ? theme.text : color) }
                                                ]}>
                                                    {f === 'all' ? 'All' : i18n.t(f as any)}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </Animated.View>
                        )}

                        {selectedItem && isMapVisible && (
                            <Animated.View
                                style={[styles.infoCardContainer]}
                                entering={SlideInDown.duration(400).easing(Easing.out(Easing.exp))}
                                exiting={SlideOutDown.duration(200)}
                            >
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    style={[styles.mapCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                                    onPress={() => {
                                        // Do NOT close the map here.
                                        // When the user goes back, the modal will still be visible.
                                        router.push(`/sight/${selectedItem.id}` as any);
                                    }}
                                >
                                    {/* Image */}
                                    <View style={styles.mapCardImageContainer}>
                                        <Image source={selectedItem.image} style={styles.mapCardImage} />
                                    </View>

                                    {/* Content */}
                                    <View style={styles.mapCardContent}>
                                        <View style={styles.mapCardHeader}>
                                            <Text style={[styles.mapCardTitle, { color: theme.text }]} numberOfLines={1}>
                                                {selectedItem.name}
                                            </Text>
                                        </View>
                                        <Text style={[styles.mapCardDesc, { color: theme.icon }]} numberOfLines={2}>
                                            {selectedItem.shortDescription}
                                        </Text>

                                        <View style={styles.mapCardFooter}>
                                            <View style={[styles.miniChip, { backgroundColor: getCategoryColor(selectedItem.type) }]}>
                                                <Text style={styles.miniChipText}>{i18n.t(selectedItem.type as any).toUpperCase()}</Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 13, marginRight: 2 }}>More</Text>
                                                <IconSymbol name="chevron.right" size={16} color={theme.primary} />
                                            </View>
                                        </View>
                                    </View>

                                    {/* Close Button */}
                                    <TouchableOpacity
                                        style={[styles.cardCloseBtn, { backgroundColor: theme.background }]}
                                        onPress={(e) => {
                                            e.stopPropagation(); // Prevent card press
                                            setSelectedItem(null);
                                        }}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <IconSymbol name="xmark" size={16} color={theme.text} />
                                    </TouchableOpacity>
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
        paddingBottom: 120, // Extra padding for floating tab bar
    },
    columnWrapper: {
        justifyContent: 'space-between', // Ensures cards are spaced evenly
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
        // No shadow as requested
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
        bottom: 50, // Moved up slightly
        left: 16,
        right: 16,
        zIndex: 200,
        elevation: 200,
    },
    mapCard: {
        flexDirection: 'row',
        height: 120, // Fixed height for consistency
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
        paddingRight: 20, // Space for close button
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
        top: 50, // SafeArea
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
    }
});
