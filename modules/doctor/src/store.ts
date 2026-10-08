import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appointment } from './data';

const APPOINTMENTS_KEY = '@servicehub:doctor_appointments';

interface DoctorState {
  appointments: Appointment[];
  isLoading: boolean;
}

interface DoctorActions {
  loadAppointments: () => Promise<void>;
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => Promise<void>;
  cancelAppointment: (id: string) => Promise<void>;
}

type DoctorStore = DoctorState & DoctorActions;

export const useDoctorStore = create<DoctorStore>((set, get) => ({
  appointments: [],
  isLoading: false,

  loadAppointments: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      if (stored) {
        const appointments = JSON.parse(stored);
        set({ appointments, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load appointments:', error);
      set({ isLoading: false });
    }
  },

  bookAppointment: async (appointment) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}`,
      status: 'upcoming',
    };

    const appointments = [...get().appointments, newAppointment];
    set({ appointments });
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  },

  cancelAppointment: async (id) => {
    const appointments = get().appointments.map((apt) =>
      apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
    );
    set({ appointments });
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
  },
}));
