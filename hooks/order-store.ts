import { CartItem, Order, OrderItem } from '@/types/product';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const ORDERS_STORAGE_KEY = 'orders';

export const [OrderProvider, useOrder] = createContextHook(() => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch (error) {
      console.log('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveOrders = async (ordersData: Order[]) => {
    try {
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordersData));
    } catch (error) {
      console.log('Error saving orders:', error);
    }
  };

  const createOrder = (cartItems: CartItem[], totalAmount: number, deliveryAddress?: string): Order => {
    const orderItems: OrderItem[] = cartItems.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const order: Order = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      items: orderItems,
      totalAmount,
      orderDate: new Date().toISOString(),
      status: 'confirmed',
      deliveryAddress,
    };

    const updatedOrders = [order, ...orders];
    setOrders(updatedOrders);
    saveOrders(updatedOrders);

    return order;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
  };

  const getOrderById = (orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  const clearOrderHistory = () => {
    setOrders([]);
    AsyncStorage.removeItem(ORDERS_STORAGE_KEY);
  };

  return {
    orders,
    isLoading,
    createOrder,
    updateOrderStatus,
    getOrderById,
    clearOrderHistory,
  };
});
