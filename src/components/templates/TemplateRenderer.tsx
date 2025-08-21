import React from 'react';
import { TemplateProps } from './index';
import ClassicTemplate from './ClassicTemplate';
import ModernTemplate from './ModernTemplate';
import ElegantTemplate from './ElegantTemplate';
import MinimalTemplate from './MinimalTemplate';
import PremiumTemplate from './PremiumTemplate';
import ColorfulTemplate from './ColorfulTemplate';
import RetroTemplate from './RetroTemplate';
import TechTemplate from './TechTemplate';
import NatureTemplate from './NatureTemplate';
import ArtisticTemplate from './ArtisticTemplate';
import CorporateTemplate from './CorporateTemplate';
import FestiveTemplate from './FestiveTemplate';
import BusinessTemplate from './BusinessTemplate';
import SimpleTemplate from './SimpleTemplate';
import ProfessionalTemplate from './ProfessionalTemplate';
import CleanTemplate from './CleanTemplate';
import StandardTemplate from './StandardTemplate';

interface TemplateRendererProps extends TemplateProps {
  template: string;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ template, ...props }) => {
  const renderTemplate = () => {
    switch (template) {
      case 'classic':
        return <ClassicTemplate {...props} />;
      case 'modern':
        return <ModernTemplate {...props} />;
      case 'elegant':
        return <ElegantTemplate {...props} />;
      case 'minimal':
        return <MinimalTemplate {...props} />;
      case 'premium':
        return <PremiumTemplate {...props} />;
      case 'colorful':
        return <ColorfulTemplate {...props} />;
      case 'retro':
        return <RetroTemplate {...props} />;
      case 'tech':
        return <TechTemplate {...props} />;
      case 'nature':
        return <NatureTemplate {...props} />;
      case 'artistic':
        return <ArtisticTemplate {...props} />;
      case 'corporate':
        return <CorporateTemplate {...props} />;
      case 'festive':
        return <FestiveTemplate {...props} />;
      case 'business':
        return <BusinessTemplate {...props} />;
      case 'simple':
        return <SimpleTemplate {...props} />;
      case 'professional':
        return <ProfessionalTemplate {...props} />;
      case 'clean':
        return <CleanTemplate {...props} />;
      case 'standard':
        return <StandardTemplate {...props} />;
      default:
        return <ClassicTemplate {...props} />;
    }
  };

  return <>{renderTemplate()}</>;
};

export default TemplateRenderer;