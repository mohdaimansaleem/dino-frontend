// QR Code Template Components
export { default as ClassicTemplate } from './ClassicTemplate';
export { default as ModernTemplate } from './ModernTemplate';
export { default as ElegantTemplate } from './ElegantTemplate';
export { default as MinimalTemplate } from './MinimalTemplate';
export { default as PremiumTemplate } from './PremiumTemplate';
export { default as ColorfulTemplate } from './ColorfulTemplate';
export { default as RetroTemplate } from './RetroTemplate';
export { default as TechTemplate } from './TechTemplate';
export { default as NatureTemplate } from './NatureTemplate';
export { default as ArtisticTemplate } from './ArtisticTemplate';
export { default as CorporateTemplate } from './CorporateTemplate';
export { default as FestiveTemplate } from './FestiveTemplate';
export { default as BusinessTemplate } from './BusinessTemplate';
export { default as SimpleTemplate } from './SimpleTemplate';
export { default as ProfessionalTemplate } from './ProfessionalTemplate';
export { default as CleanTemplate } from './CleanTemplate';
export { default as StandardTemplate } from './StandardTemplate';
export { default as TemplateRenderer } from './TemplateRenderer';

// Template types and interfaces
export interface TemplateProps {
  qrCodeBase64: string;
  venueName: string;
  tableNumber: string;
  menuUrl: string;
  primaryColor?: string;
  includeInstructions?: boolean;
  layout?: 'standard' | 'compact' | 'large';
  colorScheme?: 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export interface TemplateConfig {
  name: string;
  description: string;
  icon: string;
  previewGradient: string;
  textColor: string;
  category: 'professional' | 'creative' | 'themed';
}

export const templateConfigs: Record<string, TemplateConfig> = {
  classic: {
    name: 'Classic',
    description: 'Traditional design with clean borders and professional styling',
    icon: '🏛️',
    previewGradient: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    textColor: '#333333',
    category: 'professional'
  },
  modern: {
    name: 'Modern',
    description: 'Contemporary gradient design with sleek typography',
    icon: '🚀',
    previewGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#ffffff',
    category: 'professional'
  },
  elegant: {
    name: 'Elegant',
    description: 'Sophisticated layout with gold accents and serif fonts',
    icon: '✨',
    previewGradient: 'linear-gradient(135deg, #f8f6f0 0%, #d4af37 100%)',
    textColor: '#2c2c2c',
    category: 'professional'
  },
  minimal: {
    name: 'Minimal',
    description: 'Clean, simple design with minimal visual elements',
    icon: '⚪',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
    textColor: '#666666',
    category: 'professional'
  },
  premium: {
    name: 'Premium',
    description: 'Luxury black and gold theme with premium styling',
    icon: '👑',
    previewGradient: 'linear-gradient(135deg, #000000 0%, #d4af37 100%)',
    textColor: '#d4af37',
    category: 'professional'
  },
  colorful: {
    name: 'Colorful',
    description: 'Vibrant rainbow gradients with playful animations',
    icon: '🌈',
    previewGradient: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
    textColor: '#ffffff',
    category: 'creative'
  },
  retro: {
    name: 'Retro',
    description: 'Vintage-inspired design with classic typography',
    icon: '📻',
    previewGradient: 'linear-gradient(135deg, #f4e4bc 0%, #d2b48c 100%)',
    textColor: '#8b4513',
    category: 'themed'
  },
  tech: {
    name: 'Tech',
    description: 'Futuristic green-on-black terminal aesthetic',
    icon: '💻',
    previewGradient: 'linear-gradient(135deg, #0a0a0a 0%, #00ff41 100%)',
    textColor: '#00ff41',
    category: 'themed'
  },
  nature: {
    name: 'Nature',
    description: 'Organic green theme with natural elements',
    icon: '🌿',
    previewGradient: 'linear-gradient(135deg, #a8e6cf 0%, #4a7c59 100%)',
    textColor: '#2d5016',
    category: 'themed'
  },
  artistic: {
    name: 'Artistic',
    description: 'Creative design with paint splash effects',
    icon: '🎨',
    previewGradient: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 100%)',
    textColor: '#2c2c54',
    category: 'creative'
  },
  corporate: {
    name: 'Corporate',
    description: 'Professional business theme with clean lines',
    icon: '🏢',
    previewGradient: 'linear-gradient(135deg, #f8f9fa 0%, #0056b3 100%)',
    textColor: '#ffffff',
    category: 'professional'
  },
  festive: {
    name: 'Festive',
    description: 'Celebration theme with party colors and animations',
    icon: '🎉',
    previewGradient: 'linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3)',
    textColor: '#ffffff',
    category: 'creative'
  },
  business: {
    name: 'Business',
    description: 'Clean corporate style with professional layout',
    icon: '💼',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #1976d2 100%)',
    textColor: '#1976d2',
    category: 'professional'
  },
  simple: {
    name: 'Simple',
    description: 'Ultra-minimal design with clean typography',
    icon: '⭕',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
    textColor: '#424242',
    category: 'professional'
  },
  professional: {
    name: 'Professional',
    description: 'Formal business template with elegant styling',
    icon: '🎯',
    previewGradient: 'linear-gradient(135deg, #f5f5f5 0%, #2c3e50 100%)',
    textColor: '#2c3e50',
    category: 'professional'
  },
  clean: {
    name: 'Clean',
    description: 'Modern clean design with subtle shadows',
    icon: '✨',
    previewGradient: 'linear-gradient(135deg, #ffffff 0%, #ecf0f1 100%)',
    textColor: '#34495e',
    category: 'professional'
  },
  standard: {
    name: 'Standard',
    description: 'Basic professional template for everyday use',
    icon: '📋',
    previewGradient: 'linear-gradient(135deg, #fafafa 0%, #1565c0 100%)',
    textColor: '#1565c0',
    category: 'professional'
  }
};