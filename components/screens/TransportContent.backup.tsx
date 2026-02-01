import { ctsService, VehicleJourney } from '@/app/(tabs)/services/cts';
import { ParkingList } from '@/components/ParkingList';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { SIGHTS } from '@/data/sights';
import { TRANSPORT_LINES } from '@/data/transport_data_generated';
import { TRANSPORT_STOPS } from '@/data/transport_stops'; // Updated import
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ParkingData, useParkingData } from '@/hooks/useParkingData';
import i18n from '@/i18n';
import { offsetPolyline, toGeoJSONLineString } from '@/utils/geo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Mapbox from '@rnmapbox/maps';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Linking, Modal, Platform, Pressable, Animated as RNAnimated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInDown, LinearTransition, runOnJS, SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GuideContent } from './GuideContent';

// --- Constants ---
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3BlY3RydWgiLCJhIjoiY21rNG5sNmh3MDF6NjNkczl5cGM3Ynl2aSJ9.U3vf9ao95WB7Xxx4n2Ihug';
Mapbox.setAccessToken(MAPBOX_TOKEN);

const CITY_CENTER = [7.74894, 48.58177]; // [Lon, Lat] for Mapbox
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

// --- Layers Menu Component ---
const LayersMenu = ({ visible, onClose, layers, toggleLayer, theme }: any) => {
    if (!visible) return null;

    return (
        <Pressable style={styles.layersBackdrop} onPress={onClose}>
            <Animated.View entering={FadeInDown.duration(200)} style={[styles.layersMenu, { backgroundColor: theme.cardBackground }]}>
                <Text style={[styles.layersTitle, { color: theme.text }]}>Map Layers</Text>

                <Text style={[styles.layersSection, { color: theme.textSecondary }]}>ESSENTIALS (Recommended)</Text>

                <TouchableOpacity style={styles.layerRow} onPress={() => toggleLayer('landmarks')}>
                    <IconSymbol name={layers.landmarks ? "checkmark.circle.fill" : "circle"} size={22} color={layers.landmarks ? theme.primary : theme.textSecondary} />
                    <Text style={[styles.layerText, { color: theme.text }]}>Landmarks / Attractions</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.layerRow} onPress={() => toggleLayer('mainLines')}>
                    <IconSymbol name={layers.mainLines ? "checkmark.circle.fill" : "circle"} size={22} color={layers.mainLines ? theme.primary : theme.textSecondary} />
                    <View>
                        <Text style={[styles.layerText, { color: theme.text }]}>Main Lines (Tram & Rapid)</Text>
                        {layers.mainLines && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                {['A', 'B', 'C', 'D', 'E', 'F'].map(l => (
                                    <View key={l} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: TRANSPORT_LINES.find(t => t.id.endsWith(l))?.color }} />
                                ))}
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <Text style={[styles.layersSection, { color: theme.textSecondary }]}>ADVANCED</Text>

                <TouchableOpacity style={styles.layerRow} onPress={() => toggleLayer('buses')}>
                    <IconSymbol name={layers.buses ? "checkmark.circle.fill" : "circle"} size={22} color={layers.buses ? theme.primary : theme.textSecondary} />
                    <View>
                        <Text style={[styles.layerText, { color: theme.text }]}>Show Bus Network</Text>
                        <Text style={[styles.layerSubtext, { color: theme.error }]}>Warning: Adds 40+ lines</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </Pressable>
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
    const [selectedStop, setSelectedStop] = useState<any | null>(null); // New State for Stop
    const [arrivals, setArrivals] = useState<VehicleJourney[]>([]);
    const [arrivalsLoading, setArrivalsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [stopRefs, setStopRefs] = useState<Record<string, string>>({});
    const [followingUser, setFollowingUser] = useState(false);

    // Layers State
    const [isLayersValues, setIsLayersValues] = useState({
        landmarks: true,
        mainLines: true,
        buses: false
    });
    const [isLayersVisible, setIsLayersVisible] = useState(false);

    const mapCamera = useRef<Mapbox.Camera>(null);
    const parkingMapCamera = useRef<Mapbox.Camera>(null);

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
            runOnJS(setSelectedStop)(null);
            runOnJS(setArrivals)([]);
        });
    };

    const handleLocateMe = async (type: 'transport' | 'parking') => {
        setFollowingUser(true);
        // Reset after bit? Or just let it follow until moved?
        // Mapbox handles the "stop following on gesture" usually.
    };

    // --- Real-time Arrivals ---
    const fetchArrivals = useCallback(async (stopName: string) => {
        setArrivalsLoading(true);
        setFetchError(null);
        setArrivals([]);

        try {
            let ref = stopRefs[stopName];

            // If we don't have the ref, we need to find it
            if (!ref) {
                console.log(`[Transport] Looking up ref for: ${stopName}`);
                const discovery = await ctsService.getStopPointsDiscovery();
                if (discovery.length === 0) {
                    throw new Error('CTS service returned no stop data');
                }

                const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
                const target = normalize(stopName);

                // Strategy 1: Exact Match
                let matched = discovery.find(s => s.StopPointName === stopName);

                // Strategy 2: Normalized Match
                if (!matched) {
                    matched = discovery.find(s => normalize(s.StopPointName) === target);
                }

                // Strategy 3: Partial Match (e.g. "Gare Centrale" vs "Gare Centrale (Platform A)")
                if (!matched) {
                    matched = discovery.find(s => {
                        const sNorm = normalize(s.StopPointName);
                        return sNorm.includes(target) || target.includes(sNorm);
                    });
                }

                if (matched) {
                    ref = matched.StopPointRef;
                    console.log(`[Transport] Found ref: ${ref} for ${stopName} (Matched as: ${matched.StopPointName})`);
                    setStopRefs(prev => ({ ...prev, [stopName]: ref }));
                }
            }

            if (ref) {
                const data = await ctsService.getStopMonitoring(ref);
                if (data.length === 0) {
                    setFetchError('noArrivals');
                } else {
                    setArrivals(data.slice(0, 6));
                }
            } else {
                console.warn(`[Transport] Stop not found in CTS registry: ${stopName}`);
                setFetchError('stopNotFound');
            }
        } catch (err) {
            console.error('[Transport] Fetch failed:', err);
            setFetchError('connectionError');
        } finally {
            setArrivalsLoading(false);
        }
    }, [stopRefs]);

    useEffect(() => {
        if (selectedStop) {
            fetchArrivals(selectedStop.name);
        } else {
            setArrivals([]);
        }
    }, [selectedStop]);

    // --- Parking Map Handlers ---
    React.useImperativeHandle(ref, () => ({
        openMap: handleOpenMap
    }));

    const animatedModalStyle = useAnimatedStyle(() => ({
        opacity: modalOpacity.value
    }));

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
    // Prepare GeoJSON Data
    const transportSource = useMemo(() => {
        // Filter lines based on layers
        const filteredLines = TRANSPORT_LINES.filter(line => {
            const isMain = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].some(id => line.id.endsWith(id));
            if (isMain) return isLayersValues.mainLines;
            return isLayersValues.buses;
        });

        const features = filteredLines.map(line => {
            if (line.geoJson && line.geoJson.type === 'Feature') {
                return {
                    type: 'Feature' as const,
                    properties: { id: line.id, color: line.color },
                    geometry: line.geoJson.geometry
                };
            }
            return {
                type: 'Feature' as const,
                properties: { id: line.id, color: line.color },
                geometry: line.geoJson || toGeoJSONLineString(offsetPolyline((line as any).path || [], 0)),
            };
        });
        return { type: 'FeatureCollection' as const, features: features };
    }, [isLayersValues]);

    const landmarksSource = useMemo(() => {
        if (!isLayersValues.landmarks) return { type: 'FeatureCollection', features: [] };

        const features = SIGHTS.map(sight => {
            if (!sight.coordinates) return null;
            return {
                type: 'Feature',
                id: sight.id,
                properties: {
                    id: sight.id,
                    name: sight.name,
                    icon: 'attraction'
                },
                geometry: {
                    type: 'Point',
                    coordinates: [sight.coordinates.longitude, sight.coordinates.latitude]
                }
            };
        }).filter(f => f !== null);
        return { type: 'FeatureCollection' as const, features };
    }, [isLayersValues.landmarks]);

    const stopsSource = useMemo(() => {
        // Only show stops if zoomed in OR line is selected
        // And respect layers (if main lines off, hide main line stops?)
        // For simplicity, just filter by selected line or show all if nothing selected (but optimized by zoom)

        if (!selectedLineId) {
            // If main lines are OFF, maybe hide all stops? Let's keep it simple.
            if (!isLayersValues.mainLines && !isLayersValues.buses) return { type: 'FeatureCollection', features: [] };
            return TRANSPORT_STOPS;
        }

        const shortName = selectedLineId.replace('TRAM_', '').replace('BUS_', '');
        const filteredFeatures = TRANSPORT_STOPS.features.filter((f: any) =>
            f.properties.lines.includes(shortName)
        );
        return { type: 'FeatureCollection', features: filteredFeatures };
    }, [selectedLineId, isLayersValues]);

    const toggleLineSelection = (id: string) => {
        setSelectedLineId(prev => (prev === id ? null : id));
        setSelectedStop(null); // Deselect stop on line change
    };

    const selectedLine = TRANSPORT_LINES.find(l => l.id === selectedLineId);

    const onStopPress = (e: any) => {
        const feature = e.features[0];
        if (feature) {
            setSelectedStop(feature.properties);
        }
    };

    const renderMapContent = (fullscreen: boolean) => (
        <Mapbox.MapView
            style={{ flex: 1 }}
            styleURL={Mapbox.StyleURL.Street}
            // styleURL="mapbox://styles/mapbox/light-v11" // Cleaner style for transport?
            surfaceView={false}
            scrollEnabled={fullscreen}
            zoomEnabled={fullscreen}
            pitchEnabled={fullscreen}
            rotateEnabled={fullscreen}
            attributionEnabled={false}
            logoEnabled={false}
            onPress={() => setSelectedStop(null)}
        >
            <Mapbox.UserLocation visible={fullscreen} />
            <Mapbox.Camera
                ref={fullscreen ? mapCamera : null}
                defaultSettings={{
                    centerCoordinate: CITY_CENTER,
                    zoomLevel: INITIAL_ZOOM,
                }}
                centerCoordinate={CITY_CENTER}
                followUserLocation={followingUser}
                followUserMode={Mapbox.UserTrackingMode.Follow}
                animationMode={'flyTo'}
                onUserTrackingModeChange={(e) => {
                    if (!e.nativeEvent.payload.followUserLocation) {
                        setFollowingUser(false);
                    }
                }}
            />

            {/* Landmarks Layer */}
            <Mapbox.ShapeSource id="landmarks" shape={landmarksSource as any} onPress={() => { }}>
                <Mapbox.SymbolLayer
                    id="landmarkIcons"
                    style={{
                        iconImage: 'marker-15', // Use built-in or custom icon
                        iconSize: 1.5,
                        textField: ['get', 'name'],
                        textSize: 12,
                        textOffset: [0, 1.2],
                        textAnchor: 'top',
                        textHaloColor: '#FFF',
                        textHaloWidth: 2,
                    }}
                />
            </Mapbox.ShapeSource>

            {/* Lines Layer */}
            <Mapbox.ShapeSource id="transportLines" shape={transportSource} onPress={(e) => {
                if (e.features && e.features.length > 0) {
                    const id = e.features[0].properties?.id;
                    if (id) toggleLineSelection(id);
                }
            }}>
                {/* Normal/Background Lines */}
                <Mapbox.LineLayer
                    id="lines"
                    style={{
                        lineColor: ['get', 'color'],
                        lineWidth: [
                            'interpolate', ['linear'], ['zoom'],
                            10, 2,
                            15, 6
                        ],
                        lineCap: 'round',
                        lineJoin: 'round',
                        lineOpacity: selectedLineId ? 0 : 0.8
                    }}
                />
                {/* Selected Line Highlight */}
                <Mapbox.LineLayer
                    id="lines-selected"
                    filter={['==', ['get', 'id'], selectedLineId || '']}
                    style={{
                        lineColor: ['get', 'color'],
                        lineWidth: [
                            'interpolate', ['linear'], ['zoom'],
                            10, 5,
                            15, 10
                        ],
                        lineCap: 'round',
                        lineJoin: 'round',
                        lineOpacity: 1
                    }}
                />
            </Mapbox.ShapeSource>

            {/* Stops Layer - Only visible when zoomed in a bit or if line selected? */}
            {/* Or always visible but small? */}
            <Mapbox.ShapeSource id="transportStops" shape={stopsSource as any} onPress={onStopPress} hitbox={{ width: 20, height: 20 }}>
                {/* Normal Stops Layer */}
                <Mapbox.CircleLayer
                    id="stops"
                    aboveLayerID="lines-selected"
                    minZoomLevel={12}
                    filter={['!=', ['get', 'uniqueId'], selectedStop?.uniqueId || '']}
                    style={{
                        circleRadius: [
                            'interpolate', ['linear'], ['zoom'],
                            12, 3,
                            16, 6
                        ],
                        circleColor: '#FFFFFF',
                        circleStrokeColor: '#333333',
                        circleStrokeWidth: 1.5,
                    }}
                />
                {/* Selected Stop Highlight Layer */}
                <Mapbox.CircleLayer
                    id="stops-selected"
                    aboveLayerID="stops"
                    minZoomLevel={12}
                    filter={['==', ['get', 'uniqueId'], selectedStop?.uniqueId || '']}
                    style={{
                        circleRadius: [
                            'interpolate', ['linear'], ['zoom'],
                            12, 8,
                            16, 12
                        ],
                        circleColor: '#FFFFFF',
                        circleStrokeColor: '#000000',
                        circleStrokeWidth: 3,
                        circleOpacity: 1
                    }}
                />
                {/* Text Labels for Stops at high zoom */}
                <Mapbox.SymbolLayer
                    id="stopLabels"
                    aboveLayerID="stops-selected"
                    minZoomLevel={14.5}
                    style={{
                        textField: ['get', 'name'],
                        textSize: 12,
                        textOffset: [0, 1.2],
                        textAnchor: 'top',
                        textColor: '#333',
                        textHaloColor: '#FFF',
                        textHaloWidth: 2,
                        textOpacity: selectedLineId
                            ? 1 // Always show if line filtering
                            : ['step', ['zoom'], 0, 15, 1] // Show after zoom 15 normally
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

                            {/* Layers FAB */}
                            <TouchableOpacity
                                style={[styles.layersFab, { backgroundColor: theme.cardBackground }]}
                                onPress={() => setIsLayersVisible(true)}
                            >
                                <IconSymbol name="square.stack.3d.up" size={24} color={theme.text} />
                            </TouchableOpacity>

                            <LayersMenu
                                visible={isLayersVisible}
                                onClose={() => setIsLayersVisible(false)}
                                layers={isLayersValues}
                                toggleLayer={(key: keyof typeof isLayersValues) => setIsLayersValues(prev => ({ ...prev, [key]: !prev[key] }))}
                                theme={theme}
                            />

                            {/* Line Detail Card (Tap-to-Clarify) */}
                            {selectedLine && !selectedStop && (
                                <Animated.View entering={FadeInDown.duration(200)} style={[styles.detailCard, { backgroundColor: theme.cardBackground }, uiStyle]}>
                                    <View style={[styles.lineBadgeBig, { backgroundColor: selectedLine.color }]}>
                                        <Text style={styles.lineBadgeTextBig}>{selectedLine.id.replace('TRAM_', '').replace('BUS_', '')}</Text>
                                    </View>
                                    <View style={styles.detailTextContainer}>
                                        <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedLine.name}</Text>
                                        <Text style={[styles.detailSubtitle, { color: theme.textSecondary }]}>{selectedLine.trajectory}</Text>
                                    </View>
                                    <TouchableOpacity style={[styles.closeLineButton, { backgroundColor: theme.border }]} onPress={() => setSelectedLineId(null)}>
                                        <MaterialIcons name="close" size={20} color={theme.text} />
                                    </TouchableOpacity>
                                </Animated.View>
                            )}

                            {/* Selected Stop Card */}
                            {selectedStop && (
                                <Animated.View entering={FadeInDown.duration(200)} style={[styles.detailCard, { backgroundColor: theme.cardBackground, flexDirection: 'column', alignItems: 'stretch' }, uiStyle]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <View style={[styles.detailIcon, { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#333' }]}>
                                            <MaterialIcons name="place" size={24} color="#333" />
                                        </View>
                                        <View style={styles.detailTextContainer}>
                                            <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedStop.name}</Text>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                                                {(selectedStop.lines || []).map((l: string) => {
                                                    const lineData = TRANSPORT_LINES.find(data => data.id.endsWith(l));
                                                    const color = lineData?.color || '#333';
                                                    return (
                                                        <View key={l} style={{ backgroundColor: color, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{l}</Text>
                                                        </View>
                                                    );
                                                })}
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => fetchArrivals(selectedStop.name)}
                                            style={[styles.refreshButton, { backgroundColor: theme.border }]}
                                            disabled={arrivalsLoading}
                                        >
                                            <MaterialIcons
                                                name="refresh"
                                                size={20}
                                                color={theme.text}
                                                style={{ transform: [{ rotate: arrivalsLoading ? '45deg' : '0deg' }] }}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Arrivals List */}
                                    <View style={styles.arrivalsContainer}>
                                        <Text style={[styles.arrivalsHeader, { color: theme.textSecondary }]}>{i18n.t('realTimeArrivals')}</Text>
                                        {arrivalsLoading ? (
                                            <Text style={[styles.arrivalText, { color: theme.textSecondary, fontStyle: 'italic' }]}>{i18n.t('loadingArrivals')}</Text>
                                        ) : fetchError ? (
                                            <Text style={[styles.arrivalText, { color: theme.textSecondary }]}>
                                                {fetchError === 'noArrivals' ? i18n.t('noArrivals') :
                                                    fetchError === 'stopNotFound' ? 'Stop not found in CTS registry (Names might differ)' :
                                                        fetchError === 'connectionError' ? 'Failed to connect to CTS API' : fetchError}
                                            </Text>
                                        ) : arrivals.length > 0 ? (
                                            arrivals.map((arr, idx) => {
                                                const lineData = TRANSPORT_LINES.find(l => l.id.endsWith(arr.PublishedLineName));
                                                const color = lineData?.color || '#333';

                                                // Calculate minutes until arrival
                                                const arrivalTime = new Date(arr.MonitoredCall.ExpectedArrivalTime).getTime();
                                                const now = new Date().getTime();
                                                const diffMins = Math.max(0, Math.floor((arrivalTime - now) / 60000));

                                                return (
                                                    <View key={idx} style={styles.arrivalRow}>
                                                        <View style={[styles.linePill, { backgroundColor: color }]}>
                                                            <Text style={styles.linePillText}>{arr.PublishedLineName}</Text>
                                                        </View>
                                                        <Text style={[styles.arrivalDest, { color: theme.text }]} numberOfLines={1}>
                                                            {arr.DestinationName}
                                                        </Text>
                                                        <Text style={[styles.arrivalTime, { color: diffMins <= 5 ? theme.success : theme.text }]}>
                                                            {diffMins === 0 ? 'Now' : `${diffMins} min`}
                                                        </Text>
                                                    </View>
                                                );
                                            })
                                        ) : (
                                            <Text style={[styles.arrivalText, { color: theme.textSecondary }]}>{i18n.t('noArrivals')}</Text>
                                        )}
                                    </View>
                                </Animated.View>
                            )}

                            <Animated.View style={[styles.closeButtonContainer, closeButtonAnimationStyle]}>
                                <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.cardBackground, marginBottom: 12 }]} onPress={() => handleLocateMe('transport')}>
                                    <MaterialIcons name="my-location" size={24} color={theme.primary} />
                                </TouchableOpacity>
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
                            <Mapbox.UserLocation visible={true} />
                            <Mapbox.Camera
                                ref={parkingMapCamera}
                                defaultSettings={{
                                    centerCoordinate: CITY_CENTER,
                                    zoomLevel: 12.5,
                                }}
                                zoomLevel={selectedParking ? 15 : 12.5}
                                centerCoordinate={selectedParking ? [selectedParking.position.lon, selectedParking.position.lat] : CITY_CENTER}
                                followUserLocation={followingUser}
                                followUserMode={Mapbox.UserTrackingMode.Follow}
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
                            style={[styles.floatingCloseBtn, { top: 110, backgroundColor: theme.cardBackground }]}
                            onPress={() => handleLocateMe('parking')}
                        >
                            <MaterialIcons name="my-location" size={20} color={theme.primary} />
                        </TouchableOpacity>

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
    stopLabels: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    lineBadgeBig: {
        width: 48,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    lineBadgeTextBig: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
    },
    closeLineButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    filterText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    // --- Layers Menu Styles ---
    layersFab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
        zIndex: 90,
    },
    layersBackdrop: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        zIndex: 110,
    },
    layersMenu: {
        padding: 24,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 40,
    },
    layersTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    layersSection: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 12,
        marginTop: 8,
    },
    layerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    layerText: {
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 12,
    },
    layerSubtext: {
        fontSize: 12,
        marginLeft: 12,
        marginTop: 2,
    },
    divider: {
        height: 1,
        marginVertical: 12,
        opacity: 0.2,
    },
    detailCard: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    refreshButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrivalsContainer: {
        marginTop: 4,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 8,
    },
    arrivalsHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    arrivalRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    linePill: {
        width: 28,
        height: 20,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    linePillText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    arrivalDest: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
    },
    arrivalTime: {
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    arrivalText: {
        fontSize: 14,
        paddingVertical: 4,
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
