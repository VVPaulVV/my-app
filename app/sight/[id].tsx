import i18n, { tData } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import Mapbox from '@rnmapbox/maps';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';



const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3BlY3RydWgiLCJhIjoiY21rNG5sNmh3MDF6NjNkczl5cGM3Ynl2aSJ9.U3vf9ao95WB7Xxx4n2Ihug';
Mapbox.setAccessToken(MAPBOX_TOKEN);

import { CATEGORIES } from '@/data/categories';
import { MUSEUMS } from '@/data/museums';
import { RESTAURANTS } from '@/data/restaurants';
import { SIGHTS, Sight } from '@/data/sights';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFavorites } from '@/hooks/use-favorites';
import * as Haptics from 'expo-haptics';



export default function SightDetailScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];


    const { id, returnCategory } = useLocalSearchParams<{ id: string; returnCategory?: string }>();

    const router = useRouter();
    const navigation = useNavigation();





    const sight = (SIGHTS.map(s => ({ ...s, category: 'sights' as const })).find(s => s.id === id) ||
        MUSEUMS.map(m => ({ ...m, category: 'museums' as const })).find(m => m.id === id) ||
        RESTAURANTS.map(r => ({ ...r, category: 'restaurants' as const })).find(r => r.id === id)) as Sight | undefined;

    const { isFavorite, toggleFavorite } = useFavorites();
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        if (sight) {
            setIsFav(isFavorite(sight.id));
        }
    }, [sight, isFavorite]);

    const handleToggleFavorite = () => {
        if (sight) {
            toggleFavorite(sight.id);
            setIsFav(!isFav);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };


    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50);

    const animatedContentStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    if (!sight) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>{i18n.t('sightNotFound') || 'Sight not found'}</Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/', params: { category: returnCategory || 'sights' } })} style={{ marginTop: 20 }}>
                    <Text style={{ color: theme.tint }}>{i18n.t('goBack')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const categoryColor = CATEGORIES.find(c => c.id === sight.category)?.color || theme.primary;

    const handleOpenMaps = () => {
        router.dismissAll();
        router.push({ pathname: '/', params: { category: 'map', poiId: sight?.id } });
    };

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
        translateY.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.exp) });
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ title: '', headerShown: false }} />
            { }
            <View style={styles.imageContainer}>
                <Image source={sight.image} style={styles.image} contentFit="cover" transition={1000} />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gradient} />

            </View>

            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <View style={{ height: 350 }} />
                <Animated.View style={[styles.detailsCard, { backgroundColor: theme.cardBackground }, animatedContentStyle]}>
                    { }
                    <View style={[styles.categoryChip, { backgroundColor: categoryColor + '20' }]}>
                        <Text style={[styles.categoryText, { color: categoryColor }]}>{i18n.t(sight.category)}</Text>
                    </View>

                    <Text style={[styles.title, { color: theme.text }]}>{tData(sight, 'name')}</Text>

                    { }
                    <TouchableOpacity activeOpacity={0.7} onPress={handleOpenMaps} style={styles.locationRow}>
                        <Ionicons name="location-sharp" size={18} color={categoryColor} style={{ marginRight: 6 }} />
                        <Text style={[styles.locationText, { color: categoryColor }]}>{tData(sight, 'location')}</Text>
                    </TouchableOpacity>

                    { }
                    <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>{i18n.t('about')}</Text>
                    <Text style={[styles.description, { color: theme.text }]}>
                        {tData(sight, 'description') || tData(sight, 'shortDescription')}
                    </Text>

                    { }
                    {
                        sight.category === 'restaurants' && (
                            <View style={{ marginTop: 24, marginBottom: 8 }}>
                                <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 12 }]}>{i18n.t('reservation')}</Text>

                                { }

                                {((sight as any).reservationUrl || (sight as any).phoneNumber) ? (
                                    <View style={{ gap: 12 }}>
                                        { }
                                        <TouchableOpacity
                                            disabled={!(sight as any).reservationUrl}
                                            style={{
                                                backgroundColor: (sight as any).reservationUrl ? theme.primary : theme.border,
                                                paddingVertical: 14,
                                                paddingHorizontal: 20,
                                                borderRadius: 12,
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                shadowColor: (sight as any).reservationUrl ? theme.primary : 'transparent',
                                                shadowOffset: { width: 0, height: 4 },
                                                shadowOpacity: (sight as any).reservationUrl ? 0.3 : 0,
                                                shadowRadius: 8,
                                                elevation: (sight as any).reservationUrl ? 4 : 0
                                            }}
                                            onPress={() => (sight as any).reservationUrl && Linking.openURL((sight as any).reservationUrl)}
                                        >
                                            <Ionicons name="calendar-outline" size={20} color={(sight as any).reservationUrl ? "#FFF" : theme.textSecondary} style={{ marginRight: 8 }} />
                                            <Text style={{ color: (sight as any).reservationUrl ? "#FFF" : theme.textSecondary, fontWeight: 'bold', fontSize: 16 }}>
                                                {(sight as any).reservationUrl ? i18n.t('reserveOnline') : i18n.t('bookingUnavailable')}
                                            </Text>
                                            {(sight as any).reservationUrl && <Ionicons name="arrow-forward" size={16} color="#FFF" style={{ marginLeft: 8, opacity: 0.8 }} />}
                                        </TouchableOpacity>

                                        { }
                                        <TouchableOpacity
                                            disabled={!(sight as any).phoneNumber}
                                            style={{
                                                backgroundColor: (sight as any).phoneNumber ? theme.background : theme.border,
                                                borderColor: (sight as any).phoneNumber ? theme.primary : 'transparent',
                                                borderWidth: (sight as any).phoneNumber ? 2 : 0,
                                                paddingVertical: 14,
                                                paddingHorizontal: 20,
                                                borderRadius: 12,
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                            }}
                                            onPress={() => (sight as any).phoneNumber && Linking.openURL(`tel:${(sight as any).phoneNumber}`)}
                                        >
                                            <Ionicons name="call-outline" size={20} color={(sight as any).phoneNumber ? theme.primary : theme.textSecondary} style={{ marginRight: 8 }} />
                                            <Text style={{ color: (sight as any).phoneNumber ? theme.primary : theme.textSecondary, fontWeight: 'bold', fontSize: 16 }}>
                                                {(sight as any).phoneNumber ? i18n.t('callReserve') : i18n.t('phoneUnavailable')}
                                            </Text>
                                            {(sight as any).phoneNumber && <Text style={{ color: theme.textSecondary, fontSize: 14, marginLeft: 8 }}>{(sight as any).phoneNumber}</Text>}
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={{
                                        backgroundColor: theme.cardBackground,
                                        borderColor: theme.border,
                                        borderWidth: 1,
                                        paddingVertical: 14,
                                        paddingHorizontal: 20,
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        flexDirection: 'row',
                                        justifyContent: 'center'
                                    }}>
                                        <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
                                        <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '500' }}>{i18n.t('noReservation')}</Text>
                                    </View>
                                )}
                            </View>
                        )
                    }

                    { }
                    {
                        sight.coordinates && (
                            <>
                                <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>{i18n.t('location')}</Text>

                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    onPress={handleOpenMaps}
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



                                    <TouchableOpacity style={[styles.openMapsButton, { backgroundColor: categoryColor }]} onPress={handleOpenMaps}>
                                        <Ionicons name="map-outline" size={16} color="#FFF" style={{ marginRight: 8 }} />
                                        <Text style={styles.openMapsText}>{i18n.t('mapView')}</Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            </>
                        )
                    }

                    <View style={{ height: 40 }} />
                </Animated.View >
            </ScrollView >

            <TouchableOpacity onPress={() => router.push({ pathname: '/', params: { category: returnCategory || 'sights' } })} style={[styles.backButton, { backgroundColor: theme.background }]}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleToggleFavorite} style={[styles.favoriteButton, { backgroundColor: theme.background }]}>
                <Ionicons name={isFav ? "heart" : "heart-outline"} size={24} color={isFav ? "#FF4B4B" : theme.text} />
            </TouchableOpacity>


        </View >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    imageContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 400, width: '100%', zIndex: 0 },
    image: { width: '100%', height: '100%' },
    gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 },
    backButton: { position: 'absolute', top: 55, left: 20, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
    favoriteButton: { position: 'absolute', top: 55, right: 20, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
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