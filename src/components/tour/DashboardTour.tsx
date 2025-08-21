import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTour } from '../../contexts/TourContext';
import TourOverlay from './TourOverlay';
import universalTourSteps from './tourSteps/universalTourSteps';

interface DashboardTourProps {
  className?: string;
}

const DashboardTour: React.FC<DashboardTourProps> = ({ className }) => {
  console.log('🎬 DashboardTour component rendered');
  const { user, isAdmin, isOperator, isSuperAdmin } = useAuth();
  const { shouldShowTour, startTour, tourStatus, loading, isActive } = useTour();
  
  console.log('🎬 DashboardTour props and state:', {
    user: user ? { id: user.id, role: user.role } : null,
    shouldShowTour,
    tourStatus,
    loading,
    isAdmin: isAdmin(),
    isOperator: isOperator(),
    isSuperAdmin: isSuperAdmin()
  });

  // Use universal tour steps for all roles
  const getTourSteps = () => {
    return universalTourSteps;
  };

  // Auto-start tour for first-time users
  useEffect(() => {
    console.log('🔍 DashboardTour useEffect triggered:', {
      loading,
      shouldShowTour,
      hasUser: !!user,
      hasTourStatus: !!tourStatus,
      tourStatus: tourStatus
    });

    if (!loading && shouldShowTour && user && tourStatus && !tourStatus.tour_completed && !tourStatus.tour_skipped && !isActive) {
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
        console.log('🎬 Tour steps prepared:', steps.length, 'steps');
        console.log('🎯 First step target:', steps[0]?.target);
        
        // Check if first target element exists (skip for center placement)
        if (steps[0]?.target !== 'center') {
          const firstTarget = document.querySelector(steps[0]?.target);
          console.log('🎯 First target element found:', !!firstTarget, firstTarget);
        }
        
        // Check all available data-tour elements
        const allTourElements = document.querySelectorAll('[data-tour]');
        console.log('🎯 All available tour elements:', Array.from(allTourElements).map(el => el.getAttribute('data-tour')));
        
        console.log('🎬 Calling startTour with steps:', steps);
        startTour(steps);
      }, 1000); // Reduced delay to 1 second

      return () => clearTimeout(timer);
    } else {
      console.log('🚫 Tour not starting because:', {
        loading: loading ? 'still loading' : 'loaded',
        shouldShowTour: shouldShowTour ? 'should show' : 'should not show',
        hasUser: !!user ? 'has user' : 'no user',
        hasTourStatus: !!tourStatus ? 'has tour status' : 'no tour status',
        tourCompleted: tourStatus?.tour_completed,
        tourSkipped: tourStatus?.tour_skipped,
        tourStatusDetails: tourStatus
      });
    }
  }, [loading, shouldShowTour, user, tourStatus, isActive, startTour]);

  // Don't render anything if tour shouldn't be shown
  if (loading || !shouldShowTour || !user) {
    console.log('🚫 DashboardTour not rendering because:', {
      loading,
      shouldShowTour,
      hasUser: !!user
    });
    return null;
  }

  console.log('✅ DashboardTour rendering TourOverlay');
  return (
    <div className={className}>
      <TourOverlay />
    </div>
  );
};

export default DashboardTour;