import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle,
    Clock,
    Package,
    XCircle
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
  variants?: any[];
}

export default function AddedProductsScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - In real app, this would come from API
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Organic Tomatoes',
      description: 'Fresh organic tomatoes grown without pesticides',
      category: 'Fruits & Vegetables',
      basePrice: 4.99,
      status: 'approved',
      createdAt: '2024-01-15T10:30:00.000Z'
    },
    {
      id: '2',
      name: 'Free-Range Eggs',
      description: 'Farm fresh eggs from free-range chickens',
      category: 'Dairy & Eggs',
      basePrice: 6.99,
      status: 'pending',
      createdAt: '2024-01-16T14:20:00.000Z'
    },
    {
      id: '3',
      name: 'Organic Honey',
      description: 'Pure organic honey from local beekeepers',
      category: 'Beverages',
      basePrice: 12.99,
      status: 'rejected',
      createdAt: '2024-01-14T09:15:00.000Z',
      rejectionReason: 'Product description needs more detail about organic certification'
    },
    {
      id: '4',
      name: 'Grass-Fed Beef',
      description: 'Premium grass-fed beef cuts',
      category: 'Meat & Poultry',
      basePrice: 24.99,
      status: 'approved',
      createdAt: '2024-01-13T16:45:00.000Z'
    },
    {
      id: '5',
      name: 'Organic Quinoa',
      description: 'Nutritious organic quinoa grains',
      category: 'Grains & Cereals',
      basePrice: 8.99,
      status: 'pending',
      createdAt: '2024-01-17T11:30:00.000Z'
    }
  ]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusIcon = (status: Product['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'pending':
        return <Clock size={20} color={Colors.warning} />;
      case 'rejected':
        return <XCircle size={20} color={Colors.error} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'approved':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'rejected':
        return Colors.error;
      default:
        return Colors.textLight;
    }
  };

  const getStatusText = (status: Product['status']) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => {
        // Navigate to product details or edit product
        console.log('Product pressed:', item.id);
      }}
    >
      <View style={styles.productHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
        </View>
        <View style={styles.statusContainer}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.productDescription} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>${item.basePrice.toFixed(2)}</Text>
        <Text style={styles.productDate}>
          Added {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {item.status === 'rejected' && item.rejectionReason && (
        <View style={styles.rejectionContainer}>
          <AlertTriangle size={16} color={Colors.error} />
          <Text style={styles.rejectionReason}>{item.rejectionReason}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const getStatusCounts = () => {
    const approved = products.filter(p => p.status === 'approved').length;
    const pending = products.filter(p => p.status === 'pending').length;
    const rejected = products.filter(p => p.status === 'rejected').length;

    return { approved, pending, rejected };
  };

  const { approved, pending, rejected } = getStatusCounts();

  if (!user || user.role !== 'vendor') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Access Denied</Text>
          <Text style={styles.errorSubtext}>Only vendors can view added products</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Added Products</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Status Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <CheckCircle size={20} color={Colors.success} />
          <Text style={styles.summaryText}>{approved} Approved</Text>
        </View>
        <View style={styles.summaryItem}>
          <Clock size={20} color={Colors.warning} />
          <Text style={styles.summaryText}>{pending} Pending</Text>
        </View>
        <View style={styles.summaryItem}>
          <XCircle size={20} color={Colors.error} />
          <Text style={styles.summaryText}>{rejected} Rejected</Text>
        </View>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Package size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>No products added yet</Text>
            <Text style={styles.emptySubtext}>Add your first product to get started</Text>
            <TouchableOpacity
              style={styles.addProductButton}
              onPress={() => router.push('/vendor/add-product' as any)}
            >
              <Text style={styles.addProductButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 32,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  headerRight: {
    width: 40, // To balance the header
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    margin: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  productItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  productDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  productDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  rejectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.errorLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  rejectionReason: {
    flex: 1,
    fontSize: 14,
    color: Colors.error,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  addProductButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addProductButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
