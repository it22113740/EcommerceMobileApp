import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OTPScreen() {
  const { phone, email, mode } = useLocalSearchParams<{
    phone?: string;
    email?: string;
    mode?: string;
  }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const { verifyOTP, sendOTP } = useAuth();
  const inputRefs = useRef<TextInput[]>([]);

  const isPasswordReset = mode === 'password_reset';
  const contactInfo = isPasswordReset ? email : phone;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter the complete OTP');
      return;
    }

    setIsLoading(true);
    const result = await verifyOTP(otpString);
    setIsLoading(false);

    if (result.success) {
      if (isPasswordReset) {
        Alert.alert('Success', 'Email verified successfully!', [
          { text: 'OK', onPress: () => router.replace('/auth/reset-password') }
        ]);
      } else {
        Alert.alert('Success', 'Phone number verified successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      }
    } else {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    setIsLoading(true);
    // For password reset, we would typically resend to email
    // For now, we'll use the phone OTP function as a placeholder
    await sendOTP(phone || '');
    setIsLoading(false);
    setTimer(60);

    const message = isPasswordReset
      ? 'Verification code sent to your email!'
      : 'OTP sent successfully!';
    Alert.alert('Success', message);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: isPasswordReset ? 'Verify Email' : 'Verify Phone',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We&apos;ve sent a 6-digit code to {contactInfo}
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { if (ref) inputRefs.current[index] = ref; }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]} 
          onPress={handleVerifyOTP}
          disabled={isLoading}
        >
          <Text style={styles.verifyButtonText}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
          <TouchableOpacity 
            onPress={handleResendOTP}
            disabled={timer > 0}
          >
            <Text style={[styles.resendLink, timer > 0 && styles.resendLinkDisabled]}>
              {timer > 0 ? `Resend in ${timer}s` : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    backgroundColor: Colors.white,
  },
  otpInputFilled: {
    borderColor: Colors.primary,
  },
  verifyButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    color: Colors.textLight,
    fontSize: 14,
  },
  resendLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: Colors.textLight,
  },
});