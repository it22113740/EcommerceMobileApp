import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Shield
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CheckoutVerificationProps {
  totalAmount: string;
  onVerificationSuccess: () => void;
  onVerificationCancel: () => void;
}

export default function CheckoutVerificationScreen({
  totalAmount,
  onVerificationSuccess,
  onVerificationCancel
}: CheckoutVerificationProps) {
  const {
    authenticateWithBiometrics,
    authenticateWithPIN,
    checkBiometricAvailability
  } = useAuth();

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | 'none'>('none');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMethod, setAuthMethod] = useState<'biometric' | 'pin'>('biometric');
  const [error, setError] = useState<string | null>(null);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);

  const checkBiometricSetup = useCallback(async () => {
    try {
      const { isAvailable, biometricType: type } = await checkBiometricAvailability();
      setBiometricAvailable(isAvailable);
      setBiometricType(type);

      // Default to biometric if available, otherwise use PIN
      setAuthMethod(isAvailable ? 'biometric' : 'pin');
    } catch (error) {
      console.log('Biometric setup check error:', error);
      setAuthMethod('pin');
    }
  }, [checkBiometricAvailability]);

  useEffect(() => {
    checkBiometricSetup();
  }, [checkBiometricSetup]);

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true);
    setError(null);
    setIsFirstAttempt(false);

    try {
      const result = await authenticateWithBiometrics();

      if (result.success) {
        onVerificationSuccess();
      } else {
        // Biometric failed, switch to PIN
        setAuthMethod('pin');
        setError('Biometric authentication failed. Please use your PIN.');
      }
    } catch (error) {
      console.log('Biometric authentication error:', error);
      setAuthMethod('pin');
      setError('Biometric authentication failed. Please use your PIN.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinAuth = async () => {
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setIsAuthenticating(true);
    setError(null);
    setIsFirstAttempt(false);

    try {
      const result = await authenticateWithPIN(pin);

      if (result.success) {
        onVerificationSuccess();
      } else {
        setError(result.error || 'Invalid PIN');
        setPin('');
      }
    } catch (error) {
      console.log('PIN authentication error:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleCancel = () => {
    onVerificationCancel();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Shield size={32} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Verify Payment</Text>
            <Text style={styles.amount}>${totalAmount}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <AlertCircle size={20} color={Colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>
              {isFirstAttempt ? 'Confirm your identity' : 'Please verify to proceed'}
            </Text>
            <Text style={styles.instructionText}>
              For security, we need to verify your identity before processing your payment.
            </Text>
          </View>

          {authMethod === 'biometric' && biometricAvailable ? (
            <View style={styles.authSection}>
              <View style={styles.authOption}>
                <View style={styles.authIcon}>
                  {biometricType === 'fingerprint' ? (
                    <Fingerprint size={32} color={Colors.primary} />
                  ) : (
                    <Shield size={32} color={Colors.primary} />
                  )}
                </View>
                <View style={styles.authInfo}>
                  <Text style={styles.authTitle}>
                    {biometricType === 'fingerprint' ? 'Fingerprint' : 'Face Recognition'}
                  </Text>
                  <Text style={styles.authDescription}>
                    Use your {biometricType === 'fingerprint' ? 'fingerprint' : 'face'} to verify
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.authButton, isAuthenticating && styles.authButtonDisabled]}
                onPress={handleBiometricAuth}
                disabled={isAuthenticating}
              >
                <Text style={styles.authButtonText}>
                  {isAuthenticating ? 'Verifying...' : `Verify with ${biometricType === 'fingerprint' ? 'Fingerprint' : 'Face'}`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                  setAuthMethod('pin');
                  setError(null);
                }}
              >
                <Lock size={16} color={Colors.primary} />
                <Text style={styles.switchButtonText}>Use PIN instead</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.authSection}>
              <View style={styles.pinContainer}>
                <View style={styles.pinInputContainer}>
                  <Lock size={24} color={Colors.textLight} />
                  <TextInput
                    style={styles.pinInput}
                    placeholder="Enter 4-digit PIN"
                    value={pin}
                    onChangeText={(text) => {
                      // Only allow numeric input and limit to 4 digits
                      const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
                      setPin(numericText);
                      setError(null);
                    }}
                    keyboardType="numeric"
                    secureTextEntry={!showPin}
                    maxLength={4}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPin(!showPin)}
                  >
                    {showPin ? (
                      <EyeOff size={24} color={Colors.textLight} />
                    ) : (
                      <Eye size={24} color={Colors.textLight} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.pinDots}>
                  {Array.from({ length: 4 }, (_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.pinDot,
                        pin.length > index && styles.pinDotFilled
                      ]}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.authButton,
                  (pin.length !== 4 || isAuthenticating) && styles.authButtonDisabled
                ]}
                onPress={handlePinAuth}
                disabled={pin.length !== 4 || isAuthenticating}
              >
                <Text style={styles.authButtonText}>
                  {isAuthenticating ? 'Verifying...' : 'Verify PIN'}
                </Text>
              </TouchableOpacity>

              {biometricAvailable && (
                <TouchableOpacity
                  style={styles.switchButton}
                  onPress={() => {
                    setAuthMethod('biometric');
                    setError(null);
                  }}
                >
                  {biometricType === 'fingerprint' ? (
                    <Fingerprint size={16} color={Colors.primary} />
                  ) : (
                    <Shield size={16} color={Colors.primary} />
                  )}
                  <Text style={styles.switchButtonText}>
                    Use {biometricType === 'fingerprint' ? 'Fingerprint' : 'Face'} instead
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
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
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: Colors.accent,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '20',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    flex: 1,
  },
  instructionContainer: {
    marginBottom: 32,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  authSection: {
    alignItems: 'center',
  },
  authOption: {
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
  authIcon: {
    width: 60,
    height: 60,
    backgroundColor: Colors.accent,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  authInfo: {
    flex: 1,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  authDescription: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  authButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  switchButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  pinInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    gap: 12,
  },
  pinInput: {
    flex: 1,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 8,
  },
  eyeButton: {
    padding: 4,
  },
  pinDots: {
    flexDirection: 'row',
    gap: 16,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  pinDotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
});
