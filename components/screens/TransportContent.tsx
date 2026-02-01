import { ParkingList } from '@/components/ParkingList';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { ACTIVITIES } from '@/data/activities';
import { CATEGORIES } from '@/data/categories';
import { MUSEUMS } from '@/data/museums';
import { RESTAURANTS } from '@/data/restaurants';
import { SIGHTS } from '@/data/sights';
import { TRANSPORT_LINES } from '@/data/transport_data_generated';
import { TRANSPORT_STOPS } from '@/data/transport_stops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ParkingData, useParkingData } from '@/hooks/useParkingData';
import i18n, { tData } from '@/i18n';

import { ctsService, VehicleJourney } from '@/utils/cts';
import { createGeoJSONCircle, getDistance } from '@/utils/geo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Mapbox from '@rnmapbox/maps';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Dimensions, Image, Linking, Modal, Platform, Pressable, Animated as RNAnimated, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutDown, LinearTransition, runOnJS, SlideInDown, SlideInLeft, SlideOutDown, SlideOutLeft, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GuideContent } from './GuideContent';


const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3BlY3RydWgiLCJhIjoiY21rNG5sNmh3MDF6NjNkczl5cGM3Ynl2aSJ9.U3vf9ao95WB7Xxx4n2Ihug';
Mapbox.setAccessToken(MAPBOX_TOKEN);

const CITY_CENTER = [7.74894, 48.58177];
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const INITIAL_ZOOM = 13.0;

const CLOSED_STOP_NAMES = [
    "Langstross/Grand Rue",
    "Broglie",
    "Alt Winmärik-Vieux Marché aux Vins"
];




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


const PoiMarker = React.memo(({ item, nearestStop, onPress, isSelected, theme }: any) => {
    const scaleAnim = useRef(new RNAnimated.Value(1)).current;

    useEffect(() => {
        RNAnimated.spring(scaleAnim, {
            toValue: isSelected ? 1.2 : 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
        }).start();
    }, [isSelected]);

    return (
        <Mapbox.PointAnnotation
            id={`poi-${item.id}`}
            coordinate={[item.coordinates.longitude, item.coordinates.latitude]}
            onSelected={() => onPress(item)}
        >
            <RNAnimated.View style={{ alignItems: 'center', justifyContent: 'center', padding: 16, transform: [{ scale: scaleAnim }], zIndex: isSelected ? 999 : 10 }}>
                { }
                <View style={[styles.poiMarkerBody, { backgroundColor: getCategoryColor(item.type) }]}>
                    <IconSymbol name={getCategoryIcon(item.type)} size={14} color="#FFF" />
                </View>

                { }
                {nearestStop && nearestStop.lines && (
                    <View style={styles.poiBadgeContainer}>
                        {nearestStop.lines.slice(0, 3).map((line: string, idx: number) => {

                            const lineData = TRANSPORT_LINES.find(l => l.id.endsWith(line));

                            const color = lineData?.color || '#333';

                            return (
                                <View key={idx} style={[styles.poiBadge, { backgroundColor: color }]}>
                                    <Text style={styles.poiBadgeText}>{line}</Text>
                                </View>
                            );
                        })}
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


const LayersMenu = ({ visible, onClose, layers, toggleLayer, theme, isSeasonalMode, toggleSeasonal }: any) => {

    useEffect(() => {
        const onBackPress = () => {
            if (visible) {
                onClose();
                return true;
            }
            return false;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
        return () => subscription.remove();
    }, [visible, onClose]);

    if (!visible) return null;

    return (
        <Pressable style={styles.layersBackdrop} onPress={onClose}>
            <Animated.View
                entering={FadeInDown.duration(200)}
                style={[styles.layersMenu, { backgroundColor: theme.cardBackground }]}
                onStartShouldSetResponder={() => true}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={[styles.layersTitle, { marginBottom: 0, color: theme.text }]}>Map Layers</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <IconSymbol name="xmark.circle.fill" size={24} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                <Text style={[styles.layersSection, { color: theme.textSecondary }]}>ESSENTIALS (Recommended)</Text>



                <TouchableOpacity style={styles.layerRow} onPress={() => toggleLayer('mainLines')}>
                    <IconSymbol name={layers.mainLines ? "checkmark.circle.fill" : "circle"} size={22} color={layers.mainLines ? theme.primary : theme.textSecondary} />
                    <View>
                        <Text style={[styles.layerText, { color: theme.text }]}>Main Lines (Tram & Rapid)</Text>

                    </View>
                </TouchableOpacity>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />



                <Text style={[styles.layersSection, { color: theme.textSecondary }]}>SEASONAL</Text>

                <TouchableOpacity style={styles.layerRow} onPress={toggleSeasonal}>
                    <IconSymbol name={isSeasonalMode ? "checkmark.circle.fill" : "circle"} size={22} color={isSeasonalMode ? theme.primary : theme.textSecondary} />
                    <View>
                        <Text style={[styles.layerText, { color: theme.text }]}>Christmas Mode</Text>
                        <Text style={[styles.layerSubtext, { color: theme.textSecondary }]}>Hide closed stops nearby markets</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View >
        </Pressable >
    );
};

export interface TransportRef {
    openMap: () => void;
}

export const TransportContent = React.memo(React.forwardRef<TransportRef>((props, ref) => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();


    const { data: parkingData, loading: parkingLoading, error: parkingError, refetch: refetchParking, lastUpdated } = useParkingData();


    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const [initialZoomDone, setInitialZoomDone] = useState(false);
    const [isMapClosing, setIsMapClosing] = useState(false);
    const [isParkingMapVisible, setIsParkingMapVisible] = useState(false);

    const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
    const [selectedParking, setSelectedParking] = useState<ParkingData | null>(null);
    const [selectedStop, setSelectedStop] = useState<any | null>(null);
    const [allArrivals, setAllArrivals] = useState<VehicleJourney[]>([]);
    const [arrivalsLoading, setArrivalsLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [followingUser, setFollowingUser] = useState(false);


    const [search, setSearch] = useState('');
    const [mapFilter, setMapFilter] = useState('all');
    const [selectedPoi, setSelectedPoi] = useState<any | null>(null);
    const [arrivalFilter, setArrivalFilter] = useState<string | null>(null);


    const [isLayersValues, setIsLayersValues] = useState({
        landmarks: false,
        mainLines: true
    });
    const [isLayersVisible, setIsLayersVisible] = useState(false);
    const [isSeasonalMode, setIsSeasonalMode] = useState(false);
    const [walkRadiusGeoJSON, setWalkRadiusGeoJSON] = useState<any>(null);



    const mapCamera = useRef<Mapbox.Camera>(null);
    const parkingMapCamera = useRef<Mapbox.Camera>(null);
    const mapView = useRef<Mapbox.MapView>(null);


    useEffect(() => {
        Mapbox.clearData();
    }, []);


    useFocusEffect(
        useCallback(() => {

            return () => {

                setMapFilter('all');
                setSearch('');


                setSelectedPoi(null);
                setSelectedStop(null);
                setSelectedLineId(null);


                setWalkRadiusGeoJSON(null);
                setArrivalFilter(null);


                setIsLayersValues(prev => ({
                    ...prev,
                    landmarks: false,
                    mainLines: true,
                    buses: false
                }));
            };
        }, [])
    );


    const allItems = useMemo(() => [
        ...(SIGHTS as any[]).map(i => ({ ...i, type: 'sights' })),
        ...(RESTAURANTS as any[]).map(i => ({ ...i, type: 'restaurants' })),
        ...(MUSEUMS as any[]).map(i => ({ ...i, type: 'museums' })),
        ...(ACTIVITIES as any[]).map(i => ({ ...i, type: 'activities' }))
    ], []);

    const normalize = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

    const checkSearchMatch = useCallback((item: any, searchInput: string) => {
        if (!searchInput) return true;

        const term = normalize(searchInput);
        const name = normalize(tData(item, 'name'));
        const location = normalize(tData(item, 'location'));

        return name.includes(term) || location.includes(term);
    }, []);

    const poiFeatures = useMemo(() => {
        if (!isLayersValues.landmarks) return [];

        return allItems.filter(item => {
            if (!item.coordinates) return false;

            if (mapFilter !== 'all' && item.type !== mapFilter) return false;
            if (search && !checkSearchMatch(item, search)) return false;
            return true;
        }).map(item => {

            let nearest = null;
            let minDst = 300;



            for (const feature of TRANSPORT_STOPS.features) {
                const sLat = feature.geometry.coordinates[1];
                const sLon = feature.geometry.coordinates[0];
                const d = getDistance(
                    { latitude: item.coordinates.latitude, longitude: item.coordinates.longitude },
                    { latitude: sLat, longitude: sLon }
                );

                if (d < minDst) {
                    minDst = d;

                    nearest = {
                        ...feature.properties,
                        distance: d,
                        coordinates: feature.geometry.coordinates,

                        lines: feature.properties.lines || []
                    };
                }
            }

            return { ...item, nearestStop: nearest };
        });
    }, [isLayersValues.landmarks, allItems, mapFilter, search, checkSearchMatch]);






    useEffect(() => {
        if (isMapFullscreen && !initialZoomDone) {

            setTimeout(() => {
                mapCamera.current?.setCamera({
                    centerCoordinate: CITY_CENTER,
                    zoomLevel: INITIAL_ZOOM,
                    animationDuration: 2000,
                    animationMode: 'flyTo'
                });
                setInitialZoomDone(true);
            }, 100);
        }
    }, [isMapFullscreen]);


    useEffect(() => {
        const target = selectedPoi || selectedStop;

        if (target && target.coordinates) {

            const coords = Array.isArray(target.coordinates)
                ? target.coordinates
                : [target.coordinates.longitude, target.coordinates.latitude];

            mapCamera.current?.setCamera({
                centerCoordinate: coords,
                zoomLevel: 15.5,
                animationDuration: 800,
                animationMode: 'flyTo'
            });
        }



    }, [selectedPoi, selectedStop]);

    const [isGuideVisible, setIsGuideVisible] = useState(false);
    const modalOpacity = useSharedValue(0);
    const isClosing = useSharedValue(false);


    const handleOpenMap = () => {
        setIsMapFullscreen(true);
        setInitialZoomDone(false);
        setIsMapClosing(false);
        isClosing.value = false;
        modalOpacity.value = 0;
        setTimeout(() => {
            modalOpacity.value = withTiming(1, { duration: 300 });
        }, 50);


        setTimeout(() => {
            setInitialZoomDone(true);
        }, 10);
    };

    const handleCloseMap = () => {
        setIsMapClosing(true);
        isClosing.value = true;
        modalOpacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(setIsMapFullscreen)(false);
            runOnJS(setSelectedLineId)(null);
            runOnJS(setSelectedStop)(null);
            runOnJS(setArrivalFilter)(null);
            runOnJS(setWalkRadiusGeoJSON)(null);
            runOnJS(setAllArrivals)([]);
            runOnJS(setSelectedPoi)(null);
            runOnJS(setIsLayersVisible)(false);
            runOnJS(setSearch)('');
            runOnJS(setMapFilter)('all');
            runOnJS(setIsLayersValues)({ landmarks: false, mainLines: true });
        });
    };



    const handleResetNorth = () => {
        mapCamera.current?.setCamera({ heading: 0, animationDuration: 500 });
    };

    const handleLocateMe = () => {

        setSelectedStop(null);
        setSelectedPoi(null);
        setFollowingUser(false);

        const config = {
            centerCoordinate: CITY_CENTER,
            zoomLevel: INITIAL_ZOOM,
            heading: 0,
            pitch: 0,
            animationDuration: 1500,
            animationMode: 'flyTo' as const
        };


        mapCamera.current?.setCamera(config);
        parkingMapCamera.current?.setCamera(config);
    };


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

            if (matchedStops.length === 0) {
                setFetchError('stopNotFound');
                setArrivalsLoading(false);
                return;
            }


            const refs = matchedStops.map(s => s.StopPointRef);
            console.log(`[Transport] Polling ${refs.length} platforms for ${stopName}...`);


            const requests = refs.map(ref =>
                ctsService.getStopMonitoring(ref).catch(() => [])
            );

            const responses = await Promise.all(requests);
            const allArrivals = responses.flat();


            const validLines = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

            const tramArrivals = allArrivals.filter(arr =>
                validLines.includes(arr.PublishedLineName)
            );


            const sorted = tramArrivals.sort((a, b) =>
                new Date(a.MonitoredCall.ExpectedArrivalTime).getTime() - new Date(b.MonitoredCall.ExpectedArrivalTime).getTime()
            );


            const deduped = sorted.filter((v, i, a) =>
                a.findIndex(t => (
                    t.PublishedLineName === v.PublishedLineName &&
                    t.DirectionRef === v.DirectionRef &&
                    Math.abs(new Date(t.MonitoredCall.ExpectedArrivalTime).getTime() - new Date(v.MonitoredCall.ExpectedArrivalTime).getTime()) < 60000
                )) === i
            );

            if (deduped.length === 0) {
                setFetchError('noArrivals');
            }

            setAllArrivals(deduped);

        } catch (err) {
            console.error('[Transport] Fetch failed:', err);
            setFetchError('connectionError');
        } finally {
            setArrivalsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedStop) {
            fetchArrivals(selectedStop.name);
        } else {
            setAllArrivals([]);
        }
    }, [selectedStop]);


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




    const transportSource = useMemo(() => {

        const localFeatures = TRANSPORT_LINES.map(line => ({
            type: 'Feature' as const,
            properties: {
                id: line.id,
                color: line.color,
                isMain: true
            },
            geometry: line.geoJson.geometry
        }));


        const filteredFeatures = localFeatures.filter(f => isLayersValues.mainLines);

        console.log(`[TransportContent] Source Update. Total: ${localFeatures.length}. Showing: ${filteredFeatures.length}`);

        return { type: 'FeatureCollection' as const, features: filteredFeatures };

    }, [isLayersValues]);



    const stopsSource = useMemo(() => {




        let allFeatures = [...TRANSPORT_STOPS.features];

        if (!selectedLineId) {


            if (isLayersValues.mainLines) {
                const mainScan = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                const filtered = allFeatures.filter((f: any) =>
                    f.properties.lines && f.properties.lines.some((l: string) => mainScan.includes(l))
                );
                return { type: 'FeatureCollection', features: filtered };
            }

            return { type: 'FeatureCollection', features: [] };
        }


        const shortName = selectedLineId.replace('TRAM_', '').replace('BUS_', '');
        const filteredFeatures = allFeatures.filter((f: any) =>
            f.properties.lines && f.properties.lines.includes(shortName)
        );
        return { type: 'FeatureCollection', features: filteredFeatures };
    }, [selectedLineId, isLayersValues]);

    const toggleLineSelection = (id: string) => {
        setSelectedLineId(prev => {
            const newState = (prev === id ? null : id);
            if (newState) {
                setSelectedPoi(null);
            }
            return newState;
        });
        setSelectedStop(null);
        setWalkRadiusGeoJSON(null);
    };

    const selectedLine = TRANSPORT_LINES.find(l => l.id === selectedLineId);

    const onStopPress = (e: any) => {
        const feature = e.features?.[0];
        if (feature?.properties) {
            console.log('Stop Name:', feature.properties.name);

            const coords = feature.geometry?.type === 'Point' ? feature.geometry.coordinates : null;
            setSelectedStop({ ...feature.properties, coordinates: coords });
            setSelectedPoi(null);


            if (selectedLineId) {
                const shortName = selectedLineId.replace('TRAM_', '').replace('BUS_', '');

                if (feature.properties.lines?.includes(shortName)) {
                    setArrivalFilter(shortName);
                } else {
                    setArrivalFilter(null);
                }
            } else {
                setArrivalFilter(null);
            }


            if (coords) {
                const circle = createGeoJSONCircle(coords, 0.4);
                setWalkRadiusGeoJSON(circle);
            }
        }
    };

    const handlePoiPress = useCallback((item: any) => {
        setSelectedPoi(item);
        setSelectedLineId(null);
        setSelectedStop(null);
        setWalkRadiusGeoJSON(null);
    }, []);

    const renderMapContent = (fullscreen: boolean) => (
        <Mapbox.MapView
            ref={mapView}
            style={{ flex: 1, backgroundColor: '#FFFFFF' }}
            tintColor="#FFFFFF"
            styleURL="mapbox://styles/spectruh/cmkvi58o6007p01se6l820xty"
            surfaceView={false}
            scrollEnabled={fullscreen}
            zoomEnabled={fullscreen}
            pitchEnabled={fullscreen}
            rotateEnabled={fullscreen}
            attributionEnabled={false}
            logoEnabled={false}
            onPress={() => {
                setSelectedStop(null);
                setSelectedPoi(null);
                setWalkRadiusGeoJSON(null);
            }}
        >
            <Mapbox.UserLocation visible={fullscreen} />
            <Mapbox.Camera
                ref={fullscreen ? mapCamera : null}
                defaultSettings={{
                    centerCoordinate: CITY_CENTER,
                    zoomLevel: 9,
                }}


                followUserLocation={followingUser}
                followUserMode={Mapbox.UserTrackingMode.Follow}
                onUserTrackingModeChange={(e) => {
                    if (!e.nativeEvent.payload.followUserLocation) {
                        setFollowingUser(false);
                    }
                }}
            />







            { }
            { }
            <Mapbox.ShapeSource id="transportLines" shape={transportSource}>
                { }
                { }
                <Mapbox.LineLayer
                    id="lines-main"
                    filter={['==', ['get', 'isMain'], true]}
                    style={{
                        lineColor: ['get', 'color'],
                        lineWidth: [
                            'interpolate', ['linear'], ['zoom'],
                            10, 2,
                            15, 6
                        ],
                        lineCap: 'round',
                        lineJoin: 'round',
                        lineOpacity: 1
                    }}
                />

                { }
                <Mapbox.LineLayer
                    id="lines-buses"
                    filter={['==', ['get', 'isMain'], false]}
                    minZoomLevel={12}
                    style={{
                        lineColor: ['get', 'color'],
                        lineWidth: [
                            'interpolate', ['linear'], ['zoom'],
                            12, 1,
                            16, 4
                        ],
                        lineCap: 'round',
                        lineJoin: 'round',
                        lineOpacity: 0.8
                    }}
                />
                { }
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



            { }
            {
                walkRadiusGeoJSON && (
                    <Mapbox.ShapeSource id="walkRadiusSource" shape={walkRadiusGeoJSON}>
                        <Mapbox.FillLayer
                            id="walkRadiusLayer"
                            style={{
                                fillColor: theme.primary,
                                fillOpacity: 0.15,
                                fillOutlineColor: theme.primary,
                            }}
                        />
                    </Mapbox.ShapeSource>
                )
            }

            { }
            {
                poiFeatures.map((item: any) => (
                    <PoiMarker
                        key={item.id}
                        item={item}
                        nearestStop={item.nearestStop}
                        onPress={handlePoiPress}
                        isSelected={selectedPoi?.id === item.id}
                        theme={theme}
                    />
                ))
            }

            { }
            { }
            <Mapbox.ShapeSource id="transportStops" shape={stopsSource as any} onPress={onStopPress} hitbox={{ width: 20, height: 20 }}>
                { }
                <Mapbox.CircleLayer
                    id="stops"
                    aboveLayerID="lines-selected"
                    minZoomLevel={12}
                    filter={
                        isSeasonalMode
                            ? ['all', ['!=', ['get', 'uniqueId'], selectedStop?.uniqueId || ''], ['!', ['in', ['get', 'name'], ['literal', CLOSED_STOP_NAMES]]]]
                            : ['!=', ['get', 'uniqueId'], selectedStop?.uniqueId || '']
                    }
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
                { }
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
                { }
                <Mapbox.CircleLayer
                    id="stops-highlighted"
                    aboveLayerID="stops-selected"
                    filter={['==', ['get', 'uniqueId'], selectedPoi?.nearestStop?.uniqueId || '']}
                    style={{
                        circleRadius: [
                            'interpolate', ['linear'], ['zoom'],
                            12, 6,
                            16, 15
                        ],
                        circleColor: 'transparent',
                        circleStrokeColor: theme.primary,
                        circleStrokeWidth: 3,
                        circleOpacity: 1
                    }}
                />

                { }
                <Mapbox.SymbolLayer
                    id="stopBadges"
                    aboveLayerID="stops"
                    minZoomLevel={13}
                    filter={['==', ['to-boolean', ['get', 'has_ticket_machine']], true]}
                    style={{
                        iconImage: 'ticket-badge',
                        iconSize: ['interpolate', ['linear'], ['zoom'], 13, 0.4, 16, 0.8],
                        iconOffset: [8, -8],
                        iconAllowOverlap: true,
                        iconIgnorePlacement: true,
                        iconOpacity: 1
                    }}
                />

                { }
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
                            ? 1
                            : ['step', ['zoom'], 0, 15, 1]
                    }}
                    filter={
                        isSeasonalMode
                            ? ['!', ['in', ['get', 'name'], ['literal', CLOSED_STOP_NAMES]]]
                            : ['!=', '1', '2']






                    }
                />
            </Mapbox.ShapeSource>
        </Mapbox.MapView >
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

                { }
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

                { }
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

                {/* Map preview hidden as per user request */}



                { }
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

                { }
                <Modal visible={isMapFullscreen} onRequestClose={handleCloseMap} animationType="none" transparent={true}>
                    <Animated.View style={[{ flex: 1, backgroundColor: theme.background }, animatedModalStyle]}>
                        <SafeAreaView style={{ flex: 1, position: 'relative' }}>
                            <View style={{ flex: 1 }}>{renderMapContent(true)}</View>

                            { }
                            { }
                            {(!selectedLineId && !selectedPoi && !selectedStop && !isLayersVisible) && (
                                <>
                                    { }
                                    <TouchableOpacity
                                        style={[
                                            styles.layersFab,
                                            {
                                                backgroundColor: theme.cardBackground,
                                                position: 'absolute',
                                                top: undefined,
                                                bottom: 42,
                                                right: 16,
                                                left: undefined,
                                                zIndex: 60,
                                                elevation: 6
                                            }
                                        ]}
                                        onPress={() => setIsLayersVisible(true)}
                                    >
                                        <IconSymbol name="line.3.horizontal" size={24} color={theme.text} />
                                    </TouchableOpacity>

                                    { }
                                    <View style={[
                                        styles.mapSearchPill,
                                        {
                                            backgroundColor: theme.cardBackground,
                                            borderColor: theme.border,
                                            top: undefined,
                                            bottom: 42,
                                            left: 16,
                                            right: 80,
                                        }
                                    ]}>
                                        <IconSymbol name="magnifyingglass" size={18} color={theme.icon} />
                                        <TextInput
                                            placeholder={i18n.t('searchPlaceholder')}
                                            placeholderTextColor={theme.icon}
                                            style={[styles.mapSearchInput, { color: theme.text }]}
                                            value={search}
                                            onChangeText={setSearch}
                                            returnKeyType="search"
                                        />
                                        {search.length > 0 && (
                                            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                                <IconSymbol name="xmark.circle.fill" size={16} color={theme.icon} />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    { }
                                    <View style={[
                                        styles.filterContainer,
                                        {
                                            top: undefined,
                                            bottom: 100,
                                        }
                                    ]}>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                            {['sights', 'restaurants', 'museums', 'activities'].map((f) => {
                                                const isActive = mapFilter === f && isLayersValues.landmarks;
                                                const color = getCategoryColor(f);
                                                const activeBg = color;

                                                return (
                                                    <TouchableOpacity
                                                        key={f}
                                                        style={[
                                                            styles.filterChip,
                                                            {
                                                                backgroundColor: isActive ? activeBg : theme.cardBackground,
                                                                borderColor: activeBg,
                                                                borderWidth: 1,
                                                                elevation: 4,
                                                                shadowColor: '#000',
                                                                shadowOffset: { width: 0, height: 2 },
                                                                shadowOpacity: 0.1,
                                                                shadowRadius: 2,
                                                            }
                                                        ]}
                                                        onPress={() => {
                                                            if (mapFilter === f && isLayersValues.landmarks) {

                                                                setIsLayersValues(prev => ({ ...prev, landmarks: false }));
                                                                setMapFilter('all');
                                                            } else {

                                                                setMapFilter(f);
                                                                setIsLayersValues(prev => ({ ...prev, landmarks: true }));
                                                            }
                                                            setSelectedPoi(null);
                                                        }}
                                                    >
                                                        <Text style={[
                                                            styles.filterText,
                                                            { color: isActive ? '#FFF' : color }
                                                        ]}>
                                                            {i18n.t(f as any)}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </ScrollView>
                                    </View>
                                </>
                            )}

                            {isLayersValues.mainLines && !isMapClosing && (
                                <Animated.View
                                    entering={SlideInLeft.duration(300)}
                                    exiting={SlideOutLeft.duration(300)}
                                    style={styles.leftLegendContainer}
                                >
                                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(l => {
                                        const line = TRANSPORT_LINES.find(t => t.id.endsWith(l));
                                        if (!line) return null;
                                        const isSelected = selectedLineId === line.id;
                                        return (
                                            <TouchableOpacity
                                                key={l}
                                                onPress={() => toggleLineSelection(line.id)}
                                                style={[
                                                    styles.legendItem,
                                                    {
                                                        backgroundColor: isSelected ? line.color : theme.cardBackground,
                                                        borderColor: line.color,
                                                        borderWidth: 2,
                                                    }
                                                ]}
                                            >
                                                <Text style={[styles.legendText, { color: isSelected ? '#FFF' : theme.text }]}>{l}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </Animated.View>
                            )}



                            <LayersMenu
                                visible={isLayersVisible}
                                onClose={() => setIsLayersVisible(false)}
                                layers={isLayersValues}
                                toggleLayer={(key: keyof typeof isLayersValues) => setIsLayersValues(prev => ({ ...prev, [key]: !prev[key] }))}
                                theme={theme}
                                isSeasonalMode={isSeasonalMode}
                                toggleSeasonal={() => setIsSeasonalMode(p => !p)}
                            />

                            { }
                            {selectedPoi && (
                                <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)} style={[styles.detailCard, { backgroundColor: theme.cardBackground, flexDirection: 'row', minHeight: 120, padding: 0, overflow: 'hidden' }, uiStyle]}>
                                    { }
                                    <View style={{ width: 110, height: '100%' }}>
                                        <Image source={typeof selectedPoi.image === 'string' ? { uri: selectedPoi.image } : selectedPoi.image} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                                    </View>

                                    { }
                                    <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
                                        <View>
                                            <Text style={[styles.detailTitle, { color: theme.text }]} numberOfLines={1}>{tData(selectedPoi, 'name')}</Text>
                                            <Text style={{ fontSize: 12, color: theme.icon }} numberOfLines={2}>{tData(selectedPoi, 'shortDescription')}</Text>
                                        </View>

                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View style={{ backgroundColor: getCategoryColor(selectedPoi.type), paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                <Text style={{ fontSize: 10, fontWeight: '700', color: '#222' }}>{i18n.t(selectedPoi.type).toUpperCase()}</Text>
                                            </View>

                                            <TouchableOpacity
                                                style={{ flexDirection: 'row', alignItems: 'center' }}
                                                onPress={() => router.push(`/sight/${selectedPoi.id}` as any)}
                                            >
                                                <Text style={{ color: theme.primary, fontWeight: '600', fontSize: 13, marginRight: 2 }}>{i18n.t('more')}</Text>
                                                <IconSymbol name="chevron.right" size={16} color={theme.primary} />
                                            </TouchableOpacity>
                                        </View>

                                        { }
                                        {selectedPoi.nearestStop && (
                                            <TouchableOpacity
                                                onPress={() => {

                                                    setSelectedStop(selectedPoi.nearestStop);

                                                    setSelectedPoi(null);
                                                }}
                                                style={{
                                                    marginTop: 6,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    backgroundColor: theme.background,
                                                    paddingVertical: 5,
                                                    paddingHorizontal: 8,
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                    borderColor: theme.border,
                                                    alignSelf: 'flex-start'
                                                }}
                                            >
                                                <MaterialIcons name="directions-bus" size={14} color={theme.text} style={{ marginRight: 6 }} />
                                                <Text style={{ fontSize: 11, fontWeight: '600', color: theme.text }}>
                                                    {i18n.t('showArrivals', { defaultValue: 'Show Arrivals' })} ({Math.round(selectedPoi.nearestStop.distance)}m)
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    { }
                                    <TouchableOpacity
                                        style={[
                                            styles.closeLineButton,
                                            {
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: theme.background,
                                                width: 32,
                                                height: 32,
                                                borderRadius: 16,
                                                marginLeft: 0,
                                                shadowColor: "#000",
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.2,
                                                shadowRadius: 3,
                                                elevation: 4
                                            }
                                        ]}
                                        onPress={() => setSelectedPoi(null)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <IconSymbol name="xmark" size={16} color={theme.text} />
                                    </TouchableOpacity>
                                </Animated.View>
                            )}

                            { }
                            {selectedLine && !selectedStop && (
                                <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)} style={[styles.detailCard, { backgroundColor: theme.cardBackground }, uiStyle]}>
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

                            { }
                            {selectedStop && (
                                <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(200)} style={[styles.detailCard, { backgroundColor: theme.cardBackground, flexDirection: 'column', alignItems: 'stretch' }, uiStyle]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                        <View style={[styles.detailIcon, { backgroundColor: '#FFF', borderWidth: 2, borderColor: '#333' }]}>
                                            <MaterialIcons name="place" size={24} color="#333" />
                                        </View>
                                        <View style={styles.detailTextContainer}>
                                            <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedStop.name}</Text>
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                                {(selectedStop.lines || []).map((l: string) => {
                                                    const lineData = TRANSPORT_LINES.find(data => data.id.endsWith(l));
                                                    const color = lineData?.color || '#333';
                                                    const isActive = arrivalFilter === l;
                                                    const isDimmed = arrivalFilter !== null && !isActive;

                                                    return (
                                                        <TouchableOpacity
                                                            key={l}
                                                            onPress={() => {
                                                                const newFilter = arrivalFilter === l ? null : l;
                                                                setArrivalFilter(newFilter);


                                                                if (newFilter) {

                                                                    const lineObj = TRANSPORT_LINES.find(data => data.id.endsWith(`_${l}`));
                                                                    if (lineObj) setSelectedLineId(lineObj.id);
                                                                } else {


                                                                    setSelectedLineId(null);
                                                                }
                                                            }}
                                                            style={{
                                                                backgroundColor: color,
                                                                paddingHorizontal: 8,
                                                                paddingVertical: 4,
                                                                borderRadius: 6,
                                                                opacity: isDimmed ? 0.3 : 1,
                                                                transform: [{ scale: isActive ? 1.1 : 1 }],
                                                                borderWidth: isActive ? 2 : 0,
                                                                borderColor: theme.text
                                                            }}
                                                        >
                                                            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>{l}</Text>
                                                        </TouchableOpacity>
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

                                    { }
                                    <View style={styles.arrivalsContainer}>
                                        <Text style={[styles.arrivalsHeader, { color: theme.textSecondary }]}>{i18n.t('realTimeArrivals')}</Text>

                                        {(() => {

                                            const displayedArrivals = (() => {
                                                if (!arrivalFilter) return allArrivals.slice(0, 5);
                                                return allArrivals
                                                    .filter(a => a.PublishedLineName === arrivalFilter)
                                                    .slice(0, 5);
                                            })();

                                            if (arrivalsLoading) {
                                                return <Text style={[styles.arrivalText, { color: theme.textSecondary, fontStyle: 'italic' }]}>{i18n.t('loadingArrivals')}</Text>;
                                            }

                                            if (fetchError) {
                                                return (
                                                    <Text style={[styles.arrivalText, { color: theme.textSecondary }]}>
                                                        {fetchError === 'noArrivals' ? i18n.t('noArrivals') :
                                                            fetchError === 'stopNotFound' ? 'Stop not found in CTS registry (Names might differ)' :
                                                                fetchError === 'connectionError' ? 'Failed to connect to CTS API' : fetchError}
                                                    </Text>
                                                );
                                            }

                                            if (displayedArrivals.length > 0) {
                                                return displayedArrivals.map((arr, idx) => {
                                                    const lineData = TRANSPORT_LINES.find(l => l.id.endsWith(arr.PublishedLineName));
                                                    const color = lineData?.color || '#333';


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
                                                });
                                            }

                                            return <Text style={[styles.arrivalText, { color: theme.textSecondary }]}>{i18n.t('noArrivals')}</Text>;
                                        })()}
                                    </View>
                                </Animated.View>
                            )}

                            <Animated.View style={[styles.closeButtonContainer, closeButtonAnimationStyle]}>
                                <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.cardBackground, marginBottom: 12 }]} onPress={handleCloseMap}>
                                    <MaterialIcons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.cardBackground, marginBottom: 12 }]} onPress={handleResetNorth}>
                                    <IconSymbol name="location.north.circle" size={24} color={theme.text} />
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.cardBackground }]} onPress={() => handleLocateMe()}>
                                    <MaterialIcons name="my-location" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </Animated.View>
                        </SafeAreaView>
                    </Animated.View>
                </Modal>

                { }
                <Modal visible={isParkingMapVisible} onRequestClose={handleCloseParkingMap} animationType="fade" transparent={false}>
                    <View style={{ flex: 1, backgroundColor: theme.background }}>
                        <Mapbox.MapView
                            style={{ flex: 1, backgroundColor: '#FFFFFF' }}
                            tintColor="#FFFFFF"
                            styleURL="mapbox://styles/spectruh/cmkvi58o6007p01se6l820xty"
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
                            onPress={() => handleLocateMe()}
                        >
                            <MaterialIcons name="my-location" size={20} color={theme.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.floatingCloseBtn, { backgroundColor: theme.cardBackground, shadowColor: '#000' }]}
                            onPress={handleCloseParkingMap}
                        >
                            <IconSymbol name="xmark" size={20} color={theme.text} />
                        </TouchableOpacity>

                        { }
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

                                        { }
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
            </ScrollView >
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
        zIndex: 101,
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
        elevation: 20,
        zIndex: 120,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
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
        bottom: 30,
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
    mapSearchPill: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        height: 48,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 5,
        borderWidth: 1,
        zIndex: 50,
    },
    mapSearchInput: {
        flex: 1,
        fontSize: 16,
        marginLeft: 8,
        height: '100%',
        paddingVertical: 0,
    },
    filterContainer: {
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0,
        zIndex: 49,
        elevation: 49,
    },
    filterScroll: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        gap: 10,
        alignItems: 'center'
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        height: 36,
        justifyContent: 'center'
    },
    filterText: {
        fontWeight: '600',
        textTransform: 'capitalize',
        fontSize: 13,
    },

    leftLegendContainer: {
        position: 'absolute',
        left: 16,
        top: 100,
        gap: 12,
        zIndex: 55,
        alignItems: 'center',
    },
    legendItem: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    legendText: {
        fontSize: 14,
        fontWeight: '900',
    },

    poiMarkerBody: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#FFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    poiBadgeContainer: {
        position: 'absolute',
        top: 4,
        right: 0,
        flexDirection: 'row',
        flexWrap: 'wrap',
        maxWidth: 60,
        gap: 2,
    },
    poiBadge: {
        paddingHorizontal: 3,
        paddingVertical: 1,
        borderRadius: 4,
        minWidth: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFF',
    },
    poiBadgeText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '800',
    },
});
