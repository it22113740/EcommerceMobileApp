import colorTheme, { Colors } from "@/constants/colors";
import { useCart } from "@/hooks/cart-store";
import { Tabs } from "expo-router";
import { Home, MessageCircle, ShoppingCart, User } from "lucide-react-native";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

function CartIcon({ color }: { color: string }) {
  const { totalItems } = useCart();
  
  return (
    <View style={styles.cartIconContainer}>
      <ShoppingCart color={color} size={24} />
      {totalItems > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalItems}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaView style={{flex:1,backgroundColor:"black"}}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorTheme.light.tint,
        tabBarInactiveTintColor: colorTheme.light.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => <CartIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cartIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});