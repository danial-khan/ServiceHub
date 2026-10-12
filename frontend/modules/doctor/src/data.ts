export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  yearsOfExperience: number;
  hospitalName: string;
  consultationFee: number;
  availableDays: string[];
  photoUrl?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  hospitalName: string;
}

export const SPECIALTIES = [
  'All',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'Neurologist',
  'Dentist',
];

export const DOCTORS: Doctor[] = [
  {
    id: 'doc1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    rating: 4.8,
    reviewCount: 156,
    yearsOfExperience: 15,
    hospitalName: 'City General Hospital',
    consultationFee: 150,
    availableDays: ['Mon', 'Wed', 'Fri'],
  },
  {
    id: 'doc2',
    name: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    rating: 4.9,
    reviewCount: 203,
    yearsOfExperience: 12,
    hospitalName: 'Skin Care Clinic',
    consultationFee: 120,
    availableDays: ['Tue', 'Thu', 'Sat'],
  },
  {
    id: 'doc3',
    name: 'Dr. Emily Williams',
    specialty: 'Pediatrician',
    rating: 4.7,
    reviewCount: 178,
    yearsOfExperience: 10,
    hospitalName: 'Children\'s Medical Center',
    consultationFee: 100,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  {
    id: 'doc4',
    name: 'Dr. Robert Martinez',
    specialty: 'Orthopedic',
    rating: 4.6,
    reviewCount: 142,
    yearsOfExperience: 18,
    hospitalName: 'Bone & Joint Specialist',
    consultationFee: 180,
    availableDays: ['Wed', 'Fri'],
  },
  {
    id: 'doc5',
    name: 'Dr. Lisa Anderson',
    specialty: 'Neurologist',
    rating: 4.9,
    reviewCount: 189,
    yearsOfExperience: 20,
    hospitalName: 'Neuro Care Institute',
    consultationFee: 200,
    availableDays: ['Mon', 'Thu'],
  },
  {
    id: 'doc6',
    name: 'Dr. James Taylor',
    specialty: 'Dentist',
    rating: 4.8,
    reviewCount: 167,
    yearsOfExperience: 14,
    hospitalName: 'Smile Dental Clinic',
    consultationFee: 90,
    availableDays: ['Tue', 'Wed', 'Thu', 'Sat'],
  },
];

export const generateTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = [
    '09:00 AM',
    '09:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '02:00 PM',
    '02:30 PM',
    '03:00 PM',
    '03:30 PM',
    '04:00 PM',
    '04:30 PM',
  ];

  times.forEach((time, index) => {
    slots.push({
      id: `slot-${index}`,
      time,
      available: Math.random() > 0.3,
    });
  });

  return slots;
};
