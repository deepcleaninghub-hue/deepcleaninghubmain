import React from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, Alert, Platform } from 'react-native';
import { Text, Card, Button, Chip, Divider, useTheme, IconButton, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { CartStackScreenProps } from '../../navigation/types';

type Props = CartStackScreenProps<'CartMain'>;

export const CartScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { 
    cartItems, 
    cartSummary, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    refreshCart
  } = useCart();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to proceed to checkout');
      return;
    }
    navigation.navigate('Checkout');
  };

  const handleClearCart = () => {
    clearCart();
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Cart" />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={theme.colors.outline} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Please Login
          </Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            You need to be logged in to view your cart
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Cart" />
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={theme.colors.outline} />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Your Cart is Empty
          </Text>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Add some services to get started
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Cart" />

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
          {loading ? 'Refreshing...' : 'Refresh Cart'}
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
            title="Pull to refresh"
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
                  {item.service_title || item.title || 'Service'}
                </Text>
                <Text variant="bodyMedium" style={[styles.itemDuration, { color: theme.colors.onSurfaceVariant }]}>
                  Description: {item.service_description || item.description || 'No description available'}
                </Text>
                <Text variant="bodyMedium" style={[styles.itemCategory, { color: theme.colors.onSurfaceVariant }]}>
                  Service ID: {item.service_id || item.serviceId || 'Unknown'}
                </Text>
                {item.user_inputs && item.user_inputs.measurement && (
                  <Text variant="bodySmall" style={[styles.measurementText, { color: theme.colors.primary }]}>
                    {item.user_inputs.measurement} {item.user_inputs.unit_measure} × €{item.user_inputs.unit_price}/sqm
                  </Text>
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
              Order Summary
            </Text>
            <View style={styles.summaryRow}>
              <Text variant="titleLarge" style={[styles.totalLabel, { color: theme.colors.onSurface }]}>
                Total
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
            disabled={loading}
          >
            Clear Cart
          </Button>
          <Button 
            mode="contained" 
            onPress={handleCheckout}
            icon="cart-check"
            style={styles.checkoutButton}
            contentStyle={styles.checkoutButtonContent}
            disabled={loading}
          >
            {loading ? <ActivityIndicator size="small" color="white" /> : 'Proceed to Checkout'}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000000',
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
    backgroundColor: '#f5f5f5',
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
    shadowColor: '#000000',
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
    shadowColor: '#000000',
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
    marginBottom: 32,
  },
  clearButton: {
    flex: 1,
    borderRadius: 12,
  },
  checkoutButton: {
    flex: 2,
    borderRadius: 12,
  },
  checkoutButtonContent: {
    paddingVertical: 8,
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