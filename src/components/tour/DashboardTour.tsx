import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTour } from '../../contexts/TourContext';
import TourOverlay from './TourOverlay';
import adminTourSteps from './tourSteps/adminTourSteps';
import operatorTourSteps from './tourSteps/operatorTourSteps';
import superAdminTourSteps from './tourSteps/superAdminTourSteps';

interface DashboardTourProps {
  className?: string;
}

const DashboardTour: React.FC<DashboardTourProps> = ({ className }) => {
  const { user, isAdmin, isOperator, isSuperAdmin } = useAuth();
  const { shouldShowTour, startTour, tourStatus, loading } = useTour();

  // Determine which tour steps to use based on user role
  const getTourSteps = () => {
    if (isSuperAdmin()) {
      return superAdminTourSteps;
    } else if (isAdmin()) {
      return adminTourSteps;
    } else if (isOperator()) {
      return operatorTourSteps;
    }
    return adminTourSteps; // Default fallback
  };

  // Auto-start tour for first-time users
  useEffect(() => {
    if (!loading && shouldShowTour && user && tourStatus) {
      console.log('🎯 Starting dashboard tour for first-time user:', {
        userId: user.id,
        role: user.role,
        shouldShowTour,
        tourCompleted: tourStatus.tour_completed,
        tourSkipped: tourStatus.tour_skipped,
      });

      // Small delay to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        const steps = getTourSteps();
        startTour(steps);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loading, shouldShowTour, user, tourStatus, startTour]);

  // Don't render anything if tour shouldn't be shown
  if (loading || !shouldShowTour || !user) {
    return null;
  }

  return (
    <div className={className}>
      <TourOverlay />
    </div>
  );
};

export default DashboardTour;