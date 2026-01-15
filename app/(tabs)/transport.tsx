import { IconSymbol } from '@/components/ui/icon-symbol';
import {
    BUS_G_PATH, BUS_H_PATH,
    TRAM_A_PATH, TRAM_B_PATH, TRAM_C_PATH, TRAM_D_PATH, TRAM_E_PATH, TRAM_F_PATH
} from '@/data/transport_data';
import i18n from '@/i18n';
import { offsetPolyline, toGeoJSONLineString } from '@/utils/geo';
import Mapbox from '@rnmapbox/maps';
import { useMemo, useRef, useState } from 'react';
// ADDED: Dimensions import
import { ScreenTransition } from '@/components/ScreenTransition';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Dimensions, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Constants ---
// Placeholder Token - WARNING: You must replace this with your real Mapbox public token!
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3BlY3RydWgiLCJhIjoiY21rNG5sNmh3MDF6NjNkczl5cGM3Ynl2aSJ9.U3vf9ao95WB7Xxx4n2Ihug';
Mapbox.setAccessToken(MAPBOX_TOKEN);

const CITY_CENTER = [7.74553, 48.58392]; // [Lon, Lat] for Mapbox

// ADDED: Screen Dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Zoom Level Equivalence:
const INITIAL_ZOOM = 11.5;

export default function TransportScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Animation State
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const [originRect, setOriginRect] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const previewRef = useRef<View>(null);

    // Remount Key: Forces the map to completely re-initialize when opened
    const [mapKey, setMapKey] = useState(0);

    // Animation Values
    const expandProgress = useSharedValue(0);

    const openCTSWebsite = () => {
        Linking.openURL('https://www.cts-strasbourg.eu/en/');
    };

    // Prepare GeoJSON Data
    const transportSource = useMemo(() => {
        const features = [
            { id: 'TRAM_A', color: '#ac001d', path: offsetPolyline(TRAM_A_PATH, 0) },
            { id: 'TRAM_B', color: '#0099CC', path: offsetPolyline(TRAM_B_PATH, 0) },
            { id: 'TRAM_C', color: '#F68002', path: offsetPolyline(TRAM_C_PATH, 0) },
            { id: 'TRAM_D', color: '#007934', path: offsetPolyline(TRAM_D_PATH, 0) },
            { id: 'TRAM_E', color: '#660099', path: offsetPolyline(TRAM_E_PATH, 0) },
            { id: 'TRAM_F', color: '#8CC63E', path: offsetPolyline(TRAM_F_PATH, 0) },
            { id: 'BUS_G', color: '#FFCC00', path: offsetPolyline(BUS_G_PATH, 0) },
            { id: 'BUS_H', color: '#922b3e', path: offsetPolyline(BUS_H_PATH, 0) },
        ].map(line => ({
            type: 'Feature' as const,
            properties: {
                id: line.id,
                color: line.color,
            },
            geometry: toGeoJSONLineString(line.path),
        }));

        return {
            type: 'FeatureCollection' as const,
            features: features,
        };
    }, []);

    const handleOpenMap = () => {
        setMapKey(prev => prev + 1);
        previewRef.current?.measureInWindow((x, y, width, height) => {
            if (width > 0 && height > 0) {
                setOriginRect({ x, y, width, height });
                setIsMapFullscreen(true);
                setTimeout(() => {
                    expandProgress.value = withTiming(1, { duration: 250 });
                }, 16);
            }
        });
    };

    const handleCloseMap = () => {
        expandProgress.value = withTiming(0, { duration: 250 }, (finished) => {
            if (finished) {
                runOnJS(setIsMapFullscreen)(false);
            }
        });
    };

    // --- Animation Styles ---
    const animatedContainerStyle = useAnimatedStyle(() => {
        if (originRect.width === 0) return {};
        const top = originRect.y + (0 - originRect.y) * expandProgress.value;
        const left = originRect.x + (0 - originRect.x) * expandProgress.value;
        const width = originRect.width + (SCREEN_WIDTH - originRect.width) * expandProgress.value;
        const height = originRect.height + (SCREEN_HEIGHT - originRect.height) * expandProgress.value;
        const borderRadius = 16 + (0 - 16) * expandProgress.value;
        return { position: 'absolute', top, left, width, height, borderRadius, overflow: 'hidden', backgroundColor: theme.background };
    });

    const animatedInnerMapStyle = useAnimatedStyle(() => {
        if (originRect.width === 0) return {};
        const currentWidth = originRect.width + (SCREEN_WIDTH - originRect.width) * expandProgress.value;
        const currentHeight = originRect.height + (SCREEN_HEIGHT - originRect.height) * expandProgress.value;
        const translateX = (currentWidth - SCREEN_WIDTH) / 2;
        const translateY = (currentHeight - SCREEN_HEIGHT) / 2;
        return { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, transform: [{ translateX }, { translateY }] };
    });

    // --- Map Render Helper ---
    const renderMapContent = () => (
        <Mapbox.MapView
            style={{ flex: 1 }}
            styleURL={Mapbox.StyleURL.Street}
            scrollEnabled={isMapFullscreen}
            zoomEnabled={isMapFullscreen}
            pitchEnabled={false}
            rotateEnabled={false}
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
                        lineWidth: 3,
                        lineCap: 'round',
                        lineJoin: 'round',
                        lineOpacity: 0.9
                    }}
                />
            </Mapbox.ShapeSource>
        </Mapbox.MapView>
    );

    return (
        <ScreenTransition associatedPath="/transport">
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>{i18n.t('transport')}</Text>
                    </View>

                    {/* Intro Card */}
                    <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Getting Around</Text>
                        <Text style={[styles.text, { color: theme.text }]}>
                            Strasbourg has an excellent public transport network (CTS) consisting of 6 tram lines, 2 express bus lines and numerous other bus lines.
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.text, marginTop: 12 }]}>Tickets</Text>
                        <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>Single Ticket</Text><Text style={styles.ticketPrice}>1.90 €</Text></View>
                        <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>24h Individual</Text><Text style={styles.ticketPrice}>4.60 €</Text></View>
                        <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>24h Trio (2-3 people)</Text><Text style={styles.ticketPrice}>10.20 €</Text></View>
                        <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>72h Individual</Text><Text style={styles.ticketPrice}>10.20 €</Text></View>
                        <View style={styles.ticketInfo}>
                            <IconSymbol name="info.circle" size={14} color={theme.icon} style={{ marginRight: 6, marginTop: 2 }} />
                            <Text style={[styles.textSmall, { color: theme.textSecondary, flex: 1 }]}>Tickets must be validated before boarding.</Text>
                        </View>
                        <TouchableOpacity style={[styles.websiteButton, { backgroundColor: theme.primary }]} onPress={openCTSWebsite}>
                            <Text style={styles.websiteButtonText}>Visit CTS Website</Text>
                            <IconSymbol name="arrow.up.right" size={16} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Map Preview */}
                    <TouchableOpacity
                        style={styles.mapContainer}
                        activeOpacity={0.9}
                        onPress={handleOpenMap}
                        ref={previewRef}
                    >
                        <View style={styles.map} pointerEvents="none">
                            {renderMapContent()}
                        </View>

                        <View style={styles.mapOverlay}>
                            <IconSymbol name="map" size={16} color="#000" style={{ marginRight: 6 }} />
                            <Text style={styles.mapOverlayText}>Tap to Expand</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Fullscreen Map Modal */}
                    <Modal
                        transparent={true}
                        visible={isMapFullscreen}
                        onRequestClose={handleCloseMap}
                        animationType="none"
                    >
                        <Animated.View
                            entering={FadeIn.duration(200)}
                            exiting={FadeOut.duration(200)}
                            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                        />

                        <Animated.View
                            style={[animatedContainerStyle, Platform.OS === 'android' ? { opacity: 0.99 } : undefined]}
                            collapsable={false}
                            renderToHardwareTextureAndroid={true}
                        >
                            <Animated.View style={animatedInnerMapStyle}>
                                {originRect.width > 0 && (
                                    <View style={{ flex: 1, backgroundColor: theme.background }} key={mapKey}>
                                        {renderMapContent()}
                                    </View>
                                )}
                            </Animated.View>

                            <Animated.View style={{ opacity: expandProgress, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
                                <TouchableOpacity
                                    style={[styles.closeButton, { backgroundColor: theme.cardBackground }]}
                                    onPress={handleCloseMap}
                                >
                                    <IconSymbol name="xmark" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </Animated.View>
                        </Animated.View>
                    </Modal>
                </ScrollView>
            </SafeAreaView>
        </ScreenTransition>
    );
}

// ADDED: Complete Style Definitions
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    header: { padding: 20, paddingTop: 10 },
    title: { fontSize: 32, fontWeight: 'bold' },
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
    closeButton: {
        position: 'absolute',
        top: 60,
        right: 20,
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
    }
});