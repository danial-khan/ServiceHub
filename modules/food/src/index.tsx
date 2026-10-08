import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Button, Card, Text } from '../../../src/core';
import { theme } from '../../../src/core/theme';
import { RESTAURANTS, MENU_ITEMS, CATEGORIES, Restaurant, MenuItem } from './data';
import { useFoodStore } from './store';

type Screen = 'restaurants' | 'menu' | 'cart' | 'orders' | 'orderStatus';

interface FoodModuleProps {
  onBack: () => void;
}

export const FoodModule: React.FC<FoodModuleProps> = ({ onBack }) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('restaurants');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const {
    cart,
    orders,
    loadCart,
    loadOrders,
    addToCart,
    removeFromCart,
    updateQuantity,
    placeOrder,
    getCartTotal,
    getCartItemCount,
  } = useFoodStore();

  useEffect(() => {
    loadCart();
    loadOrders();
  }, []);

  const handleAddToCart = (menuItem: MenuItem) => {
    addToCart({ menuItem, quantity: 1 });
    Alert.alert('Added to Cart', `${menuItem.name} added to your cart`);
  };

  const handleCheckout = async () => {
    if (!selectedRestaurant || cart.length === 0) return;

    const subtotal = getCartTotal();
    const deliveryFee = selectedRestaurant.deliveryFee;
    const total = subtotal + deliveryFee;

    await placeOrder({
      restaurantName: selectedRestaurant.name,
      items: cart,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress: '123 Main St, Apt 4B',
    });

    const latestOrder = orders[orders.length - 1];
    if (latestOrder) {
      setPlacedOrderId(latestOrder.id);
    }
    setCurrentScreen('orderStatus');
  };

  if (currentScreen === 'restaurants') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button title="← Back" variant="ghost" size="small" onPress={onBack} />
          <Text variant="h3">Restaurants</Text>
          <Button
            title="Orders"
            variant="ghost"
            size="small"
            onPress={() => setCurrentScreen('orders')}
          />
        </View>
        <FlatList
          data={RESTAURANTS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedRestaurant(item);
                setCurrentScreen('menu');
              }}
            >
              <Card style={styles.card}>
                <Text variant="h3">{item.name}</Text>
                <Text variant="bodySmall" color={theme.colors.textSecondary}>
                  {item.cuisine}
                </Text>
                <View style={styles.restaurantMeta}>
                  <Text variant="bodySmall">★ {item.rating} ({item.reviewCount})</Text>
                  <Text variant="bodySmall">{item.deliveryTime}</Text>
                  <Text variant="bodySmall">${item.deliveryFee} delivery</Text>
                </View>
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  if (currentScreen === 'menu') {
    const menuItems = MENU_ITEMS.filter((item) => {
      if (item.restaurantId !== selectedRestaurant?.id) return false;
      if (selectedCategory === 'All') return true;
      return item.category === selectedCategory;
    });

    const cartCount = getCartItemCount();

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="← Back"
            variant="ghost"
            size="small"
            onPress={() => setCurrentScreen('restaurants')}
          />
          <Text variant="h4">{selectedRestaurant?.name}</Text>
          <Button
            title={`Cart (${cartCount})`}
            variant="ghost"
            size="small"
            onPress={() => setCurrentScreen('cart')}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
            >
              <Text
                variant="bodySmall"
                weight="medium"
                color={
                  selectedCategory === category
                    ? theme.colors.white
                    : theme.colors.text
                }
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.menuItemRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="h4">{item.name}</Text>
                  <Text
                    variant="bodySmall"
                    color={theme.colors.textSecondary}
                    style={styles.description}
                  >
                    {item.description}
                  </Text>
                  <Text variant="body" weight="semibold">
                    ${item.price.toFixed(2)}
                  </Text>
                </View>
                <Button
                  title="Add"
                  size="small"
                  onPress={() => handleAddToCart(item)}
                />
              </View>
            </Card>
          )}
        />
      </View>
    );
  }

  if (currentScreen === 'cart') {
    const subtotal = getCartTotal();
    const deliveryFee = selectedRestaurant?.deliveryFee || 0;
    const total = subtotal + deliveryFee;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="← Back"
            variant="ghost"
            size="small"
            onPress={() => setCurrentScreen('menu')}
          />
          <Text variant="h3">Cart</Text>
          <View style={{ width: 60 }} />
        </View>

        {cart.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="h4">Your cart is empty</Text>
            <Button
              title="Browse Menu"
              onPress={() => setCurrentScreen('menu')}
            />
          </View>
        ) : (
          <>
            <FlatList
              data={cart}
              keyExtractor={(item) => item.menuItem.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Text variant="h4">{item.menuItem.name}</Text>
                  <Text variant="body">${item.menuItem.price.toFixed(2)}</Text>
                  <View style={styles.quantityRow}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.menuItem.id, item.quantity - 1)
                        }
                        style={styles.quantityButton}
                      >
                        <Text variant="h4">−</Text>
                      </TouchableOpacity>
                      <Text variant="body" weight="semibold">
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.menuItem.id, item.quantity + 1)
                        }
                        style={styles.quantityButton}
                      >
                        <Text variant="h4">+</Text>
                      </TouchableOpacity>
                    </View>
                    <Button
                      title="Remove"
                      variant="ghost"
                      size="small"
                      onPress={() => removeFromCart(item.menuItem.id)}
                    />
                  </View>
                </Card>
              )}
            />

            <Card style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text variant="body">Subtotal</Text>
                <Text variant="body">${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="body">Delivery Fee</Text>
                <Text variant="body">${deliveryFee.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text variant="h4">Total</Text>
                <Text variant="h4">${total.toFixed(2)}</Text>
              </View>
              <Button title="Place Order" onPress={handleCheckout} fullWidth />
            </Card>
          </>
        )}
      </View>
    );
  }

  if (currentScreen === 'orders') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="← Back"
            variant="ghost"
            size="small"
            onPress={() => setCurrentScreen('restaurants')}
          />
          <Text variant="h3">My Orders</Text>
          <View style={{ width: 60 }} />
        </View>

        {orders.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="h4">No orders yet</Text>
            <Button
              title="Order Now"
              onPress={() => setCurrentScreen('restaurants')}
            />
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <Text variant="h4">{item.restaurantName}</Text>
                <Text variant="bodySmall" color={theme.colors.textSecondary}>
                  {item.items.length} items · ${item.total.toFixed(2)}
                </Text>
                <View style={[styles.statusBadge, styles[`status${item.status}`]]}>
                  <Text variant="caption" color={theme.colors.white}>
                    {item.status.toUpperCase().replace('-', ' ')}
                  </Text>
                </View>
              </Card>
            )}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title="← Done"
          variant="ghost"
          size="small"
          onPress={() => setCurrentScreen('orders')}
        />
        <Text variant="h3">Order Status</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Card style={styles.successCard}>
          <Text variant="h2" align="center">
            ✓
          </Text>
          <Text variant="h3" align="center">
            Order Placed!
          </Text>
          <Text variant="body" color={theme.colors.textSecondary} align="center">
            Your order is being prepared
          </Text>
          <Button
            title="View All Orders"
            onPress={() => setCurrentScreen('orders')}
            fullWidth
          />
        </Card>
      </View>
    </View>
  );
};

export const getNavigator = () => FoodModule;
export default FoodModule;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xxl,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  card: {
    marginBottom: theme.spacing.md,
  },
  restaurantMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  categoryScroll: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
  },
  categoryContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryChip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundSecondary,
    marginRight: theme.spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
  },
  menuItemRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  description: {
    marginVertical: theme.spacing.xs,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    margin: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalRow: {
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statusBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
  },
  statuspreparing: {
    backgroundColor: theme.colors.warning,
  },
  'statuson-the-way': {
    backgroundColor: theme.colors.info,
  },
  statusdelivered: {
    backgroundColor: theme.colors.success,
  },
  statuscancelled: {
    backgroundColor: theme.colors.textTertiary,
  },
  successCard: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    padding: theme.spacing.xxl,
  },
});
