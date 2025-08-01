import React from 'react';
import { Box, keyframes } from '@mui/material';
import { QrCode, TrendingUp, EmojiEvents, AttachMoney, Business } from '@mui/icons-material';

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

const AnimatedBackground: React.FC = () => {
  const floatingElements = [
    { icon: QrCode, delay: 0, duration: 4 },
    { icon: TrendingUp, delay: 1, duration: 5 },
    { icon: EmojiEvents, delay: 2, duration: 6 },
    { icon: AttachMoney, delay: 0.5, duration: 4.5 },
    { icon: Business, delay: 1.5, duration: 5.5 },
  ];

  const driftingElements = [
    { icon: QrCode, delay: 0, top: '20%' },
    { icon: TrendingUp, delay: 3, top: '60%' },
    { icon: EmojiEvents, delay: 6, top: '40%' },
    { icon: AttachMoney, delay: 9, top: '80%' },
  ];

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
        zIndex: 0,
      }}
    >
      {/* Floating Elements */}
      {floatingElements.map((element, index) => {
        const IconComponent = element.icon;
        return (
          <Box
            key={`float-${index}`}
            sx={{
              position: 'absolute',
              top: `${20 + (index * 15)}%`,
              left: `${10 + (index * 20)}%`,
              animation: `${float} ${element.duration}s ease-in-out infinite`,
              animationDelay: `${element.delay}s`,
              opacity: 0.1,
              color: 'white',
            }}
          >
            <IconComponent sx={{ fontSize: 40 }} />
          </Box>
        );
      })}

      {/* Drifting Elements */}
      {driftingElements.map((element, index) => {
        const IconComponent = element.icon;
        return (
          <Box
            key={`drift-${index}`}
            sx={{
              position: 'absolute',
              top: element.top,
              left: '-100px',
              animation: `${drift} 15s linear infinite`,
              animationDelay: `${element.delay}s`,
              opacity: 0.08,
              color: 'white',
            }}
          >
            <IconComponent sx={{ fontSize: 30 }} />
          </Box>
        );
      })}

      {/* Pulsing Background Elements */}
      {[...Array(8)].map((_, index) => (
        <Box
          key={`pulse-${index}`}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: '4px',
            height: '4px',
            backgroundColor: 'white',
            borderRadius: '50%',
            animation: `${pulse} 3s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Growing Success Indicators */}
      {[...Array(6)].map((_, index) => (
        <Box
          key={`grow-${index}`}
          sx={{
            position: 'absolute',
            top: `${20 + (index * 12)}%`,
            right: `${5 + (index * 8)}%`,
            animation: `${grow} 6s ease-in-out infinite`,
            animationDelay: `${index * 1}s`,
            opacity: 0.06,
            color: 'white',
          }}
        >
          <EmojiEvents sx={{ fontSize: 24 }} />
        </Box>
      ))}
    </Box>
  );
};

export default AnimatedBackground;