import { TourStep } from '../../../contexts/TourContext';

export const universalTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Dino! 🎉',
    content: 'Welcome to your restaurant management platform! Dino helps you manage orders, menus, tables, and staff all in one place. Let\'s take a quick tour to get you started.',
    target: 'center',
    placement: 'center',
    nextButtonText: 'Let\'s Start!',
    showSkip: true,
  },
  {
    id: 'navigation',
    title: 'Navigation Menu 🧭',
    content: 'Use this sidebar to navigate between different sections like Orders, Menu, Tables, and Settings. Your available options depend on your role and permissions.',
    target: '[data-tour="sidebar-navigation"]',
    placement: 'right',
    nextButtonText: 'Show Order Control',
  },
  {
    id: 'venue-status',
    title: 'Order Control Panel 🎛️',
    content: 'Control your order intake with this panel! Toggle your restaurant open or closed to manage when customers can place new orders. This is your main switch for order management.',
    target: '[data-tour="venue-status"]',
    placement: 'right',
    nextButtonText: 'Show Profile',
  },
  {
    id: 'profile',
    title: 'Your Profile 👤',
    content: 'Access your profile settings, update your information, change your password, and manage your account preferences from here.',
    target: '[data-tour="user-profile"]',
    placement: 'bottom',
    nextButtonText: 'Show Notifications',
  },
  {
    id: 'notifications',
    title: 'Stay Updated 🔔',
    content: 'Get real-time notifications about new orders, system updates, and important alerts. Never miss anything important happening in your restaurant.',
    target: '[data-tour="notifications"]',
    placement: 'bottom',
    nextButtonText: 'Almost Done!',
  },
  {
    id: 'completion',
    title: 'Thank You! 🚀',
    content: 'Congratulations! You now know the essential features of Dino. You can always restart this tour from your profile settings. Ready to start managing your restaurant like a pro?',
    target: 'center',
    placement: 'center',
    nextButtonText: 'Get Started',
    showSkip: false,
  },
];

export default universalTourSteps;