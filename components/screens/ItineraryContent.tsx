import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { getCategoryColor } from '@/constants/categoryColors';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFavorites } from '@/hooks/use-favorites';
import i18n, { tData } from '@/i18n';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MUSEUMS } from '@/data/museums';
import { RESTAURANTS } from '@/data/restaurants';
import { SIGHTS } from '@/data/sights';

import { IconSymbol } from '../ui/icon-symbol';

const ROW_HEIGHT = 104;
const LIST_MARGIN = 5;

const ALL_ITEMS_MAP = new Map<string, any>();
[...SIGHTS, ...MUSEUMS, ...RESTAURANTS].forEach(item => {
    ALL_ITEMS_MAP.set(item.id, item);
});

function DraggableRow({
    id,
    index,
    positions,
    sharedData,
    theme,
    onPress,
    onDelete,
    onDragEnd,
}: any) {
    const item = ALL_ITEMS_MAP.get(id);
    if (!item) return null;

    const top = useSharedValue(index * ROW_HEIGHT);

    const catColor = useMemo(() => {
        return getCategoryColor(item.type || item.category);
    }, [item.type, item.category]);

    const startY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    useAnimatedReaction(
        () => positions.value[id],
        (currentPosition, previousPosition) => {
            if (currentPosition !== previousPosition && !isDragging.value) {
                top.value = withSpring(currentPosition * ROW_HEIGHT, {
                    mass: 0.8,
                    damping: 15,
                    stiffness: 150,
                    overshootClamping: false,
                });
            }
        },
        [positions, id]
    );

    const style = useAnimatedStyle(() => ({
        position: 'absolute',
        top: top.value,
        left: 0,
        right: 0,
        zIndex: isDragging.value ? 999 : 1,
        elevation: isDragging.value ? 10 : 2,
    }));

    const pan = Gesture.Pan()
        .onStart(() => {
            isDragging.value = true;
            startY.value = top.value;
        })
        .onUpdate((e) => {
            top.value = startY.value + e.translationY;

            const newIndex = Math.round(top.value / ROW_HEIGHT);
            const clamped = Math.max(0, Math.min(sharedData.value.length - 1, newIndex));
            const oldIndex = positions.value[id];

            if (clamped !== oldIndex) {

                const currentOrder = [...sharedData.value];
                const item = currentOrder.splice(oldIndex, 1)[0];
                currentOrder.splice(clamped, 0, item);

                sharedData.value = currentOrder;

                const newPos: Record<string, number> = {};
                for (let i = 0; i < currentOrder.length; i++) {
                    newPos[currentOrder[i]] = i;
                }
                positions.value = newPos;
            }
        })
        .onEnd(() => {
            isDragging.value = false;
            top.value = withSpring(positions.value[id] * ROW_HEIGHT, {
                mass: 0.8,
                damping: 15,
                stiffness: 150,
                overshootClamping: false,
            });
            runOnJS(onDragEnd)(sharedData.value);
        });

    return (
        <GestureDetector gesture={pan}>
            <Animated.View style={[style]}>
                <View style={styles.timelineItem}>
                    <View style={styles.timelineConnector}>
                        <View style={[styles.timelineNode, { backgroundColor: 'rgba(201,82,74,0.12)' }]}>
                            <Text style={[styles.timelineNumber, { color: theme.tint }]}>
                                {positions.value[id] !== undefined ? positions.value[id] + 1 : ''}
                            </Text>
                        </View>
                        {positions.value[id] !== sharedData.value.length - 1 && (
                            <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
                        )}
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.95}
                        style={[
                            styles.card,
                            {
                                backgroundColor: theme.cardBackground,
                                borderColor: theme.border,
                            },
                        ]}
                        onPress={() => onPress(id)}
                    >
                        <View style={[styles.categoryBar, { backgroundColor: catColor }]} />

                        <Image source={item.image} style={styles.image} />

                        <View style={styles.content}>
                            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                                {tData(item, 'name')}
                            </Text>

                            <View style={styles.locationContainer}>
                                <IconSymbol
                                    name="mappin.and.ellipse"
                                    size={12}
                                    color={theme.textSecondary}
                                />
                                <Text
                                    style={[styles.subtitle, { color: theme.textSecondary }]}
                                    numberOfLines={1}
                                >
                                    {tData(item, 'location')} • {item.category?.toUpperCase()}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => onDelete(id)}
                        >
                            <IconSymbol name="trash.fill" size={20} color="#FF6B6B" />
                        </TouchableOpacity>

                        <View style={styles.dragHandle}>
                            <IconSymbol
                                name="line.3.horizontal"
                                size={24}
                                color={theme.textSecondary}
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </GestureDetector>
    );
}

export function ItineraryContent() {
    const router = useRouter();
    const theme = Colors[useColorScheme() ?? 'light'];
    const { favorites, reorderFavorites, toggleFavorite } = useFavorites();
    const insets = useSafeAreaInsets();

    const [data, setData] = useState<string[]>(favorites);


    useEffect(() => {
        setData(favorites);
    }, [favorites]);

    const positions = useSharedValue(
        Object.fromEntries(favorites.map((id, i) => [id, i]))
    );

    const sharedData = useSharedValue(data);

    useEffect(() => {
        sharedData.value = data;
    }, [data]);

    useEffect(() => {
        positions.value = Object.fromEntries(
            data.map((id, index) => [id, index])
        );
    }, [data]);

    const handlePress = (id: string) => {
        router.push(`/sight/${id}` as any);
    };

    const handleDelete = (id: string) => {
        setData(prev => {
            const newData = prev.filter(x => x !== id);
            reorderFavorites(newData);
            return newData;
        });
    };

    const handleDragEnd = (newData: string[]) => {
        setData(newData);
        reorderFavorites(newData);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {i18n.t('itinerary')}
                </Text>
                {data.length > 0 && (
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/', params: { category: 'map' } })}
                        style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: theme.cardBackground, borderRadius: 20, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                        <IconSymbol name="map.fill" size={14} color={theme.text} />
                        <Text style={{ color: theme.text, fontSize: 12, fontWeight: '600' }}>{i18n.t('viewRoute')}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {data.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 48 }}>
                    <IconSymbol name="list.bullet.clipboard" size={48} color={theme.textSecondary} style={{ marginBottom: 16, opacity: 0.3 }} />
                    <Text style={{ color: theme.textSecondary, fontSize: 16, fontWeight: '300', marginBottom: 8, textAlign: 'center' }}>{i18n.t('emptyItineraryTitle')}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '200', textAlign: 'center', maxWidth: 250 }}>
                        {i18n.t('emptyItineraryDesc')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/', params: { tab: 'explore' } })}
                        style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: theme.tint, borderRadius: 6 }}
                    >
                        <Text style={{ color: '#F0EBE3', fontSize: 13, fontWeight: '700', letterSpacing: 0.08, textTransform: 'uppercase' }}>{i18n.t('browseSights')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Animated.ScrollView
                    contentContainerStyle={{
                        height: data.length * ROW_HEIGHT + LIST_MARGIN,
                        paddingBottom: 100 + insets.bottom
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={{ marginTop: LIST_MARGIN, height: data.length * ROW_HEIGHT }}>
                        {data.map((id, index) => (
                            <DraggableRow
                                key={id}
                                id={id}
                                index={index}
                                data={data}
                                sharedData={sharedData}
                                positions={positions}
                                theme={theme}
                                onPress={handlePress}
                                onDelete={handleDelete}
                                onDragEnd={handleDragEnd}
                            />
                        ))}
                    </View>
                </Animated.ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 42 },
    header: { paddingHorizontal: 20, marginBottom: 24 },
    headerTitle: {
        fontSize: 34,
        fontWeight: '300',
        letterSpacing: 0.01,
        marginBottom: 14
    },

    timelineItem: {
        flexDirection: 'row',
        marginBottom: 7,
        paddingHorizontal: 20,
    },

    timelineConnector: {
        width: 30,
        alignItems: 'center',
        marginRight: 10,
    },

    timelineNode: {
        width: 24,
        height: 24,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },

    timelineLine: {
        position: 'absolute',
        top: 24,
        bottom: -7, // spans row margin
        width: 1,
    },

    timelineNumber: {
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },

    card: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 11,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
        position: 'relative'
    },

    categoryBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
    },

    image: { width: 56, height: 56, borderRadius: 6, marginLeft: 8 },
    content: { flex: 1, marginLeft: 14 },

    title: { fontSize: 14, fontWeight: '400' },
    subtitle: { fontSize: 11, fontWeight: '200', letterSpacing: 0.03, flex: 1 },

    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    categoryBadge: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginBottom: 4,
        alignSelf: 'flex-start',
    },

    categoryText: { fontSize: 10, fontWeight: '700' },

    deleteButton: { padding: 10 },
    dragHandle: { padding: 8 },
});
