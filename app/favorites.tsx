import ProductCard from '@/components/ProductCard';
import { Colors } from '@/constants/colors';
import { mockProducts } from '@/data/products';
import { useCart } from '@/hooks/cart-store';
import { useFavorites } from '@/hooks/favorites-store';
import { router } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
  const { favoriteIds, removeFromFavorites, isFavorite } = useFavorites();
  const { addToCart } = useCart();

  // Filter products based on favorite IDs
  const favoriteProducts = mockProducts.filter(product =>
    favoriteIds.includes(product.id)
  );

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      addToCart(product);
    }
  };

  const handleToggleFavorite = (productId: string) => {
    removeFromFavorites(productId);
  };

  const renderProduct = ({ item }: { item: typeof favoriteProducts[0] }) => (
    <View style={styles.productItem}>
      <ProductCard
        product={item}
        onPress={() => handleProductPress(item.id)}
        onAddToCart={() => handleAddToCart(item.id)}
      />
      <TouchableOpacity
        style={[
          styles.favoriteButton,
          isFavorite(item.id) && styles.favoriteButtonActive
        ]}
        onPress={() => handleToggleFavorite(item.id)}
      >
        <Heart
          size={20}
          color={isFavorite(item.id) ? Colors.error : Colors.textLight}
          fill={isFavorite(item.id) ? Colors.error : 'transparent'}
        />
      </TouchableOpacity>
    </View>
  );

  if (favoriteProducts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Favorites</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Heart size={64} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Start exploring products and add them to your favorites!
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.exploreButtonText}>Explore Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Favorites ({favoriteProducts.length})</Text>
      </View>

      <FlatList
        data={favoriteProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.productRow}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  productList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productItem: {
    flex: 1,
    marginHorizontal: 4,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteButtonActive: {
    backgroundColor: Colors.error,
  },
});
