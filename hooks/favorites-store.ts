import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export const [FavoritesProvider, useFavorites] = createContextHook(() => {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        const ids = JSON.parse(storedFavorites);
        setFavoriteIds(new Set(ids));
      }
    } catch (error) {
      console.log('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (ids: string[]) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(ids));
    } catch (error) {
      console.log('Error saving favorites:', error);
    }
  };

  const addToFavorites = (productId: string) => {
    setFavoriteIds(currentIds => {
      const newIds = new Set(currentIds);
      newIds.add(productId);
      saveFavorites(Array.from(newIds));
      return newIds;
    });
  };

  const removeFromFavorites = (productId: string) => {
    setFavoriteIds(currentIds => {
      const newIds = new Set(currentIds);
      newIds.delete(productId);
      saveFavorites(Array.from(newIds));
      return newIds;
    });
  };

  const toggleFavorite = (productId: string) => {
    if (favoriteIds.has(productId)) {
      removeFromFavorites(productId);
    } else {
      addToFavorites(productId);
    }
  };

  const isFavorite = (productId: string) => {
    return favoriteIds.has(productId);
  };

  const clearFavorites = () => {
    setFavoriteIds(new Set());
    saveFavorites([]);
  };

  return {
    favoriteIds: Array.from(favoriteIds),
    isLoading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
});
