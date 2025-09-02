import { Colors } from '@/constants/colors';
import { useAuth } from '@/hooks/auth-store';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
    ArrowLeft,
    Camera,
    Check,
    CheckCircle,
    ChevronDown,
    Image as ImageIcon,
    Plus,
    Save,
    Upload,
    X
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProductImage {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

interface ProductVariant {
  name: string;
  value: string;
  price: number;
  stock: number;
  sku: string;
  images: ProductImage[];
}

interface ProductCertification {
  name: string;
  issuedBy: string;
  certificateUrl: string;
  validUntil: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}



interface ProductData {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  hasVariants: boolean;
  variants: ProductVariant[];
  stock: number;
  tags: string[];
  certifications: ProductCertification[];
  metaTitle: string;
  metaDescription: string;
  mainImage?: ProductImage;
  additionalImages: ProductImage[];
}

export default function AddProductScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const [editingCertificationIndex, setEditingCertificationIndex] = useState<number | null>(null);
  const [currentUploadingVariant, setCurrentUploadingVariant] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [wantsAdditionalImages, setWantsAdditionalImages] = useState<boolean | null>(null);

  const [productData, setProductData] = useState<ProductData>({
    name: '',
    description: '',
    category: '',
    basePrice: 0,
    hasVariants: false,
    variants: [],
    stock: 0,
    tags: [],
    certifications: [],
    metaTitle: '',
    metaDescription: '',
    additionalImages: []
  });

  const [newTag, setNewTag] = useState('');

  const categories = [
    'Fruits & Vegetables',
    'Dairy & Eggs',
    'Meat & Poultry',
    'Seafood',
    'Grains & Cereals',
    'Beverages',
    'Snacks',
    'Organic Products',
    'Fair Trade Products',
    'Local Produce'
  ];

  const units = ['g', 'kg', 'ml', 'l', 'oz', 'lb'];

  const handleSave = async () => {
    if (!productData.name.trim() || !productData.description.trim() || !productData.category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Reset modal state and show image upload modal
    setCurrentStep(1);
    setWantsAdditionalImages(null);
    setCurrentUploadingVariant(null);
    setShowImageUploadModal(true);
  };

  const autoSaveProgress = async (stepCompleted: number) => {
    setIsAutoSaving(true);
    try {
      // Simulate API call to save progress
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Progress saved for step ${stepCompleted}`);
    } catch (error) {
      console.log('Auto-save failed:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const nextStep = async () => {
    await autoSaveProgress(currentStep);
    setCurrentStep(prev => prev + 1);
  };

  const previousStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const goToStep = async (step: number) => {
    if (step < currentStep) {
      await autoSaveProgress(currentStep);
    }
    setCurrentStep(step);
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permissions are required to upload images');
      return false;
    }
    return true;
  };

  const pickImage = async (source: 'camera' | 'library') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    let result;
    if (source === 'camera') {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];

      // Create ProductImage object
      const productImage: ProductImage = {
        public_id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        secure_url: asset.uri,
        url: asset.uri,
        width: asset.width,
        height: asset.height,
        format: asset.uri.split('.').pop() || 'jpg',
        bytes: 0, // Will be calculated when uploading to server
        created_at: new Date().toISOString()
      };

      return productImage;
    }

    return null;
  };

  const handleMainImageUpload = async (source: 'camera' | 'library') => {
    const image = await pickImage(source);
    if (image) {
      setProductData(prev => ({ ...prev, mainImage: image }));
    }
  };

  const handleAdditionalImageUpload = async (source: 'camera' | 'library') => {
    const image = await pickImage(source);
    if (image) {
      setProductData(prev => ({
        ...prev,
        additionalImages: [...prev.additionalImages, image]
      }));
    }
  };

  const handleVariantImageUpload = async (variantIndex: number, source: 'camera' | 'library') => {
    const image = await pickImage(source);
    if (image) {
      setProductData(prev => ({
        ...prev,
        variants: prev.variants.map((variant, index) =>
          index === variantIndex
            ? { ...variant, images: [...variant.images, image] }
            : variant
        )
      }));
    }
  };

  const removeAdditionalImage = (index: number) => {
    setProductData(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, i) => i !== index)
    }));
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    setProductData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, index) =>
        index === variantIndex
          ? { ...variant, images: variant.images.filter((_, i) => i !== imageIndex) }
          : variant
      )
    }));
  };

  const handleFinalSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call with all data including images
      await new Promise(resolve => setTimeout(resolve, 2000));

      Alert.alert('Success', 'Product with images added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !productData.tags.includes(newTag.trim())) {
      setProductData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProductData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };



  const [newVariant, setNewVariant] = useState<ProductVariant>({
    name: '',
    value: '',
    price: 0,
    stock: 0,
    sku: '',
    images: []
  });

  const addVariant = () => {
    setEditingVariantIndex(null);
    setNewVariant({
      name: '',
      value: '',
      price: 0,
      stock: 0,
      sku: '',
      images: []
    });
    setShowVariantModal(true);
  };

  const editVariant = (index: number) => {
    setEditingVariantIndex(index);
    setShowVariantModal(true);
  };

  const removeVariant = (index: number) => {
    setProductData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setEditingCertificationIndex(null);
    setShowCertificationModal(true);
  };

  const editCertification = (index: number) => {
    setEditingCertificationIndex(index);
    setShowCertificationModal(true);
  };

  const removeCertification = (index: number) => {
    setProductData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  if (!user || user.role !== 'vendor') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Access Denied</Text>
          <Text style={styles.errorSubtext}>Only vendors can add products</Text>
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Product</Text>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.saveButtonText}>Saving...</Text>
            ) : (
              <>
                <Save size={20} color={Colors.white} />
                <Text style={styles.saveButtonText}>Save</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter product name"
                value={productData.name}
                onChangeText={(text) => setProductData(prev => ({ ...prev, name: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your product"
                value={productData.description}
                onChangeText={(text) => setProductData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={productData.category ? styles.selectText : styles.selectPlaceholder}>
                  {productData.category || 'Select category'}
                </Text>
                <ChevronDown size={20} color={Colors.textLight} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Base Price ($)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                value={productData.basePrice.toString()}
                onChangeText={(text) => setProductData(prev => ({ ...prev, basePrice: parseFloat(text) || 0 }))}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.row}>
                <Text style={styles.inputLabel}>Has Variants</Text>
                <TouchableOpacity
                  style={[styles.toggle, productData.hasVariants && styles.toggleActive]}
                  onPress={() => setProductData(prev => ({ ...prev, hasVariants: !prev.hasVariants }))}
                >
                  <View style={[styles.toggleCircle, productData.hasVariants && styles.toggleCircleActive]} />
                </TouchableOpacity>
              </View>
            </View>

            {!productData.hasVariants && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Stock Quantity</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="0"
                  value={productData.stock.toString()}
                  onChangeText={(text) => setProductData(prev => ({ ...prev, stock: parseInt(text) || 0 }))}
                  keyboardType="numeric"
                />
              </View>
            )}
          </View>

          {/* Variants */}
          {productData.hasVariants && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Product Variants</Text>
                <TouchableOpacity style={styles.addButton} onPress={addVariant}>
                  <Plus size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>

              {productData.variants.map((variant, index) => (
                <View key={index} style={styles.variantItem}>
                  <View style={styles.variantInfo}>
                    <Text style={styles.variantName}>{variant.name}: {variant.value}</Text>
                    <Text style={styles.variantDetails}>Price: ${variant.price} | Stock: {variant.stock} | SKU: {variant.sku}</Text>
                  </View>
                  <View style={styles.variantActions}>
                    <TouchableOpacity onPress={() => editVariant(index)} style={styles.editButton}>
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeVariant(index)} style={styles.removeButton}>
                      <X size={16} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {productData.variants.length === 0 && (
                <Text style={styles.emptyText}>No variants added yet. Click + to add your first variant.</Text>
              )}
            </View>
          )}

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.inputGroup}>
              <View style={styles.addItemContainer}>
                <TextInput
                  style={styles.addItemInput}
                  placeholder="Add a tag"
                  value={newTag}
                  onChangeText={setNewTag}
                />
                <TouchableOpacity style={styles.addButton} onPress={addTag}>
                  <Plus size={20} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.tagsContainer}>
              {productData.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <X size={16} color={Colors.textLight} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>



          {/* Meta Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SEO Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Meta Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="SEO title"
                value={productData.metaTitle}
                onChangeText={(text) => setProductData(prev => ({ ...prev, metaTitle: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Meta Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="SEO description"
                value={productData.metaDescription}
                onChangeText={(text) => setProductData(prev => ({ ...prev, metaDescription: text }))}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Category Modal */}
        <Modal
          visible={showCategoryModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.modalItem}
                    onPress={() => {
                      setProductData(prev => ({ ...prev, category }));
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{category}</Text>
                    {productData.category === category && (
                      <Check size={20} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Variant Modal */}
        <Modal
          visible={showVariantModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingVariantIndex !== null ? 'Edit Variant' : 'Add Variant'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowVariantModal(false);
                  setEditingVariantIndex(null);
                }}>
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Variant Name *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g., Size, Color, Weight"
                      value={editingVariantIndex !== null ? productData.variants[editingVariantIndex]?.name || '' : newVariant.name}
                      onChangeText={(text) => {
                        if (editingVariantIndex !== null) {
                          setProductData(prev => ({
                            ...prev,
                            variants: prev.variants.map((variant, index) =>
                              index === editingVariantIndex ? { ...variant, name: text } : variant
                            )
                          }));
                        } else {
                          setNewVariant(prev => ({ ...prev, name: text }));
                        }
                      }}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Variant Value *</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g., Large, Red, 1kg"
                      value={editingVariantIndex !== null ? productData.variants[editingVariantIndex]?.value || '' : newVariant.value}
                      onChangeText={(text) => {
                        if (editingVariantIndex !== null) {
                          setProductData(prev => ({
                            ...prev,
                            variants: prev.variants.map((variant, index) =>
                              index === editingVariantIndex ? { ...variant, value: text } : variant
                            )
                          }));
                        } else {
                          setNewVariant(prev => ({ ...prev, value: text }));
                        }
                      }}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Price ($)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="0.00"
                      value={editingVariantIndex !== null ? productData.variants[editingVariantIndex]?.price?.toString() || '' : newVariant.price.toString()}
                      onChangeText={(text) => {
                        const price = parseFloat(text) || 0;
                        if (editingVariantIndex !== null) {
                          setProductData(prev => ({
                            ...prev,
                            variants: prev.variants.map((variant, index) =>
                              index === editingVariantIndex ? { ...variant, price } : variant
                            )
                          }));
                        } else {
                          setNewVariant(prev => ({ ...prev, price }));
                        }
                      }}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Stock</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="0"
                      value={editingVariantIndex !== null ? productData.variants[editingVariantIndex]?.stock?.toString() || '' : newVariant.stock.toString()}
                      onChangeText={(text) => {
                        const stock = parseInt(text) || 0;
                        if (editingVariantIndex !== null) {
                          setProductData(prev => ({
                            ...prev,
                            variants: prev.variants.map((variant, index) =>
                              index === editingVariantIndex ? { ...variant, stock } : variant
                            )
                          }));
                        } else {
                          setNewVariant(prev => ({ ...prev, stock }));
                        }
                      }}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>SKU</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Stock Keeping Unit"
                      value={editingVariantIndex !== null ? productData.variants[editingVariantIndex]?.sku || '' : newVariant.sku}
                      onChangeText={(text) => {
                        if (editingVariantIndex !== null) {
                          setProductData(prev => ({
                            ...prev,
                            variants: prev.variants.map((variant, index) =>
                              index === editingVariantIndex ? { ...variant, sku: text } : variant
                            )
                          }));
                        } else {
                          setNewVariant(prev => ({ ...prev, sku: text }));
                        }
                      }}
                    />
                  </View>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setShowVariantModal(false);
                        setEditingVariantIndex(null);
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cancelButton, { backgroundColor: Colors.primary }]}
                      onPress={() => {
                        if (editingVariantIndex !== null) {
                          // Edit existing variant - already handled by onChangeText
                        } else {
                          // Add new variant
                          if (newVariant.name.trim() && newVariant.value.trim()) {
                            setProductData(prev => ({
                              ...prev,
                              variants: [...prev.variants, newVariant]
                            }));
                          } else {
                            Alert.alert('Error', 'Please fill in variant name and value');
                            return;
                          }
                        }
                        setShowVariantModal(false);
                        setEditingVariantIndex(null);
                      }}
                    >
                      <Text style={[styles.cancelButtonText, { color: Colors.white }]}>Save Variant</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Step-by-Step Image Upload Modal */}
        <Modal
          visible={showImageUploadModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowImageUploadModal(false)}>
                  <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Upload Images - Step {currentStep}</Text>
                <View style={{ width: 24 }} />
              </View>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressStep, currentStep >= 1 && styles.progressStepActive]}>
                  <Text style={[styles.progressText, currentStep >= 1 && styles.progressTextActive]}>1</Text>
                </View>
                <View style={[styles.progressLine, currentStep > 1 && styles.progressLineActive]} />
                <View style={[styles.progressStep, currentStep >= 2 && styles.progressStepActive]}>
                  <Text style={[styles.progressText, currentStep >= 2 && styles.progressTextActive]}>2</Text>
                </View>
                <View style={[styles.progressLine, currentStep > 2 && styles.progressLineActive]} />
                <View style={[styles.progressStep, currentStep >= 3 && styles.progressStepActive]}>
                  <Text style={[styles.progressText, currentStep >= 3 && styles.progressTextActive]}>3</Text>
                </View>
                <View style={[styles.progressLine, currentStep > 3 && styles.progressLineActive]} />
                <View style={[styles.progressStep, currentStep >= 4 && styles.progressStepActive]}>
                  <Text style={[styles.progressText, currentStep >= 4 && styles.progressTextActive]}>4</Text>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  {/* Step 1: Main Product Image */}
                  {currentStep === 1 && (
                    <View style={styles.stepContainer}>
                      <Text style={styles.stepTitle}>Step 1: Main Product Image</Text>
                      <Text style={styles.stepDescription}>Upload the primary image for your product</Text>

                      {productData.mainImage ? (
                        <View style={styles.imagePreview}>
                          <Image source={{ uri: productData.mainImage.url }} style={styles.previewImage} />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => setProductData(prev => ({ ...prev, mainImage: undefined }))}
                          >
                            <X size={16} color={Colors.white} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.imageUploadContainer}>
                          <TouchableOpacity
                            style={styles.uploadOption}
                            onPress={() => handleMainImageUpload('camera')}
                          >
                            <Camera size={24} color={Colors.primary} />
                            <Text style={styles.uploadOptionText}>Take Photo</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.uploadOption}
                            onPress={() => handleMainImageUpload('library')}
                          >
                            <ImageIcon size={24} color={Colors.primary} />
                            <Text style={styles.uploadOptionText}>Choose from Gallery</Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      <TouchableOpacity
                        style={[styles.nextButton, !productData.mainImage && styles.nextButtonDisabled]}
                        onPress={nextStep}
                        disabled={!productData.mainImage}
                      >
                        <Text style={styles.nextButtonText}>
                          {isAutoSaving ? 'Saving...' : 'Next Step'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Step 2: Additional Images Decision */}
                  {currentStep === 2 && (
                    <View style={styles.stepContainer}>
                      <Text style={styles.stepTitle}>Step 2: Additional Images</Text>
                      <Text style={styles.stepDescription}>Would you like to add more images for this product?</Text>

                      <View style={styles.decisionContainer}>
                        <TouchableOpacity
                          style={[styles.decisionButton, wantsAdditionalImages === true && styles.decisionButtonActive]}
                          onPress={() => setWantsAdditionalImages(true)}
                        >
                          <Text style={[styles.decisionText, wantsAdditionalImages === true && styles.decisionTextActive]}>
                            Yes, add more images
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.decisionButton, wantsAdditionalImages === false && styles.decisionButtonActive]}
                          onPress={() => setWantsAdditionalImages(false)}
                        >
                          <Text style={[styles.decisionText, wantsAdditionalImages === false && styles.decisionTextActive]}>
                            No, skip this step
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.stepActions}>
                        <TouchableOpacity style={styles.backButton} onPress={previousStep}>
                          <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.nextButton, wantsAdditionalImages === null && styles.nextButtonDisabled]}
                          onPress={async () => {
                            await autoSaveProgress(2);
                            if (wantsAdditionalImages) {
                              nextStep(); // Go to step 3 (additional images)
                            } else {
                              // Skip additional images, go to variants or final
                              setCurrentStep(productData.hasVariants ? 4 : 5);
                            }
                          }}
                          disabled={wantsAdditionalImages === null}
                        >
                          <Text style={styles.nextButtonText}>
                            {isAutoSaving ? 'Saving...' : 'Next'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Step 3: Additional Images Upload */}
                  {currentStep === 3 && wantsAdditionalImages && (
                    <View style={styles.stepContainer}>
                      <Text style={styles.stepTitle}>Step 3: Additional Images</Text>
                      <Text style={styles.stepDescription}>Add more images for your product</Text>

                      <View style={styles.imageGrid}>
                        {productData.additionalImages.map((image, index) => (
                          <View key={index} style={styles.imagePreviewSmall}>
                            <Image source={{ uri: image.url }} style={styles.previewImageSmall} />
                            <TouchableOpacity
                              style={styles.removeImageButtonSmall}
                              onPress={() => removeAdditionalImage(index)}
                            >
                              <X size={12} color={Colors.white} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>

                      <TouchableOpacity
                        style={styles.addMoreButton}
                        onPress={() => {
                          Alert.alert(
                            'Add Image',
                            'Choose image source',
                            [
                              { text: 'Camera', onPress: () => handleAdditionalImageUpload('camera') },
                              { text: 'Gallery', onPress: () => handleAdditionalImageUpload('library') },
                              { text: 'Cancel', style: 'cancel' }
                            ]
                          );
                        }}
                      >
                        <Plus size={20} color={Colors.primary} />
                        <Text style={styles.addMoreText}>Add Another Image</Text>
                      </TouchableOpacity>

                      <View style={styles.stepActions}>
                        <TouchableOpacity style={styles.backButton} onPress={() => goToStep(2)}>
                          <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.nextButton}
                          onPress={() => setCurrentStep(productData.hasVariants ? 4 : 5)}
                        >
                          <Text style={styles.nextButtonText}>Next Step</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Step 4: Variant Images */}
                  {currentStep === 4 && productData.hasVariants && (
                    <View style={styles.stepContainer}>
                      <Text style={styles.stepTitle}>Step 4: Variant Images</Text>
                      <Text style={styles.stepDescription}>Upload one image for each product variant</Text>

                      <View style={styles.variantProgress}>
                        <Text style={styles.variantProgressText}>
                          {productData.variants.filter(v => v.images.length > 0).length} of {productData.variants.length} variants completed
                        </Text>
                      </View>

                      {productData.variants.map((variant, variantIndex) => (
                        <View key={variantIndex} style={styles.variantUploadItem}>
                          <View style={styles.variantInfo}>
                            <Text style={styles.variantName}>{variant.name}: {variant.value}</Text>
                            {variant.images.length > 0 ? (
                              <View style={styles.variantImagePreview}>
                                <Image source={{ uri: variant.images[0].url }} style={styles.variantPreviewImage} />
                                <TouchableOpacity
                                  style={styles.removeVariantImageButton}
                                  onPress={() => removeVariantImage(variantIndex, 0)}
                                >
                                  <X size={12} color={Colors.white} />
                                </TouchableOpacity>
                              </View>
                            ) : (
                              <TouchableOpacity
                                style={styles.uploadVariantButton}
                                onPress={() => {
                                  Alert.alert(
                                    `Add Image for ${variant.name}: ${variant.value}`,
                                    'Choose image source',
                                    [
                                      { text: 'Camera', onPress: () => handleVariantImageUpload(variantIndex, 'camera') },
                                      { text: 'Gallery', onPress: () => handleVariantImageUpload(variantIndex, 'library') },
                                      { text: 'Cancel', style: 'cancel' }
                                    ]
                                  );
                                }}
                              >
                                <Upload size={16} color={Colors.primary} />
                                <Text style={styles.uploadVariantText}>Upload Image</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      ))}

                      <View style={styles.stepActions}>
                        <TouchableOpacity
                          style={styles.backButton}
                          onPress={() => goToStep(wantsAdditionalImages ? 3 : 2)}
                        >
                          <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.nextButton}
                          onPress={() => setCurrentStep(5)}
                          disabled={productData.variants.some(v => v.images.length === 0)}
                        >
                          <Text style={styles.nextButtonText}>Finish</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Step 5: Final Save */}
                  {currentStep === 5 && (
                    <View style={styles.stepContainer}>
                      <Text style={styles.stepTitle}>Complete Setup</Text>
                      <Text style={styles.stepDescription}>Review and save your product</Text>

                      <View style={styles.summaryContainer}>
                        <View style={styles.summaryItem}>
                          <CheckCircle size={20} color={Colors.success} />
                          <Text style={styles.summaryText}>Main Image: ✓</Text>
                        </View>
                        <View style={styles.summaryItem}>
                          <Text style={styles.summaryText}>
                            Additional Images: {productData.additionalImages.length}
                          </Text>
                        </View>
                        {productData.hasVariants && (
                          <View style={styles.summaryItem}>
                            <Text style={styles.summaryText}>
                              Variant Images: {productData.variants.filter(v => v.images.length > 0).length}/{productData.variants.length}
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.stepActions}>
                        <TouchableOpacity
                          style={styles.backButton}
                          onPress={() => {
                            if (productData.hasVariants && productData.variants.some(v => v.images.length === 0)) {
                              setCurrentStep(4); // Go back to variants if some are incomplete
                            } else if (productData.hasVariants) {
                              setCurrentStep(4); // Go back to variants
                            } else if (wantsAdditionalImages) {
                              setCurrentStep(3); // Go back to additional images
                            } else {
                              setCurrentStep(2); // Go back to additional images decision
                            }
                          }}
                        >
                          <Text style={styles.backButtonText}>Back</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.finalSaveButton, isLoading && styles.finalSaveButtonDisabled]}
                          onPress={handleFinalSave}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Text style={styles.finalSaveButtonText}>Saving Product...</Text>
                          ) : (
                            <Text style={styles.finalSaveButtonText}>Save Product</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectPlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
  },
  datePlaceholder: {
    fontSize: 16,
    color: Colors.textLight,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    transform: [{ translateX: 0 }],
  },
  toggleCircleActive: {
    transform: [{ translateX: 22 }],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  variantItem: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  variantInfo: {
    flex: 1,
  },
  variantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  variantDetails: {
    fontSize: 14,
    color: Colors.textLight,
  },
  variantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  editButton: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  removeButton: {
    padding: 6,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 16,
  },
  modalBody: {
    padding: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.border,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
  flex1: {
    flex: 1,
  },
  rowInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitSelector: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: Colors.accent,
    borderRadius: 6,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  addItemContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  addItemInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  tagText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.text,
  },
  imageSection: {
    marginBottom: 24,
  },
  imageUploadContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  uploadOption: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    textAlign: 'center',
  },
  imagePreview: {
    marginTop: 12,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.error,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  imagePreviewSmall: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  previewImageSmall: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButtonSmall: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variantImageSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  variantTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
  },
  progressTextActive: {
    color: Colors.white,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: Colors.primary,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 24,
    lineHeight: 20,
  },
  decisionContainer: {
    gap: 12,
    marginBottom: 32,
  },
  decisionButton: {
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    alignItems: 'center',
  },
  decisionButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.accent,
  },
  decisionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  decisionTextActive: {
    color: Colors.primary,
  },
  stepActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: Colors.border,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },

  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: 24,
  },
  addMoreText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
  variantProgress: {
    backgroundColor: Colors.accent,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  variantProgressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  variantUploadItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadVariantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 8,
  },
  uploadVariantText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  variantImagePreview: {
    position: 'relative',
    marginTop: 8,
  },
  variantPreviewImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  removeVariantImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  finalSaveButton: {
    flex: 2,
    backgroundColor: Colors.success,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  finalSaveButtonDisabled: {
    backgroundColor: Colors.border,
  },
  finalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
