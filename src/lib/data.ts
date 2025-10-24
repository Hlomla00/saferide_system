// Mock drivers for Cape Town ( names, CAA plates, and ratings)
export const drivers = [
  { name: 'Lwazi Mbeki', plate: 'CAA 123-456', rating: 4.9 },
  { name: 'Sipho Dlamini', plate: 'CAA 654-321', rating: 3.8 },
  { name: 'Noluthando Jacobs', plate: 'CAA 234-567', rating: 4.7 },
  { name: 'Thabo Williams', plate: 'CAA 345-678', rating: 4.6 },
  { name: 'Ayanda Smith', plate: 'CAA 456-789', rating: 4.9 },
  { name: 'Sibusiso Johnson', plate: 'CAA 567-890', rating: 4.8 },
  { name: 'Nomsa Daniels', plate: 'CAA 678-901', rating: 3.7 },
  { name: 'Lindelwa Brown', plate: 'CAA 789-012', rating: 4.8 },
  { name: 'Zanele Thomas', plate: 'CAA 890-123', rating: 4.9 },
  { name: 'Jason Mthembu', plate: 'CAA 901-234', rating: 5.0 },
];

import { Car, Gem, Users, CreditCard, Banknote, Phone, Zap } from 'lucide-react';


export const destinations = [
  { value: 'uwc-innovation-hub', label: 'UWC Innovation Hub' },
  { value: 'cput-bellville', label: 'CPUT Bellville Campus' },
  { value: 'sanlam-parow', label: 'Sanlam Center Parow' },
  { value: 'cput-d6', label: 'CPUT Cape Town Campus' },
  { value: 'va-waterfront', label: 'V&A Waterfront' },
  { value: 'nmj', label: 'New Market Junction' },
  { value: 'kirstenbosch', label: 'Kirstenbosch Gardens' },
  { value: 'cpt-airport', label: 'Cape Town International Airport (CPT)' },
  { value: 'camps-bay', label: 'Camps Bay Beach' },
  { value: 'ct-icc', label: 'Cape Town International Convention Centre' },

];


export const providers = [
  { id: 'uber', name: 'Uber', icon: '/assets/providers/uber_logo.png' },
  { id: 'bolt', name: 'Bolt', icon: '/assets/providers/bolt.png' },
  { id: 'indrive', name: 'inDrive', icon: '/assets/providers/indriver_logo.png' },
  { id: 'maxima', name: 'Maxima', icon: '/assets/providers/maxim_logo.png' },
];

export const paymentMethods = [
  { id: 'card', name: 'Card', icon: CreditCard, description: 'Pay with credit or debit card' },
  { id: 'cash', name: 'Cash', icon: Banknote, description: 'Pay with cash on arrival' },
  { id: 'phone', name: 'Phone Number', icon: Phone, description: 'Pay with USDC via phone' },
  { id: 'gonow', name: 'RIDE NOW! (Instant Loan)', icon: Zap, description: 'Instant loan service' },
];

export type Ride = {
  id: string;
  provider: string;
  name: string;
  description: string;
  icon: React.ElementType;
  priceMultiplier: number;
};

export const allRides: Ride[] = [
  // Uber - USDC pricing between $1-2
  { id: 'uber-economy', provider: 'uber', name: 'Uber Economy', description: 'Affordable, everyday rides', icon: Car, priceMultiplier: 1.0 },
  { id: 'uber-comfort', provider: 'uber', name: 'Uber Comfort', description: 'Newer cars with more legroom', icon: Gem, priceMultiplier: 1.4 },
  { id: 'uber-xl', provider: 'uber', name: 'Uber XL', description: 'Rides for groups up to 6', icon: Users, priceMultiplier: 1.8 },
  // Bolt - USDC pricing between $1-2
  { id: 'bolt-economy', provider: 'bolt', name: 'Bolt Economy', description: 'The quick and affordable option', icon: Car, priceMultiplier: 0.95 },
  { id: 'bolt-comfort', provider: 'bolt', name: 'Bolt Comfort', description: 'Executive cars for your comfort', icon: Gem, priceMultiplier: 1.35 },
  { id: 'bolt-xl', provider: 'bolt', name: 'Bolt XL', description: 'For when you need more space', icon: Users, priceMultiplier: 1.7 },
  // inDrive - USDC pricing between $1-2
  { id: 'indrive-economy', provider: 'indrive', name: 'inDrive Economy', description: 'You set the fare', icon: Car, priceMultiplier: 0.85 },
  { id: 'indrive-comfort', provider: 'indrive', name: 'inDrive Comfort', description: 'Comfortable rides at your price', icon: Gem, priceMultiplier: 1.25 },
  { id: 'indrive-xl', provider: 'indrive', name: 'inDrive XL', description: 'Large group rides, your fare', icon: Users, priceMultiplier: 1.65 },
  // Maxima - USDC pricing between $1-2
  { id: 'maxima-economy', provider: 'maxima', name: 'Maxima Economy', description: 'Cost-effective local rides', icon: Car, priceMultiplier: 0.8 },
  { id: 'maxima-comfort', provider: 'maxima', name: 'Maxima Comfort', description: 'Relax in a better car', icon: Gem, priceMultiplier: 1.2 },
  { id: 'maxima-xl', provider: 'maxima', name: 'Maxima XL', description: 'For the whole family', icon: Users, priceMultiplier: 1.6 },
];

// This is kept for the admin page, but the booking flow will use `allRides`.
export const rideTypes = [
  { id: 'economy', name: 'Economy', description: 'Affordable, everyday rides', icon: Car, priceMultiplier: 1.0 },
  { id: 'comfort', name: 'Comfort', description: 'Full-size cars with more legroom', icon: Gem, priceMultiplier: 1.4 },
  { id: 'xl', name: 'XL', description: 'Rides for groups up to 6', icon: Users, priceMultiplier: 1.8 },
];
