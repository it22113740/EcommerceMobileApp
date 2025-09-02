import { AuthState, User } from '@/types/auth';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.log('Error loading stored auth:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: '1',
        email,
        firstName: email.split('@')[0],
        lastName: '',
        phoneNumber: '+1234567890',
        role: email === 'vendor@gmail.com' ? 'vendor' : 'customer',
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string, phoneNumber?: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user: User = {
        id: '1',
        email,
        firstName,
        lastName,
        phoneNumber,
        role: email === 'vendor@gmail.com' ? 'vendor' : 'customer',
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const sendOTP = async (phone: string) => {
    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true };
  };

  const verifyOTP = async (otp: string) => {
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: otp === '123456' };
  };

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricEnabled = await SecureStore.getItemAsync('biometric_enabled');

      return {
        isAvailable: compatible && enrolled && biometricEnabled === 'true',
        biometricType: await getBiometricType(),
      };
    } catch (error) {
      console.log('Biometric availability check error:', error);
      return { isAvailable: false, biometricType: 'none' as const };
    }
  };

  const getBiometricType = async (): Promise<'fingerprint' | 'facial' | 'none'> => {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'facial';
      }
      return 'none';
    } catch (error) {
      return 'none';
    }
  };

  const authenticateWithBiometrics = async () => {
    try {
      const biometricType = await getBiometricType();
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate with ${biometricType === 'fingerprint' ? 'fingerprint' : 'face recognition'}`,
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
      });

      return { success: result.success };
    } catch (error) {
      console.log('Biometric authentication error:', error);
      return { success: false, error: 'Biometric authentication failed' };
    }
  };

  const authenticateWithPIN = async (enteredPin: string) => {
    try {
      const storedPin = await SecureStore.getItemAsync('user_pin');

      if (!storedPin) {
        return { success: false, error: 'PIN not set up' };
      }

      if (enteredPin === storedPin) {
        return { success: true };
      } else {
        return { success: false, error: 'Incorrect PIN' };
      }
    } catch (error) {
      console.log('PIN authentication error:', error);
      return { success: false, error: 'PIN authentication failed' };
    }
  };

  const authenticateUser = async () => {
    try {
      const { isAvailable, biometricType } = await checkBiometricAvailability();

      if (isAvailable) {
        const biometricResult = await authenticateWithBiometrics();

        if (biometricResult.success) {
          // Load user data and set authenticated
          const storedUser = await AsyncStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return { success: true, method: 'biometric' };
          }
        }
      }

      // If biometric fails or not available, return to allow PIN authentication
      return { success: false, method: 'pin_required' };
    } catch (error) {
      console.log('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  };

  const isBiometricSetupComplete = async () => {
    try {
      const biometricEnabled = await SecureStore.getItemAsync('biometric_enabled');
      const pinEnabled = await SecureStore.getItemAsync('pin_enabled');

      return {
        biometricEnabled: biometricEnabled === 'true',
        pinEnabled: pinEnabled === 'true',
      };
    } catch (error) {
      return { biometricEnabled: false, pinEnabled: false };
    }
  };

  return {
    ...authState,
    login,
    signup,
    logout,
    sendOTP,
    verifyOTP,
    checkBiometricAvailability,
    authenticateWithBiometrics,
    authenticateWithPIN,
    authenticateUser,
    isBiometricSetupComplete,
  };
});