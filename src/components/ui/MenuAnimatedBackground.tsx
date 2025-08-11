import React from 'react';
import { Box, keyframes } from '@mui/material';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(180deg); }
`;

const drift = keyframes`
  0% { transform: translateX(-100px) rotate(0deg); }
  100% { transform: translateX(calc(100vw + 100px)) rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.1; transform: scale(1); }
  50% { opacity: 0.2; transform: scale(1.05); }
`;

const steamRise = keyframes`
  0% { 
    transform: translateY(0px) scaleX(1);
    opacity: 0.1;
  }
  50% { 
    transform: translateY(-30px) scaleX(1.2);
    opacity: 0.15;
  }
  100% { 
    transform: translateY(-60px) scaleX(0.8);
    opacity: 0;
  }
`;

const plateRotate = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.05); }
  100% { transform: rotate(360deg) scale(1); }
`;

const foodBounce = keyframes`
  0%, 100% { 
    transform: translateY(0px) scale(1) rotate(0deg);
    opacity: 0.08;
  }
  25% { 
    transform: translateY(-10px) scale(1.05) rotate(90deg);
    opacity: 0.12;
  }
  50% { 
    transform: translateY(-15px) scale(1.1) rotate(180deg);
    opacity: 0.15;
  }
  75% { 
    transform: translateY(-10px) scale(1.05) rotate(270deg);
    opacity: 0.12;
  }
`;

const sparkle = keyframes`
  0%, 100% { 
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% { 
    transform: scale(1) rotate(180deg);
    opacity: 0.1;
  }
`;

const cookingBubble = keyframes`
  0% { 
    transform: translateY(0px) scale(0.8);
    opacity: 0.05;
  }
  50% { 
    transform: translateY(-40px) scale(1.2);
    opacity: 0.1;
  }
  100% { 
    transform: translateY(-80px) scale(0.6);
    opacity: 0;
  }
`;

const MenuAnimatedBackground: React.FC = () => {
  // Food emojis for different categories
  const foodItems = ['🍕', '🍔', '🍜', '🍛', '🥗', '🍰', '🥤', '🍞', '🍚', '🥘', '🍲', '🥙'];
  const spiceItems = ['🌶️', '🧄', '🧅', '🥕', '🥬', '🍅'];
  
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
      {/* Floating Food Items - Very subtle */}
      {foodItems.slice(0, 8).map((food, index) => (
        <Box
          key={`food-float-${index}`}
          sx={{
            position: 'absolute',
            top: `${15 + (index * 10)}%`,
            left: `${8 + (index * 10)}%`,
            fontSize: { xs: '16px', sm: '18px', md: '20px' },
            opacity: 0.08,
            animation: `${foodBounce} ${6 + index * 0.5}s ease-in-out infinite`,
            animationDelay: `${index * 0.5}s`,
            filter: 'grayscale(0.3) blur(0.5px)',
          }}
        >
          {food}
        </Box>
      ))}

      {/* Drifting Food Elements - Very slow and subtle */}
      {[...Array(4)].map((_, index) => (
        <Box
          key={`drift-food-${index}`}
          sx={{
            position: 'absolute',
            top: `${20 + (index * 20)}%`,
            left: '-60px',
            fontSize: { xs: '14px', sm: '16px', md: '18px' },
            opacity: 0.06,
            animation: `${drift} ${35 + index * 5}s linear infinite`,
            animationDelay: `${index * 8}s`,
            filter: 'grayscale(0.5) blur(1px)',
          }}
        >
          {foodItems[index % foodItems.length]}
        </Box>
      ))}

      {/* Steam Effects - Very subtle */}
      {[...Array(6)].map((_, index) => (
        <Box
          key={`steam-${index}`}
          sx={{
            position: 'absolute',
            bottom: `${25 + (index * 12)}%`,
            left: `${15 + (index * 15)}%`,
            width: '2px',
            height: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(4px)',
            borderRadius: '1px',
            animation: `${steamRise} ${3 + index * 0.3}s ease-out infinite`,
            animationDelay: `${index * 0.4}s`,
            transformOrigin: 'bottom',
          }}
        />
      ))}

      {/* Plate Rotation Effects - Very subtle */}
      {[...Array(3)].map((_, index) => (
        <Box
          key={`plate-${index}`}
          sx={{
            position: 'absolute',
            top: `${30 + (index * 25)}%`,
            right: `${10 + (index * 20)}%`,
            width: { xs: '30px', sm: '35px', md: '40px' },
            height: { xs: '30px', sm: '35px', md: '40px' },
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.05)',
            animation: `${plateRotate} ${8 + index * 1}s ease-in-out infinite`,
            animationDelay: `${index * 1}s`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60%',
              height: '60%',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(4px)',
            },
          }}
        />
      ))}

      {/* Spice Particles - Very subtle */}
      {spiceItems.slice(0, 4).map((spice, index) => (
        <Box
          key={`spice-${index}`}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 60 + 20}%`,
            left: `${Math.random() * 60 + 20}%`,
            fontSize: { xs: '12px', sm: '14px', md: '16px' },
            opacity: 0.05,
            animation: `${pulse} ${4 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
            filter: 'grayscale(0.7) blur(1px)',
          }}
        >
          {spice}
        </Box>
      ))}

      {/* Cooking Bubbles - Very subtle */}
      {[...Array(6)].map((_, index) => (
        <Box
          key={`bubble-${index}`}
          sx={{
            position: 'absolute',
            bottom: `${10 + (index * 10)}%`,
            left: `${20 + (index * 12)}%`,
            width: `${4 + Math.random() * 4}px`,
            height: `${4 + Math.random() * 4}px`,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            animation: `${cookingBubble} ${4 + Math.random() * 2}s ease-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Sparkle Effects - Very subtle */}
      {[...Array(8)].map((_, index) => (
        <Box
          key={`sparkle-${index}`}
          sx={{
            position: 'absolute',
            top: `${Math.random() * 80 + 10}%`,
            left: `${Math.random() * 80 + 10}%`,
            width: '4px',
            height: '4px',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            backdropFilter: 'blur(2px)',
            borderRadius: '50%',
            animation: `${sparkle} ${3 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-1px',
              left: '-1px',
              right: '-1px',
              bottom: '-1px',
              background: 'linear-gradient(45deg, transparent, rgba(255, 193, 7, 0.05), transparent)',
              borderRadius: '50%',
              animation: `${plateRotate} 2s linear infinite`,
            },
          }}
        />
      ))}

      {/* Food Category Indicators - Very subtle */}
      {[
        { emoji: '🥗', color: 'rgba(76, 175, 80, 0.03)' },
        { emoji: '🍕', color: 'rgba(255, 152, 0, 0.03)' },
        { emoji: '🍔', color: 'rgba(244, 67, 54, 0.03)' },
      ].map((category, index) => (
        <Box
          key={`category-${index}`}
          sx={{
            position: 'absolute',
            top: `${25 + (index * 25)}%`,
            right: `${5 + (index * 8)}%`,
            width: { xs: '35px', sm: '40px', md: '45px' },
            height: { xs: '35px', sm: '40px', md: '45px' },
            backgroundColor: category.color,
            backdropFilter: 'blur(8px)',
            borderRadius: '20%',
            border: `1px solid ${category.color.replace('0.03', '0.06')}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: { xs: '14px', sm: '16px', md: '18px' },
            opacity: 0.06,
            animation: `${float} ${7 + index * 0.5}s ease-in-out infinite`,
            animationDelay: `${index * 1.5}s`,
            filter: 'grayscale(0.5)',
          }}
        >
          {category.emoji}
        </Box>
      ))}

      {/* Kitchen Utensil Animations - Very subtle */}
      {['🍴', '🥄'].map((utensil, index) => (
        <Box
          key={`utensil-${index}`}
          sx={{
            position: 'absolute',
            top: `${70 + (index * 10)}%`,
            right: `${15 + (index * 20)}%`,
            fontSize: { xs: '12px', sm: '14px', md: '16px' },
            opacity: 0.04,
            animation: `${float} ${5 + index * 0.5}s ease-in-out infinite`,
            animationDelay: `${index * 0.8}s`,
            filter: 'grayscale(0.8) blur(0.5px)',
            transform: `rotate(${index * 45}deg)`,
          }}
        >
          {utensil}
        </Box>
      ))}
    </Box>
  );
};

export default MenuAnimatedBackground;