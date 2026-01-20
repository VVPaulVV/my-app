import { ParkingList } from '@/components/ParkingList';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { TRANSPORT_LINES } from '@/data/transport_data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ParkingData, useParkingData } from '@/hooks/useParkingData';
import i18n from '@/i18n';
import { offsetPolyline, toGeoJSONLineString } from '@/utils/geo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Mapbox from '@rnmapbox/maps';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Linking, Modal, Platform, Pressable, Animated as RNAnimated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInDown, LinearTransition, SlideInDown, SlideOutDown, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GuideContent } from './GuideContent';

// --- Constants ---
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3BlY3RydWgiLCJhIjoiY21rNG5sNmh3MDF6NjNkczl5cGM3Ynl2aSJ9.U3vf9ao95WB7Xxx4n2Ihug';
Mapbox.setAccessToken(MAPBOX_TOKEN);

const CITY_CENTER = [7.74553, 48.58392]; // [Lon, Lat] for Mapbox
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const INITIAL_ZOOM = 11.5;

// --- Parking Marker Component ---
const ParkingMapMarker = ({ item, isFocused, onSelect, theme }: { item: ParkingData, isFocused: boolean, onSelect: () => void, theme: any }) => {
    const scaleAnim = useRef(new RNAnimated.Value(1)).current;

    // Determine color based on status
    const isOpen = item.etat_descriptif === 'Ouvert';
    const percentFree = item.total > 0 ? (item.libre / item.total) : 0;

    let color = theme.success;
    if (!isOpen) color = theme.textSecondary; // Closed -> Gray
    else if (item.libre === 0 || percentFree < 0.1) color = theme.error; // Full/Almost full -> Red
    else if (percentFree < 0.3) color = '#FFA500'; // Moderate -> Orange

    useEffect(() => {
        RNAnimated.spring(scaleAnim, {
            toValue: isFocused ? 1.3 : 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, [isFocused]);

    return (
        <Mapbox.PointAnnotation
            id={item.nom_parking}
            coordinate={[item.position.lon, item.position.lat]}
            title={item.nom_parking}
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
                <View style={styles.markerInner}>
                    <Text style={styles.markerText}>P</Text>
                </View>
            </RNAnimated.View>
        </Mapbox.PointAnnotation>
    );
};

export interface TransportRef {
    openMap: () => void;
}

export const TransportContent = React.memo(React.forwardRef<TransportRef>((props, ref) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Parking Data
    const { data: parkingData, loading: parkingLoading, error: parkingError, refetch: refetchParking, lastUpdated } = useParkingData();

    // Animation State
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const [isParkingMapVisible, setIsParkingMapVisible] = useState(false);

    const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
    const [selectedParking, setSelectedParking] = useState<ParkingData | null>(null);

    const [isGuideVisible, setIsGuideVisible] = useState(false);
    const modalOpacity = useSharedValue(0);
    const isClosing = useSharedValue(false);

    // --- Transport Map Handlers ---
    const handleOpenMap = () => {
        setIsMapFullscreen(true);
        isClosing.value = false;
        modalOpacity.value = 0;
        setTimeout(() => {
            modalOpacity.value = withTiming(1, { duration: 300 });
        }, 50);
    };

    const handleCloseMap = () => {
        isClosing.value = true;
        modalOpacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(setIsMapFullscreen)(false);
            runOnJS(setSelectedLineId)(null);
        });
    };

    // --- Parking Map Handlers ---
    // We reuse simple Modal for parking map (inspired by ExploreContent) rather than the complex animated one for Transport

    React.useImperativeHandle(ref, () => ({
        openMap: handleOpenMap
    }));

    const animatedModalStyle = useAnimatedStyle(() => ({
        opacity: modalOpacity.value
    }));

    // Accelerate UI fade out ONLY when closing + Manual Slide Up/Down
    const uiStyle = useAnimatedStyle(() => {
        const translateY = (1 - modalOpacity.value) * 50;
        if (!isClosing.value) {
            return { opacity: 1, transform: [{ translateY }], zIndex: 100 };
        }
        const val = (modalOpacity.value - 0.4) / 0.6;
        return { opacity: val < 0 ? 0 : (val > 1 ? 1 : val), transform: [{ translateY }], zIndex: 100 };
    });

    const closeButtonAnimationStyle = useAnimatedStyle(() => {
        const translateX = (1 - modalOpacity.value) * 80;
        if (!isClosing.value) {
            return { opacity: 1, transform: [{ translateX }], zIndex: 101 };
        }
        const val = (modalOpacity.value - 0.4) / 0.6;
        return { opacity: val < 0 ? 0 : (val > 1 ? 1 : val), transform: [{ translateX }], zIndex: 101 };
    });

    const openCTSWebsite = () => {
        Linking.openURL('https://www.cts-strasbourg.eu/en/');
    };

    // Prepare GeoJSON Data
    const transportSource = useMemo(() => {
        const features = TRANSPORT_LINES.map(line => ({
            type: 'Feature' as const,
            properties: { id: line.id, color: line.color },
            geometry: line.geoJson || toGeoJSONLineString(offsetPolyline(line.path || [], 0)),
        }));
        return { type: 'FeatureCollection' as const, features: features };
    }, []);

    const toggleLineSelection = (id: string) => {
        setSelectedLineId(prev => (prev === id ? null : id));
    };

    const selectedLine = TRANSPORT_LINES.find(l => l.id === selectedLineId);

    const renderMapContent = (fullscreen: boolean) => (
        <Mapbox.MapView
            style={{ flex: 1 }}
            styleURL={Mapbox.StyleURL.Street}
            surfaceView={false}
            scrollEnabled={fullscreen}
            zoomEnabled={fullscreen}
            pitchEnabled={fullscreen}
            rotateEnabled={fullscreen}
            attributionEnabled={false}
            logoEnabled={false}
        >
            <Mapbox.Camera
                zoomLevel={INITIAL_ZOOM}
                centerCoordinate={CITY_CENTER}
                animationMode={'none'}
            />
            <Mapbox.ShapeSource id="transportLines" shape={transportSource}>
                <Mapbox.LineLayer
                    id="lines"
                    style={{
                        lineColor: ['get', 'color'],
                        lineWidth: 4,
                        lineCap: 'round',
                        lineJoin: 'round',
                        lineOpacity: selectedLineId
                            ? ['match', ['get', 'id'], selectedLineId, 1, 0.0]
                            : 0.9
                    }}
                />
            </Mapbox.ShapeSource>
        </Mapbox.MapView>
    );

    const handleCloseParkingMap = () => {
        setIsParkingMapVisible(false);
        setSelectedParking(null);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                overScrollMode="never"
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>{i18n.t('transport')}</Text>
                </View>

                {/* Intro Card */}
                <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>{i18n.t('gettingAround')}</Text>
                    <Text style={[styles.text, { color: theme.text }]}>
                        {i18n.t('transportIntro')}
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.text, marginTop: 12 }]}>{i18n.t('tickets')}</Text>
                    <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>{i18n.t('singleTicket')}</Text><Text style={styles.ticketPrice}>1.90 €</Text></View>
                    <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>{i18n.t('dayIndividual')}</Text><Text style={styles.ticketPrice}>4.60 €</Text></View>
                    <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>{i18n.t('dayTrio')}</Text><Text style={styles.ticketPrice}>10.20 €</Text></View>
                    <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>{i18n.t('threeDayIndividual')}</Text><Text style={styles.ticketPrice}>10.20 €</Text></View>
                    <View style={styles.ticketInfo}>
                        <IconSymbol name="info.circle" size={14} color={theme.icon} style={{ marginRight: 6, marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.textSmall, { color: theme.textSecondary }]}>{i18n.t('validateMandatory')}</Text>
                            <Text style={[styles.textSmall, { color: theme.textSecondary, fontStyle: 'italic', marginTop: 4 }]}>{i18n.t('ticketFeeNote')}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={[styles.websiteButton, { backgroundColor: theme.primary }]} onPress={openCTSWebsite}>
                        <Text style={styles.websiteButtonText}>{i18n.t('visitCTS')}</Text>
                        <IconSymbol name="arrow.up.right" size={16} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.websiteButton, { backgroundColor: theme.cardBackground, borderColor: theme.primary, borderWidth: 1, marginTop: 12 }]}
                        onPress={() => setIsGuideVisible(true)}
                    >
                        <Text style={[styles.websiteButtonText, { color: theme.primary }]}>{i18n.t('howToBuy')}</Text>
                        <IconSymbol name="chevron.right" size={16} color={theme.primary} />
                    </TouchableOpacity>
                </View>

                {/* Guide Modal */}
                <Modal
                    visible={isGuideVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setIsGuideVisible(false)}
                >
                    <View style={styles.bottomSheetBackdrop}>
                        <Pressable style={StyleSheet.absoluteFill} onPress={() => setIsGuideVisible(false)} />
                        <View style={styles.bottomSheetWrapper}>
                            <GuideContent onClose={() => setIsGuideVisible(false)} />
                        </View>
                    </View>
                </Modal>

                {/* Map Preview */}
                <TouchableOpacity
                    style={styles.mapContainer}
                    activeOpacity={0.9}
                    onPress={handleOpenMap}
                >
                    <View style={styles.map} pointerEvents="none">
                        {renderMapContent(false)}
                    </View>

                    <View style={styles.mapOverlay}>
                        <IconSymbol name="map" size={16} color="#000" style={{ marginRight: 6 }} />
                        <Text style={styles.mapOverlayText}>{i18n.t('tapToExpand')}</Text>
                    </View>
                </TouchableOpacity>

                {/* Live Parking Section */}
                <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                    <ParkingList
                        data={parkingData}
                        loading={parkingLoading}
                        error={parkingError}
                        lastUpdated={lastUpdated}
                        onViewMap={() => setIsParkingMapVisible(true)}
                        onSelectParking={(parking) => {
                            setSelectedParking(parking);
                            setIsParkingMapVisible(true);
                        }}
                        onRetry={refetchParking}
                    />
                </View>

                {/* -------------------- FULLSCREEN TRANSPORT MAP -------------------- */}
                <Modal visible={isMapFullscreen} onRequestClose={handleCloseMap} animationType="none" transparent={true}>
                    <Animated.View style={[{ flex: 1, backgroundColor: theme.background }, animatedModalStyle]}>
                        <SafeAreaView style={{ flex: 1 }}>
                            <View style={{ flex: 1 }}>{renderMapContent(true)}</View>
                            <Animated.View style={[styles.filterContainer, uiStyle]}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
                                    {TRANSPORT_LINES.map(line => {
                                        const isSelected = selectedLineId === line.id;
                                        const isFaded = selectedLineId !== null && !isSelected;
                                        return (
                                            <TouchableOpacity
                                                key={line.id}
                                                onPress={() => toggleLineSelection(line.id)}
                                                style={[styles.filterChip, { backgroundColor: line.color, opacity: isFaded ? 0.4 : 1, transform: [{ scale: isSelected ? 1.1 : 1 }] }]}
                                            >
                                                <Text style={[styles.filterText, { color: '#FFF' }]}>{line.id.replace('TRAM_', '').replace('BUS_', '')}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </Animated.View>
                            {selectedLine && (
                                <Animated.View entering={FadeInDown.duration(200)} style={[styles.detailCard, { backgroundColor: theme.cardBackground }, uiStyle]}>
                                    <View style={[styles.detailIcon, { backgroundColor: selectedLine.color }]}>
                                        <MaterialIcons name={selectedLine.type === 'tram' ? 'tram' : 'directions-bus'} size={20} color="#FFF" />
                                    </View>
                                    <View style={styles.detailTextContainer}>
                                        <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedLine.name}</Text>
                                        <Text style={[styles.detailSubtitle, { color: theme.textSecondary }]}>{selectedLine.trajectory}</Text>
                                    </View>
                                </Animated.View>
                            )}
                            <Animated.View style={[styles.closeButtonContainer, closeButtonAnimationStyle]}>
                                <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.cardBackground }]} onPress={handleCloseMap}>
                                    <MaterialIcons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </Animated.View>
                        </SafeAreaView>
                    </Animated.View>
                </Modal>

                {/* -------------------- FULLSCREEN PARKING MAP -------------------- */}
                <Modal visible={isParkingMapVisible} onRequestClose={handleCloseParkingMap} animationType="fade" transparent={false}>
                    <View style={{ flex: 1, backgroundColor: theme.background }}>
                        <Mapbox.MapView
                            style={{ flex: 1 }}
                            styleURL={Mapbox.StyleURL.Street}
                            onPress={() => setSelectedParking(null)}
                        >
                            <Mapbox.Camera
                                defaultSettings={{ centerCoordinate: CITY_CENTER, zoomLevel: 12.5 }}
                                zoomLevel={selectedParking ? 15 : 12.5}
                                centerCoordinate={selectedParking ? [selectedParking.position.lon, selectedParking.position.lat] : CITY_CENTER}
                                animationMode="flyTo"
                                animationDuration={800}
                            />
                            {parkingData.map((item) => (
                                <ParkingMapMarker
                                    key={item.nom_parking}
                                    item={item}
                                    theme={theme}
                                    isFocused={selectedParking?.nom_parking === item.nom_parking}
                                    onSelect={() => setSelectedParking(item)}
                                />
                            ))}
                        </Mapbox.MapView>

                        <TouchableOpacity
                            style={[styles.floatingCloseBtn, { backgroundColor: theme.cardBackground, shadowColor: '#000' }]}
                            onPress={handleCloseParkingMap}
                        >
                            <IconSymbol name="xmark" size={20} color={theme.text} />
                        </TouchableOpacity>

                        {/* Parking Info Card */}
                        {selectedParking && (
                            <Animated.View
                                style={[styles.infoCardContainer]}
                                entering={SlideInDown.duration(400).easing(Easing.out(Easing.exp))}
                                exiting={SlideOutDown.duration(200)}
                                layout={LinearTransition}
                            >
                                <View style={[styles.mapCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                                    <View style={styles.mapCardContent}>
                                        <View style={styles.mapCardHeader}>
                                            <Text style={[styles.mapCardTitle, { color: theme.text }]} numberOfLines={1}>
                                                {selectedParking.nom_parking.replace('Parking ', '')}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
                                                    const url = Platform.select({
                                                        ios: `maps:0,0?q=${selectedParking.nom_parking} Strasbourg`,
                                                        android: `geo:0,0?q=${selectedParking.position.lat},${selectedParking.position.lon}(${selectedParking.nom_parking})`
                                                    });
                                                    Linking.openURL(url as string);
                                                }}
                                                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.primary, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 }}
                                            >
                                                <IconSymbol name="arrow.triangle.turn.up.right.diamond.fill" size={12} color="#FFF" style={{ marginRight: 4 }} />
                                                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>Go</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                                            <Text style={[styles.mapCardDesc, { color: theme.textSecondary, flex: 1 }]}>
                                                {selectedParking.etat_descriptif === 'Ouvert'
                                                    ? `${selectedParking.libre} ${i18n.t('spots')} ${i18n.t('available')} / ${selectedParking.total}`
                                                    : i18n.t('closed')}
                                            </Text>
                                        </View>

                                        {/* Simple Progress Bar */}
                                        {selectedParking.etat_descriptif === 'Ouvert' && (
                                            <View style={[styles.progressTrack, { backgroundColor: theme.border, marginTop: 8 }]}>
                                                <View
                                                    style={[
                                                        styles.progressBar,
                                                        {
                                                            width: `${(1 - (selectedParking.libre / selectedParking.total)) * 100}%`,
                                                            backgroundColor: selectedParking.libre === 0 ? theme.error : (selectedParking.libre / selectedParking.total < 0.1 ? theme.error : theme.success)
                                                        }
                                                    ]}
                                                />
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </Animated.View>
                        )}
                    </View>
                </Modal>
            </ScrollView>
        </SafeAreaView >
    );
}));

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 70 },
    header: {
        paddingVertical: 12,
        paddingLeft: 24,
        paddingRight: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 0,
    },
    card: {
        margin: 20,
        marginTop: 0,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
    },
    cardTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
    text: { fontSize: 16, lineHeight: 24 },
    subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
    ticketRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    ticketLabel: { fontSize: 16 },
    ticketPrice: { fontSize: 16, fontWeight: 'bold', color: '#666' },
    ticketInfo: { flexDirection: 'row', marginTop: 12, opacity: 0.8 },
    textSmall: { fontSize: 13, lineHeight: 18 },
    websiteButton: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12
    },
    websiteButtonText: { color: 'white', fontWeight: 'bold', marginRight: 8 },
    mapContainer: {
        height: 200,
        margin: 20,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    map: { flex: 1 },
    mapOverlay: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mapOverlayText: { fontSize: 12, fontWeight: 'bold' },
    closeButtonContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        zIndex: 101, // Above everything
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    filterContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
    },
    filterContent: {
        paddingHorizontal: 20,
        gap: 10,
        paddingVertical: 12,
    },
    filterChip: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    filterText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailCard: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    detailIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    detailTextContainer: {
        flex: 1,
    },
    detailTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    detailSubtitle: {
        fontSize: 14,
    },
    bottomSheetBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheetWrapper: {
        height: '80%',
        width: '100%',
    },
    // --- Parking Map Styles ---
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
    },
    marker: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    markerInner: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoCardContainer: {
        position: 'absolute',
        bottom: 50,
        left: 16,
        width: SCREEN_WIDTH - 32,
        zIndex: 200,
        elevation: 200,
    },
    mapCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 16,
        backgroundColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    mapCardContent: {
        flexDirection: 'column',
    },
    mapCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mapCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    mapCardDesc: {
        fontSize: 14,
    },
    progressTrack: {
        height: 8,
        borderRadius: 4,
        width: '100%',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
});
