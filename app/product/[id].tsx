import ProductCard from '@/components/ProductCard';
import { Colors } from '@/constants/colors';
import { mockProducts, mockReviews } from '@/data/products';
import { useCart } from '@/hooks/cart-store';
import { useFavorites } from '@/hooks/favorites-store';
import { Product, Review } from '@/types/product';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Heart,
  Leaf,
  MapPin,
  Minus,
  Plus,
  Share2,
  ShoppingCart,
  Star,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const product = mockProducts.find((p) => p.id === id);
  const reviews = mockReviews[id || ''] || [];
  const relatedProducts = mockProducts
    .filter((p) => p.category === product?.category && p.id !== id)
    .slice(0, 4);

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <Text>Product not found</Text>
      </SafeAreaView>
    );
  }

  const images = product.images || [product.image];

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    router.push('/(tabs)/cart');
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            color={star <= rating ? Colors.warning : Colors.border}
            fill={star <= rating ? Colors.warning : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewUser}>
          <View style={styles.reviewAvatar}>
            <Text style={styles.reviewAvatarText}>
              {item.userName.charAt(0)}
            </Text>
          </View>
          <View>
            <View style={styles.reviewNameContainer}>
              <Text style={styles.reviewUserName}>{item.userName}</Text>
              {item.verified && (
                <CheckCircle size={14} color={Colors.success} />
              )}
            </View>
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
        </View>
        {renderStars(item.rating, 14)}
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
    </View>
  );

  const renderRelatedProduct = ({ item }: { item: Product }) => (
    <View style={styles.relatedProductItem}>
      <ProductCard
        product={item}
        onPress={() => router.push(`/product/${item.id}`)}
        onAddToCart={() => addToCart(item)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => toggleFavorite(id || '')}
          >
            <Heart
              size={24}
              color={isFavorite(id || '') ? Colors.error : Colors.text}
              fill={isFavorite(id || '') ? Colors.error : 'transparent'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Share2 size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width
              );
              setSelectedImageIndex(index);
            }}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
          <View style={styles.imageIndicators}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  selectedImageIndex === index && styles.activeIndicator,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.productInfo}>
          <View style={styles.badges}>
            {product.isLocal && (
              <View style={[styles.badge, styles.localBadge]}>
                <MapPin size={12} color={Colors.primary} />
                <Text style={styles.localBadgeText}>Local</Text>
              </View>
            )}
            {product.isOrganic && (
              <View style={[styles.badge, styles.organicBadge]}>
                <Leaf size={12} color={Colors.success} />
                <Text style={styles.organicBadgeText}>Organic</Text>
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.farmName}>from {product.farmName}</Text>
          
          <View style={styles.ratingContainer}>
            {renderStars(product.rating, 18)}
            <Text style={styles.ratingText}>
              {product.rating} ({product.reviews} reviews)
            </Text>
          </View>

          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'details' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('details')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'details' && styles.activeTabText,
              ]}
            >
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'reviews' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'reviews' && styles.activeTabText,
              ]}
            >
              Reviews ({reviews.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'details' ? (
          <View style={styles.detailsContent}>
            {product.origin && (
              <View style={styles.detailItem}>
                <MapPin size={20} color={Colors.primary} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Origin</Text>
                  <Text style={styles.detailValue}>{product.origin}</Text>
                </View>
              </View>
            )}
            
            {product.nutritionInfo && (
              <View style={styles.detailItem}>
                <Award size={20} color={Colors.success} />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>Nutrition</Text>
                  <Text style={styles.detailValue}>{product.nutritionInfo}</Text>
                </View>
              </View>
            )}

            {product.certifications && product.certifications.length > 0 && (
              <View style={styles.certificationsContainer}>
                <Text style={styles.certificationsTitle}>Certifications</Text>
                <View style={styles.certificationsList}>
                  {product.certifications.map((cert, index) => (
                    <View key={index} style={styles.certificationBadge}>
                      <CheckCircle size={14} color={Colors.success} />
                      <Text style={styles.certificationText}>{cert}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.reviewsContent}>
            {reviews.length > 0 ? (
              <FlatList
                data={reviews}
                renderItem={renderReview}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.reviewSeparator} />}
              />
            ) : (
              <Text style={styles.noReviews}>No reviews yet</Text>
            )}
          </View>
        )}

        {relatedProducts.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related Products</Text>
            <FlatList
              data={relatedProducts}
              renderItem={renderRelatedProduct}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.relatedList}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Plus size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <ShoppingCart size={20} color={Colors.white} />
          <Text style={styles.addToCartText}>
            Add to Cart - ${(product.price * quantity).toFixed(2)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: width,
    height: 300,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeIndicator: {
    backgroundColor: Colors.white,
  },
  productInfo: {
    padding: 20,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  localBadge: {
    backgroundColor: Colors.accent,
  },
  localBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  organicBadge: {
    backgroundColor: '#E8F5E8',
  },
  organicBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  farmName: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.primary,
  },
  detailsContent: {
    padding: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  certificationsContainer: {
    marginTop: 8,
  },
  certificationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  certificationsList: {
    gap: 8,
  },
  certificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  certificationText: {
    fontSize: 14,
    color: Colors.text,
  },
  reviewsContent: {
    padding: 20,
  },
  reviewItem: {
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  reviewNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  reviewSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  noReviews: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 40,
  },
  relatedSection: {
    marginTop: 24,
    paddingBottom: 20,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  relatedList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  relatedProductItem: {
    width: 160,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 16,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 16,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});