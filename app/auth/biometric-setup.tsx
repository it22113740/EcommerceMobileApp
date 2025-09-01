import { Colors } from '@/constants/colors';
import * as LocalAuthentication from 'expo-local-authentication';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
    Fingerprint,
    Shield,
    SkipForward,
    User
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BiometricSetupScreen() {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | 'none'>('none');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (compatible && enrolled) {
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

        if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('facial');
        }
        setIsBiometricSupported(true);
      }
    } catch (error) {
      console.log('Biometric check failed:', error);
    }
  };

  const setupBiometric = async () => {
    if (!isBiometricSupported) {
      Alert.alert('Not Supported', 'Biometric authentication is not supported on this device.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Set up ${biometricType === 'fingerprint' ? 'fingerprint' : 'face'} recognition`,
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
      });

      if (result.success) {
        // Store biometric setup preference
        await SecureStore.setItemAsync('biometric_enabled', 'true');
        await SecureStore.setItemAsync('biometric_type', biometricType);

        Alert.alert(
          'Success',
          `${biometricType === 'fingerprint' ? 'Fingerprint' : 'Face'} recognition has been set up successfully!`,
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/auth/pin-setup')
            }
          ]
        );
      } else {
        Alert.alert('Setup Failed', 'Biometric setup was cancelled or failed.');
      }
    } catch (error) {
      console.log('Biometric setup error:', error);
      Alert.alert('Error', 'Failed to set up biometric authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const skipBiometricSetup = async () => {
    await SecureStore.setItemAsync('biometric_enabled', 'false');
    router.replace('/auth/pin-setup');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={40} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Secure Your Account</Text>
          <Text style={styles.subtitle}>
            Set up biometric authentication for quick and secure access
          </Text>
        </View>

        <View style={styles.content}>
          {isBiometricSupported ? (
            <View style={styles.biometricSection}>
              <View style={styles.biometricOption}>
                <View style={styles.biometricIcon}>
                  {biometricType === 'fingerprint' ? (
                    <Fingerprint size={32} color={Colors.primary} />
                  ) : (
                    <User size={32} color={Colors.primary} />
                  )}
                </View>
                <View style={styles.biometricInfo}>
                  <Text style={styles.biometricTitle}>
                    {biometricType === 'fingerprint' ? 'Fingerprint' : 'Face Recognition'}
                  </Text>
                  <Text style={styles.biometricDescription}>
                    Use your {biometricType === 'fingerprint' ? 'fingerprint' : 'face'} for instant login
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.setupButton, isLoading && styles.setupButtonDisabled]}
                onPress={setupBiometric}
                disabled={isLoading}
              >
                <Text style={styles.setupButtonText}>
                  {isLoading ? 'Setting up...' : `Set up ${biometricType === 'fingerprint' ? 'Fingerprint' : 'Face'}`}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noBiometricSection}>
              <View style={styles.noBiometricIcon}>
                <Shield size={32} color={Colors.textLight} />
              </View>
              <Text style={styles.noBiometricTitle}>Biometric Not Available</Text>
              <Text style={styles.noBiometricDescription}>
                Your device doesn&apos;t support biometric authentication. We&apos;ll set up a PIN for security.
              </Text>
            </View>
          )}

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipBiometricSetup}
          >
            <SkipForward size={20} color={Colors.primary} />
            <Text style={styles.skipButtonText}>Set up PIN only</Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.accent,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  biometricSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  biometricOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  biometricIcon: {
    width: 60,
    height: 60,
    backgroundColor: Colors.accent,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  biometricInfo: {
    flex: 1,
  },
  biometricTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  biometricDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  setupButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
  },
  setupButtonDisabled: {
    opacity: 0.6,
  },
  setupButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  noBiometricSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noBiometricIcon: {
    width: 60,
    height: 60,
    backgroundColor: Colors.white,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noBiometricTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  noBiometricDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: Colors.textLight,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 8,
  },
  skipButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
