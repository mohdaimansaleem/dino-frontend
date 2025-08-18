/**
 * Application Information and Content
 * 
 * This file contains all user-facing content, messages, and information
 * used throughout the Dino application.
 */

import { 
  MenuBook, 
  QrCode, 
  Dashboard,
  Restaurant,
  ShoppingCart,
  ThumbUp,
  CloudDone
} from '@mui/icons-material';

// ===================================================================
// COMPANY INFORMATION
// ===================================================================

export const COMPANY_INFO = {
  name: 'Dino',
  tagline: 'Revolutionizing Restaurant Ordering',
  description: 'Digital menu solutions for modern restaurants',
  website: 'https://dino-emenu.com',
  email: 'contact@dino-emenu.com',
  phone: '+91 98765 43210',
  address: {
    street: '123 Tech Park',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    pincode: '560001'
  },
  social: {
    twitter: '@dinoemenu',
    facebook: 'dinoemenu',
    instagram: 'dinoemenu',
    linkedin: 'dino-emenu'
  },
  legal: {
    copyright: '© 2024 Dino. All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service'
  },
  socialMedia: [
    { icon: 'Twitter', color: '#1DA1F2' },
    { icon: 'Facebook', color: '#4267B2' },
    { icon: 'Instagram', color: '#E4405F' },
    { icon: 'LinkedIn', color: '#0077B5' }
  ],
  contact: {
    address: {
      full: '123 Tech Park, Whitefield, Bangalore 560066'
    },
    phone: {
      primary: '+91 98765 43210'
    },
    email: {
      primary: 'contact@dino-emenu.com'
    }
  }
} as const;

export const COMPANY_STATS = [
  {
    number: 500,
    suffix: '+',
    label: 'Restaurants',
    icon: Restaurant,
    color: '#1976d2',
    bgColor: 'rgba(25, 118, 210, 0.1)',
    decimals: 0
  },
  {
    number: 100,
    suffix: 'K+',
    label: 'Orders Processed',
    icon: ShoppingCart,
    color: '#2e7d32',
    bgColor: 'rgba(46, 125, 50, 0.1)',
    decimals: 0
  },
  {
    number: 99,
    suffix: '%',
    label: 'Customer Satisfaction',
    icon: ThumbUp,
    color: '#ed6c02',
    bgColor: 'rgba(237, 108, 2, 0.1)',
    decimals: 0
  },
  {
    number: 99.9,
    suffix: '%',
    label: 'Uptime',
    icon: CloudDone,
    color: '#9c27b0',
    bgColor: 'rgba(156, 39, 176, 0.1)',
    decimals: 1
  }
] as const;

// ===================================================================
// FEATURES & BENEFITS
// ===================================================================

export const CORE_FEATURES = [
  {
    title: 'Digital Menu',
    description: 'Beautiful, interactive digital menus that customers love',
    icon: MenuBook,
    color: 'primary',
    stats: 'Easy to update',
    benefits: [
      'Easy to update',
      'Rich media support',
      'Multi-language support',
      'Dietary filters'
    ]
  },
  {
    title: 'QR Code Ordering',
    description: 'Contactless ordering through QR codes',
    icon: QrCode,
    color: 'secondary',
    stats: 'Contactless experience',
    benefits: [
      'Contactless experience',
      'Instant ordering',
      'No app download required',
      'Table-specific menus'
    ]
  },
  {
    title: 'Real-time Management',
    description: 'Live order tracking and kitchen management',
    icon: Dashboard,
    color: 'success',
    stats: 'Live order updates',
    benefits: [
      'Live order updates',
      'Kitchen display system',
      'Staff notifications',
      'Performance analytics'
    ]
  }
] as const;

export const MANAGEMENT_FEATURES = [
  {
    title: 'Order Management',
    description: 'Complete order lifecycle management',
    features: [
      'Order tracking',
      'Status updates',
      'Payment processing',
      'Customer notifications'
    ]
  },
  {
    title: 'Menu Management',
    description: 'Easy menu creation and updates',
    features: [
      'Drag & drop interface',
      'Bulk operations',
      'Category management',
      'Price optimization'
    ]
  },
  {
    title: 'Analytics Dashboard',
    description: 'Comprehensive business insights',
    features: [
      'Sales analytics',
      'Popular items',
      'Peak hours analysis',
      'Revenue tracking'
    ]
  }
] as const;

export const ADVANCED_FEATURES = [
  {
    title: 'Multi-location Support',
    description: 'Manage multiple restaurant locations',
    features: [
      'Centralized management',
      'Location-specific menus',
      'Unified reporting',
      'Staff management'
    ]
  },
  {
    title: 'Integration Hub',
    description: 'Connect with your existing tools',
    features: [
      'POS integration',
      'Payment gateways',
      'Delivery platforms',
      'Accounting software'
    ]
  }
] as const;



// ===================================================================
// TESTIMONIALS & SUCCESS STORIES
// ===================================================================

export const TESTIMONIALS = [
  {
    name: 'Rajesh Kumar',
    role: 'Owner',
    restaurant: 'Spice Garden',
    location: 'Mumbai',
    rating: 5,
    text: 'Dino transformed our restaurant operations. Orders are faster, more accurate, and our customers love the digital experience.',
    comment: 'Dino transformed our restaurant operations. Orders are faster, more accurate, and our customers love the digital experience.',
    image: '/testimonials/rajesh.jpg',
    avatar: '/testimonials/rajesh.jpg'
  },
  {
    name: 'Priya Sharma',
    role: 'Manager',
    restaurant: 'Cafe Delight',
    location: 'Delhi',
    rating: 5,
    text: 'The analytics dashboard gives us incredible insights. We\'ve increased our revenue by 30% since implementing Dino.',
    comment: 'The analytics dashboard gives us incredible insights. We\'ve increased our revenue by 30% since implementing Dino.',
    image: '/testimonials/priya.jpg',
    avatar: '/testimonials/priya.jpg'
  },
  {
    name: 'Arjun Patel',
    role: 'Chef',
    restaurant: 'Fusion Bistro',
    location: 'Bangalore',
    rating: 5,
    text: 'Kitchen operations are so much smoother now. Real-time order updates help us serve customers faster and reduce wait times.',
    comment: 'Kitchen operations are so much smoother now. Real-time order updates help us serve customers faster and reduce wait times.',
    image: '/testimonials/arjun.jpg',
    avatar: '/testimonials/arjun.jpg'
  }
] as const;

export const SUCCESS_STORIES = [
  {
    restaurant: 'The Curry House',
    location: 'Chennai',
    improvement: '40% faster service',
    description: 'Reduced order processing time and improved customer satisfaction'
  },
  {
    restaurant: 'Pizza Corner',
    location: 'Pune',
    improvement: '25% revenue increase',
    description: 'Upselling through digital menu recommendations'
  },
  {
    restaurant: 'Healthy Bites',
    location: 'Hyderabad',
    improvement: '60% error reduction',
    description: 'Eliminated order miscommunication between staff and kitchen'
  }
] as const;

// ===================================================================
// BENEFITS & VALUE PROPOSITIONS
// ===================================================================

export const BENEFITS = [
  'Increase Revenue - Boost sales with smart upselling and faster table turnover',
  'Reduce Costs - Lower operational costs with automated processes', 
  'Improve Efficiency - Streamline operations with digital workflows',
  'Enhance Experience - Delight customers with modern dining experience'
] as const;

// ===================================================================
// INTEGRATIONS & PARTNERSHIPS
// ===================================================================

export const INTEGRATIONS = [
  {
    name: 'Razorpay',
    category: 'Payment Gateway',
    description: 'Secure payment processing',
    logo: '/integrations/razorpay.png'
  },
  {
    name: 'Zomato',
    category: 'Delivery Platform',
    description: 'Online food delivery integration',
    logo: '/integrations/zomato.png'
  },
  {
    name: 'Swiggy',
    category: 'Delivery Platform',
    description: 'Food delivery and logistics',
    logo: '/integrations/swiggy.png'
  },
  {
    name: 'Tally',
    category: 'Accounting',
    description: 'Financial management integration',
    logo: '/integrations/tally.png'
  }
] as const;

// ===================================================================
// CONTACT & SUPPORT
// ===================================================================

export const CONTACT_DEPARTMENTS = [
  {
    name: 'Sales',
    email: 'sales@dino-emenu.com',
    phone: '+91 98765 43210',
    description: 'New customer inquiries and demos'
  },
  {
    name: 'Support',
    email: 'support@dino-emenu.com',
    phone: '+91 98765 43211',
    description: 'Technical support and assistance'
  },
  {
    name: 'Partnerships',
    email: 'partners@dino-emenu.com',
    phone: '+91 98765 43212',
    description: 'Integration and partnership opportunities'
  }
] as const;

export const CONTACT_INFO = {
  headquarters: {
    address: '123 Tech Park, Whitefield, Bangalore 560066',
    phone: '+91 98765 43210',
    email: 'contact@dino-emenu.com'
  },
  support: {
    hours: '24/7 for Enterprise customers, 9 AM - 6 PM for others',
    email: 'support@dino-emenu.com',
    phone: '+91 98765 43211'
  }
} as const;

// ===================================================================
// FAQ
// ===================================================================

export const FAQS = [
  {
    question: 'How quickly can we get started?',
    answer: 'You can be up and running within 24 hours. Our team will help you set up your digital menu and train your staff.'
  },
  {
    question: 'Do customers need to download an app?',
    answer: 'No! Customers simply scan a QR code and access your menu through their web browser. No app download required.'
  },
  {
    question: 'Can we customize the menu design?',
    answer: 'Yes, you can fully customize your menu with your branding, colors, and layout to match your restaurant\'s style.'
  },
  {
    question: 'What payment methods are supported?',
    answer: 'We support all major payment methods including UPI, cards, wallets, and cash on delivery.'
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees! You only pay the monthly subscription. We include free setup and training with all plans.'
  },
  {
    question: 'Can we integrate with our existing POS?',
    answer: 'Yes, we integrate with most popular POS systems. Our team will help you set up the integration.'
  }
] as const;

// ===================================================================
// USER INTERFACE MESSAGES & LABELS
// ===================================================================

// Page Titles
export const PAGE_TITLES = {
  ADMIN_DASHBOARD: 'Dashboard',
  OPERATOR_DASHBOARD: 'Orders Dashboard',
  ORDERS_MANAGEMENT: 'Orders Management',
  MENU_MANAGEMENT: 'Menu Management',
  TABLE_MANAGEMENT: 'Table Management',
  VENUE_SETTINGS: 'Venue Settings',
  USER_MANAGEMENT: 'User Management',
  USER_PERMISSIONS: 'User Permissions',
  WORKSPACE_MANAGEMENT: 'Workspace Management',
  HOME: 'Home',
  LOGIN: 'Login',
  REGISTER: 'Register',
  MENU: 'Menu',
  CHECKOUT: 'Checkout',
  ORDER_TRACKING: 'Order Tracking',
  PROFILE: 'Profile',
} as const;

// App Titles
export const APP_TITLES = {
  MAIN: 'Dino',
  ADMIN: 'Admin Dashboard',
  OPERATOR: 'Operator Dashboard',
  CUSTOMER: 'Customer Portal',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logged out successfully',
  REGISTER: 'Registration successful!',
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_UPDATED: 'Order updated successfully!',
  MENU_UPDATED: 'Menu updated successfully!',
  USER_CREATED: 'User created successfully!',
  USER_UPDATED: 'User updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  ORDER_FAILED: 'Failed to place order. Please try again.',
  MENU_LOAD_FAILED: 'Failed to load menu items.',
  USER_LOAD_FAILED: 'Failed to load user data.',
  GENERIC: 'Something went wrong. Please try again.',
} as const;

// Warning Messages
export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
  DELETE_CONFIRMATION: 'Are you sure you want to delete this item?',
  LOGOUT_CONFIRMATION: 'Are you sure you want to logout?',
} as const;

// Info Messages
export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  NO_DATA: 'No data available',
  EMPTY_CART: 'Your cart is empty',
  ORDER_PROCESSING: 'Your order is being processed',
} as const;

// Button Labels
export const BUTTON_LABELS = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  REGISTER: 'Register',
  SUBMIT: 'Submit',
  CANCEL: 'Cancel',
  SAVE: 'Save',
  DELETE: 'Delete',
  EDIT: 'Edit',
  ADD: 'Add',
  REMOVE: 'Remove',
  VIEW: 'View',
  BACK: 'Back',
  NEXT: 'Next',
  PREVIOUS: 'Previous',
  CONFIRM: 'Confirm',
  RETRY: 'Retry',
} as const;

// Placeholders
export const PLACEHOLDERS = {
  EMAIL: 'Enter your email',
  PASSWORD: 'Enter your password',
  NAME: 'Enter your name',
  PHONE: 'Enter your phone number',
  SEARCH: 'Search...',
  DESCRIPTION: 'Enter description',
} as const;

// Form Labels
export const FORM_LABELS = {
  EMAIL: 'Email',
  PASSWORD: 'Password',
  FIRST_NAME: 'First Name',
  LAST_NAME: 'Last Name',
  PHONE: 'Phone Number',
  ROLE: 'Role',
  STATUS: 'Status',
  DESCRIPTION: 'Description',
  PRICE: 'Price',
  CATEGORY: 'Category',
} as const;

// Access Messages
export const ACCESS_MESSAGES = {
  ADMIN_REQUIRED: 'Admin access required',
  LOGIN_REQUIRED: 'Please login to continue',
  PERMISSION_DENIED: 'You do not have permission to access this resource',
} as const;

// Status Labels
export const STATUS_LABELS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
} as const;

// Notification Messages
export const NOTIFICATION_MESSAGES = {
  NEW_ORDER: 'New order received',
  ORDER_READY: 'Order is ready for pickup',
  ORDER_DELIVERED: 'Order has been delivered',
  PAYMENT_RECEIVED: 'Payment received successfully',
} as const;

// Navigation
export const NAVIGATION = {
  HOME: { label: 'Home', path: '/' },
  MENU: { label: 'Menu', path: '/menu' },
  ORDERS: { label: 'Orders', path: '/orders' },
  DASHBOARD: { label: 'Dashboard', path: '/dashboard' },
  ADMIN: { label: 'Admin', path: '/admin' },
  PROFILE: { label: 'Profile', path: '/profile' },
  LOGIN: { label: 'Login', path: '/login' },
  REGISTER: { label: 'Register', path: '/register' },
  
  // Home page navigation sections
  home: [
    { id: 'hero', label: 'Home', icon: 'Home' },
    { id: 'features', label: 'Features', icon: 'Star' },
    { id: 'testimonials', label: 'Reviews', icon: 'Reviews' },
    { id: 'contact', label: 'Contact', icon: 'ContactMail' },
  ],
  
  // Footer navigation
  footer: {
    platform: [
      'Digital Menu',
      'QR Ordering',
      'Analytics',
      'Multi-location',
      'Integrations'
    ],
    solutions: [
      'Restaurant Management',
      'Order Processing',
      'Customer Experience',
      'Business Intelligence',
      'Payment Solutions'
    ]
  }
} as const;

// Footer Features
export const FOOTER_FEATURES = [
  {
    icon: 'TrackChanges',
    title: 'Real-time order tracking',
    description: 'Track orders in real-time'
  },
  {
    icon: 'MenuBook',
    title: 'Digital menu management',
    description: 'Manage your menu digitally'
  },
  {
    icon: 'QrCode',
    title: 'QR code ordering',
    description: 'Contactless ordering experience'
  },
  {
    icon: 'Analytics',
    title: 'Analytics dashboard',
    description: 'Comprehensive business insights'
  },
] as const;

// Content
export const CONTENT = {
  HERO_TITLE: 'Revolutionize Your Restaurant Experience',
  HERO_SUBTITLE: 'Digital menu, QR ordering, and real-time management',
  FEATURES_TITLE: 'Everything You Need to Run Your Restaurant',
  TESTIMONIALS_TITLE: 'What Our Customers Say',
  
  hero: {
    badge: 'New Features Available',
    title: 'Revolutionize Your Restaurant Experience',
    subtitle: 'Digital menu, QR ordering, and real-time management',
    description: 'Transform your restaurant with our comprehensive digital solution. From contactless ordering to real-time analytics, we help you deliver exceptional dining experiences.',
    cta: {
      primary: 'Start Free Trial',
      secondary: 'Watch Demo'
    }
  },
  
  features: {
    title: 'Everything You Need to Run Your Restaurant',
    subtitle: 'Comprehensive tools designed for modern restaurants'
  },

  
  benefits: {
    title: 'Why Choose Dino?',
    subtitle: 'Join thousands of restaurants already transforming their business',
    stats: {
      processing: {
        value: '3x',
        label: 'Faster Order Processing'
      },
      satisfaction: {
        value: '99%',
        label: 'Customer Satisfaction'
      },
      availability: {
        value: '24/7',
        label: 'System Availability'
      }
    }
  },
  
  testimonials: {
    title: 'What Our Customers Say',
    subtitle: 'Trusted by restaurants across India'
  },
  
  contact: {
    title: 'Ready to Get Started?',
    subtitle: 'Contact us today and transform your restaurant experience'
  }
} as const;

// Testimonial Stats
export const TESTIMONIAL_STATS = {
  RESTAURANTS: '500+',
  ORDERS: '100K+',
  SATISFACTION: '99%',
  UPTIME: '99.9%',
} as const;

