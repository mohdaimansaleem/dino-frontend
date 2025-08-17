import React from 'react';
import { Box } from '@mui/material';

// Simple space background without complex animations
const SimpleSpaceBackground: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
        background: 'radial-gradient(circle at 30% 40%, rgba(135, 206, 235, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 152, 0, 0.2) 0%, transparent 50%)',
      }}
    >
      {/* Simple Stars */}
      {[...Array(20)].map((_, index) => (
        <Box
          key={`star-${index}`}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '2px',
            height: '2px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            opacity: 0.8,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
          }}
        />
      ))}
      
      {/* Simple Cat Silhouette */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '25%',
          transform: 'translate(-50%, -50%)',
          width: '200px',
          height: '200px',
          backgroundColor: 'rgba(255, 183, 77, 0.3)',
          borderRadius: '50%',
          border: '3px solid rgba(25, 118, 210, 0.4)',
          backdropFilter: 'blur(10px)',
        }}
      />
      
      {/* Simple Asteroid */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '60px',
          height: '60px',
          backgroundColor: 'rgba(255, 152, 0, 0.4)',
          borderRadius: '50%',
          backdropFilter: 'blur(5px)',
        }}
      />
    </Box>
  );
};

export default SimpleSpaceBackground;