import { ParkingList } from '@/components/ParkingList';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { CATEGORIES } from '@/data/categories';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useParkingData } from '@/hooks/useParkingData';
import i18n from '@/i18n';


import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GuideContent } from './GuideContent';


// Mapbox token removed

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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










export interface TransportRef {
    openMap: () => void;
}

export const TransportContent = React.memo(React.forwardRef<TransportRef>((props, ref) => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const insets = useSafeAreaInsets();


    const { data: parkingData, loading: parkingLoading, error: parkingError, refetch: refetchParking, lastUpdated } = useParkingData();







    const [isGuideVisible, setIsGuideVisible] = useState(false);
    React.useImperativeHandle(ref, () => ({
        openMap: () => {
            router.push({ pathname: '/', params: { category: 'map' } });
        }
    }));





    const openCTSWebsite = () => {
        Linking.openURL('https://www.cts-strasbourg.eu/en/');
    };






    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + insets.bottom }]}
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
                        onViewMap={() => router.push('/?tab=map')}
                        onSelectParking={(parking) => {
                            // Navigate to main map with parking focus?
                            // For now just console log or switch tab
                            router.push('/?tab=map');
                        }}
                        onRetry={refetchParking}
                    />
                </View>

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
