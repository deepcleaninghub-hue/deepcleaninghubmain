/**
 * Variant Configuration Component
 * Handles quantity, measurement, distance, and boxes inputs based on pricing type
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, TextInput, useTheme, Divider } from 'react-native-paper';
import { ServiceVariant } from './ServiceVariantSelector';
import { getPricingType, calculateTotalPrice, calculateHouseMovingCost } from '../utils/priceCalculations';
import { validateNumericInput } from '../utils/validations';

interface VariantConfigurationProps {
  variant: ServiceVariant;
  quantity: string;
  measurement: string;
  distance: string;
  numberOfBoxes: string;
  onQuantityChange: (value: string) => void;
  onMeasurementChange: (value: string) => void;
  onDistanceChange: (value: string) => void;
  onBoxesChange: (value: string) => void;
  isHouseMoving: boolean;
}

export function VariantConfiguration({
  variant,
  quantity,
  measurement,
  distance,
  numberOfBoxes,
  onQuantityChange,
  onMeasurementChange,
  onDistanceChange,
  onBoxesChange,
  isHouseMoving,
}: VariantConfigurationProps) {
  const theme = useTheme();
  const pricingType = getPricingType(variant);
  const totalPrice = calculateTotalPrice(
    variant,
    pricingType,
    quantity,
    measurement,
    distance,
    numberOfBoxes,
    isHouseMoving
  );

  const handleQuantityChange = (text: string) => {
    const result = validateNumericInput(text, true);
    if (result.isValid) {
      onQuantityChange(text);
    }
  };

  const handleMeasurementChange = (text: string) => {
    const result = validateNumericInput(text, true);
    if (result.isValid) {
      onMeasurementChange(text);
    }
  };

  const handleDistanceChange = (text: string) => {
    const result = validateNumericInput(text, true);
    if (result.isValid) {
      onDistanceChange(text);
    }
  };

  const handleBoxesChange = (text: string) => {
    const result = validateNumericInput(text, false);
    if (result.isValid) {
      onBoxesChange(text);
    }
  };

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
          {variant.title}
        </Text>
        {variant.description && (
          <Text variant="bodyMedium" style={[styles.description, { color: theme.colors.onSurfaceVariant }]}>
            {variant.description}
          </Text>
        )}
        <Divider style={styles.divider} />

        {/* Quantity Input for Fixed Pricing */}
        {pricingType === 'fixed' && !isHouseMoving && (
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
              Quantity:
            </Text>
            <TextInput
              mode="outlined"
              value={quantity}
              onChangeText={handleQuantityChange}
              placeholder="Enter quantity"
              keyboardType="decimal-pad"
              style={styles.input}
              error={
                quantity !== '' ? (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) : false
              }
            />
          </View>
        )}

        {/* Measurement Input for Per-Unit Pricing */}
        {pricingType === 'per_unit' && (
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
              {variant.unitMeasure || 'Measurement'}:
            </Text>
            <TextInput
              mode="outlined"
              value={measurement}
              onChangeText={handleMeasurementChange}
              placeholder={variant.measurementPlaceholder || `Enter ${variant.unitMeasure || 'measurement'}`}
              keyboardType="decimal-pad"
              style={styles.input}
              error={
                measurement !== ''
                  ? (isNaN(parseFloat(measurement)) ||
                      parseFloat(measurement) <= 0 ||
                      (variant.minMeasurement !== undefined && parseFloat(measurement) < variant.minMeasurement) ||
                      (variant.maxMeasurement !== undefined && parseFloat(measurement) > variant.maxMeasurement))
                  : false
              }
            />
            <View style={styles.measurementInfo}>
              {variant.unitMeasure && (
                <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                  Unit: {variant.unitMeasure}
                </Text>
              )}
              {variant.minMeasurement && (
                <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.primary }]}>
                  Minimum: {variant.minMeasurement} {variant.unitMeasure || 'units'}
                </Text>
              )}
              {variant.maxMeasurement && (
                <Text variant="bodySmall" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
                  Maximum: {variant.maxMeasurement} {variant.unitMeasure || 'units'}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Distance and Boxes Input for House Moving Services */}
        {isHouseMoving && (
          <View style={styles.inputContainer}>
            <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface }]}>
              Distance (km) *:
            </Text>
            <TextInput
              mode="outlined"
              value={distance}
              onChangeText={handleDistanceChange}
              placeholder="Enter distance in kilometers"
              keyboardType="decimal-pad"
              style={styles.input}
              error={distance !== '' && (isNaN(parseFloat(distance)) || parseFloat(distance) <= 0)}
            />

            <Text variant="bodyMedium" style={[styles.inputLabel, { color: theme.colors.onSurface, marginTop: 16 }]}>
              Number of Boxes (Optional):
            </Text>
            <TextInput
              mode="outlined"
              value={numberOfBoxes}
              onChangeText={handleBoxesChange}
              placeholder="Enter number of boxes"
              keyboardType="number-pad"
              style={styles.input}
              error={numberOfBoxes !== '' && (isNaN(parseInt(numberOfBoxes)) || parseInt(numberOfBoxes) < 0)}
            />
          </View>
        )}

        {/* Price Calculation Display */}
        <View style={[styles.priceContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
          {/* Calculation details for per-unit pricing */}
          {pricingType === 'per_unit' && measurement && parseFloat(measurement) > 0 && (
            <View style={styles.calculationDetails}>
              <Text variant="bodyMedium" style={[styles.calculationText, { color: theme.colors.onSurfaceVariant }]}>
                {measurement} {variant.unitMeasure || 'units'} × €{variant.unitPrice || variant.price}/{variant.unitMeasure || 'unit'} = €{totalPrice.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Calculation details for fixed pricing with quantity > 1 */}
          {pricingType === 'fixed' && parseFloat(quantity || '1') > 1 && !isHouseMoving && (
            <View style={styles.calculationDetails}>
              <Text variant="bodyMedium" style={[styles.calculationText, { color: theme.colors.onSurfaceVariant }]}>
                Quantity: {quantity} × €{variant.price} = €{totalPrice.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Cost breakdown for house moving services */}
          {isHouseMoving && distance && parseFloat(distance) > 0 && (
            <View style={styles.movingCalculationContainer}>
              {(() => {
                const area = pricingType === 'per_unit' ? parseFloat(measurement || '0') : parseFloat(quantity || '1');
                const distanceValue = parseFloat(distance);
                const boxesValue = parseFloat(numberOfBoxes) || 0;
                const rate = pricingType === 'per_unit' ? (variant.unitPrice || variant.price || 0) : (variant.price || 0);
                const movingCost = calculateHouseMovingCost(area, distanceValue, rate, boxesValue);

                return (
                  <View style={styles.calculationDetails}>
                    <Text variant="titleSmall" style={[styles.calculationTitle, { color: theme.colors.onSurface }]}>
                      Cost Breakdown:
                    </Text>
                    <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                      Area: {area} sqm × €{rate.toFixed(2)}/sqm = €{movingCost.areaCost.toFixed(2)}
                    </Text>
                    <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                      Distance: {distanceValue}km × €0.5/km = €{movingCost.distanceCost.toFixed(2)}
                    </Text>
                    {boxesValue > 0 && (
                      <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                        Boxes: {boxesValue} × €{movingCost.boxPrice.toFixed(2)} = €{movingCost.boxesCost.toFixed(2)}
                      </Text>
                    )}
                    <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                      Subtotal: €{movingCost.areaCost.toFixed(2)} + €{movingCost.distanceCost.toFixed(2)}{boxesValue > 0 ? ` + €${movingCost.boxesCost.toFixed(2)}` : ''} = €{movingCost.subtotal.toFixed(2)}
                    </Text>
                    <Text variant="bodyMedium" style={[styles.calculationLine, { color: theme.colors.onSurfaceVariant }]}>
                      VAT (19%): €{movingCost.vat.toFixed(2)}
                    </Text>
                  </View>
                );
              })()}
            </View>
          )}

          {/* Total Price Display */}
          <View style={styles.totalPriceContainer}>
            <Text variant="titleMedium" style={[styles.totalPriceLabel, { color: theme.colors.primary }]}>
              Total Price: €{totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    marginBottom: 8,
  },
  measurementInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
  },
  priceContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  calculationDetails: {
    marginBottom: 12,
  },
  calculationText: {
    fontSize: 14,
  },
  calculationTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  calculationLine: {
    fontSize: 14,
    marginBottom: 4,
  },
  movingCalculationContainer: {
    marginTop: 8,
  },
  totalPriceContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalPriceLabel: {
    fontWeight: '700',
    fontSize: 18,
  },
});

