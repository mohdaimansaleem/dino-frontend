import {
  QrCode,
  Analytics,
  Speed,
  Security,
  Smartphone,
  CloudDone,
  Restaurant,
  TableRestaurant,
  ShoppingCart,
  Notifications,
  TrendingUp,
  Support,
  Star,
  Inventory,
  People,
  Assessment,
  Phone,
  Email,
  LocationOn,
  Schedule,
  Business,
  Engineering,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Home,
  Info,
  AttachMoney,
  RateReview,
  ContactMail,
  EmojiEvents,
  CorporateFare,
} from '@mui/icons-material';

// Company Information
export const COMPANY_INFO = {
  name: 'Dino',
  fullName: 'Dino',
  tagline: 'Digital Menu Revolution',
  description: 'Transform your restaurant with our cutting-edge digital menu system. Enhance customer experience, boost efficiency, and increase revenue with our innovative QR-based ordering platform.',
  
  // Contact Information
  contact: {
    phone: {
      primary: '+91 98765 43210',
      secondary: '+91 98765 43211',
      hours: 'Mon-Fri 9AM-6PM IST'
    },
    email: {
      primary: 'hello@dinoemenu.in',
      support: 'support@dinoemenu.com',
      sales: 'sales@dinoemenu.com',
      tech: 'tech@dinoemenu.com',
      partners: 'partners@dinoemenu.com',
      responseTime: 'We reply within 24 hours'
    },
    address: {
      street: '123 Tech Park, Sector 5',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500032',
      country: 'India',
      full: 'BKC, Mumbai, Maharashtra 400051',
      description: 'Visit us for demos'
    },
    businessHours: {
      weekdays: 'Monday - Friday: 9:00 AM - 6:00 PM',
      saturday: 'Saturday: 10:00 AM - 4:00 PM',
      sunday: 'Sunday: Closed'
    }
  },

  // Social Media
  socialMedia: [
    { platform: 'Facebook', icon: Facebook, color: '#1877F2', url: '#' },
    { platform: 'Twitter', icon: Twitter, color: '#1DA1F2', url: '#' },
    { platform: 'Instagram', icon: Instagram, color: '#E4405F', url: '#' },
    { platform: 'LinkedIn', icon: LinkedIn, color: '#0A66C2', url: '#' },
  ],

  // Legal
  legal: {
    copyright: '© 2024 Dino Digital Menu Revolution. All rights reserved.'
  }
} as const;

// Statistics and Metrics
export const COMPANY_STATS = [
  { 
    number: 5000, 
    suffix: "+", 
    label: "Restaurants", 
    icon: Restaurant,
    color: '#4caf50',
    bgColor: 'rgba(76, 175, 80, 0.1)',
    decimals: 0
  },
  { 
    number: 1000000, 
    suffix: "+", 
    label: "Orders Daily", 
    icon: TrendingUp,
    color: '#2196f3',
    bgColor: 'rgba(33, 150, 243, 0.1)',
    decimals: 0
  },
  { 
    number: 99.9, 
    suffix: "%", 
    label: "Uptime", 
    icon: CloudDone, 
    decimals: 1,
    color: '#ff9800',
    bgColor: 'rgba(255, 152, 0, 0.1)'
  },
  { 
    number: 45, 
    suffix: "%", 
    label: "Revenue Boost", 
    icon: EmojiEvents,
    color: '#4caf50',
    bgColor: 'rgba(76, 175, 80, 0.1)',
    decimals: 0
  },
] as const;

// Core Features
export const CORE_FEATURES = [
  {
    icon: QrCode,
    title: 'Smart QR Ordering',
    description: 'Customers scan QR codes to access your menu and place orders instantly with zero wait time.',
    stats: '99.9% Uptime',
    color: '#2196F3',
    benefits: [
      'Zero contact ordering',
      'Instant menu access',
      'Reduced wait times',
      'Multi-language support'
    ]
  },
  {
    icon: Analytics,
    title: 'Advanced Analytics',
    description: 'Real-time insights, predictive analytics, and revenue optimization tools for data-driven decisions.',
    stats: '40% Revenue Boost',
    color: '#4CAF50',
    benefits: [
      'Real-time sales tracking',
      'Customer behavior insights',
      'Popular item analysis',
      'Revenue forecasting'
    ]
  },
  {
    icon: Security,
    title: 'Enterprise Security',
    description: 'Bank-level encryption, PCI compliance, and 24/7 monitoring to keep your data safe.',
    stats: 'ISO 27001 Certified',
    color: '#9C27B0',
    benefits: [
      'SSL encryption',
      'PCI compliance',
      'Data protection',
      'Secure payments'
    ]
  },
  {
    icon: Speed,
    title: 'Lightning Fast',
    description: 'Sub-second loading times with global CDN and edge computing for optimal performance.',
    stats: '<100ms Response',
    color: '#FF9800',
    benefits: [
      'Sub-second loading',
      'Global CDN',
      'Edge computing',
      'Optimized performance'
    ]
  },
  {
    icon: Smartphone,
    title: 'Mobile First',
    description: 'Progressive web app with offline support and native app experience across all devices.',
    stats: '5-Star Rating',
    color: '#E91E63',
    benefits: [
      'Works on any device',
      'Offline functionality',
      'App-like experience',
      'Fast loading times'
    ]
  },
  {
    icon: Support,
    title: 'Premium Support',
    description: 'Dedicated success manager, priority support, and custom integrations for enterprise clients.',
    stats: '24/7 Available',
    color: '#00BCD4',
    benefits: [
      'Dedicated success manager',
      'Priority support',
      'Custom integrations',
      '24/7 availability'
    ]
  },
] as const;

// Management Features
export const MANAGEMENT_FEATURES = [
  {
    icon: Restaurant,
    title: 'Menu Management',
    description: 'Easy-to-use interface for managing your menu items, categories, and pricing.',
    features: [
      'Drag & drop menu organization',
      'Real-time price updates',
      'Image management',
      'Availability controls'
    ]
  },
  {
    icon: ShoppingCart,
    title: 'Order Management',
    description: 'Streamlined order processing with real-time updates and status tracking.',
    features: [
      'Real-time order notifications',
      'Order status tracking',
      'Kitchen display integration',
      'Customer communication'
    ]
  },
  {
    icon: TableRestaurant,
    title: 'Table Management',
    description: 'Efficient table management with QR code generation and occupancy tracking.',
    features: [
      'QR code generation',
      'Table status tracking',
      'Capacity management',
      'Reservation integration'
    ]
  },
  {
    icon: People,
    title: 'User Management',
    description: 'Role-based access control with permission management for your team.',
    features: [
      'Role-based permissions',
      'Staff management',
      'Activity tracking',
      'Multi-location support'
    ]
  }
] as const;

// Advanced Features
export const ADVANCED_FEATURES = [
  {
    icon: Notifications,
    title: 'Real-time Notifications',
    description: 'Instant notifications for new orders, status updates, and important alerts.',
    color: '#1976d2'
  },
  {
    icon: TrendingUp,
    title: 'Sales Analytics',
    description: 'Detailed sales reports with trends, forecasting, and performance metrics.',
    color: '#388e3c'
  },
  {
    icon: Inventory,
    title: 'Inventory Tracking',
    description: 'Monitor stock levels and get alerts when items are running low.',
    color: '#f57c00'
  },
  {
    icon: Assessment,
    title: 'Custom Reports',
    description: 'Generate custom reports for accounting, tax filing, and business analysis.',
    color: '#7b1fa2'
  },
  {
    icon: CloudDone,
    title: 'Cloud Backup',
    description: 'Automatic cloud backup ensures your data is always safe and accessible.',
    color: '#0288d1'
  },
  {
    icon: Support,
    title: '24/7 Support',
    description: 'Round-the-clock customer support with dedicated account managers.',
    color: '#d32f2f'
  }
] as const;

// Pricing Plans
export const PRICING_PLANS = [
  {
    id: 'basic',
    name: 'Starter',
    description: 'Perfect for small cafes and restaurants',
    monthlyPrice: 2999,
    annualPrice: 29990,
    popular: false,
    maxCafes: 2 as const,
    maxUsers: 5 as const,
    icon: Restaurant,
    color: 'primary',
    features: [
      'Up to 2 cafes',
      'Basic QR menu',
      'Order management',
      'Basic analytics',
      'Email support',
      'Mobile app access',
      'QR Code Ordering',
      'Digital Menu Management',
      'Table Management',
      'Customer Support',
      'Payment Integration'
    ],
    limitations: [
      'Limited to 2 cafe locations',
      'Basic reporting only',
      'Email support only'
    ]
  },
  {
    id: 'premium',
    name: 'Professional',
    description: 'Ideal for growing restaurant chains',
    monthlyPrice: 7999,
    annualPrice: 79990,
    popular: true,
    maxCafes: 10 as const,
    maxUsers: 25 as const,
    icon: Business,
    color: 'secondary',
    features: [
      'Up to 10 cafes',
      'Advanced QR features',
      'Real-time analytics',
      'Customer insights',
      'Priority support',
      'Custom branding',
      'Multi-language support',
      'Integration APIs',
      'Everything in Basic',
      'Advanced Analytics & Reports',
      'Real-time Notifications',
      'Multi-location Management',
      'Inventory Management',
      'Staff Management',
      'API Access',
      'Custom Integrations'
    ],
    limitations: [
      'Limited to 10 cafe locations',
      'Standard API rate limits'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large restaurant enterprises',
    monthlyPrice: 19999,
    annualPrice: 199990,
    popular: false,
    maxCafes: -1, // Unlimited
    maxUsers: -1, // Unlimited
    icon: CorporateFare,
    color: 'success',
    features: [
      'Unlimited cafes',
      'White-label solution',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Custom features',
      'Training & onboarding',
      'Everything in Premium',
      'Unlimited Locations',
      'Unlimited Users',
      'Advanced Security Features',
      'Dedicated Account Manager',
      'Custom Development',
      '24/7 Phone Support',
      'On-premise Deployment',
      'Advanced API Access',
      'Custom Reports & Analytics'
    ],
    limitations: []
  }
] as const;

// Add-ons
export const PRICING_ADDONS = [
  {
    name: 'Additional Location',
    description: 'Add extra cafe locations to your plan',
    price: 1500,
    unit: 'per location/month'
  },
  {
    name: 'Extra Users',
    description: 'Add more staff users to your account',
    price: 299,
    unit: 'per user/month'
  },
  {
    name: 'Custom Integration',
    description: 'Connect with your existing POS/billing systems',
    price: 15000,
    unit: 'one-time setup'
  },
  {
    name: 'Training Session',
    description: 'Dedicated training for your team',
    price: 5000,
    unit: 'per session'
  }
] as const;

// Testimonials
export const TESTIMONIALS = [
  {
    id: 1,
    name: "Rajesh Kumar",
    role: "Restaurant Owner",
    position: "Owner",
    restaurant: "Spice Garden",
    location: "Mumbai, India",
    rating: 5,
    comment: "Dino transformed our restaurant completely! Revenue increased by 45% in just 3 months. The QR ordering system is perfect for Indian customers.",
    quote: "Dino transformed our restaurant completely. We saw a 45% increase in orders within the first month. The QR code ordering system is a game-changer!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    metrics: {
      orderIncrease: '45%',
      timeReduction: '60%',
      customerSatisfaction: '95%'
    },
    plan: 'Premium'
  },
  {
    id: 2,
    name: "Priya Sharma",
    role: "Head Chef",
    position: "Manager",
    restaurant: "Mumbai Masala",
    location: "Delhi, India",
    rating: 5,
    comment: "The analytics helped us understand our customers better. We can track peak hours and optimize our menu for maximum profit.",
    quote: "The analytics dashboard gives us insights we never had before. We can track everything in real-time and make data-driven decisions.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    metrics: {
      orderIncrease: '35%',
      timeReduction: '50%',
      customerSatisfaction: '92%'
    },
    plan: 'Basic'
  },
  {
    id: 3,
    name: "Arjun Patel",
    role: "Manager",
    position: "Manager",
    restaurant: "Gujarati Thali House",
    location: "Bangalore, India",
    rating: 5,
    comment: "Setup was incredibly easy. Our customers love ordering from their phones. Wait times reduced by 60% during lunch rush!",
    quote: "Setup was incredibly easy. Our customers love ordering from their phones. Wait times reduced by 60% during lunch rush!",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    metrics: {
      orderIncrease: '30%',
      timeReduction: '45%',
      customerSatisfaction: '90%'
    },
    plan: 'Basic'
  },
  {
    id: 4,
    name: "Deepika Reddy",
    role: "Owner",
    position: "Owner",
    restaurant: "South Indian Express",
    location: "Chennai, India",
    rating: 5,
    comment: "Best investment for our chain! Order accuracy improved and customers appreciate the contactless experience, especially post-COVID.",
    quote: "Our customers love the contactless ordering. During COVID, this system kept our business running when others had to close.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    metrics: {
      orderIncrease: '40%',
      timeReduction: '55%',
      customerSatisfaction: '94%'
    },
    plan: 'Premium'
  },
  {
    id: 5,
    name: "Mohammed Ali",
    role: "Operations Manager",
    position: "CEO",
    restaurant: "Biryani Palace",
    location: "Hyderabad, India",
    rating: 5,
    comment: "Managing our 8 locations across Mumbai became so much easier. Real-time tracking and centralized menu management is fantastic.",
    quote: "Managing 12 locations was a nightmare before Dino. Now everything is centralized and we can monitor all our restaurants from one dashboard.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    metrics: {
      orderIncrease: '55%',
      timeReduction: '70%',
      customerSatisfaction: '97%'
    },
    plan: 'Enterprise'
  },
  {
    id: 6,
    name: "Anita Singh",
    role: "Franchise Owner",
    position: "Franchise Owner",
    restaurant: "Punjabi Dhaba Chain",
    location: "Chandigarh, India",
    rating: 5,
    comment: "The enterprise features are outstanding. Custom branding helps maintain our traditional dhaba feel while being modern.",
    quote: "The enterprise features are outstanding. Custom branding helps maintain our traditional dhaba feel while being modern.",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150",
    metrics: {
      orderIncrease: '38%',
      timeReduction: '52%',
      customerSatisfaction: '93%'
    },
    plan: 'Premium'
  },
  {
    id: 7,
    name: "Vikram Singh",
    role: "Manager",
    position: "Manager",
    restaurant: "Punjabi Dhaba",
    location: "Chandigarh, India",
    rating: 4,
    comment: "The staff training was excellent and the support team is always available. Implementation was smooth and customers adapted quickly.",
    quote: "The staff training was excellent and the support team is always available. Implementation was smooth and customers adapted quickly.",
    avatar: "/api/placeholder/64/64",
    metrics: {
      orderIncrease: '30%',
      timeReduction: '45%',
      customerSatisfaction: '90%'
    },
    plan: 'Basic'
  },
  {
    id: 8,
    name: "Suresh Agarwal",
    role: "Owner",
    position: "Owner",
    restaurant: "Rajasthani Royal Thali",
    location: "Jaipur, India",
    rating: 5,
    comment: "Our traditional thali business got a modern touch with Dino. Young customers love the QR ordering while we maintain our authentic taste.",
    quote: "Our traditional thali business got a modern touch with Dino. Young customers love the QR ordering while we maintain our authentic taste.",
    avatar: "/api/placeholder/64/64",
    metrics: {
      orderIncrease: '50%',
      timeReduction: '65%',
      customerSatisfaction: '96%'
    },
    plan: 'Basic'
  },
  {
    id: 9,
    name: "Kavita Joshi",
    role: "Manager",
    position: "Manager",
    restaurant: "Udupi Palace",
    location: "Bangalore, India",
    rating: 5,
    comment: "During festival seasons, we used to have huge queues. Now customers can order while waiting, and our efficiency has doubled.",
    quote: "During festival seasons, we used to have huge queues. Now customers can order while waiting, and our efficiency has doubled.",
    avatar: "/api/placeholder/64/64",
    metrics: {
      orderIncrease: '42%',
      timeReduction: '58%',
      customerSatisfaction: '94%'
    },
    plan: 'Premium'
  }
] as const;

// Success Stories
export const SUCCESS_STORIES = [
  {
    title: 'From Struggling to Thriving',
    restaurant: 'Green Leaf Cafe',
    story: 'A small cafe in Pune was struggling with long queues and order mix-ups. After implementing Dino, they reduced wait times by 65% and increased customer satisfaction scores from 3.2 to 4.7 stars.',
    results: ['65% reduction in wait time', '47% increase in orders', '4.7-star rating'],
    image: '/api/placeholder/300/200'
  },
  {
    title: 'Scaling Across Cities',
    restaurant: 'Masala Magic Chain',
    story: 'A regional chain wanted to expand but struggled with consistency across locations. Dino\'s centralized management helped them maintain quality while scaling from 3 to 15 locations.',
    results: ['5x location growth', 'Consistent quality', '60% operational efficiency'],
    image: '/api/placeholder/300/200'
  },
  {
    title: 'Digital Transformation Success',
    restaurant: 'Traditional Thali House',
    story: 'A 50-year-old traditional restaurant embraced digital ordering with Dino. They attracted younger customers while retaining their loyal base, increasing revenue by 80%.',
    results: ['80% revenue increase', '40% new customers', 'Preserved tradition'],
    image: '/api/placeholder/300/200'
  }
] as const;

// Benefits
export const BENEFITS = [
  'Reduce order processing time by 60%',
  'Increase table turnover rate',
  'Minimize order errors',
  'Contactless ordering experience',
  'Real-time order tracking',
  'Detailed sales analytics',
  'Easy menu updates',
  'Multi-language support',
] as const;

// Integrations
export const INTEGRATIONS = [
  'Payment Gateways (Stripe, PayPal, Razorpay)',
  'Accounting Software (QuickBooks, Xero)',
  'Delivery Platforms (Uber Eats, DoorDash)',
  'POS Systems (Square, Toast)',
  'Email Marketing (Mailchimp, SendGrid)',
  'SMS Services (Twilio, TextLocal)'
] as const;

// Contact Departments
export const CONTACT_DEPARTMENTS = [
  {
    icon: Business,
    title: 'Sales',
    email: 'sales@dinoemenu.com',
    description: 'Questions about pricing, plans, and demos'
  },
  {
    icon: Support,
    title: 'Support',
    email: 'support@dinoemenu.com',
    description: 'Technical support and account help'
  },
  {
    icon: Engineering,
    title: 'Technical',
    email: 'tech@dinoemenu.com',
    description: 'API, integrations, and custom development'
  },
  {
    icon: Business,
    title: 'Partnerships',
    email: 'partners@dinoemenu.com',
    description: 'Business partnerships and collaborations'
  }
] as const;

// Contact Information Cards
export const CONTACT_INFO = [
  {
    icon: Phone,
    title: 'Phone',
    details: ['+91 98765 43210', '+91 98765 43211'],
    description: 'Mon-Fri 9AM-6PM IST'
  },
  {
    icon: Email,
    title: 'Email',
    details: ['hello@dinoemenu.com', 'support@dinoemenu.com'],
    description: 'We reply within 24 hours'
  },
  {
    icon: LocationOn,
    title: 'Office',
    details: ['123 Tech Park, Sector 5', 'Hyderabad, Telangana 500032'],
    description: 'Visit us for demos'
  },
  {
    icon: Schedule,
    title: 'Business Hours',
    details: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 10:00 AM - 4:00 PM'],
    description: 'Sunday: Closed'
  }
] as const;

// FAQ Data
export const FAQS = [
  {
    question: 'Can I change my plan anytime?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes, we offer a 14-day free trial for all plans. No credit card required to start.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, UPI, net banking, and bank transfers. For enterprise plans, we also offer invoice-based billing with GST.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level encryption and are compliant with industry standards including PCI DSS, GDPR, and Indian data protection regulations.'
  },
  {
    question: 'Do you offer custom solutions?',
    answer: 'Yes, our Enterprise plan includes custom development and white-label solutions tailored to your specific needs.'
  },
  {
    question: 'How quickly can I get started?',
    answer: 'You can start using Dino immediately with our free trial. Setup takes less than 15 minutes.'
  },
  {
    question: 'Do you offer training?',
    answer: 'Yes, we provide comprehensive training for all plans, including video tutorials and live sessions.'
  },
  {
    question: 'Can you integrate with my existing POS?',
    answer: 'We support integration with most popular POS systems. Contact our technical team for specific requirements.'
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'We offer email support for all plans, with phone support and dedicated account managers for premium plans.'
  }
] as const;

// Navigation Items
export const NAVIGATION = {
  home: [
    { label: 'Home', id: 'hero', icon: Home },
    { label: 'Features', id: 'features', icon: Info },
    { label: 'Pricing', id: 'pricing', icon: AttachMoney },
    { label: 'Testimonials', id: 'testimonials', icon: RateReview },
    { label: 'Contact', id: 'contact', icon: ContactMail },
  ],
  footer: {
    platform: ['Features', 'Pricing', 'Testimonials', 'Demo'],
    solutions: ['QR Menu System', 'Order Management', 'Analytics Dashboard', 'Customer Insights']
  }
} as const;

// Footer Features
export const FOOTER_FEATURES = [
  { icon: QrCode, title: 'QR Ordering', description: 'Contactless dining experience' },
  { icon: Analytics, title: 'Analytics', description: 'Real-time insights' },
  { icon: Security, title: 'Secure', description: 'Bank-level encryption' },
  { icon: Speed, title: 'Fast', description: 'Lightning quick service' },
] as const;

// Content Text
export const CONTENT = {
  hero: {
    badge: 'Revolutionary Technology',
    title: 'Transform Your Restaurant',
    subtitle: 'with Digital Menu Ordering',
    description: 'Join 5,000+ restaurants across India revolutionizing customer experience with QR code-based digital menus. Let customers order directly from their phones while you manage everything from our powerful dashboard.',
    cta: {
      primary: 'Start Free Trial',
      secondary: 'Create Account',
      dashboard: 'Go to Dashboard'
    },
    quickActions: {
      learnMore: 'Learn More →',
      viewPricing: 'View Pricing →'
    }
  },
  features: {
    title: 'Why Choose Dino?',
    subtitle: 'Everything you need to modernize your restaurant ordering experience with cutting-edge technology'
  },
  pricing: {
    title: 'Simple, Transparent Pricing',
    subtitle: 'Choose the perfect plan for your restaurant. All plans include our core features with no hidden fees.',
    trialInfo: 'All plans include 14-day free trial • No setup fees • Cancel anytime',
    customPlan: 'Need a custom plan? Contact us'
  },
  testimonials: {
    title: 'Loved by Restaurant Owners',
    subtitle: 'See what our customers are saying about their experience with Dino'
  },
  contact: {
    title: 'Ready to Transform Your Restaurant?',
    subtitle: 'Join thousands of successful restaurants using Dino'
  },
  benefits: {
    title: 'Boost Your Restaurant\'s Efficiency',
    subtitle: 'Join hundreds of restaurants that have transformed their operations with Dino.',
    stats: {
      processing: { value: '60%', label: 'Faster Order Processing' },
      satisfaction: { value: '95%', label: 'Customer Satisfaction' },
      availability: { value: '24/7', label: 'System Availability' }
    }
  }
} as const;

// Testimonial Stats for Pages
export const TESTIMONIAL_STATS = [
  {
    number: '2,500+',
    label: 'Happy Restaurants',
    icon: Restaurant
  },
  {
    number: '5L+',
    label: 'Orders Processed',
    icon: TrendingUp
  },
  {
    number: '45%',
    label: 'Average Revenue Increase',
    icon: Speed
  },
  {
    number: '4.9/5',
    label: 'Customer Rating',
    icon: Star
  }
] as const;

// Pricing Benefits
export const PRICING_BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Proven ROI',
    description: 'Our customers see an average 40% increase in revenue within 3 months',
    color: '#4CAF50'
  },
  {
    icon: Security,
    title: 'Enterprise Security',
    description: 'Bank-level security with PCI compliance and end-to-end encryption',
    color: '#2196F3'
  },
  {
    icon: Support,
    title: 'Expert Support',
    description: '24/7 support with dedicated account managers for premium plans',
    color: '#FF9800'
  },
  {
    icon: CloudDone,
    title: '99.9% Uptime',
    description: 'Reliable cloud infrastructure with automatic backups and failover',
    color: '#9C27B0'
  }
] as const;