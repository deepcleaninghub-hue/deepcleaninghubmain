// Enhanced with comprehensive color palette: #F9F7F7, #DBE2EF, #3F72AF, #112D4E
import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Platform } from 'react-native';
import { Text, Card, Button, Chip, Divider, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import AutoTranslateText from '../../components/AutoTranslateText';
import { CartStackScreenProps } from '../../navigation/types';
import AppModal from '../../components/common/AppModal';
import { useAppModal } from '../../hooks/useAppModal';
import ServiceCategoryCard from '../../components/ServiceCategoryCard';

type Props = CartStackScreenProps<'CartMain'>;

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { 
    cartItems, 
    cartSummary, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    refreshCart
  } = useCart();
  const { modalConfig, visible, hideModal, showError } = useAppModal();

  // Main service categories - same as in ServicesScreen
  const mainServiceCategories = [
    {
      id: 'cleaning',
      title: t('services.cleaning'),
      image: require('../../../assets/services/cleaning-image.jpeg'),
      category: 'Cleaning',
    },
    {
      id: 'furniture-assembly',
      title: t('services.furnitureAssembly'),
      image: require('../../../assets/services/furniture-image.jpeg'),
      category: 'Furniture Assembly',
    },
    {
      id: 'furniture-disassembly',
      title: t('services.furnitureDisassembly'),
      image: require('../../../assets/services/furniture-image.jpeg'),
      category: 'Furniture Disassembly',
    },
    {
      id: 'moving',
      title: t('services.moving'),
      image: require('../../../assets/services/moving.jpeg'),
      category: 'Moving',
    },
    {
      id: 'office-setup',
      title: t('services.officeSetup'),
      image: require('../../../assets/services/office-setup-image.jpeg'),
      category: 'Office Setup',
    },
    {
      id: 'house-painting',
      title: t('services.housePainting'),
      image: require('../../../assets/services/paint-image.jpeg'),
      category: 'House Painting',
    },
  ];

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showError(t('cart.loginRequired'), t('cart.loginToCheckout'));
      return;
    }
    navigation.navigate('Checkout');
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleServiceCardPress = (service: any) => {
    // Navigate to Services tab and then to the specific category
    // We need to use the parent navigator to switch tabs
    const parentNavigation = navigation.getParent();
    if (parentNavigation) {
      parentNavigation.navigate('Services', {
        screen: 'ServiceCategory',
        params: {
          categoryId: service.id,
          categoryTitle: service.title,
        },
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title={t('cart.title')} />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={theme.colors.outline} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            {t('cart.pleaseLogin')}
          </Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {t('cart.loginToViewCart')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title={t('cart.title')} />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={theme.colors.outline} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            {t('cart.emptyCart')}
          </Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            {t('cart.addItems')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
        <AppHeader title={t('cart.title')} />

      {/* Manual Refresh Button */}
      <View style={styles.refreshButtonContainer}>
        <Button
          mode="outlined"
          icon="refresh"
          onPress={() => {
            console.log('🔄 Manual refresh button pressed');
            refreshCart(true);
          }}
          disabled={loading}
          compact
          style={styles.refreshButton}
        >
          {loading ? t('cart.refreshing') : t('cart.refreshCart')}
        </Button>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={() => {
              console.log('🔄 RefreshControl triggered on Android');
              refreshCart(true);
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
            progressBackgroundColor={theme.colors.surface}
            title={t('cart.pullToRefresh')}
            titleColor={theme.colors.onSurface}
          />
        }
      >
        {/* Cart Items */}
        {cartItems.map((item, index) => (
          <Card key={item.id} style={[styles.cartItemCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.cartItemContent}>
              <View style={styles.itemInfo}>
                <Text variant="titleMedium" style={[styles.itemName, { color: theme.colors.onSurface }]}>
                  {item.service_title || item.title || t('cart.service')}
                </Text>
                <Text variant="bodyMedium" style={[styles.itemDuration, { color: theme.colors.onSurfaceVariant }]}>
                  {t('cart.description')} {item.service_description || item.description || t('cart.noDescriptionAvailable')}
                </Text>
                <Text variant="bodyMedium" style={[styles.itemCategory, { color: theme.colors.onSurfaceVariant }]}>
                  {t('cart.serviceId')} {item.service_id || item.serviceId || t('cart.unknown')}
                </Text>
                {/* Display all user inputs */}
                {item.user_inputs && Object.keys(item.user_inputs).length > 0 && (
                  <View style={styles.userInputsContainer}>
                    <Text variant="bodySmall" style={[styles.userInputsTitle, { color: theme.colors.onSurfaceVariant }]}>
                      {t('cart.serviceDetails')}:
                    </Text>
                    
                    {/* Quantity */}
                    {item.user_inputs.quantity && (
                      <Text variant="bodySmall" style={[styles.userInputText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('cart.quantity')}: {item.user_inputs.quantity}
                      </Text>
                    )}
                    
                    {/* Measurement for per-unit services */}
                    {item.user_inputs.measurement && (
                      <Text variant="bodySmall" style={[styles.userInputText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('cart.measurement')}: {item.user_inputs.measurement} {item.user_inputs.unit_measure || 'units'}
                      </Text>
                    )}
                    
                    {/* House moving specific inputs */}
                    {item.user_inputs.area && (
                      <Text variant="bodySmall" style={[styles.userInputText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('cart.area')}: {item.user_inputs.area} sqm
                      </Text>
                    )}
                    
                    {item.user_inputs.distance && (
                      <Text variant="bodySmall" style={[styles.userInputText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('cart.distance')}: {item.user_inputs.distance} km
                      </Text>
                    )}
                    
                    {item.user_inputs.boxes && item.user_inputs.boxes > 0 && (
                      <Text variant="bodySmall" style={[styles.userInputText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('cart.boxes')}: {item.user_inputs.boxes} ({t('cart.boxesCost')}: €{(item.user_inputs.boxes * 2.50).toFixed(2)})
                      </Text>
                    )}
                    
                    {/* Multi-day booking */}
                    {item.user_inputs.isMultiDay && item.user_inputs.selectedDates && (
                      <Text variant="bodySmall" style={[styles.userInputText, { color: theme.colors.onSurfaceVariant }]}>
                        {t('cart.multiDayBooking')}: {item.user_inputs.selectedDates.length} {t('cart.days')}
                      </Text>
                    )}


                    
                  </View>
                )}
                <Text variant="titleLarge" style={[styles.itemPrice, { color: theme.colors.primary }]}>
                  €{((item.calculated_price || item.service_price || 0)).toFixed(2)}
                </Text>
              </View>
                  
              <View style={styles.itemActions}>
                <View style={styles.quantityControls}>
                  <IconButton
                    icon="minus"
                    size={20}
                    onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    style={styles.quantityButton}
                    disabled={loading}
                  />
                  <Text variant="titleMedium" style={[styles.quantity, { color: theme.colors.onSurface }]}>
                    {item.quantity}
                  </Text>
                  <IconButton
                    icon="plus"
                    size={20}
                    onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    style={styles.quantityButton}
                    disabled={loading}
                  />
                </View>
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor={theme.colors.error}
                  onPress={() => removeFromCart(item.id)}
                  style={styles.deleteButton}
                  disabled={loading}
                />
              </View>
            </Card.Content>
            {index < cartItems.length - 1 && <Divider />}
          </Card>
        ))}

        {/* Order Summary */}
        <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={[styles.summaryTitle, { color: theme.colors.onSurface }]}>
              {t('cart.orderSummary')}
            </Text>
            <View style={styles.summaryRow}>
              <Text variant="titleLarge" style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
                {t('cart.total')}
              </Text>
              <Text variant="titleLarge" style={[styles.totalValue, { color: theme.colors.primary }]}>
                €{(cartSummary?.totalPrice || 0).toFixed(2)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button 
            mode="outlined" 
            onPress={handleClearCart}
            icon="delete-sweep"
            style={styles.clearButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.clearButtonLabel}
            disabled={loading}
          >
            {t('cart.clearCart')}
          </Button>
          <Button 
            mode="contained" 
            onPress={handleCheckout}
            icon="cart-check"
            style={styles.checkoutButton}
            contentStyle={styles.buttonContent}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="small" color="white" /> : t('cart.proceedToCheckout')}
          </Button>
        </View>

        {/* Add More Services Section */}
        <View style={styles.addMoreServicesSection}>
          <Text variant="titleMedium" style={[styles.addMoreTitle, { color: theme.colors.onSurface }]}>
            {t('cart.addMoreServices')}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            style={styles.horizontalScroll}
          >
            {mainServiceCategories.map((service) => (
              <ServiceCategoryCard
                key={service.id}
                id={service.id}
                title={service.title}
                image={service.image}
                onPress={() => handleServiceCardPress(service)}
                compact={true}
                showButton={false}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      
      {/* App Modal */}
      {modalConfig && (
        <AppModal
          visible={visible}
          onDismiss={hideModal}
          title={modalConfig.title}
          message={modalConfig.message}
          type={modalConfig.type}
          showCancel={modalConfig.showCancel}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          onConfirm={modalConfig.onConfirm}
          onCancel={modalConfig.onCancel}
          icon={modalConfig.icon}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7F7',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#112D4E',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  itemCount: {
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  refreshButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F9F7F7',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  refreshButton: {
    alignSelf: 'flex-start',
  },
  cartItemCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#112D4E',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cartItemContent: {
    paddingVertical: 16,
  },
  itemInfo: {
    marginBottom: 16,
  },
  itemName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDuration: {
    marginBottom: 8,
  },
  itemCategory: {
    marginTop: 4,
    fontSize: 12,
  },
  measurementText: {
    fontWeight: '500',
    marginBottom: 8,
  },
  userInputsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 6,
  },
  userInputsTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  userInputText: {
    marginBottom: 2,
    fontSize: 12,
  },
  itemPrice: {
    fontWeight: '700',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    margin: 0,
  },
  quantity: {
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    margin: 0,
  },
  summaryCard: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#112D4E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontWeight: '500',
  },
  summaryValue: {
    fontWeight: '600',
  },
  summaryDivider: {
    marginVertical: 12,
  },
  totalLabel: {
    fontWeight: '700',
  },
  totalValue: {
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    alignItems: 'stretch',
  },
  addMoreServicesSection: {
    marginBottom: 32,
  },
  addMoreTitle: {
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  horizontalScroll: {
    marginHorizontal: -8,
  },
  horizontalScrollContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  clearButton: {
    flex: 1.3,
    borderRadius: 12,
    minHeight: 48,
  },
  clearButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkoutButton: {
    flex: 1.7,
    borderRadius: 12,
    minHeight: 48,
  },
  buttonContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default CartScreen;