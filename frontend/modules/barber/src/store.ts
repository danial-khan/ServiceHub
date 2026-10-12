import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarberBooking } from './data';

const BOOKINGS_KEY = '@servicehub:barber_bookings';

interface BarberState {
  bookings: BarberBooking[];
  isLoading: boolean;
}

interface BarberActions {
  loadBookings: () => Promise<void>;
  createBooking: (booking: Omit<BarberBooking, 'id' | 'status'>) => Promise<void>;
  cancelBooking: (id: string) => Promise<void>;
}

type BarberStore = BarberState & BarberActions;

export const useBarberStore = create<BarberStore>((set, get) => ({
  bookings: [],
  isLoading: false,

  loadBookings: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(BOOKINGS_KEY);
      if (stored) {
        const bookings = JSON.parse(stored);
        set({ bookings, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      set({ isLoading: false });
    }
  },

  createBooking: async (booking) => {
    const newBooking: BarberBooking = {
      ...booking,
      id: `booking-${Date.now()}`,
      status: 'upcoming',
    };

    const bookings = [...get().bookings, newBooking];
    set({ bookings });
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  },

  cancelBooking: async (id) => {
    const bookings = get().bookings.map((booking) =>
      booking.id === id ? { ...booking, status: 'cancelled' as const } : booking
    );
    set({ bookings });
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  },
}));
