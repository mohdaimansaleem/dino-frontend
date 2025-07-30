/**
 * Indian Market Formatting Utilities
 * Handles currency, numbers, dates, and phone numbers for Indian market
 */

// Indian Rupee Currency Formatter
export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Indian Number Formatting (with commas in Indian style)
export const formatIndianNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Format Indian Phone Number
export const formatIndianPhone = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid Indian number
  if (cleaned.length === 10) {
    // Format as: +91 98765 43210
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // Already has country code
    const number = cleaned.slice(2);
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  }
  
  return phone; // Return as-is if not valid
};

// Format Indian Date (DD/MM/YYYY)
export const formatIndianDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Format Indian DateTime
export const formatIndianDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Format Indian Time
export const formatIndianTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Convert USD to INR (approximate conversion for pricing)
export const convertUSDToINR = (usdAmount: number, conversionRate: number = 83): number => {
  return Math.round(usdAmount * conversionRate);
};

// Format percentage for Indian context
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

// Format large numbers in Indian style (Lakh, Crore)
export const formatIndianLargeNumber = (num: number): string => {
  if (num >= 10000000) { // 1 Crore
    return `${(num / 10000000).toFixed(1)} Cr`;
  } else if (num >= 100000) { // 1 Lakh
    return `${(num / 100000).toFixed(1)} L`;
  } else if (num >= 1000) { // 1 Thousand
    return `${(num / 1000).toFixed(1)}K`;
  }
  return formatIndianNumber(num);
};

// Validate Indian Phone Number
export const isValidIndianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return (cleaned.length === 10 && /^[6-9]/.test(cleaned)) || 
         (cleaned.length === 12 && cleaned.startsWith('91') && /^[6-9]/.test(cleaned.slice(2)));
};

// Validate Indian PIN Code
export const isValidIndianPinCode = (pinCode: string): boolean => {
  return /^[1-9][0-9]{5}$/.test(pinCode);
};

// Format Indian Address
export const formatIndianAddress = (address: {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pinCode: string;
}): string => {
  const parts = [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pinCode
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Indian States List
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];

// Major Indian Cities
export const MAJOR_INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik'
];

// Business Hours Formatter for Indian Context
export const formatBusinessHours = (openTime: string, closeTime: string): string => {
  return `${openTime} - ${closeTime}`;
};

// GST Number Validator
export const isValidGSTNumber = (gst: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};