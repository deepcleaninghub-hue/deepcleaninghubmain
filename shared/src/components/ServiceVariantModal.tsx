import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { 
  Modal, 
  Portal, 
  Text, 
  useTheme, 
  Button, 
  Card, 
  Divider,
  List,
  IconButton,
  TextInput,
  Chip,
  Switch
} from 'react-native-paper';
import { useCart } from '../contexts/CartContext';
import { servicesAPI } from '../services/api';
import { ServiceVariant } from '../types';
import { modalService } from '../services/modalService';
import MultiDateSelector from './MultiDateSelector';
import AutoTranslateText from './AutoTranslateText';

interface ServiceVariantModalProps {
  visible: boolean;
  onDismiss: () => void;
  serviceTitle: string;
  serviceId: string;
  onNavigateToCart?: () => void;
  t: (key: string) => string;
  translateDynamicText?: (text: string) => Promise<string>;
  currentLanguage?: string;
}

const ServiceVariantModal: React.FC<ServiceVariantModalProps> = ({
  visible,
  onDismiss,
  serviceTitle,
  serviceId,
  onNavigateToCart,
  t,
  translateDynamicText,
  currentLanguage,
}) => {
  const theme = useTheme();
  const { addToCart } = useCart();
  const [variants, setVariants] = useState<ServiceVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: {variant: ServiceVariant, quantity: number, customMeasurement?: string}}>({});
  const [perUnitInputs, setPerUnitInputs] = useState<{[key: string]: string}>({});
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Array<{date: string; time: string; id: string}>>([]);
  const [serviceTime, setServiceTime] = useState<Date | null>(null);


  // Fetch service variants when modal opens
  useEffect(() => {
    if (visible && serviceId) {
      fetchServiceVariants();
    }
  }, [visible, serviceId]);

  const fetchServiceVariants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      // Map service titles to service IDs from your database
      const serviceIdMapping: {[key: string]: string} = {
        // CLEANING SERVICES
        'Normal Cleaning': 'normal-cleaning',
        'Deep Cleaning': 'deep-cleaning',
        
        // FURNITURE ASSEMBLY SERVICES
        'Bed Assembly': 'bed-assembly',
        'Bookshelf Assembly': 'bookshelf-assembly',
        'Kitchen Assembly': 'kitchen-assembly',
        'Table Assembly': 'table-assembly',
        'Wardrobe Assembly': 'wardrobe-assembly',
        'Filing Cabinet Assembly': 'filing-cabinet-assembly',
        
        // FURNITURE DISASSEMBLY SERVICES
        'Bed Disassembly': 'bed-disassembly',
        'Bookshelf Disassembly': 'bookshelf-disassembly',
        'Kitchen Disassembly': 'kitchen-disassembly',
        'Table Disassembly': 'table-disassembly',
        'Wardrobe Disassembly': 'wardrobe-disassembly',
        
        // HOUSE PAINTING SERVICES
        'Exterior Painting': 'exterior-painting',
        'Interior Painting': 'interior-painting',
        'Ceiling Painting': 'ceiling-painting',
        
        // OFFICE SETUP SERVICES
        'Office Chair Assembly': 'office-chair-assembly',
        'Office Desk Assembly': 'office-desk-assembly',
        'Office Equipment Assembly': 'office-equipment-assembly',
        'Meeting Table Assembly': 'meeting-table-assembly',
        
        // MOVING SERVICES
        'House Moving': 'house-moving',
        'Office Moving': 'office-moving',
      };
      
      // Get the correct service ID from the mapping
      const mappedServiceId = serviceIdMapping[serviceTitle] || serviceId;
      
      // Fetch variants using the mapped service ID
      const variants = await servicesAPI.getServiceVariantsByServiceId(mappedServiceId);
      
      if (variants && variants.length > 0) {
        // Sort variants by display_order
        const sortedVariants = variants.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setVariants(sortedVariants);
      } else {
        // Fallback: try to get service and use its variants
        const service = await servicesAPI.getServiceById(mappedServiceId);
        
        if (service && service.serviceVariants && service.serviceVariants.length > 0) {
          const sortedVariants = service.serviceVariants.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setVariants(sortedVariants);
        } else {
          // No variants found - show empty state
          setVariants([]);
          setError('No variants available for this service');
        }
      }
    } catch (err) {
      console.error('Error fetching service variants:', err);
      setError('Failed to load service variants');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price based on pricing type
  const calculateTotalPrice = (variant: ServiceVariant, quantity: number = 1): number => {
    if (variant.pricingType === 'per_unit') {
      const inputValue = perUnitInputs[variant.id] || '';
      const measurement = parseFloat(inputValue) || 0;
      return measurement * (variant.unitPrice || variant.price);
    }
    // Fixed pricing - multiply by quantity
    return variant.price * quantity;
  };

  // Handle variant selection
  const handleVariantSelect = (variant: ServiceVariant) => {
    setSelectedVariants(prev => {
      const newSelected = { ...prev };
      if (newSelected[variant.id]) {
        // If already selected, remove it
        delete newSelected[variant.id];
      } else {
        // If not selected, add it with default values
        newSelected[variant.id] = {
          variant,
          quantity: 1,
          customMeasurement: ''
        };
      }
      return newSelected;
    });
    
    // Reset per-unit inputs for this variant
    setPerUnitInputs(prev => ({
      ...prev,
      [variant.id]: ''
    }));
  };

  // Handle quantity change for a specific variant
  const handleQuantityChange = (variantId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      setSelectedVariants(prev => {
        const current = prev[variantId];
        if (!current) return prev;
        
        return {
          ...prev,
          [variantId]: {
            ...current,
            quantity: newQuantity
          }
        };
      });
    }
  };

  // Handle measurement change for per_unit pricing
  const handleMeasurementChange = (variantId: string, value: string) => {
    setSelectedVariants(prev => {
      const current = prev[variantId];
      if (!current) return prev;
      
      return {
        ...prev,
        [variantId]: {
          ...current,
          customMeasurement: value
        }
      };
    });
  };

  // Handle per-unit input change for specific variant
  const handlePerUnitInputChange = (variantId: string, value: string) => {
    setPerUnitInputs(prev => ({
      ...prev,
      [variantId]: value
    }));
  };

  // Check if all required inputs are filled for a specific variant
  const isVariantReadyForCart = (variantId: string): boolean => {
    const selectedVariant = selectedVariants[variantId];
    if (!selectedVariant) return false;

    const variant = selectedVariant.variant;
    
    // Check pricing inputs
    let pricingValid = false;
    if (variant.pricingType === 'fixed') {
      pricingValid = selectedVariant.quantity > 0;
    } else if (variant.pricingType === 'per_unit') {
      const inputValue = perUnitInputs[variantId] || '';
      const numericValue = parseFloat(inputValue);
      pricingValid = numericValue > 0 && 
             (!variant.minMeasurement || numericValue >= variant.minMeasurement) &&
             (!variant.maxMeasurement || numericValue <= variant.maxMeasurement);
    } else {
      pricingValid = true; // For other pricing types
    }

    // Check date selection for multi-day services
    const dateValid = !isMultiDay || selectedDates.length > 0;

    return pricingValid && dateValid;
  };

  // Check if any variants are ready for cart
  const hasReadyVariants = (): boolean => {
    return Object.keys(selectedVariants).some(variantId => isVariantReadyForCart(variantId));
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      
      // Add all selected variants to cart
      const addedVariants: string[] = [];
      
      for (const [variantId, selectedVariant] of Object.entries(selectedVariants)) {
        if (isVariantReadyForCart(variantId)) {
          const variant = selectedVariant.variant;
          const totalPrice = calculateTotalPrice(variant, selectedVariant.quantity);
          
          const userInputs: Record<string, any> = {
            quantity: selectedVariant.quantity,
            pricingType: variant.pricingType || 'fixed',
          };

          if (variant.pricingType === 'per_unit') {
            const inputValue = perUnitInputs[variantId] || selectedVariant.customMeasurement || '';
            userInputs.measurement = parseFloat(inputValue) || 0;
            userInputs.unitPrice = variant.unitPrice || variant.price;
            userInputs.unitMeasure = variant.unitMeasure || '';
          }

          // Add date selection data
          if (isMultiDay) {
            userInputs.selectedDates = selectedDates;
            userInputs.isMultiDay = true;
          } else {
            userInputs.isMultiDay = false;
          }

          const serviceData = {
            id: variant.id,
            title: variant.title,
            description: variant.description,
            image: '',
            category: `${serviceTitle} - ${variant.title}`,
            pricingType: variant.pricingType || 'fixed',
            price: totalPrice,
            unitPrice: variant.unitPrice || variant.price,
            unitMeasure: variant.unitMeasure || '',
            minMeasurement: variant.minMeasurement || 0,
            maxMeasurement: variant.maxMeasurement || 0,
            measurementStep: variant.measurementStep || 1,
            measurementPlaceholder: variant.measurementPlaceholder || '',
            duration: variant.duration || '',
            features: variant.features || [],
            displayOrder: variant.displayOrder || 0,
            isActive: true,
            serviceVariants: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await addToCart(serviceData, totalPrice, userInputs);
          addedVariants.push(variant.title);
        }
      }
      
      if (addedVariants.length > 0) {
        modalService.showSuccess(
          t('cart.itemAdded'),
          `${addedVariants.join(', ')} ${t('cart.addedToCart')}`
        );
        
        // Auto-dismiss modal after successful addition
        setTimeout(() => {
          onDismiss();
          if (onNavigateToCart) {
            onNavigateToCart();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      modalService.showError(t('common.error'), t('cart.failedToAdd'));
    } finally {
      setAddingToCart(false);
    }
  };


  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        <View style={styles.modalHeader}>
          <AutoTranslateText 
            style={[styles.modalTitle, { color: theme.colors.onSurface }]}
            t={t}
            {...(translateDynamicText && { translateDynamicText })}
            {...(currentLanguage && { currentLanguage })}
            {...{ variant: "headlineSmall" }}
          >
            {serviceTitle}
          </AutoTranslateText>
          <IconButton
            icon="close"
            size={24}
            onPress={onDismiss}
            iconColor={theme.colors.onSurface}
            style={{ margin: 0 }} // Remove default margins
          />
        </View>
        
        <Divider style={{ marginBottom: 16 }} />
        
        <ScrollView 
          style={styles.modalScrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.modalScrollContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
                {t('services.loadingVariants')}
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
              <Button 
                mode="contained" 
                onPress={fetchServiceVariants}
                style={{ marginTop: 16 }}
              >
                {t('services.retry')}
              </Button>
            </View>
          ) : variants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                No variants available for this service.
              </Text>
            </View>
          ) : (
            <View style={styles.variantsList}>
            {variants.map((variant) => (
              <Card 
                key={variant.id} 
                style={[
                  styles.variantCard, 
                  { backgroundColor: theme.colors.surface },
                  selectedVariants[variant.id] && { borderColor: theme.colors.primary, borderWidth: 2 }
                ]}
              >
                <Card.Content style={styles.variantContent}>
                  <View style={styles.variantHeader}>
                    <AutoTranslateText 
                      style={[styles.variantTitle, { color: theme.colors.onSurface }]}
                      showLoading={true}
                      loadingText={t('autoTranslate.translating')}
                      t={t}
                      {...(translateDynamicText && { translateDynamicText })}
                      {...(currentLanguage && { currentLanguage })}
                    >
                      {variant.title}
                    </AutoTranslateText>
                    <View style={styles.priceContainer}>
                      <Text variant="titleSmall" style={[styles.variantPrice, { color: theme.colors.primary }]}>
                        {variant.pricingType === 'per_unit' 
                          ? `€${variant.unitPrice || variant.price}/${variant.unitMeasure || 'unit'}`
                          : `€${variant.price}`
                        }
                      </Text>
                      {variant.pricingType === 'fixed' && (
                        <Chip 
                          mode="outlined" 
                          compact 
                          style={[styles.pricingChip, { borderColor: theme.colors.primary }]}
                          textStyle={{ color: theme.colors.primary, fontSize: 10 }}
                        >
                          {t('services.fixedPrice')}
                        </Chip>
                      )}
                      {variant.pricingType === 'per_unit' && (
                        <Chip 
                          mode="outlined" 
                          compact 
                          style={[styles.pricingChip, { borderColor: theme.colors.secondary }]}
                          textStyle={{ color: theme.colors.secondary, fontSize: 10 }}
                        >
                          {t('services.perUnit')}
                        </Chip>
                      )}
                    </View>
                  </View>
                  
                  {variant.description && (
                    <AutoTranslateText 
                      style={[styles.variantDescription, { color: theme.colors.onSurfaceVariant }]}
                      showLoading={true}
                      loadingText={t('autoTranslate.translating')}
                      t={t}
                      {...(translateDynamicText && { translateDynamicText })}
                      {...(currentLanguage && { currentLanguage })}
                    >
                      {variant.description}
                    </AutoTranslateText>
                  )}
                  
                  {variant.duration && (
                    <Text variant="bodySmall" style={[styles.variantDuration, { color: theme.colors.primary }]}>
                      {t('services.duration')} {variant.duration}
                    </Text>
                  )}
                  
                  {variant.features && variant.features.length > 0 && (
                    <View style={styles.featuresContainer}>
                      <Text variant="bodySmall" style={[styles.featuresLabel, { color: theme.colors.onSurfaceVariant }]}>
                        {t('services.features')}
                      </Text>
                      <View style={styles.featuresChips}>
                        {variant.features.map((feature, index) => (
                          <Chip 
                            key={index}
                            mode="outlined" 
                            compact 
                            style={[styles.featureChip, { borderColor: theme.colors.outline }]}
                            textStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
                          >
                            <AutoTranslateText 
                              style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}
                              showLoading={false}
                              t={t}
                              {...(translateDynamicText && { translateDynamicText })}
                              {...(currentLanguage && { currentLanguage })}
                            >
                              {feature}
                            </AutoTranslateText>
                          </Chip>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Selection Button - Always visible */}
                  <Button
                    mode={selectedVariants[variant.id] ? "contained" : "outlined"}
                    onPress={() => handleVariantSelect(variant)}
                    style={[
                      styles.selectButton, 
                      { 
                        backgroundColor: selectedVariants[variant.id] ? theme.colors.primary : 'transparent',
                        borderColor: theme.colors.primary
                      }
                    ]}
                    contentStyle={styles.selectButtonContent}
                    labelStyle={[
                      styles.selectButtonLabel, 
                      { 
                        color: selectedVariants[variant.id] ? theme.colors.onPrimary : theme.colors.primary 
                      }
                    ]}
                    icon="check"
                  >
                    {selectedVariants[variant.id] ? t('services.selected') : t('services.select')}
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Quantity Inputs for Selected Variants */}
        {Object.keys(selectedVariants).length > 0 && (
          <View style={styles.selectedVariantsSection}>
            <Divider style={{ marginVertical: 16 }} />
            <Text variant="titleMedium" style={[styles.selectedVariantsTitle, { color: theme.colors.onSurface }]}>
              {t('services.selectedVariants')}
            </Text>
            
            {Object.entries(selectedVariants).map(([variantId, selectedVariant]) => (
              <Card key={variantId} style={[styles.selectedVariantCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={styles.selectedVariantCardContent}>
                  <View style={styles.selectedVariantHeader}>
                    <AutoTranslateText 
                      style={[styles.selectedVariantCardTitle, { color: theme.colors.onSurface }]}
                      t={t}
                      {...(translateDynamicText && { translateDynamicText })}
                      {...(currentLanguage && { currentLanguage })}
                    >
                      {selectedVariant.variant.title}
                    </AutoTranslateText>
                    <Text variant="bodyMedium" style={[styles.selectedVariantCardPrice, { color: theme.colors.primary }]}>
                      {selectedVariant.variant.pricingType === 'per_unit' 
                        ? `€${selectedVariant.variant.unitPrice || selectedVariant.variant.price}/${selectedVariant.variant.unitMeasure || t('services.units')}`
                        : `€${selectedVariant.variant.price}`
                      }
                    </Text>
                  </View>

                  {/* Quantity Input for Fixed Pricing */}
                  {selectedVariant.variant.pricingType === 'fixed' && (
                    <View style={styles.quantityInputContainer}>
                      <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                        {t('services.quantity')}:
                      </Text>
                      <View style={styles.quantityControls}>
                        <Button
                          mode="outlined"
                          onPress={() => handleQuantityChange(variantId, Math.max(1, selectedVariant.quantity - 1))}
                          style={styles.quantityButton}
                          contentStyle={styles.quantityButtonContent}
                        >
                          -
                        </Button>
                        <Text variant="titleMedium" style={[styles.quantityText, { color: theme.colors.onSurface }]}>
                          {selectedVariant.quantity}
                        </Text>
                        <Button
                          mode="outlined"
                          onPress={() => handleQuantityChange(variantId, selectedVariant.quantity + 1)}
                          style={styles.quantityButton}
                          contentStyle={styles.quantityButtonContent}
                        >
                          +
                        </Button>
                      </View>
                    </View>
                  )}

                  {/* Measurement Input for Per Unit Pricing */}
                  {selectedVariant.variant.pricingType === 'per_unit' && (
                    <View style={styles.measurementInputContainer}>
                      <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                        <AutoTranslateText 
                          style={[styles.inputLabel, { color: theme.colors.onSurface }]}
                          t={t}
                          {...(translateDynamicText && { translateDynamicText })}
                          {...(currentLanguage && { currentLanguage })}
                        >
                          {selectedVariant.variant.unitMeasure || t('services.units')}
                        </AutoTranslateText>
                        :
                      </Text>
                      <TextInput
                        mode="outlined"
                        value={perUnitInputs[variantId] || ''}
                        onChangeText={(value) => handlePerUnitInputChange(variantId, value)}
                        placeholder={selectedVariant.variant.measurementPlaceholder || `${t('services.enter')} ${selectedVariant.variant.unitMeasure || t('services.units')}`}
                        keyboardType="numeric"
                        style={styles.measurementInput}
                        outlineColor={theme.colors.outline}
                      />
                      {selectedVariant.variant.minMeasurement && selectedVariant.variant.maxMeasurement && (
                        <Text variant="bodySmall" style={[styles.measurementHint, { color: theme.colors.onSurfaceVariant }]}>
                          {t('services.range')} {selectedVariant.variant.minMeasurement} - {selectedVariant.variant.maxMeasurement}{' '}
                          <AutoTranslateText 
                            style={[styles.measurementHint, { color: theme.colors.onSurfaceVariant }]}
                            t={t}
                            {...(translateDynamicText && { translateDynamicText })}
                            {...(currentLanguage && { currentLanguage })}
                          >
                            {selectedVariant.variant.unitMeasure || t('services.units')}
                          </AutoTranslateText>
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Total Price Display */}
                  <View style={styles.totalPriceContainer}>
                    <Text variant="titleMedium" style={[styles.totalPriceLabel, { color: theme.colors.onSurface }]}>
                      {t('services.totalPrice')} €{calculateTotalPrice(selectedVariant.variant, selectedVariant.quantity).toFixed(2)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}

        {/* Input Fields and Add to Cart Button - Only show when variants are selected */}
        {Object.keys(selectedVariants).length > 0 && (
          <View style={styles.inputSection}>
            <Divider style={{ marginVertical: 16 }} />
            


            {/* Date Selection Section */}
            <View style={styles.dateSelectionSection}>
              <Divider style={{ marginVertical: 16 }} />
              
              <View style={styles.dateSelectionHeader}>
                <Text variant="titleMedium" style={[styles.dateSelectionTitle, { color: theme.colors.onSurface }]}>
                  {t('checkout.serviceDate')}
                </Text>
                <View style={styles.multiDayToggle}>
                  <Text variant="bodyMedium" style={[styles.multiDayLabel, { color: theme.colors.onSurfaceVariant }]}>
                    {t('checkout.multiDayService')}
                  </Text>
                  <Switch
                    value={isMultiDay}
                    onValueChange={setIsMultiDay}
                    color={theme.colors.primary}
                  />
                </View>
              </View>

              {isMultiDay ? (
                <MultiDateSelector
                  selectedDates={selectedDates}
                  onDatesChange={setSelectedDates}
                  serviceTime={serviceTime || new Date()}
                  onTimeChange={setServiceTime}
                  maxDays={7}
                  t={t}
                />
              ) : (
                <View style={styles.singleDateContainer}>
                  <Text variant="bodyMedium" style={[styles.singleDateText, { color: theme.colors.onSurfaceVariant }]}>
                    {t('checkout.singleDateService')}
                  </Text>
                </View>
              )}
            </View>


            {/* Add to Cart Button - Only enabled when inputs are valid */}
            <Button
              mode="contained"
              onPress={handleAddToCart}
              disabled={!hasReadyVariants() || addingToCart}
              loading={addingToCart}
              style={[
                styles.addToCartButton,
                { 
                  backgroundColor: hasReadyVariants() && !addingToCart ? theme.colors.primary : theme.colors.outline,
                }
              ]}
              contentStyle={styles.addToCartButtonContent}
              labelStyle={[
                styles.addToCartButtonLabel, 
                { 
                  color: hasReadyVariants() && !addingToCart ? theme.colors.onPrimary : theme.colors.onSurfaceVariant 
                }
              ]}
              {...(addingToCart ? {} : { icon: "cart-plus" })}
            >
              {addingToCart ? t('services.addingToCart') : t('services.addToCart')}
            </Button>
          </View>
          )}
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 8,
    borderRadius: 16,
    maxHeight: '95%',
    minHeight: '85%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden', // Prevent content from extending beyond modal boundaries
    // Ensure modal doesn't exceed screen width on small devices
    maxWidth: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    minHeight: 56, // Ensure consistent header height
  },
  modalTitle: {
    fontWeight: '700',
    flex: 1,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20, // Add bottom padding for better scrolling experience
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    minHeight: 200, // Ensure minimum height for loading state
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: 200, // Ensure minimum height for error state
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: 200, // Ensure minimum height for empty state
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  variantsList: {
    paddingHorizontal: 16,
  },
  variantCard: {
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  variantContent: {
    padding: 16,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  variantTitle: {
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  variantPrice: {
    fontWeight: '700',
    fontSize: 16,
  },
  pricingChip: {
    marginTop: 4,
  },
  variantDescription: {
    marginBottom: 8,
    lineHeight: 20,
  },
  variantDuration: {
    fontWeight: '600',
    marginBottom: 8,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  featuresChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  featureChip: {
    marginRight: 4,
    marginBottom: 4,
  },
  pricingInputs: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputLabel: {
    fontWeight: '600',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    minWidth: 40,
  },
  quantityButtonContent: {
    height: 40,
  },
  quantityText: {
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  measurementContainer: {
    marginBottom: 12,
  },
  measurementInput: {
    marginTop: 8,
  },
  measurementHint: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  totalPriceContainer: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  totalPriceLabel: {
    fontWeight: '700',
    color: '#2E7D32',
  },
  selectButton: {
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectButtonContent: {
    paddingVertical: 8,
  },
  selectButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputSection: {
    paddingHorizontal: 16,
    paddingBottom: 8, // Reduced since button now has its own margin
  },
  selectedVariantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedVariantTitle: {
    fontWeight: '600',
    flex: 1,
  },
  selectedVariantPrice: {
    fontWeight: '700',
  },
  inputFieldsContainer: {
    marginBottom: 16,
  },
  addToCartButton: {
    borderRadius: 12,
    minHeight: 48,
    marginHorizontal: 16, // Add horizontal margin to keep button within modal
    marginBottom: 16, // Add bottom margin for proper spacing
    // Ensure button doesn't exceed modal width
    maxWidth: '100%',
    alignSelf: 'stretch', // Make button stretch to fill available width
  },
  addToCartButtonContent: {
    paddingVertical: 12,
  },
  addToCartButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateSelectionSection: {
    marginTop: 16,
  },
  dateSelectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateSelectionTitle: {
    fontWeight: '700',
  },
  multiDayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  multiDayLabel: {
    marginRight: 8,
  },
  singleDateContainer: {
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  singleDateText: {
    fontStyle: 'italic',
  },
  selectedVariantsSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  selectedVariantsTitle: {
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedVariantCard: {
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selectedVariantCardContent: {
    padding: 16,
  },
  selectedVariantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedVariantCardTitle: {
    fontWeight: '600',
    flex: 1,
  },
  selectedVariantCardPrice: {
    fontWeight: '700',
  },
  quantityInputContainer: {
    marginBottom: 12,
  },
  measurementInputContainer: {
    marginBottom: 12,
  },
});

export default ServiceVariantModal;
