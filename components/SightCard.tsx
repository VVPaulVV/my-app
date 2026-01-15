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
};

export const SightCard = React.memo(({ sight, onPress }: SightCardProps) => {
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

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{ marginBottom: 16 }}
        >
            <Animated.View style={[
                styles.card,
                {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                    transform: [{ scale }]
                }
            ]}>
                <Image source={sight.image} style={styles.image} />
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={[
                            styles.categoryChip,
                            { backgroundColor: CATEGORIES.find(c => c.nameKey === sight.category)?.color || theme.tint }
                        ]}>
                            <Text style={styles.categoryText}>{i18n.t(sight.category).toUpperCase()}</Text>
                        </View>
                    </View>
                    <Text style={[styles.title, { color: theme.text }]}>{sight.name}</Text>
                    <Text style={[styles.description, { color: theme.icon }]} numberOfLines={2}>
                        {sight.shortDescription}
                    </Text>
                </View>
            </Animated.View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    image: {
        width: '100%',
        height: 200,
        backgroundColor: '#eee',
    },
    content: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryChip: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 8,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        color: '#2D2A26', // Dark text for pastel
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        fontFamily: 'System', // Fallback
    },
    description: {
        fontSize: 15,
        lineHeight: 20,
    },
});
