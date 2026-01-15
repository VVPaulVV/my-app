import i18n from '@/i18n';
import { Ionicons } from '@expo/vector-icons'; // Standard Icons
import Mapbox from '@rnmapbox/maps';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';


// --- 1. CONFIGURATION ---
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3BlY3RydWgiLCJhIjoiY21rNG5sNmh3MDF6NjNkczl5cGM3Ynl2aSJ9.U3vf9ao95WB7Xxx4n2Ihug';
Mapbox.setAccessToken(MAPBOX_TOKEN);

import { ACTIVITIES } from '@/data/activities';
import { CATEGORIES } from '@/data/categories';
import { MUSEUMS } from '@/data/museums';
import { RESTAURANTS } from '@/data/restaurants';
import { SIGHTS, Sight } from '@/data/sights';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ALSACE_CENTER = [7.70, 48.56]; // Approximate center of Alsace

export default function SightDetailScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Get ID from URL, default to '1' for testing if missing
    const params = useLocalSearchParams();
    const id = params.id as string;

    const router = useRouter();
    const navigation = useNavigation();

    // State for Map Expansion
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    // Find the item in any data source
    const sight = (SIGHTS.map(s => ({ ...s, category: 'sights' as const })).find(s => s.id === id) ||
        MUSEUMS.map(m => ({ ...m, category: 'museums' as const })).find(m => m.id === id) ||
        RESTAURANTS.map(r => ({ ...r, category: 'restaurants' as const })).find(r => r.id === id) ||
        ACTIVITIES.map(a => ({ ...a, category: 'activities' as const })).find(a => a.id === id)) as Sight | undefined;

    // Animation State
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50); // Start 50px down

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    if (!sight) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>Sight not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.tint }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    useEffect(() => {
        // Start animation - Slide Up
        opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
        translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });

        // Hide default header
        navigation.setOptions({ headerShown: false });
    }, [opacity, translateY, navigation]);

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        }
    };

    const handleOpenMaps = () => {
        if (!sight || !sight.coordinates) return;
        const url = Platform.select({
            ios: `maps:0,0?q=${sight.name}@${sight.coordinates.latitude},${sight.coordinates.longitude}`,
            android: `geo:0,0?q=${sight.coordinates.latitude},${sight.coordinates.longitude}(${sight.name})`,
        });
        if (url) Linking.openURL(url);
    };

    // Resolve Category Color
    const categoryData = CATEGORIES.find(c => c.nameKey === sight.category);
    const categoryColor = categoryData?.color || '#333';
    // Use i18n for label since 'label' property doesn't exist on Category type
    const categoryLabel = i18n.t(sight.category);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header Image */}
            <Animated.View style={[styles.imageContainer]}>
                <Image
                    source={sight.image} // Works for both require() (number) and { uri: string } if formatted correctly, but our data has require() directly
                    style={styles.image}
                    contentFit="cover"
                    transition={500}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.7)']}
                    style={styles.gradient}
                />
            </Animated.View>

            {/* Back Button */}
            <TouchableOpacity
                style={[styles.backButton, { top: 50, backgroundColor: 'rgba(0,0,0,0.3)' }]}
                onPress={handleBack}
            >
                <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* Scrollable Content */}
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ height: 300 }} />

                <Animated.View style={[styles.detailsCard, { backgroundColor: theme.cardBackground || theme.background }, animatedContentStyle]}>

                    {/* Category Chip */}
                    <View style={[styles.categoryChip, { backgroundColor: categoryColor + '20' }]}>
                        <Text style={[styles.categoryText, { color: categoryColor }]}>{categoryLabel.toUpperCase()}</Text>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: theme.text }]}>{sight.name}</Text>

                    {/* Location Row */}
                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={16} color={theme.icon} style={{ marginRight: 6 }} />
                        <Text style={[styles.locationText, { color: theme.textSecondary }]}>{sight.location}</Text>
                    </View>

                    {/* Description */}
                    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>About</Text>
                    <Text style={[styles.description, { color: theme.text }]}>
                        {sight.description || sight.shortDescription}
                    </Text>

                    {/* Map Section */}
                    {sight.coordinates && (
                        <>
                            <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Location</Text>

                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => setIsMapExpanded(true)}
                                style={styles.mapContainer}
                            >
                                <Mapbox.MapView
                                    style={styles.map}
                                    styleURL={Mapbox.StyleURL.Street}
                                    scrollEnabled={false}
                                    zoomEnabled={false}
                                    pitchEnabled={false}
                                    rotateEnabled={false}
                                    logoEnabled={false}
                                    attributionEnabled={false}
                                >
                                    <Mapbox.Camera
                                        zoomLevel={14.5}
                                        centerCoordinate={[sight.coordinates.longitude, sight.coordinates.latitude]}
                                        animationMode="none"
                                    />
                                    <Mapbox.PointAnnotation
                                        id={`marker-${sight.id}`}
                                        coordinate={[sight.coordinates.longitude, sight.coordinates.latitude]}
                                    >
                                        <View style={[styles.marker, { backgroundColor: categoryColor }]}>
                                            <View style={styles.markerInner} />
                                        </View>
                                    </Mapbox.PointAnnotation>
                                </Mapbox.MapView>

                                <View style={styles.mapOverlay}>
                                    <View style={styles.expandButton}>
                                        <Ionicons name="expand-outline" size={20} color={'#000'} />
                                    </View>
                                </View>

                                <TouchableOpacity style={[styles.openMapsButton, { backgroundColor: categoryColor }]} onPress={handleOpenMaps}>
                                    <Ionicons name="map-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.openMapsText}>Open in Maps</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </>
                    )}

                    <View style={{ height: 40 }} />
                </Animated.View>
            </ScrollView>

            {/* FULLSCREEN MAP MODAL */}
            <Modal
                visible={isMapExpanded}
                animationType="fade"
                onRequestClose={() => setIsMapExpanded(false)}
            >
                <View style={{ flex: 1 }}>
                    <Mapbox.MapView
                        style={{ flex: 1 }}
                        styleURL={Mapbox.StyleURL.Street}
                        // Enabled interaction for fullscreen
                        scrollEnabled={true}
                        zoomEnabled={true}
                        pitchEnabled={true}
                        rotateEnabled={true}
                    >
                        {sight.coordinates && (
                            <>
                                <Mapbox.Camera
                                    defaultSettings={{
                                        centerCoordinate: ALSACE_CENTER,
                                        zoomLevel: 9
                                    }}
                                    zoomLevel={16}
                                    centerCoordinate={[sight.coordinates.longitude, sight.coordinates.latitude]}
                                    animationMode="flyTo"
                                    animationDuration={2000} // Increased to 2 seconds for dramatic effect
                                />
                                <Mapbox.PointAnnotation
                                    id={`marker-full-${sight.id}`}
                                    coordinate={[sight.coordinates.longitude, sight.coordinates.latitude]}
                                >
                                    <View style={[styles.marker, { backgroundColor: categoryColor, width: 40, height: 40, borderRadius: 20 }]}>
                                        <View style={[styles.markerInner, { width: 12, height: 12, borderRadius: 6 }]} />
                                    </View>
                                </Mapbox.PointAnnotation>
                            </>
                        )}
                    </Mapbox.MapView>

                    {/* Close Button */}
                    <TouchableOpacity
                        style={[styles.closeMapButton, { backgroundColor: theme.background }]}
                        onPress={() => setIsMapExpanded(false)}
                    >
                        <Ionicons name="close" size={28} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    imageContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 400, width: '100%', zIndex: 0 },
    image: { width: '100%', height: '100%' },
    gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 },
    backButton: { position: 'absolute', left: 20, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    scrollContainer: { flex: 1, zIndex: 1 },
    contentContainer: { paddingBottom: 0 },
    detailsCard: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        minHeight: 500,
        paddingTop: 32,
        marginTop: -40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10
    },
    categoryChip: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 16 },
    categoryText: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    title: { fontSize: 32, fontWeight: '700', marginBottom: 8, lineHeight: 40 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    locationText: { fontSize: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
    description: { fontSize: 16, lineHeight: 26, opacity: 0.8 },
    mapContainer: { height: 220, borderRadius: 20, overflow: 'hidden', marginTop: 8, position: 'relative' },
    map: { flex: 1 },
    mapOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
    expandButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    openMapsButton: { position: 'absolute', bottom: 16, right: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4, zIndex: 10 },
    openMapsText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
    marker: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
    markerInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
    closeMapButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6
    }
});