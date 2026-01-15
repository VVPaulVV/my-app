import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { TRANSPORT_LINES } from '@/data/transport_data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/i18n';
import { offsetPolyline, toGeoJSONLineString } from '@/utils/geo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Mapbox from '@rnmapbox/maps';
import React, { useMemo, useState } from 'react';
import { Dimensions, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GuideContent } from './GuideContent';

// --- Constants ---
const MAPBOX_TOKEN = 'pk.eyJ1Ijoic3BlY3RydWgiLCJhIjoiY21rNG5sNmh3MDF6NjNkczl5cGM3Ynl2aSJ9.U3vf9ao95WB7Xxx4n2Ihug';
Mapbox.setAccessToken(MAPBOX_TOKEN);

const CITY_CENTER = [7.74553, 48.58392]; // [Lon, Lat] for Mapbox
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const INITIAL_ZOOM = 11.5;

export interface TransportRef {
    openMap: () => void;
}

export const TransportContent = React.memo(React.forwardRef<TransportRef>((_, ref) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    // Animation State
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
    const [isGuideVisible, setIsGuideVisible] = useState(false);
    const modalOpacity = useSharedValue(0);
    const isClosing = useSharedValue(false);

    const handleOpenMap = () => {
        setIsMapFullscreen(true);
        isClosing.value = false;
        modalOpacity.value = 0;
        setTimeout(() => {
            modalOpacity.value = withTiming(1, { duration: 300 });
        }, 50);
    };

    React.useImperativeHandle(ref, () => ({
        openMap: handleOpenMap
    }));

    const animatedModalStyle = useAnimatedStyle(() => ({
        opacity: modalOpacity.value
    }));

    // Accelerate UI fade out ONLY when closing + Manual Slide Up/Down
    const uiStyle = useAnimatedStyle(() => {
        // Slide Up on Open, Slide Down on Close
        // 0 opacity -> 50px down
        // 1 opacity -> 0px down
        const translateY = (1 - modalOpacity.value) * 50;

        if (!isClosing.value) {
            return {
                opacity: 1,
                transform: [{ translateY }],
                zIndex: 100
            };
        }
        // interpolated: [0.4, 1] -> [0, 1]
        const val = (modalOpacity.value - 0.4) / 0.6;
        return {
            opacity: val < 0 ? 0 : (val > 1 ? 1 : val),
            transform: [{ translateY }],
            zIndex: 100
        };
    });

    // Separate animation for close button: slide from Right
    const closeButtonAnimationStyle = useAnimatedStyle(() => {
        // Slide from Right on Open, Slide to Right on Close
        // 0 opacity -> 80px right
        // 1 opacity -> 0px right
        const translateX = (1 - modalOpacity.value) * 80;

        if (!isClosing.value) {
            return {
                opacity: 1,
                transform: [{ translateX }],
                zIndex: 101
            };
        }
        // interpolated: [0.4, 1] -> [0, 1]
        const val = (modalOpacity.value - 0.4) / 0.6;
        return {
            opacity: val < 0 ? 0 : (val > 1 ? 1 : val),
            transform: [{ translateX }],
            zIndex: 101
        };
    });

    const openCTSWebsite = () => {
        Linking.openURL('https://www.cts-strasbourg.eu/en/');
    };

    // Prepare GeoJSON Data
    const transportSource = useMemo(() => {
        const features = TRANSPORT_LINES.map(line => ({
            type: 'Feature' as const,
            properties: {
                id: line.id,
                color: line.color,
            },
            geometry: toGeoJSONLineString(offsetPolyline(line.path, 0)),
        }));

        return {
            type: 'FeatureCollection' as const,
            features: features,
        };
    }, []);

    const toggleLineSelection = (id: string) => {
        setSelectedLineId(prev => (prev === id ? null : id));
    };

    const selectedLine = TRANSPORT_LINES.find(l => l.id === selectedLineId);

    const handleCloseMap = () => {
        isClosing.value = true;
        modalOpacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(setIsMapFullscreen)(false);
            runOnJS(setSelectedLineId)(null);
        });
    };

    const renderMapContent = (fullscreen: boolean) => (
        <Mapbox.MapView
            style={{ flex: 1 }}
            styleURL={Mapbox.StyleURL.Street}
            surfaceView={false} // Use TextureView to ensure correct opacity/fade animation during Modal transitions
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
                        // Logic: If selectedLineId is defined AND prop.id != selectedLineId -> 0.0 else 0.9
                        lineOpacity: selectedLineId
                            ? ['match', ['get', 'id'], selectedLineId, 1, 0.0]
                            : 0.9
                    }}
                />
            </Mapbox.ShapeSource>
        </Mapbox.MapView>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                overScrollMode="never" // Prevent Android stretch effect causing transparency issues with Map
            >
                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>{i18n.t('transport')}</Text>
                </View>

                {/* Intro Card */}
                <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Getting Around</Text>
                    <Text style={[styles.text, { color: theme.text }]}>
                        Strasbourg has an excellent public transport network (CTS) consisting of 6 tram lines, 2 express bus lines (G/H) and numerous other bus lines.
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.text, marginTop: 12 }]}>Tickets</Text>
                    <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>Single Ticket</Text><Text style={styles.ticketPrice}>1.90 €</Text></View>
                    <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>24h Individual</Text><Text style={styles.ticketPrice}>4.60 €</Text></View>
                    <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>24h Trio (2-3 people)</Text><Text style={styles.ticketPrice}>10.20 €</Text></View>
                    <View style={styles.ticketRow}><Text style={[styles.ticketLabel, { color: theme.text }]}>72h Individual</Text><Text style={styles.ticketPrice}>10.20 €</Text></View>
                    <View style={styles.ticketInfo}>
                        <IconSymbol name="info.circle" size={14} color={theme.icon} style={{ marginRight: 6, marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.textSmall, { color: theme.textSecondary }]}>Tickets must be validated before boarding.</Text>
                            <Text style={[styles.textSmall, { color: theme.textSecondary, fontStyle: 'italic', marginTop: 4 }]}>+0.20 € for the first purchase of the ticket</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={[styles.websiteButton, { backgroundColor: theme.primary }]} onPress={openCTSWebsite}>
                        <Text style={styles.websiteButtonText}>Visit CTS Website</Text>
                        <IconSymbol name="arrow.up.right" size={16} color="#FFF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.websiteButton, { backgroundColor: theme.cardBackground, borderColor: theme.primary, borderWidth: 1, marginTop: 12 }]}
                        onPress={() => setIsGuideVisible(true)}
                    >
                        <Text style={[styles.websiteButtonText, { color: theme.primary }]}>How to buy and validate?</Text>
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
                        <Pressable
                            style={StyleSheet.absoluteFill}
                            onPress={() => setIsGuideVisible(false)}
                        />
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
                        <Text style={styles.mapOverlayText}>Tap to Expand</Text>
                    </View>
                </TouchableOpacity>

                {/* Fullscreen Map Modal */}
                <Modal
                    visible={isMapFullscreen}
                    onRequestClose={handleCloseMap}
                    animationType="none"
                    transparent={true}
                >
                    <Animated.View style={[{ flex: 1, backgroundColor: theme.background }, animatedModalStyle]}>
                        <SafeAreaView style={{ flex: 1 }}>
                            <View style={{ flex: 1 }}>
                                {renderMapContent(true)}
                            </View>

                            {/* Filter Bar */}
                            <Animated.View
                                style={[styles.filterContainer, uiStyle]}
                            >
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.filterContent}
                                >
                                    {TRANSPORT_LINES.map(line => {
                                        const isSelected = selectedLineId === line.id;
                                        const isFaded = selectedLineId !== null && !isSelected;
                                        return (
                                            <TouchableOpacity
                                                key={line.id}
                                                onPress={() => toggleLineSelection(line.id)}
                                                style={[
                                                    styles.filterChip,
                                                    {
                                                        backgroundColor: line.color,
                                                        opacity: isFaded ? 0.4 : 1,
                                                        transform: [{ scale: isSelected ? 1.1 : 1 }]
                                                    }
                                                ]}
                                            >
                                                <Text style={[
                                                    styles.filterText,
                                                    { color: '#FFF' }
                                                ]}>
                                                    {line.id.replace('TRAM_', '').replace('BUS_', '')}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </Animated.View>

                            {/* Selection Details Card */}
                            {selectedLine && (
                                <Animated.View
                                    entering={FadeInDown.duration(200)}
                                    style={[styles.detailCard, { backgroundColor: theme.cardBackground }, uiStyle]}
                                >
                                    <View style={[styles.detailIcon, { backgroundColor: selectedLine.color }]}>
                                        <MaterialIcons
                                            name={selectedLine.type === 'tram' ? 'tram' : 'directions-bus'}
                                            size={20}
                                            color="#FFF"
                                        />
                                    </View>
                                    <View style={styles.detailTextContainer}>
                                        <Text style={[styles.detailTitle, { color: theme.text }]}>{selectedLine.name}</Text>
                                        <Text style={[styles.detailSubtitle, { color: theme.textSecondary }]}>{selectedLine.trajectory}</Text>
                                    </View>
                                </Animated.View>
                            )}

                            <Animated.View style={[styles.closeButtonContainer, closeButtonAnimationStyle]}>
                                <TouchableOpacity
                                    style={[styles.closeButton, { backgroundColor: theme.cardBackground }]}
                                    onPress={handleCloseMap}
                                >
                                    <MaterialIcons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </Animated.View>
                        </SafeAreaView>
                    </Animated.View>
                </Modal>
            </ScrollView>
        </SafeAreaView >
    );
}));

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
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
    }
});
