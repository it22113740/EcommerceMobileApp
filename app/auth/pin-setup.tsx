import { Colors } from '@/constants/colors';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
    Eye,
    EyeOff,
    Lock,
    Shield
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PINSetupScreen() {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePINSubmit = async () => {
    if (step === 'enter') {
      if (pin.length !== 4) {
        Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
        return;
      }

      if (!/^\d{4}$/.test(pin)) {
        Alert.alert('Invalid PIN', 'PIN must contain only numbers.');
        return;
      }

      setStep('confirm');
      return;
    }

    // Confirm step
    if (confirmPin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter a 4-digit PIN.');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'PINs do not match. Please try again.');
      setConfirmPin('');
      setStep('enter');
      setPin('');
      return;
    }

    setIsLoading(true);
    try {
      // Store PIN securely
      await SecureStore.setItemAsync('user_pin', pin);
      await SecureStore.setItemAsync('pin_enabled', 'true');

      Alert.alert(
        'Success',
        'Your PIN has been set up successfully!',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)')
          }
        ]
      );
    } catch (error) {
      console.log('PIN setup error:', error);
      Alert.alert('Error', 'Failed to save PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('enter');
      setConfirmPin('');
    } else {
      router.back();
    }
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
          <Text style={styles.title}>
            {step === 'enter' ? 'Create PIN' : 'Confirm PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'enter'
              ? 'Set up a 4-digit PIN for secure access'
              : 'Re-enter your PIN to confirm'
            }
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.pinContainer}>
            <View style={styles.pinInputContainer}>
              <Lock size={24} color={Colors.textLight} />
              <TextInput
                style={styles.pinInput}
                placeholder={step === 'enter' ? 'Enter 4-digit PIN' : 'Confirm PIN'}
                value={step === 'enter' ? pin : confirmPin}
                onChangeText={(text) => {
                  // Only allow numeric input and limit to 4 digits
                  const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
                  if (step === 'enter') {
                    setPin(numericText);
                  } else {
                    setConfirmPin(numericText);
                  }
                }}
                keyboardType="numeric"
                secureTextEntry={!showPin && step === 'enter' || !showConfirmPin && step === 'confirm'}
                maxLength={4}
                autoFocus
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => {
                  if (step === 'enter') {
                    setShowPin(!showPin);
                  } else {
                    setShowConfirmPin(!showConfirmPin);
                  }
                }}
              >
                {(step === 'enter' ? showPin : showConfirmPin) ? (
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
                    ((step === 'enter' ? pin : confirmPin).length > index) && styles.pinDotFilled
                  ]}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (step === 'enter' ? pin.length !== 4 : confirmPin.length !== 4) && styles.submitButtonDisabled,
              isLoading && styles.submitButtonDisabled
            ]}
            onPress={handlePINSubmit}
            disabled={(step === 'enter' ? pin.length !== 4 : confirmPin.length !== 4) || isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Setting up...' : step === 'enter' ? 'Continue' : 'Set PIN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>
              {step === 'confirm' ? 'Back' : 'Use Different Method'}
            </Text>
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
  pinContainer: {
    alignItems: 'center',
    marginBottom: 32,
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
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
