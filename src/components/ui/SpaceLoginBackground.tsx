import React from 'react';
import { Box, keyframes } from '@mui/material';

// Space-themed animations for login page
const floatInSpace = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  50% { 
    transform: translateY(-20px) rotate(2deg); 
  }
`;

const asteroidFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  50% { 
    transform: translateY(-30px) rotate(10deg); 
  }
`;

const starTwinkle = keyframes`
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.2);
  }
`;

const helmetGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(135, 206, 235, 0.3);
  }
  50% { 
    box-shadow: 0 0 40px rgba(135, 206, 235, 0.6);
  }
`;

const spaceFloat = keyframes`
  0% { 
    transform: translateY(0px) translateX(0px);
  }
  25% { 
    transform: translateY(-10px) translateX(5px);
  }
  50% { 
    transform: translateY(-5px) translateX(-3px);
  }
  75% { 
    transform: translateY(-15px) translateX(2px);
  }
  100% { 
    transform: translateY(0px) translateX(0px);
  }
`;

// Space Cat Astronaut Component
const SpaceLoginBackground: React.FC = () => {
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
      }}
    >
      {/* Cat Astronaut */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '25%',
          transform: 'translate(-50%, -50%)',
          width: '300px',
          height: '350px',
          animation: `${floatInSpace} 6s ease-in-out infinite`,
          zIndex: 3,
        }}
      >
        {/* Cat Body */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '120px',
            height: '140px',
            backgroundColor: '#ffffff',
            borderRadius: '60px 60px 40px 40px',
            border: '4px solid #1976d2',
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.3)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80px',
              height: '100px',
              backgroundColor: '#f5f5f5',
              borderRadius: '40px',
              border: '2px solid #1976d2',
            },
          }}
        />

        {/* Cat Head */}
        <Box
          sx={{
            position: 'absolute',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100px',
            height: '100px',
            backgroundColor: '#ffb74d',
            borderRadius: '50%',
            border: '3px solid #1976d2',
            boxShadow: '0 6px 24px rgba(255, 183, 77, 0.4)',
            zIndex: 2,
          }}
        />

        {/* Cat Ears */}
        <Box
          sx={{
            position: 'absolute',
            top: '45px',
            left: '40%',
            width: '0',
            height: '0',
            borderLeft: '15px solid transparent',
            borderRight: '15px solid transparent',
            borderBottom: '25px solid #ffb74d',
            transform: 'rotate(-20deg)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '45px',
            right: '40%',
            width: '0',
            height: '0',
            borderLeft: '15px solid transparent',
            borderRight: '15px solid transparent',
            borderBottom: '25px solid #ffb74d',
            transform: 'rotate(20deg)',
          }}
        />

        {/* Cat Eyes */}
        <Box
          sx={{
            position: 'absolute',
            top: '85px',
            left: '35%',
            width: '12px',
            height: '12px',
            backgroundColor: '#2e7d32',
            borderRadius: '50%',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '2px',
              left: '2px',
              width: '4px',
              height: '4px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
            },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '85px',
            right: '35%',
            width: '12px',
            height: '12px',
            backgroundColor: '#2e7d32',
            borderRadius: '50%',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '2px',
              left: '2px',
              width: '4px',
              height: '4px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
            },
          }}
        />

        {/* Cat Nose */}
        <Box
          sx={{
            position: 'absolute',
            top: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '8px',
            height: '6px',
            backgroundColor: '#e91e63',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          }}
        />

        {/* Astronaut Helmet */}
        <Box
          sx={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '130px',
            height: '130px',
            backgroundColor: 'rgba(135, 206, 235, 0.2)',
            borderRadius: '50%',
            border: '4px solid rgba(135, 206, 235, 0.8)',
            animation: `${helmetGlow} 4s ease-in-out infinite`,
            backdropFilter: 'blur(2px)',
            zIndex: 4,
          }}
        />

        {/* Helmet Reflection */}
        <Box
          sx={{
            position: 'absolute',
            top: '55px',
            left: '45%',
            width: '40px',
            height: '60px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            transform: 'rotate(-20deg)',
            zIndex: 5,
          }}
        />

        {/* Spacesuit Arms */}
        <Box
          sx={{
            position: 'absolute',
            top: '120px',
            left: '20px',
            width: '30px',
            height: '80px',
            backgroundColor: '#ffffff',
            borderRadius: '15px',
            border: '3px solid #1976d2',
            transform: 'rotate(-15deg)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '120px',
            right: '20px',
            width: '30px',
            height: '80px',
            backgroundColor: '#ffffff',
            borderRadius: '15px',
            border: '3px solid #1976d2',
            transform: 'rotate(15deg)',
          }}
        />

        {/* Spacesuit Legs */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '20px',
            left: '35%',
            width: '25px',
            height: '70px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '3px solid #1976d2',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20px',
            right: '35%',
            width: '25px',
            height: '70px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '3px solid #1976d2',
          }}
        />

        {/* Space Boots */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '5px',
            left: '30%',
            width: '35px',
            height: '20px',
            backgroundColor: '#1976d2',
            borderRadius: '17px',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '5px',
            right: '30%',
            width: '35px',
            height: '20px',
            backgroundColor: '#1976d2',
            borderRadius: '17px',
          }}
        />
      </Box>

      {/* Orange Asteroid */}
      <Box
        sx={{
          position: 'absolute',
          top: '15%',
          left: '15%',
          width: '80px',
          height: '80px',
          backgroundColor: '#ff9800',
          borderRadius: '50%',
          animation: `${asteroidFloat} 8s ease-in-out infinite`,
          boxShadow: '0 6px 24px rgba(255, 152, 0, 0.4)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '15px',
            left: '20px',
            width: '15px',
            height: '15px',
            backgroundColor: '#f57c00',
            borderRadius: '50%',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: '20px',
            right: '15px',
            width: '10px',
            height: '10px',
            backgroundColor: '#f57c00',
            borderRadius: '50%',
          },
        }}
      />

      {/* Scattered Stars */}
      {[...Array(20)].map((_, index) => (
        <Box
          key={`star-${index}`}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '4px',
            height: '4px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            animation: `${starTwinkle} ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-2px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '1px',
              height: '8px',
              backgroundColor: '#ffffff',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              left: '-2px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '8px',
              height: '1px',
              backgroundColor: '#ffffff',
            },
          }}
        />
      ))}

      {/* Floating Space Particles */}
      {[...Array(15)].map((_, index) => (
        <Box
          key={`particle-${index}`}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 60}%`, // Keep particles on left side
            width: `${3 + Math.random() * 6}px`,
            height: `${3 + Math.random() * 6}px`,
            backgroundColor: 'rgba(135, 206, 235, 0.6)',
            borderRadius: '50%',
            animation: `${spaceFloat} ${4 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            boxShadow: '0 0 8px rgba(135, 206, 235, 0.4)',
          }}
        />
      ))}

      {/* Additional Asteroids */}
      <Box
        sx={{
          position: 'absolute',
          top: '70%',
          left: '5%',
          width: '40px',
          height: '40px',
          backgroundColor: '#ff7043',
          borderRadius: '50%',
          animation: `${asteroidFloat} 10s ease-in-out infinite`,
          animationDelay: '2s',
          boxShadow: '0 4px 16px rgba(255, 112, 67, 0.3)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: '25%',
          left: '45%',
          width: '25px',
          height: '25px',
          backgroundColor: '#ffab40',
          borderRadius: '50%',
          animation: `${spaceFloat} 7s ease-in-out infinite`,
          animationDelay: '1s',
          boxShadow: '0 3px 12px rgba(255, 171, 64, 0.3)',
        }}
      />

      {/* Space Dust */}
      {[...Array(30)].map((_, index) => (
        <Box
          key={`dust-${index}`}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 70}%`, // Keep on left side
            width: '1px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '50%',
            animation: `${starTwinkle} ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}
    </Box>
  );
};

export default SpaceLoginBackground;