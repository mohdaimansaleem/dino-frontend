import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tourService, TourStatus } from '../services/api';
import { useAuth } from './AuthContext';

export interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'none';
  nextButtonText?: string;
  showSkip?: boolean;
  isOptional?: boolean;
}

export interface TourContextType {
  // Tour state
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  tourStatus: TourStatus | null;
  loading: boolean;
  
  // Tour controls
  startTour: (steps: TourStep[]) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  restartTour: () => void;
  goToStep: (stepIndex: number) => void;
  
  // Tour status
  refreshTourStatus: () => Promise<void>;
  shouldShowTour: boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

interface TourProviderProps {
  children: ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [tourStatus, setTourStatus] = useState<TourStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Load tour status when user is authenticated
  useEffect(() => {
    console.log('🎯 TourContext useEffect - auth state changed:', {
      isAuthenticated,
      hasUser: !!user,
      userId: user?.id
    });
    
    if (isAuthenticated && user) {
      console.log('🎯 Loading tour status for authenticated user');
      refreshTourStatus();
    }
  }, [isAuthenticated, user]);

  const refreshTourStatus = async () => {
    try {
      console.log('🎯 Refreshing tour status...');
      setLoading(true);
      const status = await tourService.getTourStatus();
      console.log('🎯 Tour status received from API:', status);
      setTourStatus(status);
      console.log('🎯 Tour status set in context:', status);
    } catch (error) {
      console.error('❌ Failed to load tour status:', error);
      setTourStatus(null);
    } finally {
      setLoading(false);
      console.log('🎯 Tour status loading completed');
    }
  };

  const startTour = (tourSteps: TourStep[]) => {
    console.log('🎬 Starting tour with', tourSteps.length, 'steps');
    console.log('🎯 Tour steps:', tourSteps.map(step => ({ id: step.id, target: step.target })));
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsActive(true);
    console.log('✅ Tour state updated - isActive:', true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Tour completed
      completeTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const skipTour = async () => {
    try {
      await tourService.skipTour();
      setIsActive(false);
      setCurrentStep(0);
      setSteps([]);
      await refreshTourStatus();
      console.log('⏭️ Tour skipped');
    } catch (error) {
      console.error('Failed to skip tour:', error);
    }
  };

  const completeTour = async () => {
    try {
      await tourService.completeTour();
      setIsActive(false);
      setCurrentStep(0);
      setSteps([]);
      await refreshTourStatus();
      console.log('✅ Tour completed');
    } catch (error) {
      console.error('Failed to complete tour:', error);
    }
  };

  const restartTour = async () => {
    try {
      await tourService.restartTour();
      await refreshTourStatus();
      console.log('🔄 Tour restarted');
    } catch (error) {
      console.error('Failed to restart tour:', error);
    }
  };

  const shouldShowTour = tourStatus?.should_show_tour || false;

  const value: TourContextType = {
    // Tour state
    isActive,
    currentStep,
    steps,
    tourStatus,
    loading,
    
    // Tour controls
    startTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    restartTour,
    goToStep,
    
    // Tour status
    refreshTourStatus,
    shouldShowTour,
  };

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = (): TourContextType => {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};