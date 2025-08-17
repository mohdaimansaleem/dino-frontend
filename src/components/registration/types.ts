import { VenueLocation, PriceRange } from '../../types/api';

export interface RegistrationFormData {
  // Workspace Information
  workspaceName: string;
  workspaceDescription: string;
  
  // Venue Information
  venueName: string;
  venueDescription: string;
  venueLocation: VenueLocation;
  venuePhone: string;
  venueEmail: string;
  priceRange: PriceRange;
  venueType: string;
  
  // Owner Information
  ownerEmail: string;
  ownerPhone: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPassword: string;
  confirmPassword: string;
}

export const initialFormData: RegistrationFormData = {
  // Workspace Information
  workspaceName: '',
  workspaceDescription: '',
  
  // Venue Information
  venueName: '',
  venueDescription: '',
  venueLocation: {
    address: '',
    city: '',
    state: '',
    country: 'India',
    postal_code: '',
    landmark: ''
  },
  venuePhone: '',
  venueEmail: '',
  priceRange: 'mid_range',
  venueType: 'restaurant',
  
  // Owner Information
  ownerEmail: '',
  ownerPhone: '',
  ownerFirstName: '',
  ownerLastName: '',
  ownerPassword: '',
  confirmPassword: ''
};

export const priceRangeOptions = [
  { value: 'budget', label: 'Budget (₹ - Under ₹500 per person)' },
  { value: 'mid_range', label: 'Mid Range (₹₹ - ₹500-₹1500 per person)' },
  { value: 'premium', label: 'Premium (₹₹₹ - ₹1500-₹3000 per person)' },
  { value: 'luxury', label: 'Luxury (₹₹₹₹ - Above ₹3000 per person)' }
];

export const venueTypeOptions = [
  'restaurant',
  'cafe',
  'bar',
  'fast_food',
  'fine_dining',
  'bakery',
  'food_truck',
  'cloud_kitchen',
  'other'
];