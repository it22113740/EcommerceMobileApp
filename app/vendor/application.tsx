import { Colors } from '@/constants/colors';
import { Stack, router } from 'expo-router';
import {
    Award,
    Building2,
    CheckCircle,
    FileText,
    Globe,
    Heart,
    Mail,
    MapPin,
    Phone,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FormData {
  businessName: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  productCategories: string[];
  businessDescription: string;
  experience: string;
  motivation: string;
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'url';
  numberOfLines?: number;
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  multiline = false,
  keyboardType = 'default',
  numberOfLines = 1,
}: InputFieldProps) {
  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        {icon && <View style={styles.labelIcon}>{icon}</View>}
        <Text style={styles.label}>{label}</Text>
      </View>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textLight}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

interface CategoryTagProps {
  category: string;
  isSelected: boolean;
  onToggle: () => void;
}

function CategoryTag({ category, isSelected, onToggle }: CategoryTagProps) {
  return (
    <TouchableOpacity
      style={[styles.categoryTag, isSelected && styles.categoryTagSelected]}
      onPress={onToggle}
    >
      <Text style={[styles.categoryTagText, isSelected && styles.categoryTagTextSelected]}>
        {category}
      </Text>
      {isSelected && <CheckCircle size={16} color={Colors.white} />}
    </TouchableOpacity>
  );
}

const PRODUCT_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy & Eggs',
  'Grains & Cereals',
  'Herbs & Spices',
  'Meat & Poultry',
  'Seafood',
  'Bakery',
  'Beverages',
  'Honey & Preserves',
  'Nuts & Seeds',
  'Organic Products',
];

export default function VendorApplicationScreen() {
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    productCategories: [],
    businessDescription: '',
    experience: '',
    motivation: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCategory = (category: string) => {
    const currentCategories = formData.productCategories;
    const isSelected = currentCategories.includes(category);
    
    if (isSelected) {
      updateFormData('productCategories', currentCategories.filter(c => c !== category));
    } else {
      updateFormData('productCategories', [...currentCategories, category]);
    }
  };

  const validateForm = (): boolean => {
    const requiredFields = [
      'businessName',
      'street',
      'city',
      'state',
      'country',
      'zipCode',
      'phone',
      'email',
      'businessDescription',
      'experience',
      'motivation',
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof FormData] || (formData[field as keyof FormData] as string).trim() === '') {
        Alert.alert('Missing Information', `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return false;
      }
    }

    if (formData.productCategories.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one product category.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Application Submitted!',
        'Thank you for your interest in becoming a vendor. We will review your application and get back to you within 3-5 business days.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          title: 'Vendor Application',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Join Our Eco-Friendly Marketplace</Text>
            <Text style={styles.subtitle}>
              Help us build a sustainable future by selling your local, eco-friendly products.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Information</Text>
            
            <InputField
              label="Business Name"
              value={formData.businessName}
              onChangeText={(text) => updateFormData('businessName', text)}
              placeholder="Enter your business name"
              icon={<Building2 size={18} color={Colors.primary} />}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            
            <InputField
              label="Street Address"
              value={formData.street}
              onChangeText={(text) => updateFormData('street', text)}
              placeholder="Enter street address"
              icon={<MapPin size={18} color={Colors.primary} />}
            />
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="City"
                  value={formData.city}
                  onChangeText={(text) => updateFormData('city', text)}
                  placeholder="City"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="State"
                  value={formData.state}
                  onChangeText={(text) => updateFormData('state', text)}
                  placeholder="State"
                />
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <InputField
                  label="Country"
                  value={formData.country}
                  onChangeText={(text) => updateFormData('country', text)}
                  placeholder="Country"
                />
              </View>
              <View style={styles.halfWidth}>
                <InputField
                  label="Zip Code"
                  value={formData.zipCode}
                  onChangeText={(text) => updateFormData('zipCode', text)}
                  placeholder="Zip Code"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Details</Text>
            
            <InputField
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              placeholder="Enter phone number"
              icon={<Phone size={18} color={Colors.primary} />}
            />
            
            <InputField
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              placeholder="Enter email address"
              keyboardType="email-address"
              icon={<Mail size={18} color={Colors.primary} />}
            />
            
            <InputField
              label="Website (Optional)"
              value={formData.website}
              onChangeText={(text) => updateFormData('website', text)}
              placeholder="Enter website URL"
              keyboardType="url"
              icon={<Globe size={18} color={Colors.primary} />}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Categories</Text>
            <Text style={styles.sectionSubtitle}>
              Select the categories that best describe your products
            </Text>
            
            <View style={styles.categoriesContainer}>
              {PRODUCT_CATEGORIES.map((category) => (
                <CategoryTag
                  key={category}
                  category={category}
                  isSelected={formData.productCategories.includes(category)}
                  onToggle={() => toggleCategory(category)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tell Us About Your Business</Text>
            
            <InputField
              label="Business Description"
              value={formData.businessDescription}
              onChangeText={(text) => updateFormData('businessDescription', text)}
              placeholder="Describe your business, products, and what makes them eco-friendly..."
              multiline
              numberOfLines={4}
              icon={<FileText size={18} color={Colors.primary} />}
            />
            
            <InputField
              label="Experience"
              value={formData.experience}
              onChangeText={(text) => updateFormData('experience', text)}
              placeholder="Tell us about your experience in farming, production, or business..."
              multiline
              numberOfLines={4}
              icon={<Award size={18} color={Colors.primary} />}
            />
            
            <InputField
              label="Motivation"
              value={formData.motivation}
              onChangeText={(text) => updateFormData('motivation', text)}
              placeholder="Why do you want to join our eco-friendly marketplace?..."
              multiline
              numberOfLines={4}
              icon={<Heart size={18} color={Colors.primary} />}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By submitting this application, you agree to our vendor terms and conditions.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  halfWidth: {
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  categoryTagSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryTagText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryTagTextSelected: {
    color: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});