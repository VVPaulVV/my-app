import { getCategoryColor } from '@/constants/categoryColors';
import { Colors } from '@/constants/theme';
import { Sight } from '@/data/sights';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFavorites } from '@/hooks/use-favorites';
import i18n, { tData } from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from './themed-text';

type SightCardProps = {
    sight: Sight;
    onPress: () => void;
    style?: any;
};

// Helper for applying hex opacity
const hexToRgba = (hex: string, alpha: number) => {
    if (!hex.startsWith('#')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const SightCard = React.memo(({ sight, onPress, style }: SightCardProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const { isFavorite, toggleFavorite } = useFavorites();
    const isFav = isFavorite(sight.id);

    const handleToggleFavorite = (e: any) => {
        e.stopPropagation();
        toggleFavorite(sight.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const accentColor = getCategoryColor(sight.category);

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.container, style]}
        >
            <Animated.View style={[
                styles.card,
                {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                    transform: [{ scale }],
                }
            ]}>
                {/* Left Category Bar */}
                <View style={[styles.leftBar, { backgroundColor: accentColor }]} />

                <View style={styles.innerContainer}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={sight.image}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: hexToRgba(accentColor, 0.15) }]} />
                        <Pressable
                            onPress={handleToggleFavorite}
                            style={styles.favoriteBadge}
                        >
                            <Ionicons name={isFav ? "heart" : "heart-outline"} size={20} color={isFav ? theme.primary : theme.background} />
                        </Pressable>
                    </View>

                    <View style={styles.content}>
                        <View style={[styles.categoryBadge, { backgroundColor: hexToRgba(accentColor, 0.12) }]}>
                            <ThemedText style={[styles.categoryBadgeText, { color: accentColor }]}>
                                {i18n.t(sight.category)}
                            </ThemedText>
                        </View>
                        <ThemedText style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                            {tData(sight, 'name')}
                        </ThemedText>
                        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                            {tData(sight, 'shortDescription')}
                        </ThemedText>
                    </View>
                </View>
            </Animated.View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 16,
        marginHorizontal: 8,
    },
    card: {
        flex: 1,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        height: 240,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    leftBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        zIndex: 1,
    },
    innerContainer: {
        flex: 1,
        padding: 12,
    },
    imageContainer: {
        height: '65%',
        width: '100%',
        borderRadius: 6,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favoriteBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 6,
        borderRadius: 20,
    },
    content: {
        flex: 1,
        paddingTop: 12,
        justifyContent: 'center',
    },
    categoryBadge: {
        alignSelf: 'flex-start',
        paddingVertical: 2,
        paddingHorizontal: 7,
        borderRadius: 4,
        marginBottom: 6,
    },
    categoryBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.12,
        textTransform: 'uppercase',
    },
    title: {
        fontSize: 15,
        fontWeight: '400',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '200',
        letterSpacing: 0.03,
    },
});
