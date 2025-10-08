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
  t: (key: string) => string;
  translateDynamicText?: (text: string) => Promise<string>;
  currentLanguage?: string;
}

const ServiceVariantModal: React.FC<ServiceVariantModalProps> = ({
  visible,
  onDismiss,
  serviceTitle,
  serviceId,
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
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Array<{date: string; time: string; id: string}>>([]);
  const [serviceTime, setServiceTime] = useState<Date | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [numberOfBoxes, setNumberOfBoxes] = useState<string>('');

  // Check if this is a house moving service
  const isHouseMovingService = serviceTitle.toLowerCase().includes('moving') || 
                               serviceTitle.toLowerCase().includes('house') ||
                               serviceId === 'house-moving';

  // Check if this is a weekly cleaning service (mandatory multi-day booking)
  const isWeeklyCleaningService = serviceId === 'weekly-cleaning';
  
  // Check if this is a regular cleaning service (no multi-day booking allowed)
  const isCleaningService = (serviceTitle.toLowerCase().includes('cleaning') || 
                            serviceTitle.toLowerCase().includes('clean') ||
                            serviceTitle.toLowerCase().includes('deep clean') ||
                            serviceId.includes('cleaning') ||
                            serviceId.includes('clean')) && !isWeeklyCleaningService;


  // Set multi-day booking to true for weekly cleaning service
  useEffect(() => {
    if (isWeeklyCleaningService) {
      setIsMultiDay(true);
    } else {
      setIsMultiDay(false);
    }
  }, [isWeeklyCleaningService]);

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

  // Calculate house moving cost
  const calculateHouseMovingCost = (area: number, distance: number, rate: number, boxes: number = 0) => {
    const RATE_PER_KM = 0.5; // 0.5 euro per km
    const BOX_PRICE = 2.50; // €2.50 per box
    const VAT_RATE = 0.19; // 19% VAT
    
    const areaCost = rate * area;
    const distanceCost = distance * RATE_PER_KM;
    const boxesCost = boxes * BOX_PRICE;
    const subtotal = areaCost + distanceCost + boxesCost;
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;
    
    return {
      areaCost: areaCost,
      distanceCost: distanceCost,
      boxesCost: boxesCost,
      subtotal: subtotal,
      vat: vat,
      total: total,
      ratePerKm: RATE_PER_KM,
      boxPrice: BOX_PRICE,
      vatRate: VAT_RATE
    };
  };

  // Calculate total price based on pricing type
  const calculateTotalPrice = (variant: ServiceVariant, quantity: number = 1, customMeasurement?: string): number => {
    if (variant.pricingType === 'per_unit') {
      const inputValue = customMeasurement || '';
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
      const inputValue = selectedVariant.customMeasurement || '';
      const numericValue = parseFloat(inputValue);
      pricingValid = numericValue > 0 && 
             (!variant.minMeasurement || numericValue >= variant.minMeasurement) &&
             (!variant.maxMeasurement || numericValue <= variant.maxMeasurement);
    } else {
      pricingValid = true; // For other pricing types
    }

    // For house moving services, also check distance
    let distanceValid = true;
    if (isHouseMovingService) {
      const distanceValue = parseFloat(distance);
      distanceValid = distanceValue > 0;
    }

    // Check date selection for multi-day services (only for cleaning services)
    const dateValid = !isCleaningService || !isMultiDay || selectedDates.length > 0;

    return pricingValid && distanceValid && dateValid;
  };

  // Check if any variants are ready for cart
  const hasReadyVariants = (): boolean => {
    // For house moving services, check if we have area, distance, and date
    if (isHouseMovingService) {
      const hasArea = Object.keys(selectedVariants).some(variantId => {
        const selectedVariant = selectedVariants[variantId];
        if (!selectedVariant) return false;
        const variant = selectedVariant.variant;
        if (variant.pricingType === 'per_unit') {
          const inputValue = selectedVariant.customMeasurement || '';
          const numericValue = parseFloat(inputValue);
          return numericValue > 0;
        }
        return selectedVariant.quantity > 0;
      });
      const hasDistance = parseFloat(distance) > 0;
      const dateValid = !isCleaningService || !isMultiDay || selectedDates.length > 0;
      return hasArea && hasDistance && dateValid;
    }
    
    // For weekly cleaning service, require at least 2 dates and no quantity input needed
    if (isWeeklyCleaningService) {
      const hasEnoughDates = selectedDates.length >= 2;
      return hasEnoughDates;
    }
    
    // For regular services, require at least one date and valid variants
    const hasValidVariants = Object.keys(selectedVariants).some(variantId => isVariantReadyForCart(variantId));
    const hasDate = selectedDates.length > 0;
    return hasValidVariants && hasDate;
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      
      // Handle house moving service with special calculation
      if (isHouseMovingService) {
        const selectedVariant = Object.values(selectedVariants)[0];
        if (!selectedVariant) return;
        
        const variant = selectedVariant.variant;
        const area = variant.pricingType === 'per_unit' 
          ? parseFloat(selectedVariant.customMeasurement || '0')
          : selectedVariant.quantity;
        const distanceValue = parseFloat(distance);
        const boxesValue = parseFloat(numberOfBoxes) || 0;
        const rate = variant.pricingType === 'per_unit' 
          ? (variant.unitPrice || variant.price)
          : variant.price;
        
        const movingCost = calculateHouseMovingCost(area, distanceValue, rate, boxesValue);
        
        const serviceData = {
          id: variant.id,
          title: variant.title,
          description: `${variant.description} - ${t('services.area')}: ${area} ${t('services.sqm')}, ${t('services.distance')}: ${distanceValue}${t('services.km')}${boxesValue > 0 ? `, ${t('services.boxes')}: ${boxesValue}` : ''}`,
          image: '',
          category: `${serviceTitle} - ${variant.title}`,
          pricingType: 'fixed' as const,
          price: movingCost.total,
          unitPrice: movingCost.total,
          unitMeasure: '',
          minMeasurement: 0,
          maxMeasurement: 0,
          measurementStep: 1,
          measurementPlaceholder: '',
          duration: variant.duration || '',
          features: [
            `${t('services.area')}: ${area} ${t('services.sqm')}`,
            `${t('services.distance')}: ${distanceValue}${t('services.km')}`,
            ...(boxesValue > 0 ? [`${t('services.boxes')}: ${boxesValue} (€${movingCost.boxPrice.toFixed(2)} ${t('services.each')})`] : []),
            `${t('services.areaCost')}: €${movingCost.areaCost.toFixed(2)}`,
            `${t('services.distanceCost')}: €${movingCost.distanceCost.toFixed(2)}`,
            ...(boxesValue > 0 ? [`${t('services.boxesCost')}: €${movingCost.boxesCost.toFixed(2)}`] : []),
            `${t('services.subtotal')}: €${movingCost.subtotal.toFixed(2)}`,
            `${t('services.vat')} (${(movingCost.vatRate * 100).toFixed(0)}%): €${movingCost.vat.toFixed(2)}`
          ],
          displayOrder: variant.displayOrder || 0,
          isActive: true,
          serviceVariants: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const userInputs = {
          quantity: 1,
          pricingType: 'fixed',
          area: area,
          distance: distanceValue,
          boxes: boxesValue,
          movingCost: movingCost,
          isMovingService: true
        };

        await addToCart(serviceData, movingCost.total, userInputs);
        
        modalService.showSuccess(
          t('cart.itemAdded'),
          `${variant.title} ${t('cart.addedToCart')}`
        );
        
        setTimeout(() => {
          onDismiss();
        }, 2000);
        
        return;
      }

      // Handle weekly cleaning service with date-based quantity
      if (isWeeklyCleaningService) {
        if (variants.length === 0) return;
        
        const variant = variants[0]; // Use the first (and only) variant
        if (!variant) return;
        const quantity = selectedDates.length; // Quantity = number of dates
        
        const serviceData = {
          id: variant.id,
          title: variant.title,
          description: `${variant.description} - ${selectedDates.length} ${t('checkout.daysSelected')}`,
          image: '',
          category: `${serviceTitle} - ${variant.title}`,
          pricingType: 'fixed' as const,
          price: variant.price,
          unitPrice: variant.price,
          unitMeasure: '',
          minMeasurement: 0,
          maxMeasurement: 0,
          measurementStep: 1,
          measurementPlaceholder: '',
          duration: variant.duration || '',
          features: variant.features || [],
          displayOrder: variant.displayOrder || 0,
          isActive: true,
          serviceVariants: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const userInputs = {
          quantity: quantity,
          selectedDates: selectedDates,
          isMultiDay: true,
          serviceTime: serviceTime?.toISOString() || new Date().toISOString(),
          service_variant_data: {
            id: variant.id,
            title: variant.title,
            price: variant.price,
            duration: variant.duration,
            features: variant.features
          }
        };


        // Calculate total price (unit price × number of dates)
        const totalPrice = variant.price * quantity;
        await addToCart(serviceData, totalPrice, userInputs);
        
        modalService.showSuccess(
          t('cart.itemAdded'),
          `${variant.title} (${quantity} ${t('checkout.daysSelected')}) ${t('cart.addedToCart')}`
        );
        
        // Just dismiss the modal, don't navigate to cart
        setTimeout(() => {
          onDismiss();
        }, 2000);
        return;
      }
      
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
            const inputValue = selectedVariant.customMeasurement || '';
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
            price: variant.price, // Unit price for reference
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

          // For per-unit services, calculate total price. For fixed-price services, pass unit price only
          const calculatedPrice = variant.pricingType === 'per_unit' 
            ? calculateTotalPrice(variant, selectedVariant.quantity, selectedVariant.customMeasurement)
            : variant.price; // For fixed-price, pass unit price only
          await addToCart(serviceData, calculatedPrice, userInputs);
          addedVariants.push(variant.title);
        }
      }
      
      if (addedVariants.length > 0) {
        modalService.showSuccess(
        t('cart.itemAdded'),
          `${addedVariants.join(', ')} ${t('cart.addedToCart')}`
        );
        
        // Just dismiss the modal, don't navigate to cart
        setTimeout(() => {
              onDismiss();
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
              {/* Selected Variants First */}
              {Object.entries(selectedVariants).map(([variantId, selectedVariant]) => {
                const variant = selectedVariant.variant;
                return (
                  <View key={`selected-${variantId}`}>
              <Card 
                style={[
                  styles.variantCard, 
                        { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderWidth: 2 }
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
                  
                  {variant.features && variant.features.length > 0 && (
                    <View style={styles.featuresContainer}>
                        {variant.features.map((feature, index) => (
                              <View key={index} style={styles.featureItem}>
                                <Text style={{ color: theme.colors.primary, fontSize: 16 }}>✓</Text>
                            <AutoTranslateText 
                                  style={[styles.featureText, { color: theme.colors.onSurface }]}
                                  showLoading={true}
                                  loadingText={t('autoTranslate.translating')}
                              t={t}
                              {...(translateDynamicText && { translateDynamicText })}
                              {...(currentLanguage && { currentLanguage })}
                            >
                              {feature}
                            </AutoTranslateText>
                              </View>
                        ))}
                    </View>
                  )}

                  <Button
                          mode="contained"
                    onPress={() => handleVariantSelect(variant)}
                          style={[styles.selectButton, { backgroundColor: theme.colors.primary }]}
                          labelStyle={[styles.selectButtonLabel, { color: theme.colors.onPrimary }]}
                    icon="check"
                  >
                          {t('services.selected')}
                  </Button>
                </Card.Content>
              </Card>

                    {/* Configuration for this selected variant */}
                    <Card style={[styles.selectedVariantCard, { backgroundColor: theme.colors.surface, marginTop: 8 }]}>
                      <Card.Content style={styles.selectedVariantCardContent}>
                        <View style={styles.selectedVariantHeader}>
                          <Text variant="titleMedium" style={[styles.selectedVariantCardTitle, { color: theme.colors.onSurface }]}>
                            {t('services.configure')} {variant.title}
            </Text>
                  </View>

                        {/* Quantity Input for Fixed Pricing - Hidden for Weekly Cleaning */}
                        {variant.pricingType === 'fixed' && !isWeeklyCleaningService && (
                          <View style={styles.quantityInputContainer}>
                  <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                              {t('services.quantity')}:
                  </Text>
                  <View style={styles.quantityControls}>
                    <Button
                      mode="outlined"
                                onPress={() => handleQuantityChange(variantId, Math.max(1, selectedVariant.quantity - 1))}
                      style={styles.quantityButton}
                                labelStyle={styles.quantityButtonLabel}
                    >
                      -
                    </Button>
                              <Text variant="titleMedium" style={[styles.quantity, { color: theme.colors.onSurface }]}>
                                {selectedVariant.quantity}
                    </Text>
                    <Button
                      mode="outlined"
                                onPress={() => handleQuantityChange(variantId, selectedVariant.quantity + 1)}
                      style={styles.quantityButton}
                                labelStyle={styles.quantityButtonLabel}
                    >
                      +
                    </Button>
                  </View>
                </View>
              )}

                        {/* Date-based Quantity Display for Weekly Cleaning */}
                        {isWeeklyCleaningService && (
                          <View style={styles.quantityInputContainer}>
                            <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                              {t('checkout.daysSelected')}:
                            </Text>
                            <Text variant="titleMedium" style={[styles.quantity, { color: theme.colors.primary }]}>
                              {selectedDates.length}
                            </Text>
                          </View>
                        )}

                        {/* Measurement Input for Per-Unit Pricing */}
                        {variant.pricingType === 'per_unit' && (
                          <View style={styles.measurementInputContainer}>
                  <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
                              {variant.measurementPlaceholder || t('services.measurement')}:
                  </Text>
                  <TextInput
                    mode="outlined"
                              value={selectedVariant.customMeasurement || ''}
                              onChangeText={(text) => handleMeasurementChange(variantId, text)}
                              placeholder={variant.measurementPlaceholder || t('services.enterMeasurement')}
                    keyboardType="numeric"
                    style={styles.measurementInput}
                              error={!isVariantReadyForCart(variantId) && selectedVariant.customMeasurement !== ''}
                            />
                            <View style={styles.measurementInfoContainer}>
                              {variant.unitMeasure && (
                                <Text variant="bodySmall" style={[styles.unitMeasure, { color: theme.colors.onSurfaceVariant }]}>
                                  {variant.unitMeasure}
                                </Text>
                              )}
                              {variant.minMeasurement && (
                                <Text variant="bodySmall" style={[styles.minMeasurementText, { color: theme.colors.primary }]}>
                                  {t('services.minimum')}: {variant.minMeasurement} {variant.unitMeasure || t('services.units')}
                    </Text>
                  )}
                            </View>
                </View>
              )}

                        {/* Price Calculation and Total Price Display */}
              <View style={styles.totalPriceContainer}>
                          {/* Show calculation details for per-unit pricing */}
                          {variant.pricingType === 'per_unit' && selectedVariant.customMeasurement && (
                            <View style={styles.calculationContainer}>
                              <Text variant="bodyMedium" style={[styles.calculationText, { color: theme.colors.onSurfaceVariant }]}>
                                {t('services.measurement')}: {selectedVariant.customMeasurement} {variant.unitMeasure || t('services.units')} × €{variant.unitPrice || variant.price}/{variant.unitMeasure || t('services.units')} = €{calculateTotalPrice(variant, selectedVariant.quantity, selectedVariant.customMeasurement).toFixed(2)}
                </Text>
              </View>
                          )}
                          
                          {/* Show calculation details for fixed pricing with quantity > 1 */}
                          {variant.pricingType === 'fixed' && selectedVariant.quantity > 1 && (
                            <View style={styles.calculationContainer}>
                              <Text variant="bodyMedium" style={[styles.calculationText, { color: theme.colors.onSurfaceVariant }]}>
                                {t('services.quantity')}: {selectedVariant.quantity} × €{variant.price} = €{calculateTotalPrice(variant, selectedVariant.quantity, selectedVariant.customMeasurement).toFixed(2)}
                              </Text>
            </View>
                          )}

                          {/* Show calculation details for weekly cleaning */}
                          {isWeeklyCleaningService && selectedDates.length > 0 && (
                            <View style={styles.calculationContainer}>
                              <Text variant="bodyMedium" style={[styles.calculationText, { color: theme.colors.onSurfaceVariant }]}>
                                {t('checkout.daysSelected')}: {selectedDates.length} × €{variant.price} = €{(selectedDates.length * variant.price).toFixed(2)}
                              </Text>
                            </View>
                          )}
                          
                          <Text variant="titleMedium" style={[styles.totalPriceLabel, { color: theme.colors.primary }]}>
                            {t('services.totalPrice')} €{isWeeklyCleaningService ? (selectedDates.length * variant.price).toFixed(2) : calculateTotalPrice(variant, selectedVariant.quantity, selectedVariant.customMeasurement).toFixed(2)}
                          </Text>
                        </View>
                      </Card.Content>
                    </Card>
                  </View>
                );
              })}

              {/* Distance Input for House Moving Services */}
              {isHouseMovingService && Object.keys(selectedVariants).length > 0 && (
                <Card style={[styles.distanceInputCard, { backgroundColor: theme.colors.surface }]}>
                  <Card.Content style={styles.distanceInputContent}>
                    <Text variant="titleMedium" style={[styles.distanceInputTitle, { color: theme.colors.onSurface }]}>
                      {t('services.distanceInput')}
                    </Text>
                    <TextInput
                      mode="outlined"
                      value={distance}
                      onChangeText={setDistance}
                      placeholder={t('services.enterDistance')}
                      keyboardType="numeric"
                      style={styles.distanceInput}
                      error={!parseFloat(distance) && distance !== ''}
                    />
                    <Text variant="bodySmall" style={[styles.distanceHint, { color: theme.colors.onSurfaceVariant }]}>
                      {t('services.distanceHint')}
                    </Text>
                    
                    {/* Boxes Input */}
                    <Text variant="titleMedium" style={[styles.boxesInputTitle, { color: theme.colors.onSurface }]}>
                      {t('services.boxesInput')} ({t('services.optional')})
                    </Text>
                    <TextInput
                      mode="outlined"
                      value={numberOfBoxes}
                      onChangeText={setNumberOfBoxes}
                      placeholder={t('services.enterNumberOfBoxes')}
                      keyboardType="numeric"
                      style={styles.boxesInput}
                      error={!parseFloat(numberOfBoxes) && numberOfBoxes !== ''}
                    />
                    <Text variant="bodySmall" style={[styles.boxesHint, { color: theme.colors.onSurfaceVariant }]}>
                      {t('services.boxesHint')}
                    </Text>
                    
                    {/* Show calculation if both area and distance are provided */}
                    {Object.keys(selectedVariants).length > 0 && distance && parseFloat(distance) > 0 && (
                      <View style={styles.movingCalculationContainer}>
                        <Text variant="titleSmall" style={[styles.calculationTitle, { color: theme.colors.onSurface }]}>
                          {t('services.costBreakdown')}
                        </Text>
                        {Object.values(selectedVariants).map((selectedVariant, index) => {
                          const variant = selectedVariant.variant;
                          const area = variant.pricingType === 'per_unit' 
                            ? parseFloat(selectedVariant.customMeasurement || '0')
                            : selectedVariant.quantity;
                          const distanceValue = parseFloat(distance);
                          const boxesValue = parseFloat(numberOfBoxes) || 0;
                          const rate = variant.pricingType === 'per_unit' 
                            ? (variant.unitPrice || variant.price)
                            : variant.price;
                          const movingCost = calculateHouseMovingCost(area, distanceValue, rate, boxesValue);
                          
                          return (
                            <View key={index} style={styles.calculationDetails}>
                              <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                                {t('services.area')}: {area} {t('services.sqm')} × €{rate.toFixed(2)}/{t('services.sqm')} = €{movingCost.areaCost.toFixed(2)}
                              </Text>
                              <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                                {t('services.distance')}: {distanceValue}{t('services.km')} × €0.5/{t('services.km')} = €{movingCost.distanceCost.toFixed(2)}
                              </Text>
                              {boxesValue > 0 && (
                                <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                                  {t('services.boxes')}: {boxesValue} × €{movingCost.boxPrice.toFixed(2)} = €{movingCost.boxesCost.toFixed(2)}
                                </Text>
                              )}
                              <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                                {t('services.subtotal')}: €{movingCost.areaCost.toFixed(2)} + €{movingCost.distanceCost.toFixed(2)}{boxesValue > 0 ? ` + €${movingCost.boxesCost.toFixed(2)}` : ''} = €{movingCost.subtotal.toFixed(2)}
                              </Text>
                              <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                                {t('services.vat')} (19%): €{movingCost.vat.toFixed(2)}
                              </Text>
                              <Text variant="titleMedium" style={[styles.calculationTotal, { color: theme.colors.primary }]}>
                                {t('services.total')}: €{movingCost.total.toFixed(2)}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </Card.Content>
                </Card>
              )}

              {/* Date Selection and Add to Cart - Show after all selected variants */}
              {Object.keys(selectedVariants).length > 0 && (
                <>
            {/* Date Selection Section */}
            <View style={styles.dateSelectionSection}>
              <Divider style={{ marginVertical: 16 }} />
              
              <View style={styles.dateSelectionHeader}>
                <Text variant="titleMedium" style={[styles.dateSelectionTitle, { color: theme.colors.onSurface }]}>
                  {t('checkout.serviceDate')}
                </Text>
      {/* Multi-day toggle is only available for weekly cleaning service */}
      {isWeeklyCleaningService && (
        <View style={styles.multiDayToggle}>
          <Text variant="bodyMedium" style={[styles.multiDayLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('checkout.multiDayService')} (Required)
          </Text>
          <Switch
            value={isMultiDay}
            onValueChange={setIsMultiDay}
            color={theme.colors.primary}
            disabled={true} // Always enabled for weekly cleaning
          />
        </View>
      )}
              </View>

              {isWeeklyCleaningService ? (
                <>
                  <MultiDateSelector
                    selectedDates={selectedDates}
                    onDatesChange={setSelectedDates}
                    serviceTime={serviceTime || new Date()}
                    onTimeChange={setServiceTime}
                    maxDays={7}
                    t={t}
                  />
                  {selectedDates.length > 0 && selectedDates.length < 2 && (
                    <Text variant="bodySmall" style={[styles.validationText, { color: theme.colors.error }]}>
                      Minimum 2 dates required for weekly cleaning service
                    </Text>
                  )}
                </>
              ) : (
                <View style={styles.singleDateContainer}>
                  <Text variant="bodyMedium" style={[styles.singleDateText, { color: theme.colors.onSurfaceVariant }]}>
                    {isCleaningService ? t('checkout.singleDateService') : t('checkout.singleDayService')}
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      // For single date selection, we'll use the first date from selectedDates or create a new one
                      if (selectedDates.length === 0) {
                        const today = new Date();
                        const isoString = today.toISOString();
                        const dateString = isoString.split('T')[0] || '';
                        const timeString = today.toTimeString().split(' ')[0]?.substring(0, 5) || '09:00';
                        setSelectedDates([{
                          id: `date_${Date.now()}`,
                          date: dateString,
                          time: timeString
                        }]);
                      }
                    }}
                    style={styles.datePickerButton}
                    labelStyle={styles.datePickerButtonLabel}
                  >
                    {selectedDates.length > 0 
                      ? new Date(selectedDates[0]?.date || '').toLocaleDateString()
                      : t('checkout.selectDate')
                    }
                  </Button>
                </View>
              )}
            </View>

                  {/* Add to Cart Button */}
                  <View style={styles.inputSection}>
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
                </>
              )}

              {/* Unselected Variants */}
              {variants
                .filter(variant => !selectedVariants[variant.id])
                .map((variant) => (
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
  calculationContainer: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  calculationText: {
    textAlign: 'center',
    fontStyle: 'italic',
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
    marginBottom: 12,
  },
  datePickerButton: {
    marginTop: 8,
  },
  datePickerButtonLabel: {
    fontSize: 14,
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
  measurementInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  minMeasurementText: {
    fontWeight: '500',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    flex: 1,
  },
  quantityButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  quantity: {
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  unitMeasure: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  distanceInputCard: {
    marginTop: 16,
    marginBottom: 16,
  },
  distanceInputContent: {
    paddingVertical: 16,
  },
  distanceInputTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  distanceInput: {
    marginBottom: 8,
  },
  distanceHint: {
    fontStyle: 'italic',
    marginBottom: 16,
  },
  boxesInputTitle: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 12,
  },
  boxesInput: {
    marginBottom: 8,
  },
  boxesHint: {
    fontStyle: 'italic',
    marginBottom: 16,
  },
  movingCalculationContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  calculationTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  calculationDetails: {
    marginBottom: 8,
  },
  calculationLine: {
    marginBottom: 4,
  },
  calculationTotal: {
    fontWeight: '700',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  validationText: {
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default ServiceVariantModal;
