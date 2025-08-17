import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { useTour } from '../../contexts/TourContext';
import { useAuth } from '../../contexts/AuthContext';
import adminTourSteps from './tourSteps/adminTourSteps';

const TourDebugButton: React.FC = () => {
  const { startTour, tourStatus, shouldShowTour, isActive, loading } = useTour();
  const { user } = useAuth();

  const handleTestTour = () => {
    console.log('🧪 Manual tour test triggered');
    console.log('🧪 Current tour state:', {
      isActive,
      loading,
      shouldShowTour,
      tourStatus,
      user: user ? { id: user.id, role: user.role } : null
    });

    // Test with a simple single step first
    const testSteps = [
      {
        id: 'test-step',
        title: 'Test Tour Step',
        content: 'This is a test step to verify the tour overlay is working.',
        target: '[data-tour="dashboard-header"]',
        placement: 'bottom' as const,
      }
    ];

    console.log('🧪 Starting test tour with steps:', testSteps);
    startTour(testSteps);
  };

  const handleFullTour = () => {
    console.log('🧪 Starting full admin tour');
    startTour(adminTourSteps);
  };

  return (
    <Box sx={{ p: 2, border: '2px solid orange', borderRadius: 2, m: 2, backgroundColor: 'warning.50' }}>
      <Typography variant="h6" color="warning.main" gutterBottom>
        🧪 Tour Debug Panel
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        Current State: isActive={String(isActive)}, loading={String(loading)}, shouldShowTour={String(shouldShowTour)}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          color="warning" 
          onClick={handleTestTour}
          size="small"
        >
          Test Single Step
        </Button>
        
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={handleFullTour}
          size="small"
        >
          Start Full Tour
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={() => {
            console.log('🧪 Current DOM elements with data-tour:');
            const elements = document.querySelectorAll('[data-tour]');
            elements.forEach(el => {
              console.log(`  - ${el.getAttribute('data-tour')}:`, el);
            });
          }}
          size="small"
        >
          Check DOM Elements
        </Button>
      </Box>
    </Box>
  );
};

export default TourDebugButton;