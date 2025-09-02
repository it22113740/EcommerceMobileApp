import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { router } from 'expo-router';
import {
  ChevronRight,
  Heart,
  HelpCircle,
  Leaf,
  LogOut,
  Mail,
  MapPin,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Store,
  User
} from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, showChevron = true }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          {icon}
        </View>
        <View>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showChevron && <ChevronRight size={20} color={Colors.textLight} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          }
        },
      ]
    );
  };



  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={40} color={Colors.primary} />
          </View>
          <Text style={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <MenuItem
            icon={<Mail size={20} color={Colors.primary} />}
            title="Email"
            subtitle={user?.email}
            onPress={() => {}}
          />
          
          <MenuItem
            icon={<MapPin size={20} color={Colors.primary} />}
            title="Address"
            subtitle="Manage your delivery addresses"
            onPress={() => router.push('/address')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shopping</Text>
          
          <MenuItem
            icon={<ShoppingBag size={20} color={Colors.primary} />}
            title="Order History"
            subtitle="View your past orders"
            onPress={() => router.push('/order-history')}
          />
          
          <MenuItem
            icon={<Heart size={20} color={Colors.primary} />}
            title="Favorites"
            subtitle="Your saved products"
            onPress={() => router.push('/favorites')}
          />
          
          <MenuItem
            icon={<Leaf size={20} color={Colors.success} />}
            title="Eco Impact"
            subtitle="See your environmental contribution"
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business</Text>

          {user?.role === 'vendor' ? (
            <>
              <MenuItem
                icon={<Plus size={20} color={Colors.success} />}
                title="Add Product"
                subtitle="Add new eco-friendly products"
                onPress={() => router.push('/vendor/add-product' as any)}
              />

              <MenuItem
                icon={<Package size={20} color={Colors.primary} />}
                title="Added Products"
                subtitle="View your products and approval status"
                onPress={() => router.push('/vendor/added-products' as any)}
              />
            </>
          ) : (
            <MenuItem
              icon={<Store size={20} color={Colors.success} />}
              title="Apply For Vendor"
              subtitle="Sell your eco-friendly products"
              onPress={() => router.push('/vendor/application')}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <MenuItem
            icon={<Settings size={20} color={Colors.primary} />}
            title="Settings"
            subtitle="App preferences"
            onPress={() => {}}
          />
          
          <MenuItem
            icon={<HelpCircle size={20} color={Colors.primary} />}
            title="Help & Support"
            subtitle="Get help with your account"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>EcoMarket v1.0.0</Text>
          <Text style={styles.footerSubtext}>Supporting local, sustainable farming</Text>
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
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    backgroundColor: Colors.accent,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    backgroundColor: Colors.background,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 32,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.error,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
});