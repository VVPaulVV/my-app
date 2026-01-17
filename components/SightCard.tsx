import { Colors } from '@/constants/theme';
import { CATEGORIES } from '@/data/categories';
import { Sight } from '@/data/sights';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/i18n';
import React, { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

type SightCardProps = {
    sight: Sight;
    onPress: () => void;
    style?: any;
};

export const SightCard = React.memo(({ sight, onPress, style }: SightCardProps) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    // Find category color
    const categoryColor = CATEGORIES.find(c => c.nameKey === sight.category)?.color || theme.tint;

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
                    transform: [{ scale }]
                }
            ]}>
                <View style={styles.imageContainer}>
                    <Image source={sight.image} style={styles.image} resizeMode="cover" />
                    <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                        <Text style={styles.categoryText}>{i18n.t(sight.category).toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{sight.name}</Text>
                    {/* Optional: Add rating or location here if desired for playing card look */}
                </View>
            </Animated.View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 16,
        marginHorizontal: 8, // Add gap between columns
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        height: 240, // Fixed height for "playing card" aspect ratio
    },
    imageContainer: {
        height: '70%', // Image takes up most of the card
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    categoryBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        elevation: 2,
    },
    categoryText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#222',
        letterSpacing: 0.5,
    },
    content: {
        padding: 12,
        height: '30%',
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center', // Center title like a card label
        fontFamily: 'System',
    },
});
