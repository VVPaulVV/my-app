import { IconSymbol } from '@/components/ui/icon-symbol';
import { MaterialIcons } from '@expo/vector-icons';
import polyline from '@mapbox/polyline';
import Mapbox from '@rnmapbox/maps';
import distance from '@turf/distance';
import { lineString, point } from '@turf/helpers';
import lineSlice from '@turf/line-slice';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    Linking,
    Platform,
    Pressable,
    Animated as RNAnimated,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    FadeOutDown,
    SlideInDown,
    SlideInLeft,
    SlideOutDown
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Assets/Data assumed from your imports ---
import { ACTIVITIES } from '@/data/activities';
import { CATEGORIES } from '@/data/categories';
import { MUSEUMS } from '@/data/museums';
import { RESTAURANTS } from '@/data/restaurants';
import { SIGHTS } from '@/data/sights';
import { TRANSPORT_LINES } from '@/data/transport_data_generated';
import { TRANSPORT_STOPS } from '@/data/transport_stops';
import { ParkingData, useParkingData } from '@/hooks/useParkingData';
import i18n, { tData } from '@/i18n';
import { ctsService, VehicleJourney } from '@/utils/cts';
import { getDistance } from '@/utils/geo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CITY_CENTER = [7.74894, 48.58177];
const INITIAL_ZOOM = 13.0;
const CLOSED_STOP_NAMES = ["Langstross/Grand Rue", "Broglie", "Alt Winmärik-Vieux Marché aux Vins"];
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoic3BlY3RydWgiLCJhIjoiY21rNG5sNmh3MDF6NjNkczl5cGM3Ynl2aSJ9.U3vf9ao95WB7Xxx4n2Ihug';
const ROUTE_COLORS = ['#FF4B4B', '#4B7BFF', '#4BFF4B', '#FFD700', '#FF00FF', '#00FFFF', '#FF8C00', '#8A2BE2'];

const getCategoryColor = (type: string) => CATEGORIES.find(c => c.nameKey === type)?.color || '#888';
const getCategoryIcon = (type: string) => {
    switch (type) {
        case 'sights': return 'star.fill';
        case 'restaurants': return 'fork.knife';
        case 'museums': return 'building.columns.fill';
        case 'activities': return 'figure.walk';
        default: return 'map.fill';
    }
};

// --- Sub-Component: POI Marker ---
const PoiMarker = React.memo(({ item, nearestStop, onPress, isSelected, theme }: any) => {
    const scaleAnim = useRef(new RNAnimated.Value(1)).current;
    useEffect(() => {
        RNAnimated.spring(scaleAnim, { toValue: isSelected ? 1.2 : 1, friction: 5, tension: 40, useNativeDriver: true }).start();
    }, [isSelected]);

    return (
        <Mapbox.PointAnnotation
            id={`poi-${item.id}`}
            coordinate={[item.coordinates.longitude, item.coordinates.latitude]}
            onSelected={() => onPress(item)}
        >
            <RNAnimated.View style={{ alignItems: 'center', justifyContent: 'center', padding: 16, transform: [{ scale: scaleAnim }], zIndex: isSelected ? 999 : 10 }}>
                <View style={[styles.poiMarkerBody, { backgroundColor: getCategoryColor(item.type) }]}>
                    <IconSymbol name={getCategoryIcon(item.type)} size={14} color="#FFF" />
                </View>
                {nearestStop?.lines && (
                    <View style={styles.poiBadgeContainer}>
                        {(() => {
                            let lines = nearestStop.lines;
                            if (typeof lines === 'string') {
                                try { lines = JSON.parse(lines); } catch (e) { lines = []; }
                            }
                            if (!Array.isArray(lines)) lines = [];

                            return lines.slice(0, 3).map((line: string, idx: number) => (
                                <View key={idx} style={[styles.poiBadge, { backgroundColor: TRANSPORT_LINES.find(l => l.id.endsWith(line))?.color || '#333' }]}>
                                    <Text style={styles.poiBadgeText}>{line}</Text>
                                </View>
                            ));
                        })()}
                    </View>
                )}
            </RNAnimated.View>
        </Mapbox.PointAnnotation>
    );
});

const ParkingMapMarker = ({ item, isFocused, onSelect, theme }: { item: ParkingData, isFocused: boolean, onSelect: () => void, theme: any }) => {
    const scaleAnim = useRef(new RNAnimated.Value(1)).current;
    const isOpen = item.etat_descriptif === 'Ouvert';
    const percentFree = item.total > 0 ? (item.libre / item.total) : 0;
    let color = theme.success;
    if (!isOpen) color = theme.textSecondary;
    else if (item.libre === 0 || percentFree < 0.1) color = theme.error;
    else if (percentFree < 0.3) color = '#FFA500';

    useEffect(() => {
        RNAnimated.spring(scaleAnim, { toValue: isFocused ? 1.3 : 1, friction: 5, tension: 40, useNativeDriver: true }).start();
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
                { backgroundColor: color, zIndex: isFocused ? 999 : 1, transform: [{ scale: scaleAnim }] },
            ]}>
                <View style={styles.markerInner}><Text style={styles.markerText}>P</Text></View>
            </RNAnimated.View>
        </Mapbox.PointAnnotation>
    );
};

// --- Main Extracted Map Component ---
export const MapContent = ({ theme, onClose, router, isFocused, favorites = [], focusId }: any) => {
    const mapCamera = useRef<Mapbox.Camera>(null);
    const [search, setSearch] = useState('');
    const [mapFilter, setMapFilter] = useState('all');
    const insets = useSafeAreaInsets();

    // ALL POIS
    const allPoiItems = useMemo(() => {
        return [
            ...(SIGHTS as any[]).map(i => ({ ...i, type: 'sights' })),
            ...(RESTAURANTS as any[]).map(i => ({ ...i, type: 'restaurants' })),
            ...(MUSEUMS as any[]).map(i => ({ ...i, type: 'museums' })),
            ...(ACTIVITIES as any[]).map(i => ({ ...i, type: 'activities' }))
        ];
    }, []);

    // Selection State
    const [selectedPoi, setSelectedPoi] = useState<any | null>(null);
    const [selectedStop, setSelectedStop] = useState<any | null>(null);
    const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
    const [selectedParking, setSelectedParking] = useState<ParkingData | null>(null);

    // Map State
    const [isLayersVisible, setIsLayersVisible] = useState(false);
    const [isSeasonalMode, setIsSeasonalMode] = useState(false);
    const [isLayersValues, setIsLayersValues] = useState({ landmarks: false, mainLines: true, parking: false });

    // Data State
    const [allArrivals, setAllArrivals] = useState<VehicleJourney[]>([]);
    const [arrivalsLoading, setArrivalsLoading] = useState(false);
    const [arrivalFilter, setArrivalFilter] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [walkRadiusGeoJSON, setWalkRadiusGeoJSON] = useState<any>(null);
    const [followingUser, setFollowingUser] = useState(false);
    const [userLocation, setUserLocation] = useState<any>(null);
    const [routeCoords, setRouteCoords] = useState<any[]>([]);

    // Parking Hooks
    const { data: parkingData } = useParkingData();

    const fetchArrivals = useCallback(async (stopName: string) => {
        setArrivalsLoading(true);
        setFetchError(null);
        setAllArrivals([]);
        try {
            const discovery = await ctsService.getStopPointsDiscovery();
            const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
            const target = normalize(stopName);
            const matchedStops = discovery.filter(s => {
                const sName = normalize(s.StopPointName);
                return sName === target || sName.includes(target) || target.includes(sName);
            });

            if (matchedStops.length === 0) { setFetchError('stopNotFound'); setArrivalsLoading(false); return; }

            const refs = matchedStops.map(s => s.StopPointRef);
            const requests = refs.map(ref => ctsService.getStopMonitoring(ref).catch(() => []));
            const responses = await Promise.all(requests);

            const validLines = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
            const tramArrivals = responses.flat().filter(arr => validLines.includes(arr.PublishedLineName));

            const sorted = tramArrivals.sort((a, b) => new Date(a.MonitoredCall.ExpectedArrivalTime).getTime() - new Date(b.MonitoredCall.ExpectedArrivalTime).getTime());
            const deduped = sorted.filter((v, i, a) => a.findIndex(t => (
                t.PublishedLineName === v.PublishedLineName && t.DirectionRef === v.DirectionRef &&
                Math.abs(new Date(t.MonitoredCall.ExpectedArrivalTime).getTime() - new Date(v.MonitoredCall.ExpectedArrivalTime).getTime()) < 60000
            )) === i);

            if (deduped.length === 0) setFetchError('noArrivals');
            setAllArrivals(deduped);
        } catch (err) {
            console.error('[Map] Fetch failed:', err);
            setFetchError('connectionError');
        } finally {
            setArrivalsLoading(false);
        }
    }, []);

    const handleDirections = (item: any) => {
        if (!item.coordinates) return;
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${item.coordinates.latitude},${item.coordinates.longitude}`;
        const label = tData(item, 'name');
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        if (url) Linking.openURL(url);
    };

    useEffect(() => {
        if (selectedStop) fetchArrivals(selectedStop.name);
        else setAllArrivals([]);
    }, [selectedStop]);

    const handleLocateMe = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return;
        }
        setFollowingUser(true);
    };

    useEffect(() => {
        if (isFocused && !focusId) {
            handleLocateMe();
        }
    }, [isFocused, focusId]);

    useEffect(() => {
        if (focusId) {
            const item = allPoiItems.find((i: any) => i.id === focusId);
            if (item) {
                setSelectedPoi(item);
                if (item.coordinates) {
                    mapCamera.current?.setCamera({
                        centerCoordinate: [item.coordinates.longitude, item.coordinates.latitude],
                        zoomLevel: 16,
                        animationDuration: 1000
                    });
                }
            }
        }
    }, [focusId, allPoiItems]);

    useEffect(() => {
        const fetchRoute = async () => {
            // Need at least 1 favorite if we have user location, or 2 favorites if we don't
            if (!favorites || favorites.length === 0) {
                setRouteCoords([]);
                return;
            }

            const favItems = favorites.map((id: string) => allPoiItems.find((i: any) => i.id === id)).filter(Boolean);

            let items = [...favItems];

            // Prepend User Location if available
            if (userLocation) {
                items = [{ coordinates: userLocation }, ...favItems];
            }

            if (items.length < 2) {
                setRouteCoords([]);
                return;
            }

            const newSegments: any[] = [];

            for (let i = 0; i < items.length - 1; i++) {
                const start = items[i];
                const end = items[i + 1];
                if (!start.coordinates || !end.coordinates) continue;

                const startCoord = [start.coordinates.longitude, start.coordinates.latitude];
                const endCoord = [end.coordinates.longitude, end.coordinates.latitude];

                // 1. Find ALL Candidate Stops within 1km
                const maxWalkDist = 1.0; // 1km radius
                const startStops: any[] = [];
                const endStops: any[] = [];

                for (const f of TRANSPORT_STOPS.features) {
                    const stopCoord = f.geometry.coordinates;
                    const dStart = distance(point(startCoord), point(stopCoord));
                    const dEnd = distance(point(endCoord), point(stopCoord));

                    if (dStart <= maxWalkDist) {
                        startStops.push({ ...f.properties, coordinates: stopCoord, dist: dStart });
                    }
                    if (dEnd <= maxWalkDist) {
                        endStops.push({ ...f.properties, coordinates: stopCoord, dist: dEnd });
                    }
                }

                // Sort by distance (closest first)
                startStops.sort((a, b) => a.dist - b.dist);
                endStops.sort((a, b) => a.dist - b.dist);

                // 2. Find Best Stop Pair with Shared Line
                let sharedLine = null;
                let bestStartStop = null;
                let bestEndStop = null;

                // Check time: Trams run ~5am to 1am. If currently 1am-5am, skip transit.
                const now = new Date();
                const hour = now.getHours();
                const isNight = hour >= 1 && hour < 5;

                // Priority: Direct shared line with minimal walking
                if (!isNight) {
                    for (const sStop of startStops) {
                        if (sharedLine) break; // Found a match
                        const sLines = typeof sStop.lines === 'string' ? JSON.parse(sStop.lines) : sStop.lines;
                        if (!Array.isArray(sLines)) continue;

                        for (const eStop of endStops) {
                            // Skip if same stop
                            if (sStop.uniqueId === eStop.uniqueId) continue;

                            const eLines = typeof eStop.lines === 'string' ? JSON.parse(eStop.lines) : eStop.lines;
                            if (!Array.isArray(eLines)) continue;

                            const common = sLines.find((l: string) => eLines.includes(l));
                            if (common) {
                                sharedLine = common;
                                bestStartStop = sStop;
                                bestEndStop = eStop;
                                break;
                            }
                        }
                    }
                }

                // 3. Build Route
                let transitFound = false;
                if (sharedLine && bestStartStop && bestEndStop) {
                    // Try to get line geometry
                    const lineData = TRANSPORT_LINES.find(l => l.id.endsWith(sharedLine as string));
                    if (lineData && lineData.geoJson.geometry.type === 'LineString') {
                        try {
                            const lineGeo = lineString(lineData.geoJson.geometry.coordinates);
                            const startPt = point(bestStartStop.coordinates);
                            const endPt = point(bestEndStop.coordinates);

                            // Snap to line
                            const snappedStart = nearestPointOnLine(lineGeo, startPt);
                            const snappedEnd = nearestPointOnLine(lineGeo, endPt);

                            const sliced = lineSlice(snappedStart, snappedEnd, lineGeo);

                            // We have 3 segments: Walk -> Tram -> Walk
                            // A. Start Walk
                            const urlA = `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoord.join(',')};${bestStartStop.coordinates.join(',')}?geometries=polyline6&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;
                            const respA = await fetch(urlA).then(r => r.json());
                            if (respA.routes?.[0]) {
                                newSegments.push({
                                    coordinates: polyline.decode(respA.routes[0].geometry, 6).map((c: any) => [c[1], c[0]]),
                                    color: '#999', // Walking color
                                    type: 'walking'
                                });
                            }

                            // B. Tram Ride
                            newSegments.push({
                                coordinates: sliced.geometry.coordinates,
                                color: lineData.color,
                                type: 'transit'
                            });

                            // C. End Walk
                            const urlC = `https://api.mapbox.com/directions/v5/mapbox/walking/${bestEndStop.coordinates.join(',')};${endCoord.join(',')}?geometries=polyline6&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;
                            const respC = await fetch(urlC).then(r => r.json());
                            if (respC.routes?.[0]) {
                                newSegments.push({
                                    coordinates: polyline.decode(respC.routes[0].geometry, 6).map((c: any) => [c[1], c[0]]),
                                    color: '#999',
                                    type: 'walking'
                                });
                            }
                            transitFound = true;
                        } catch (e) {
                            console.warn("Error slicing line, falling back to walk", e);
                        }
                    }
                }

                if (!transitFound) {
                    // Fallback: Full Walking Route
                    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${startCoord.join(',')};${endCoord.join(',')}?geometries=polyline6&overview=full&access_token=${MAPBOX_ACCESS_TOKEN}`;

                    try {
                        const response = await fetch(url);
                        const json = await response.json();
                        if (json.routes && json.routes.length > 0) {
                            const geometry = json.routes[0].geometry;
                            const decoded = polyline.decode(geometry, 6);
                            const flipped = decoded.map((c: any) => [c[1], c[0]]);

                            newSegments.push({
                                coordinates: flipped,
                                color: ROUTE_COLORS[i % ROUTE_COLORS.length],
                                type: 'walking'
                            });
                        }
                    } catch (error) {
                        console.error("Error fetching segment:", error);
                    }
                }
            }
            setRouteCoords(newSegments);
        };

        fetchRoute();
    }, [favorites, allPoiItems, userLocation]);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({});
                setUserLocation(loc.coords);
            }
        })();
    }, []);

    const handleResetNorth = () => {
        mapCamera.current?.setCamera({ heading: 0, animationDuration: 500 });
    };

    // --- Logic: GeoJSON Sources ---
    const transportSource = useMemo(() => ({
        type: 'FeatureCollection' as const,
        features: TRANSPORT_LINES.filter(l => {
            if (!isLayersValues.mainLines) return false;
            if (l.type === 'bus' && !isLayersValues.mainLines) return false;
            return true;
        }).map(line => ({
            type: 'Feature' as const,
            properties: { id: line.id, color: line.color, isMain: true },
            geometry: line.geoJson.geometry
        }))
    }), [isLayersValues.mainLines]);

    const routeSource = useMemo(() => {
        if (!routeCoords || routeCoords.length === 0) return null;

        return {
            type: 'FeatureCollection' as const,
            features: routeCoords.map((segment, index) => ({
                type: 'Feature' as const,
                properties: {
                    color: segment.color,
                    type: segment.type
                },
                geometry: { type: 'LineString' as const, coordinates: segment.coordinates }
            }))
        };
    }, [routeCoords]);

    const stopsSource = useMemo(() => {
        let features = [...TRANSPORT_STOPS.features];
        if (selectedLineId) {
            const shortName = selectedLineId.replace('TRAM_', '').replace('BUS_', '');
            features = features.filter((f: any) => f.properties.lines?.includes(shortName));
        }
        return { type: 'FeatureCollection', features };
    }, [selectedLineId]);

    const poiFeatures = useMemo(() => {
        if (!isLayersValues.landmarks) return [];
        return allPoiItems.filter((item: any) => {
            if (!item.coordinates || typeof item.coordinates.latitude !== 'number' || typeof item.coordinates.longitude !== 'number') return false;
            if (mapFilter !== 'all' && item.type !== mapFilter) return false;
            if (search && !tData(item, 'name').toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        }).map((item: any) => {
            // Find nearest stop logic...
            let nearest = null; let minDst = 300;
            for (const f of TRANSPORT_STOPS.features) {
                const d = getDistance({ latitude: item.coordinates.latitude, longitude: item.coordinates.longitude }, { latitude: f.geometry.coordinates[1], longitude: f.geometry.coordinates[0] });
                if (d < minDst) { minDst = d; nearest = { ...f.properties, uniqueId: f.properties.uniqueId, distance: d }; }
            }
            return { ...item, nearestStop: nearest };
        });
    }, [isLayersValues.landmarks, mapFilter, search]);

    // --- UI Logic Hooks ---
    const handleClose = () => {
        setIsLayersVisible(false);
        onClose();
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <Mapbox.MapView
                style={StyleSheet.absoluteFill}
                styleURL="mapbox://styles/spectruh/cmkvi58o6007p01se6l820xty"
                onPress={() => {
                    setSelectedStop(null);
                    setSelectedPoi(null);
                    setSelectedParking(null);
                    setWalkRadiusGeoJSON(null);
                }}
            >
                <Mapbox.UserLocation
                    visible={true}
                    androidRenderMode="gps"
                    showsUserHeadingIndicator={true}
                />
                <Mapbox.Camera
                    ref={mapCamera}
                    defaultSettings={{ centerCoordinate: CITY_CENTER, zoomLevel: INITIAL_ZOOM }}
                    followUserLocation={followingUser}
                    followUserMode={Mapbox.UserTrackingMode.Follow}
                    onUserTrackingModeChange={(e) => { if (!e.nativeEvent.payload.followUserLocation) setFollowingUser(false); }}
                />

                {/* Route Line */}
                {routeSource && (
                    <Mapbox.ShapeSource id="routeSource" shape={routeSource}>
                        <Mapbox.LineLayer
                            id="routeLayerSolid"
                            filter={['==', ['get', 'type'], 'transit']}
                            style={{
                                lineColor: ['get', 'color'],
                                lineWidth: 4,
                                lineCap: 'round',
                                lineJoin: 'round',
                                lineOpacity: 0.8
                            }}
                        />
                        <Mapbox.LineLayer
                            id="routeLayerDashed"
                            filter={['==', ['get', 'type'], 'walking']}
                            style={{
                                lineColor: ['get', 'color'],
                                lineWidth: 4,
                                lineDasharray: [2, 1],
                                lineCap: 'round',
                                lineJoin: 'round',
                                lineOpacity: 0.8
                            }}
                        />
                    </Mapbox.ShapeSource>
                )}

                {/* Lines */}
                <Mapbox.ShapeSource id="linesSource" shape={transportSource}>
                    <Mapbox.LineLayer
                        id="linesLayer"
                        style={{
                            lineColor: ['get', 'color'],
                            lineWidth: ['interpolate', ['linear'], ['zoom'], 10, 2, 15, 6],
                            lineCap: 'round',
                            lineJoin: 'round'
                        }}
                    />
                    <Mapbox.LineLayer
                        id="lines-selected"
                        filter={['==', ['get', 'id'], selectedLineId || '']}
                        style={{
                            lineColor: ['get', 'color'],
                            lineWidth: ['interpolate', ['linear'], ['zoom'], 10, 5, 15, 10],
                            lineCap: 'round',
                            lineJoin: 'round',
                            lineOpacity: 1
                        }}
                    />
                </Mapbox.ShapeSource>

                {/* Radius */}
                {walkRadiusGeoJSON && (
                    <Mapbox.ShapeSource id="radius" shape={walkRadiusGeoJSON}>
                        <Mapbox.FillLayer id="radiusFill" style={{ fillColor: theme.primary, fillOpacity: 0.1 }} />
                    </Mapbox.ShapeSource>
                )}

                {/* Stops */}
                <Mapbox.ShapeSource
                    id="stopsSource"
                    shape={stopsSource as any}
                    onPress={(e) => {
                        const feat = e.features[0];
                        if (feat.geometry?.type === 'Point') {
                            const coords = (feat.geometry as any).coordinates;
                            setSelectedStop({ ...feat.properties, coordinates: coords });
                        }
                    }}
                    hitbox={{ width: 20, height: 20 }}
                >
                    <Mapbox.CircleLayer
                        id="stopsLayer"
                        minZoomLevel={12}
                        filter={isSeasonalMode ? ['!', ['in', ['get', 'name'], ['literal', CLOSED_STOP_NAMES]]] : ['!=', '1', '2']}
                        style={{
                            circleRadius: ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 6],
                            circleColor: '#FFFFFF',
                            circleStrokeColor: '#333333',
                            circleStrokeWidth: 1.5
                        }}
                    />
                    <Mapbox.CircleLayer
                        id="stops-selected"
                        minZoomLevel={12}
                        aboveLayerID="stopsLayer"
                        filter={['==', ['get', 'uniqueId'], selectedStop?.uniqueId || '']}
                        style={{
                            circleRadius: ['interpolate', ['linear'], ['zoom'], 12, 8, 16, 12],
                            circleColor: '#FFFFFF',
                            circleStrokeColor: '#000000',
                            circleStrokeWidth: 3,
                        }}
                    />
                    <Mapbox.SymbolLayer
                        id="stopBadges"
                        aboveLayerID="stopsLayer"
                        minZoomLevel={13}
                        filter={['==', ['to-boolean', ['get', 'has_ticket_machine']], true]}
                        style={{
                            iconImage: 'ticket-badge',
                            iconSize: ['interpolate', ['linear'], ['zoom'], 13, 0.4, 16, 0.8],
                            iconOffset: [8, -8],
                            iconAllowOverlap: true
                        }}
                    />
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
                            textOpacity: selectedLineId ? 1 : ['step', ['zoom'], 0, 15, 1]
                        }}
                    />
                </Mapbox.ShapeSource>

                {/* POIs */}
                {poiFeatures.map((item: any) => (
                    <PoiMarker key={item.id} item={item} nearestStop={item.nearestStop} isSelected={selectedPoi?.id === item.id} theme={theme} onPress={setSelectedPoi} />
                ))}

                {/* Parking Markers */}
                {isLayersValues.parking && parkingData.map((item) => (
                    <ParkingMapMarker
                        key={item.nom_parking}
                        item={item}
                        theme={theme}
                        isFocused={selectedParking?.nom_parking === item.nom_parking}
                        onSelect={() => setSelectedParking(item)}
                    />
                ))}
            </Mapbox.MapView>

            {/* --- COMPLETE UI OVERLAYS --- */}

            {/* 1. Top Search Bar */}
            {!selectedPoi && !selectedStop && !selectedParking && (
                <View style={[styles.mapSearchPill, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <IconSymbol name="magnifyingglass" size={18} color={theme.icon} />
                    <TextInput style={[styles.mapSearchInput, { color: theme.text }]} placeholder={i18n.t('searchPlaceholder')} value={search} onChangeText={setSearch} />
                </View>
            )}

            {/* 2. Left Legend Column */}
            <Animated.View entering={SlideInLeft} style={styles.leftLegendContainer}>
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(l => {
                    const line = TRANSPORT_LINES.find(t => t.id.endsWith(l));
                    if (!line) return null;
                    const isSelected = selectedLineId === line.id;
                    return (
                        <TouchableOpacity key={l} onPress={() => setSelectedLineId(isSelected ? null : line.id)}
                            style={[styles.legendItem, {
                                backgroundColor: isSelected ? line.color : theme.cardBackground,
                                borderColor: line.color,
                                borderWidth: isSelected ? 0 : 2
                            }]}>
                            <Text style={{ color: isSelected ? '#FFF' : theme.text, fontWeight: 'bold' }}>{l}</Text>
                        </TouchableOpacity>
                    );
                })}
            </Animated.View>

            {/* 3. Bottom Category Filters */}
            {!selectedPoi && !selectedStop && !selectedParking && (
                <View style={[styles.filterContainer, { bottom: 20 + insets.bottom }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                        {['sights', 'restaurants', 'museums', 'activities'].map(f => {
                            const isActive = mapFilter === f && isLayersValues.landmarks;
                            const category = CATEGORIES.find(c => c.nameKey === f);
                            const color = category?.color || theme.primary;

                            return (
                                <TouchableOpacity key={f} onPress={() => {
                                    if (isActive) {
                                        setIsLayersValues(v => ({ ...v, landmarks: false }));
                                        setMapFilter('all');
                                    } else {
                                        setMapFilter(f);
                                        setIsLayersValues(v => ({ ...v, landmarks: true }));
                                    }
                                    setSelectedPoi(null);
                                    setSelectedStop(null);
                                    setSelectedParking(null);
                                }}
                                    style={[styles.filterChip, {
                                        backgroundColor: isActive ? color : theme.cardBackground,
                                        borderColor: color,
                                        borderWidth: 2,
                                    }]}>
                                    <Text style={[styles.filterText, { color: isActive ? '#000' : theme.text }]}>{i18n.t(f as any)}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* 4. POI Detail Card */}
            {selectedPoi && (
                <Animated.View entering={SlideInDown} exiting={FadeOutDown} style={[styles.detailCard, { backgroundColor: theme.cardBackground, zIndex: 1000, bottom: 30 + insets.bottom }]}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        style={{ flexDirection: 'row', gap: 12, paddingBottom: 12 }}
                        onPress={() => router.push(`/sight/${selectedPoi.id}` as any)}
                    >
                        {selectedPoi.image && (
                            <Image
                                source={typeof selectedPoi.image === 'number' ? selectedPoi.image : { uri: selectedPoi.image }}
                                style={{ width: 90, height: 90, borderRadius: 12, backgroundColor: '#eee' }}
                            />
                        )}
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, flex: 1 }} numberOfLines={1}>{tData(selectedPoi, 'name')}</Text>
                                <TouchableOpacity
                                    style={[styles.smallCloseButton, { backgroundColor: theme.border, marginLeft: 8 }]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        setSelectedPoi(null);
                                    }}
                                >
                                    <IconSymbol name="xmark" size={14} color={theme.text} />
                                </TouchableOpacity>
                            </View>
                            <Text numberOfLines={2} style={{ fontSize: 13, color: theme.icon, marginTop: 4 }}>{tData(selectedPoi, 'shortDescription')}</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                <View style={[styles.miniChip, { backgroundColor: getCategoryColor(selectedPoi.type) }]}>
                                    <Text style={styles.miniChipText}>{i18n.t(selectedPoi.type as any).toUpperCase()}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', gap: 12 }}>
                                    <TouchableOpacity
                                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.cardBackground, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: theme.border }}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleDirections(selectedPoi);
                                        }}
                                    >
                                        <IconSymbol name="location.fill" size={14} color={theme.primary} />
                                        <Text style={{ color: theme.text, fontSize: 12, fontWeight: '700', marginLeft: 4 }}>{i18n.t('go')}</Text>
                                    </TouchableOpacity>

                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 13, marginRight: 2 }}>{i18n.t('more')}</Text>
                                        <IconSymbol name="chevron.right" size={14} color={theme.primary} />
                                    </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* 5. StopDetail Card */}
            {selectedStop && (
                <Animated.View entering={SlideInDown} exiting={FadeOutDown} style={[styles.detailCard, { backgroundColor: theme.cardBackground, zIndex: 1000, bottom: 30 + insets.bottom }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={[styles.detailTitle, { color: theme.text, flex: 1 }]}>{selectedStop.name}</Text>
                        <TouchableOpacity style={[styles.closeLineButton, { backgroundColor: theme.border }]} onPress={() => setSelectedStop(null)}>
                            <MaterialIcons name="close" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Line Badges */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 2 }}>
                        {(() => {
                            let lines = selectedStop.lines;
                            if (typeof lines === 'string') {
                                try { lines = JSON.parse(lines); } catch (e) { lines = []; }
                            }
                            if (!Array.isArray(lines)) lines = [];
                            return lines.map((l: string, idx: number) => {
                                const lineData = TRANSPORT_LINES.find(t => t.id.endsWith(l));
                                const color = lineData?.color || '#333';
                                const isSelected = selectedLineId === lineData?.id;
                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => lineData && setSelectedLineId(isSelected ? null : lineData.id)}
                                        style={{
                                            backgroundColor: color,
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 6,
                                            minWidth: 24,
                                            alignItems: 'center',
                                            opacity: (selectedLineId === null || isSelected) ? 1 : 0.6
                                        }}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>{l}</Text>
                                    </TouchableOpacity>
                                );
                            });
                        })()}
                    </View>

                    <View style={styles.arrivalsContainer}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Text style={[styles.arrivalsHeader, { color: theme.textSecondary }]}>{i18n.t('realTimeArrivals')}</Text>
                            <TouchableOpacity onPress={() => fetchArrivals(selectedStop.name)} disabled={arrivalsLoading}>
                                <MaterialIcons name="refresh" size={18} color={theme.text} style={{ opacity: arrivalsLoading ? 0.5 : 1 }} />
                            </TouchableOpacity>
                        </View>
                        {arrivalsLoading && <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>Loading...</Text>}
                        {!arrivalsLoading && (
                            allArrivals
                                .filter(arr => {
                                    if (!selectedLineId) return true;
                                    // Find line for this arrival to match ID
                                    const line = TRANSPORT_LINES.find(l => l.id.endsWith(arr.PublishedLineName));
                                    return line?.id === selectedLineId;
                                })
                                .slice(0, 5)
                                .map((arr, idx) => {
                                    const lineData = TRANSPORT_LINES.find(l => l.id.endsWith(arr.PublishedLineName));
                                    const color = lineData?.color || '#333';
                                    const diffMins = Math.max(0, Math.floor((new Date(arr.MonitoredCall.ExpectedArrivalTime).getTime() - Date.now()) / 60000));
                                    const isSelected = selectedLineId === lineData?.id;

                                    return (
                                        <View key={idx} style={styles.arrivalRow}>
                                            <TouchableOpacity
                                                onPress={() => lineData && setSelectedLineId(isSelected ? null : lineData.id)}
                                                style={[styles.linePill, { backgroundColor: color, borderWidth: 0, borderColor: 'transparent' }]}
                                            >
                                                <Text style={styles.linePillText}>{arr.PublishedLineName}</Text>
                                            </TouchableOpacity>
                                            <Text style={[styles.arrivalDest, { color: theme.text }]} numberOfLines={1}>{arr.DestinationName}</Text>
                                            <Text style={[styles.arrivalTime, { color: diffMins <= 5 ? theme.success : theme.text }]}>{diffMins === 0 ? 'Now' : `${diffMins} min`}</Text>
                                        </View>
                                    );
                                })
                        )}
                        {!arrivalsLoading && allArrivals.length === 0 && <Text style={{ color: theme.textSecondary }}>No arrivals found.</Text>}
                    </View>
                </Animated.View>
            )}


            {/* Parking Details */}
            {
                selectedParking && (
                    <Animated.View entering={SlideInDown} exiting={FadeOutDown} style={[styles.detailCard, { backgroundColor: theme.cardBackground, bottom: 30 + insets.bottom }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styles.detailTitle, { color: theme.text, flex: 1 }]}>{selectedParking.nom_parking?.replace('Parking ', '')}</Text>
                            <TouchableOpacity style={[styles.closeLineButton, { backgroundColor: theme.border }]} onPress={() => setSelectedParking(null)}>
                                <MaterialIcons name="close" size={20} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginTop: 8 }}>
                            <Text style={{ color: theme.textSecondary }}>
                                {selectedParking.etat_descriptif === 'Ouvert' ? `${selectedParking.libre} spots free / ${selectedParking.total}` : 'Closed'}
                            </Text>
                            {selectedParking.etat_descriptif === 'Ouvert' && (
                                <View style={[styles.progressTrack, { backgroundColor: theme.border, marginTop: 8 }]}>
                                    <View style={[styles.progressBar, {
                                        width: `${(1 - (selectedParking.libre / selectedParking.total)) * 100}%`,
                                        backgroundColor: selectedParking.libre === 0 ? theme.error : (selectedParking.libre / selectedParking.total < 0.1 ? theme.error : theme.success)
                                    }]} />
                                </View>
                            )}
                        </View>
                    </Animated.View>
                )
            }

            {/* 5. Right FAB Actions */}
            {/* 5. Right FAB Actions */}
            <View style={styles.closeButtonContainer}>
                <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.cardBackground }]} onPress={handleClose}><MaterialIcons name="close" size={24} color={theme.text} /></TouchableOpacity>
                <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.cardBackground }]} onPress={handleResetNorth}><IconSymbol name="location.north.circle" size={24} color={theme.text} /></TouchableOpacity>
                <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.cardBackground }]} onPress={handleLocateMe}><MaterialIcons name="my-location" size={24} color={theme.text} /></TouchableOpacity>
                <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.cardBackground }]} onPress={() => setIsLayersVisible(true)}><IconSymbol name="line.3.horizontal" size={24} color={theme.text} /></TouchableOpacity>
            </View>

            {/* 6. Layers Menu (Modal) */}
            {
                isLayersVisible && (
                    <Pressable style={styles.layersBackdrop} onPress={() => setIsLayersVisible(false)}>
                        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={[styles.layersMenu, { backgroundColor: theme.cardBackground }]}>
                            <Text style={[styles.layersTitle, { color: theme.text }]}>Map Layers</Text>
                            <TouchableOpacity style={styles.layerRow} onPress={() => setIsLayersValues(v => ({ ...v, mainLines: !v.mainLines }))}>
                                <IconSymbol name={isLayersValues.mainLines ? "checkmark.circle.fill" : "circle"} size={22} color={theme.primary} />
                                <Text style={[styles.layerText, { color: theme.text }]}>Main Lines (Tram)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.layerRow} onPress={() => setIsLayersValues(v => ({ ...v, parking: !v.parking }))}>
                                <IconSymbol name={isLayersValues.parking ? "checkmark.circle.fill" : "circle"} size={22} color={theme.primary} />
                                <Text style={[styles.layerText, { color: theme.text }]}>Parking</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.layerRow} onPress={() => setIsSeasonalMode(!isSeasonalMode)}>
                                <IconSymbol name={isSeasonalMode ? "checkmark.circle.fill" : "circle"} size={22} color={theme.primary} />
                                <Text style={[styles.layerText, { color: theme.text }]}>Christmas Mode (Hide Closed Stops)</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Pressable>
                )
            }
        </SafeAreaView >
    );
};

// --- Styles combined from your file ---
const styles = StyleSheet.create({
    mapSearchPill: { position: 'absolute', top: 50, left: 20, right: 80, height: 48, borderRadius: 24, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, elevation: 5, zIndex: 50 },
    mapSearchInput: { flex: 1, marginLeft: 8, height: '100%' },
    leftLegendContainer: { position: 'absolute', left: 16, top: 130, gap: 12, zIndex: 55 },
    legendItem: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', elevation: 4 },
    filterContainer: { position: 'absolute', bottom: 25, left: 0, right: 0, zIndex: 300, elevation: 10 },
    filterScroll: { paddingHorizontal: 20, paddingBottom: 10, gap: 10 },
    filterChip: {
        paddingHorizontal: 16,
        borderRadius: 18,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '900',
        textTransform: 'capitalize',
        textAlign: 'center',
    },
    detailCard: { position: 'absolute', bottom: 35, left: 20, right: 20, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 0, borderRadius: 20, elevation: 6, zIndex: 1000 },
    poiImage: { width: 80, height: 80, borderRadius: 8 },
    detailTitle: { fontSize: 22, fontWeight: 'bold' },
    closeButtonContainer: { position: 'absolute', top: 50, right: 20, zIndex: 101, gap: 8 },
    closeButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 5 },
    layersBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', zIndex: 2000 },
    layersMenu: { padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 40 },
    layersTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    layerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    layerText: { fontSize: 16, marginLeft: 12 },
    poiMarkerBody: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FFF' },
    poiBadgeContainer: { position: 'absolute', top: 4, right: 0, flexDirection: 'row', gap: 2 },
    poiBadge: { paddingHorizontal: 3, borderRadius: 4, borderWidth: 1, borderColor: '#FFF' },
    poiBadgeText: { color: '#FFF', fontSize: 8, fontWeight: '800' },
    marker: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
    markerInner: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    markerText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    closeLineButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    arrivalsContainer: { marginTop: 0, paddingTop: 4, minHeight: 180 },
    arrivalsHeader: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    arrivalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    linePill: { width: 28, height: 20, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    linePillText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    arrivalDest: { flex: 1, fontSize: 14, fontWeight: '500' },
    arrivalTime: { fontSize: 14, fontWeight: 'bold', marginLeft: 10 },
    progressTrack: { height: 8, borderRadius: 4, width: '100%', overflow: 'hidden' },
    progressBar: { height: '100%', borderRadius: 4 },
    miniChip: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
    miniChipText: { fontSize: 10, fontWeight: '700', color: '#FFF', letterSpacing: 0.5 },
    smallCloseButton: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
