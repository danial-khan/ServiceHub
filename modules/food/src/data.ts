export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVegetarian?: boolean;
  imageUrl?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  restaurantName: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'preparing' | 'on-the-way' | 'delivered' | 'cancelled';
  orderTime: string;
  deliveryAddress: string;
}

export const RESTAURANTS: Restaurant[] = [
  {
    id: 'rest1',
    name: 'KFC',
    cuisine: 'Fried Chicken',
    rating: 4.5,
    reviewCount: 1234,
    deliveryTime: '25-35 min',
    deliveryFee: 2.99,
    minimumOrder: 10,
  },
  {
    id: 'rest2',
    name: "McDonald's",
    cuisine: 'Burgers, Fast Food',
    rating: 4.3,
    reviewCount: 2156,
    deliveryTime: '20-30 min',
    deliveryFee: 1.99,
    minimumOrder: 8,
  },
  {
    id: 'rest3',
    name: 'Pizza Hut',
    cuisine: 'Pizza, Italian',
    rating: 4.4,
    reviewCount: 987,
    deliveryTime: '30-40 min',
    deliveryFee: 3.49,
    minimumOrder: 12,
  },
  {
    id: 'rest4',
    name: 'Subway',
    cuisine: 'Sandwiches, Healthy',
    rating: 4.6,
    reviewCount: 654,
    deliveryTime: '15-25 min',
    deliveryFee: 1.49,
    minimumOrder: 6,
  },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'item1',
    restaurantId: 'rest1',
    name: 'Original Recipe Bucket',
    description: '8 pieces of KFC\'s Original Recipe Chicken',
    price: 19.99,
    category: 'Chicken',
  },
  {
    id: 'item2',
    restaurantId: 'rest1',
    name: 'Zinger Burger',
    description: 'Crispy chicken fillet with lettuce and mayo',
    price: 6.99,
    category: 'Burgers',
  },
  {
    id: 'item3',
    restaurantId: 'rest1',
    name: 'Popcorn Chicken',
    description: 'Bite-sized crispy chicken pieces',
    price: 4.99,
    category: 'Snacks',
  },
  {
    id: 'item4',
    restaurantId: 'rest2',
    name: 'Big Mac',
    description: 'Two beef patties, special sauce, lettuce, cheese',
    price: 5.99,
    category: 'Burgers',
  },
  {
    id: 'item5',
    restaurantId: 'rest2',
    name: 'Chicken McNuggets',
    description: '10 pieces of crispy chicken nuggets',
    price: 4.99,
    category: 'Chicken',
  },
  {
    id: 'item6',
    restaurantId: 'rest2',
    name: 'McFlurry',
    description: 'Vanilla soft serve with Oreo',
    price: 3.49,
    category: 'Desserts',
  },
  {
    id: 'item7',
    restaurantId: 'rest3',
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni with mozzarella cheese',
    price: 14.99,
    category: 'Pizza',
  },
  {
    id: 'item8',
    restaurantId: 'rest3',
    name: 'Veggie Supreme',
    description: 'Bell peppers, onions, mushrooms, olives',
    price: 13.99,
    category: 'Pizza',
    isVegetarian: true,
  },
  {
    id: 'item9',
    restaurantId: 'rest4',
    name: 'Italian B.M.T.',
    description: 'Ham, pepperoni, salami on fresh bread',
    price: 7.49,
    category: 'Sandwiches',
  },
  {
    id: 'item10',
    restaurantId: 'rest4',
    name: 'Veggie Delite',
    description: 'Fresh vegetables and cheese',
    price: 5.99,
    category: 'Sandwiches',
    isVegetarian: true,
  },
];

export const CATEGORIES = ['All', 'Burgers', 'Chicken', 'Pizza', 'Sandwiches', 'Snacks', 'Desserts'];
