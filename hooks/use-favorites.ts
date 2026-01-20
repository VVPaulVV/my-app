import storage from '@/utils/storage';
import { useEffect, useState } from 'react';

const FAVORITES_KEY = 'user_favorites';

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const stored = await storage.getItem(FAVORITES_KEY);
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load favorites', e);
        }
    };

    const toggleFavorite = async (id: string) => {
        try {
            const newFavorites = favorites.includes(id)
                ? favorites.filter(fav => fav !== id)
                : [...favorites, id];

            setFavorites(newFavorites);
            await storage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
        } catch (e) {
            console.error('Failed to toggle favorite', e);
        }
    };

    const isFavorite = (id: string) => favorites.includes(id);

    return { favorites, toggleFavorite, isFavorite };
}
