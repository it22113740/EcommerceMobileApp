import ProductCard from '@/components/ProductCard';
import { Colors } from '@/constants/colors';
import { mockProducts } from '@/data/products';
import { useAuth } from '@/hooks/auth-store';
import { useCart } from '@/hooks/cart-store';
import { useOrder } from '@/hooks/order-store';
import { Product } from '@/types/product';
import { router } from 'expo-router';
import { Filter, Leaf, MapPin, Search, Star, TrendingUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = ['All', 'Vegetables', 'Fruits', 'Dairy & Eggs', 'Pantry', 'Bakery'];

// Dummy image URLs for featured products
const featuredProductImages = [
  'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
];

// Special deals products (first 3 with discounted prices)
const dealProducts = mockProducts.slice(0, 3).map(product => ({
  ...product,
  originalPrice: product.price,
  price: product.price * 0.8, // 20% discount
  discount: '20% OFF',
}));

// Vendors data
const vendors = [
  {
    id: '1',
    name: 'Green Valley Foods',
    distance: '15 miles',
    rating: 4.8,
    products: 12,
    image: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=200&h=150&fit=crop',
  },
  {
    id: '2',
    name: 'Sunny Meadow Market',
    distance: '8 miles',
    rating: 4.9,
    products: 8,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200&h=150&fit=crop',
  },
  {
    id: '3',
    name: 'Bee Happy Organics',
    distance: '12 miles',
    rating: 4.7,
    products: 5,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop',
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { orders } = useOrder();

  // Get featured products (first 5 products for demo)
  const featuredProducts = mockProducts.slice(0, 5);

  // Get suggestion products (random selection for demo)
  const suggestionProducts = mockProducts.slice(5, 10);

  // Get recent orders (last 3)
  const recentOrders = orders.slice(0, 3);

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => router.push(`/product/${item.id}`)}
      onAddToCart={() => handleAddToCart(item)}
    />
  );

  const renderFeaturedProduct = ({ item }: { item: Product }) => (
    <View style={styles.featuredProductCard}>
      <TouchableOpacity
        style={styles.featuredProductImageContainer}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <View style={styles.featuredBadge}>
          <Star size={12} color={Colors.white} fill={Colors.white} />
          <Text style={styles.featuredBadgeText}>Featured</Text>
        </View>
        <Image
          source={{ uri: featuredProductImages[Math.floor(Math.random() * featuredProductImages.length)] }}
          style={styles.featuredProductImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View style={styles.featuredProductInfo}>
        <Text style={styles.featuredProductName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.featuredProductPrice}>
          ${item.price.toFixed(2)}
        </Text>
        <TouchableOpacity
          style={styles.featuredAddToCartButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.featuredAddToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSuggestionProduct = ({ item }: { item: Product }) => (
    <View style={styles.suggestionProductCard}>
      <TouchableOpacity
        style={styles.suggestionProductImageContainer}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <View style={styles.suggestionBadge}>
          <Text style={styles.suggestionBadgeText}>Suggested</Text>
        </View>
        <Image
          source={{ uri: featuredProductImages[Math.floor(Math.random() * featuredProductImages.length)] }}
          style={styles.suggestionProductImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View style={styles.suggestionProductInfo}>
        <Text style={styles.suggestionProductName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.suggestionProductPrice}>
          ${item.price.toFixed(2)}
        </Text>
        <TouchableOpacity
          style={styles.suggestionAddToCartButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.suggestionAddToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDealProduct = ({ item }: { item: any }) => (
    <View style={styles.dealProductCard}>
      <TouchableOpacity
        style={styles.dealProductImageContainer}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <View style={styles.dealBadge}>
          <Text style={styles.dealBadgeText}>{item.discount}</Text>
        </View>
        <Image
          source={{ uri: item.image }}
          style={styles.dealProductImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <View style={styles.dealProductInfo}>
        <Text style={styles.dealProductName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.dealPriceContainer}>
          <Text style={styles.dealOriginalPrice}>${item.originalPrice.toFixed(2)}</Text>
          <Text style={styles.dealProductPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.dealAddToCartButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.dealAddToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVendor = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.vendorCard}
      onPress={() => {/* Navigate to vendor products */}}
    >
      <Image source={{ uri: item.image }} style={styles.vendorImage} resizeMode="cover" />
      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.name}</Text>
        <View style={styles.vendorDetails}>
          <View style={styles.vendorDetail}>
            <MapPin size={14} color={Colors.textLight} />
            <Text style={styles.vendorDetailText}>{item.distance}</Text>
          </View>
          <View style={styles.vendorDetail}>
            <Star size={14} color={Colors.primary} fill={Colors.primary} />
            <Text style={styles.vendorRating}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.vendorProducts}>{item.products} products available</Text>
      </View>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.greeting}>
            <View style={styles.logoContainer}>
              <Leaf size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : 'User'}</Text>
            </View>
          </View>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Fresh from Local Vendors</Text>
            <Text style={styles.heroSubtitle}>
              Support sustainable agriculture and enjoy the freshest, most nutritious produce delivered to your door.
            </Text>
            <TouchableOpacity style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Shop Now</Text>
              <TrendingUp size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=300&h=200&fit=crop' }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for eco-friendly products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Featured Products Section */}
        <View style={styles.featuredSection}>
          <View style={styles.featuredHeader}>
            <Text style={styles.featuredTitle}>Featured Products</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredProducts}
            renderItem={renderFeaturedProduct}
            keyExtractor={(item) => `featured-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredProductsContainer}
            style={styles.featuredList}
          />
        </View>

        {/* Suggestion Products Section */}
        <View style={styles.suggestionSection}>
          <View style={styles.suggestionHeader}>
            <Text style={styles.suggestionTitle}>Suggested for You</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={suggestionProducts}
            renderItem={renderSuggestionProduct}
            keyExtractor={(item) => `suggestion-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionProductsContainer}
            style={styles.suggestionList}
          />
        </View>

        {/* Special Deals Section */}
        <View style={styles.dealsSection}>
          <View style={styles.dealsHeader}>
            <Text style={styles.dealsTitle}>Special Deals</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={dealProducts}
            renderItem={renderDealProduct}
            keyExtractor={(item) => `deal-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dealsContainer}
            style={styles.dealsList}
          />
        </View>

        {/* Vendors Section */}
        <View style={styles.vendorsSection}>
          <View style={styles.vendorsHeader}>
            <Text style={styles.vendorsTitle}>Vendors</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={vendors}
            renderItem={renderVendor}
            keyExtractor={(item) => `vendor-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vendorsContainer}
            style={styles.vendorsList}
          />
        </View>

        {/* Main Products Grid */}
        <View style={styles.mainProductsSection}>
          <Text style={styles.mainProductsTitle}>All Products</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.productsContainer}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            scrollEnabled={false} // Disable scrolling since parent ScrollView handles it
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    backgroundColor: Colors.accent,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.secondary,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.secondary,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  productsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 0,
  },
  // Featured Products Section Styles
  featuredSection: {
    marginBottom: 24,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  featuredList: {
    height: 200,
  },
  featuredProductsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredProductCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  featuredProductImageContainer: {
    position: 'relative',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
    gap: 4,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  featuredProductImage: {
    width: 160,
    height: 100,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  featuredProductInfo: {
    padding: 12,
  },
  featuredProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  featuredProductPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  featuredAddToCartButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  featuredAddToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  // Suggestion Products Section Styles
  suggestionSection: {
    marginBottom: 24,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  suggestionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  suggestionList: {
    height: 200,
  },
  suggestionProductsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  suggestionProductCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  suggestionProductImageContainer: {
    position: 'relative',
  },
  suggestionBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  suggestionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  suggestionProductImage: {
    width: 160,
    height: 100,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  suggestionProductInfo: {
    padding: 12,
  },
  suggestionProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  suggestionProductPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  suggestionAddToCartButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  suggestionAddToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  // Main Products Section Styles
  mainProductsSection: {
    paddingBottom: 20,
  },
  mainProductsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  // Hero Banner Styles
  heroBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.white + 'E0',
    lineHeight: 20,
    marginBottom: 16,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  heroImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 120,
    height: 80,
    borderRadius: 12,
  },

  // Deals Section Styles
  dealsSection: {
    marginBottom: 24,
  },
  dealsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  dealsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  dealsList: {
    height: 200,
  },
  dealsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  dealProductCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  dealProductImageContainer: {
    position: 'relative',
  },
  dealBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  dealBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  dealProductImage: {
    width: 160,
    height: 100,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  dealProductInfo: {
    padding: 12,
  },
  dealProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    lineHeight: 18,
  },
  dealPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dealOriginalPrice: {
    fontSize: 12,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  dealProductPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
  },
  dealAddToCartButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dealAddToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  // Vendors Section Styles
  vendorsSection: {
    marginBottom: 24,
  },
  vendorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  vendorsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  vendorsList: {
    height: 120,
  },
  vendorsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  vendorCard: {
    width: 280,
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  vendorImage: {
    width: 100,
    height: '100%',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  vendorInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  vendorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  vendorDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  vendorDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vendorDetailText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  vendorRating: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  vendorProducts: {
    fontSize: 12,
    color: Colors.textLight,
  },
});