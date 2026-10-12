import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStore, User } from './types';

const AUTH_STORAGE_KEY = '@servicehub:auth';

const simulateApiCall = (duration: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, duration));

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      await simulateApiCall(1000);

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const user: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        isGuest: false,
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      await simulateApiCall(1000);

      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }

      const user: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        isGuest: false,
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign up failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  signInAsGuest: async () => {
    set({ isLoading: true, error: null });
    try {
      await simulateApiCall(500);

      const user: User = {
        id: `guest_${Date.now()}`,
        email: 'guest@servicehub.app',
        name: 'Guest User',
        isGuest: true,
      };

      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Guest sign in failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

export const loadStoredAuth = async (): Promise<User | null> => {
  try {
    const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      return JSON.parse(storedAuth);
    }
  } catch (error) {
    console.error('Failed to load stored auth:', error);
  }
  return null;
};

export const initializeAuth = async () => {
  const user = await loadStoredAuth();
  if (user) {
    useAuthStore.getState().setUser(user);
  }
};
