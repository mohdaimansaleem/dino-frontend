import React from 'react';
import { Box, keyframes } from '@mui/material';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
`;

const drift = keyframes`
  0% { transform: translateX(-100px) rotate(0deg); }
  100% { transform: translateX(calc(100vw + 100px)) rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
`;

const grow = keyframes`
  0% { transform: scale(0) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
`;

const growthWave = keyframes`
  0% { 
    transform: scaleY(0.3) scaleX(1);
    opacity: 0.4;
  }
  50% { 
    transform: scaleY(1) scaleX(1.1);
    opacity: 0.8;
  }
  100% { 
    transform: scaleY(0.3) scaleX(1);
    opacity: 0.4;
  }
`;

const successRipple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const trustShield = keyframes`
  0%, 100% {
    transform: scale(1) rotate(0deg);
    border-radius: 50%;
  }
  25% {
    transform: scale(1.1) rotate(90deg);
    border-radius: 20%;
  }
  50% {
    transform: scale(1.2) rotate(180deg);
    border-radius: 10%;
  }
  75% {
    transform: scale(1.1) rotate(270deg);
    border-radius: 20%;
  }
`;

const progressBar = keyframes`
  0% {
    width: 0%;
    opacity: 0.5;
  }
  50% {
    width: 100%;
    opacity: 1;
  }
  100% {
    width: 0%;
    opacity: 0.5;
  }
`;

const AnimatedBackground: React.FC = () => {
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
      {/* Growth Wave Animations */}
      {[...Array(6)].map((_, index) => (
        <Box
          key={`growth-wave-${index}`}
          sx={{
            position: 'absolute',
            bottom: `${10 + (index * 15)}%`,
            left: `${5 + (index * 15)}%`,
            width: '60px',
            height: '40px',
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px 8px 0 0',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            animation: `${growthWave} ${3 + index * 0.5}s ease-in-out infinite`,
            animationDelay: `${index * 0.3}s`,
            transformOrigin: 'bottom',
            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)',
          }}
        />
      ))}

      {/* Success Ripple Effects */}
      {[...Array(4)].map((_, index) => (
        <Box
          key={`success-ripple-${index}`}
          sx={{
            position: 'absolute',
            top: `${20 + (index * 20)}%`,
            right: `${10 + (index * 15)}%`,
            width: '80px',
            height: '80px',
            border: '2px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '50%',
            animation: `${successRipple} ${4 + index * 0.5}s ease-out infinite`,
            animationDelay: `${index * 1}s`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              backgroundColor: 'rgba(76, 175, 80, 0.4)',
              borderRadius: '50%',
              backdropFilter: 'blur(6px)',
            },
          }}
        />
      ))}

      {/* Trust Shield Shapes */}
      {[...Array(5)].map((_, index) => (
        <Box
          key={`trust-shield-${index}`}
          sx={{
            position: 'absolute',
            top: `${15 + (index * 18)}%`,
            left: `${5 + (index * 10)}%`,
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(33, 150, 243, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(33, 150, 243, 0.3)',
            animation: `${trustShield} ${6 + index * 0.5}s ease-in-out infinite`,
            animationDelay: `${index * 0.8}s`,
            boxShadow: '0 6px 24px rgba(33, 150, 243, 0.1)',
          }}
        />
      ))}

      {/* Progress Bars for Growth */}
      {[...Array(3)].map((_, index) => (
        <Box
          key={`progress-${index}`}
          sx={{
            position: 'absolute',
            top: `${30 + (index * 25)}%`,
            right: `${5 + (index * 8)}%`,
            width: '120px',
            height: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              backgroundColor: 'rgba(255, 193, 7, 0.6)',
              borderRadius: '4px',
              animation: `${progressBar} ${5 + index * 0.5}s ease-in-out infinite`,
              animationDelay: `${index * 1.2}s`,
            },
          }}
        />
      ))}

      {/* Floating Glass Particles */}
      {[...Array(12)].map((_, index) => (
        <Box
          key={`particle-${index}`}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${8 + Math.random() * 16}px`,
            height: `${8 + Math.random() * 16}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(6px)',
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: `${pulse} ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          }}
        />
      ))}

      {/* Drifting Success Indicators */}
      {[...Array(4)].map((_, index) => (
        <Box
          key={`drift-success-${index}`}
          sx={{
            position: 'absolute',
            top: `${20 + (index * 20)}%`,
            left: '-60px',
            width: '50px',
            height: '50px',
            backgroundColor: 'rgba(76, 175, 80, 0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: '50%',
            border: '2px solid rgba(76, 175, 80, 0.3)',
            animation: `${drift} ${20 + index * 2}s linear infinite`,
            animationDelay: `${index * 3}s`,
            boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              backgroundColor: 'rgba(76, 175, 80, 0.4)',
              borderRadius: '50%',
            },
          }}
        />
      ))}

      {/* Trust Network Lines */}
      {[...Array(6)].map((_, index) => (
        <Box
          key={`trust-line-${index}`}
          sx={{
            position: 'absolute',
            top: `${10 + (index * 15)}%`,
            left: `${10 + (index * 12)}%`,
            width: '2px',
            height: '60px',
            backgroundColor: 'rgba(33, 150, 243, 0.2)',
            backdropFilter: 'blur(4px)',
            transformOrigin: 'bottom',
            animation: `${grow} ${4 + index * 0.3}s ease-in-out infinite`,
            animationDelay: `${index * 0.5}s`,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '-4px',
              left: '-4px',
              width: '10px',
              height: '10px',
              backgroundColor: 'rgba(33, 150, 243, 0.4)',
              borderRadius: '50%',
              backdropFilter: 'blur(6px)',
            },
          }}
        />
      ))}

      {/* Growth Chart Lines */}
      {[...Array(5)].map((_, index) => (
        <Box
          key={`chart-line-${index}`}
          sx={{
            position: 'absolute',
            bottom: `${5 + (index * 8)}%`,
            right: `${20 + (index * 10)}%`,
            width: '80px',
            height: '3px',
            backgroundColor: 'rgba(255, 193, 7, 0.3)',
            backdropFilter: 'blur(6px)',
            borderRadius: '2px',
            transform: `rotate(${15 + index * 5}deg)`,
            animation: `${float} ${3 + index * 0.4}s ease-in-out infinite`,
            animationDelay: `${index * 0.6}s`,
            boxShadow: '0 2px 12px rgba(255, 193, 7, 0.2)',
          }}
        />
      ))}
    </Box>
  );
};

export default AnimatedBackground;