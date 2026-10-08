import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, Order } from './data';

const CART_KEY = '@servicehub:food_cart';
const ORDERS_KEY = '@servicehub:food_orders';

interface FoodState {
  cart: CartItem[];
  orders: Order[];
  currentRestaurantId: string | null;
  isLoading: boolean;
}

interface FoodActions {
  loadCart: () => Promise<void>;
  loadOrders: () => Promise<void>;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  placeOrder: (order: Omit<Order, 'id' | 'status' | 'orderTime'>) => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

type FoodStore = FoodState & FoodActions;

export const useFoodStore = create<FoodStore>((set, get) => ({
  cart: [],
  orders: [],
  currentRestaurantId: null,
  isLoading: false,

  loadCart: async () => {
    try {
      const stored = await AsyncStorage.getItem(CART_KEY);
      if (stored) {
        const { cart, currentRestaurantId } = JSON.parse(stored);
        set({ cart, currentRestaurantId });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  },

  loadOrders: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(ORDERS_KEY);
      if (stored) {
        const orders = JSON.parse(stored);
        set({ orders, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      set({ isLoading: false });
    }
  },

  addToCart: async (item) => {
    const { cart, currentRestaurantId } = get();
    
    if (currentRestaurantId && currentRestaurantId !== item.menuItem.restaurantId) {
      return;
    }

    const existingItem = cart.find((i) => i.menuItem.id === item.menuItem.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map((i) =>
        i.menuItem.id === item.menuItem.id
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    } else {
      newCart = [...cart, item];
    }

    set({ cart: newCart, currentRestaurantId: item.menuItem.restaurantId });
    await AsyncStorage.setItem(
      CART_KEY,
      JSON.stringify({ cart: newCart, currentRestaurantId: item.menuItem.restaurantId })
    );
  },

  removeFromCart: async (itemId) => {
    const cart = get().cart.filter((item) => item.menuItem.id !== itemId);
    const currentRestaurantId = cart.length > 0 ? get().currentRestaurantId : null;
    set({ cart, currentRestaurantId });
    await AsyncStorage.setItem(
      CART_KEY,
      JSON.stringify({ cart, currentRestaurantId })
    );
  },

  updateQuantity: async (itemId, quantity) => {
    if (quantity <= 0) {
      return get().removeFromCart(itemId);
    }

    const cart = get().cart.map((item) =>
      item.menuItem.id === itemId ? { ...item, quantity } : item
    );
    set({ cart });
    await AsyncStorage.setItem(
      CART_KEY,
      JSON.stringify({ cart, currentRestaurantId: get().currentRestaurantId })
    );
  },

  clearCart: async () => {
    set({ cart: [], currentRestaurantId: null });
    await AsyncStorage.removeItem(CART_KEY);
  },

  placeOrder: async (order) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      status: 'preparing',
      orderTime: new Date().toISOString(),
    };

    const orders = [...get().orders, newOrder];
    set({ orders });
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    await get().clearCart();
  },

  getCartTotal: () => {
    return get().cart.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0
    );
  },

  getCartItemCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },
}));
