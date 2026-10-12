export interface Barbershop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  distance: string;
}

export interface BarberService {
  id: string;
  name: string;
  price: number;
  duration: string;
}

export interface Barber {
  id: string;
  name: string;
  shopId: string;
  rating: number;
  experience: string;
}

export interface BarberBooking {
  id: string;
  shopName: string;
  barberName: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export const BARBERSHOPS: Barbershop[] = [
  {
    id: 'shop1',
    name: 'Classic Cuts',
    rating: 4.8,
    reviewCount: 245,
    address: '123 Main St',
    distance: '0.5 mi',
  },
  {
    id: 'shop2',
    name: 'Modern Gentleman',
    rating: 4.9,
    reviewCount: 312,
    address: '456 Oak Ave',
    distance: '1.2 mi',
  },
  {
    id: 'shop3',
    name: 'The Barber Shop',
    rating: 4.7,
    reviewCount: 189,
    address: '789 Pine Rd',
    distance: '2.1 mi',
  },
];

export const SERVICES: BarberService[] = [
  { id: 'svc1', name: 'Haircut', price: 25, duration: '30 min' },
  { id: 'svc2', name: 'Haircut & Beard Trim', price: 35, duration: '45 min' },
  { id: 'svc3', name: 'Shave', price: 20, duration: '20 min' },
  { id: 'svc4', name: 'Hair Coloring', price: 60, duration: '60 min' },
  { id: 'svc5', name: 'Deluxe Package', price: 80, duration: '90 min' },
];

export const BARBERS: Barber[] = [
  { id: 'barber1', name: 'Mike Johnson', shopId: 'shop1', rating: 4.9, experience: '8 years' },
  { id: 'barber2', name: 'Alex Brown', shopId: 'shop1', rating: 4.7, experience: '5 years' },
  { id: 'barber3', name: 'Chris Wilson', shopId: 'shop2', rating: 4.8, experience: '10 years' },
  { id: 'barber4', name: 'Sam Davis', shopId: 'shop2', rating: 4.9, experience: '7 years' },
  { id: 'barber5', name: 'Tom Martinez', shopId: 'shop3', rating: 4.6, experience: '6 years' },
];

export const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM',
];
