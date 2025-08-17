import React from 'react';
import { Box, keyframes } from '@mui/material';

// Welcome-themed animations for login page
const welcomeFloat = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-15px) rotate(2deg); 
    opacity: 1;
  }
`;

const welcomeWave = keyframes`
  0% { 
    transform: rotate(0deg);
  }
  25% { 
    transform: rotate(15deg);
  }
  75% { 
    transform: rotate(-15deg);
  }
  100% { 
    transform: rotate(0deg);
  }
`;

const sparkle = keyframes`
  0%, 100% { 
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% { 
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
`;

const doorOpen = keyframes`
  0% { 
    transform: scaleX(0.1);
    opacity: 0.5;
  }
  50% { 
    transform: scaleX(1);
    opacity: 1;
  }
  100% { 
    transform: scaleX(0.1);
    opacity: 0.5;
  }
`;

const chefHat = keyframes`
  0%, 100% { 
    transform: translateY(0px) rotate(-2deg);
  }
  50% { 
    transform: translateY(-8px) rotate(2deg);
  }
`;

const plateRotate = keyframes`
  0% { 
    transform: rotate(0deg) scale(1);
  }
  50% { 
    transform: rotate(180deg) scale(1.1);
  }
  100% { 
    transform: rotate(360deg) scale(1);
  }
`;

const welcomeBubble = keyframes`
  0% {
    transform: translateY(100px) scale(0);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(1);
    opacity: 0;
  }
`;

const heartBeat = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
`;

// Welcome Animation Component for Login
const LoginAnimatedBackground: React.FC = () => {
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
      {/* Welcome Chef Characters */}
      {[...Array(3)].map((_, index) => (
        <Box
          key={`chef-${index}`}
          sx={{
            position: 'absolute',
            top: `${20 + (index * 25)}%`,
            left: `${5 + (index * 15)}%`,
            width: '80px',
            height: '80px',
            animation: `${welcomeFloat} ${4 + index * 0.5}s ease-in-out infinite`,
            animationDelay: `${index * 1}s`,
          }}
        >
          {/* Chef Body */}
          <Box
            sx={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '50px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '20px 20px 5px 5px',
              border: '2px solid rgba(244, 67, 54, 0.3)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 20px rgba(244, 67, 54, 0.2)',
            }}
          />
          
          {/* Chef Head */}
          <Box
            sx={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '30px',
              height: '30px',
              backgroundColor: 'rgba(255, 235, 238, 0.9)',
              borderRadius: '50%',
              border: '2px solid rgba(244, 67, 54, 0.3)',
              backdropFilter: 'blur(8px)',
            }}
          />
          
          {/* Chef Hat */}
          <Box
            sx={{
              position: 'absolute',
              top: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '35px',
              height: '25px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '50% 50% 10px 10px',
              border: '2px solid rgba(244, 67, 54, 0.4)',
              animation: `${chefHat} 3s ease-in-out infinite`,
              animationDelay: `${index * 0.5}s`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-5px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '8px',
                height: '8px',
                backgroundColor: 'rgba(244, 67, 54, 0.6)',
                borderRadius: '50%',
              },
            }}
          />
          
          {/* Waving Hand */}
          <Box
            sx={{
              position: 'absolute',
              top: '35px',
              right: '5px',
              width: '12px',
              height: '12px',
              backgroundColor: 'rgba(255, 235, 238, 0.9)',
              borderRadius: '50%',
              animation: `${welcomeWave} 2s ease-in-out infinite`,
              animationDelay: `${index * 0.3}s`,
            }}
          />
        </Box>
      ))}

      {/* Restaurant Elements - Plates and Utensils */}
      {[...Array(4)].map((_, index) => (
        <Box
          key={`plate-${index}`}
          sx={{
            position: 'absolute',
            top: `${15 + (index * 20)}%`,
            right: `${10 + (index * 12)}%`,
            width: '60px',
            height: '60px',
            animation: `${plateRotate} ${6 + index * 0.8}s linear infinite`,
            animationDelay: `${index * 1.2}s`,
          }}
        >
          {/* Plate */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '45px',
              height: '45px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%',
              border: '3px solid rgba(244, 67, 54, 0.4)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 4px 16px rgba(244, 67, 54, 0.2)',
            }}
          />
          
          {/* Food on Plate */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              backgroundColor: 'rgba(244, 67, 54, 0.6)',
              borderRadius: '50%',
              backdropFilter: 'blur(4px)',
            }}
          />
        </Box>
      ))}

      {/* Welcome Doors */}
      {[...Array(2)].map((_, index) => (
        <Box
          key={`door-${index}`}
          sx={{
            position: 'absolute',
            bottom: `${10 + (index * 30)}%`,
            left: `${20 + (index * 40)}%`,
            width: '50px',
            height: '80px',
            animation: `${doorOpen} ${8 + index * 1}s ease-in-out infinite`,
            animationDelay: `${index * 2}s`,
          }}
        >
          {/* Door Frame */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(139, 69, 19, 0.3)',
              borderRadius: '8px 8px 0 0',
              border: '2px solid rgba(244, 67, 54, 0.4)',
              backdropFilter: 'blur(8px)',
            }}
          />
          
          {/* Door Handle */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              right: '8px',
              transform: 'translateY(-50%)',
              width: '6px',
              height: '6px',
              backgroundColor: 'rgba(244, 67, 54, 0.8)',
              borderRadius: '50%',
            }}
          />
          
          {/* Welcome Light */}
          <Box
            sx={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '15px',
              backgroundColor: 'rgba(255, 193, 7, 0.4)',
              borderRadius: '50%',
              filter: 'blur(8px)',
              animation: `${sparkle} 3s ease-in-out infinite`,
              animationDelay: `${index * 1.5}s`,
            }}
          />
        </Box>
      ))}

      {/* Floating Welcome Bubbles */}
      {[...Array(8)].map((_, index) => (
        <Box
          key={`bubble-${index}`}
          sx={{
            position: 'absolute',
            bottom: '0%',
            left: `${Math.random() * 100}%`,
            width: `${15 + Math.random() * 25}px`,
            height: `${15 + Math.random() * 25}px`,
            backgroundColor: 'rgba(244, 67, 54, 0.15)',
            borderRadius: '50%',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            backdropFilter: 'blur(6px)',
            animation: `${welcomeBubble} ${8 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: '0 4px 16px rgba(244, 67, 54, 0.1)',
          }}
        />
      ))}

      {/* Sparkle Effects */}
      {[...Array(12)].map((_, index) => (
        <Box
          key={`sparkle-${index}`}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '8px',
            height: '8px',
            animation: `${sparkle} ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '6px',
              height: '6px',
              backgroundColor: 'rgba(255, 193, 7, 0.8)',
              borderRadius: '50%',
              boxShadow: '0 0 10px rgba(255, 193, 7, 0.6)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              width: '2px',
              height: '8px',
              backgroundColor: 'rgba(255, 193, 7, 0.6)',
              borderRadius: '1px',
            },
          }}
        />
      ))}

      {/* Welcome Hearts */}
      {[...Array(5)].map((_, index) => (
        <Box
          key={`heart-${index}`}
          sx={{
            position: 'absolute',
            top: `${25 + (index * 15)}%`,
            right: `${5 + (index * 8)}%`,
            width: '20px',
            height: '20px',
            animation: `${heartBeat} ${2 + index * 0.3}s ease-in-out infinite`,
            animationDelay: `${index * 0.8}s`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '12px',
              height: '10px',
              backgroundColor: 'rgba(244, 67, 54, 0.6)',
              borderRadius: '6px 6px 0 0',
              transform: 'translate(-50%, -60%) rotate(-45deg)',
              transformOrigin: '0 100%',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '12px',
              height: '10px',
              backgroundColor: 'rgba(244, 67, 54, 0.6)',
              borderRadius: '6px 6px 0 0',
              transform: 'translate(-50%, -60%) rotate(45deg)',
              transformOrigin: '100% 100%',
            },
          }}
        />
      ))}

      {/* Restaurant Tables */}
      {[...Array(3)].map((_, index) => (
        <Box
          key={`table-${index}`}
          sx={{
            position: 'absolute',
            bottom: `${5 + (index * 15)}%`,
            right: `${15 + (index * 20)}%`,
            width: '40px',
            height: '30px',
            animation: `${welcomeFloat} ${5 + index * 0.4}s ease-in-out infinite`,
            animationDelay: `${index * 1.5}s`,
          }}
        >
          {/* Table Top */}
          <Box
            sx={{
              position: 'absolute',
              top: '0',
              left: '0',
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(139, 69, 19, 0.4)',
              borderRadius: '4px',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              backdropFilter: 'blur(6px)',
            }}
          />
          
          {/* Table Legs */}
          <Box
            sx={{
              position: 'absolute',
              top: '8px',
              left: '5px',
              width: '3px',
              height: '20px',
              backgroundColor: 'rgba(139, 69, 19, 0.5)',
              borderRadius: '1px',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: '8px',
              right: '5px',
              width: '3px',
              height: '20px',
              backgroundColor: 'rgba(139, 69, 19, 0.5)',
              borderRadius: '1px',
            }}
          />
        </Box>
      ))}

      {/* Welcome Message Particles */}
      {[...Array(6)].map((_, index) => (
        <Box
          key={`message-${index}`}
          sx={{
            position: 'absolute',
            top: `${10 + (index * 12)}%`,
            left: `${8 + (index * 14)}%`,
            width: '25px',
            height: '15px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            border: '1px solid rgba(244, 67, 54, 0.4)',
            backdropFilter: 'blur(8px)',
            animation: `${welcomeFloat} ${4 + index * 0.3}s ease-in-out infinite`,
            animationDelay: `${index * 0.7}s`,
            boxShadow: '0 2px 12px rgba(244, 67, 54, 0.15)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '15px',
              height: '2px',
              backgroundColor: 'rgba(244, 67, 54, 0.5)',
              borderRadius: '1px',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '70%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '10px',
              height: '1px',
              backgroundColor: 'rgba(244, 67, 54, 0.3)',
              borderRadius: '1px',
            },
          }}
        />
      ))}
    </Box>
  );
};

export default LoginAnimatedBackground;