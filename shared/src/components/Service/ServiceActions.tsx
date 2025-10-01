/**
 * Service Actions Component
 * 
 * Handles service action buttons (View, Add to Cart, etc.).
 */

import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Service, BaseComponentProps } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppModal } from '../../hooks/useAppModal';

interface ServiceActionsProps extends BaseComponentProps {
  service: Service;
  isInCart: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  onViewService?: () => void;
  onAddToCart?: () => void;
  onSelectService?: () => void;
}

export const ServiceActions: React.FC<ServiceActionsProps> = ({
  service,
  isInCart,
  loading,
  isAuthenticated,
  onViewService,
  onAddToCart,
  onSelectService,
  testID = 'service-actions',
  accessibilityLabel = 'Service actions',
}) => {
  const theme = useTheme();
  const { t } = useLanguage();
  const { showError } = useAppModal();

  const handleViewService = useCallback(() => {
    if (onViewService) {
      onViewService();
    } else {
      showError(t('services.serviceDetails'), `${t('services.viewingDetails')} ${service.title}`);
    }
  }, [onViewService, service.title, t, showError]);

  const handleAddToCart = useCallback(() => {
    if (!isAuthenticated) {
      showError(t('auth.loginRequired'), t('cart.loginToAddItems'));
      return;
    }

    if (onAddToCart) {
      onAddToCart();
    }
  }, [isAuthenticated, onAddToCart, t, showError]);

  const handleSelectService = useCallback(() => {
    if (onSelectService) {
      onSelectService();
    }
  }, [onSelectService]);

  const getButtonText = () => {
    if (isInCart) return 'In Cart';
    if (service.serviceVariants && service.serviceVariants.length > 1) return 'Choose Option';
    return 'Add to Cart';
  };

  const getButtonIcon = () => {
    if (isInCart) return 'checkmark';
    if (service.serviceVariants && service.serviceVariants.length > 1) return 'options';
    return 'cart';
  };

  const handleMainAction = () => {
    if (service.serviceVariants && service.serviceVariants.length > 1) {
      handleSelectService();
    } else if (service.pricingType === 'per_unit') {
      handleAddToCart();
    } else {
      handleAddToCart();
    }
  };

  return (
    <View 
      style={styles.container}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <Button
        mode="outlined"
        onPress={handleViewService}
        style={[styles.button, styles.viewButton]}
        contentStyle={styles.buttonContent}
        icon={({ size, color }) => (
          <Ionicons name="arrow-forward" size={size} color={color} />
        )}
        testID={`${testID}-view-button`}
      >
        View
      </Button>
      
      {isAuthenticated && (
        <Button
          mode="contained"
          onPress={handleMainAction}
          style={[styles.button, styles.cartButton]}
          contentStyle={styles.buttonContent}
          disabled={loading || isInCart}
          loading={loading}
          icon={({ size, color }) => (
            <Ionicons 
              name={getButtonIcon()} 
              size={size} 
              color={color} 
            />
          )}
          testID={`${testID}-cart-button`}
        >
          {getButtonText()}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    borderRadius: 8,
    flex: 1,
  },
  viewButton: {
    flex: 1,
  },
  cartButton: {
    flex: 2,
  },
  buttonContent: {
    paddingVertical: 4,
  },
});
