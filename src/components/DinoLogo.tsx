import React from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface DinoLogoProps {
  size?: number;
  animated?: boolean;
  sx?: SxProps<Theme>;
}

const DinoLogo: React.FC<DinoLogoProps> = ({ 
  size = 40, 
  animated = false,
  sx = {} 
}) => {
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{
          animation: animated ? 'cleanFloat 3s ease-in-out infinite' : 'none',
        }}
      >
        <defs>
          {/* Clean gradients */}
          <linearGradient id="cleanBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#42A5F5" />
            <stop offset="100%" stopColor="#2196F3" />
          </linearGradient>
          
          <linearGradient id="cleanBellyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E3F2FD" />
            <stop offset="100%" stopColor="#BBDEFB" />
          </linearGradient>
          
          <linearGradient id="cleanSpotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1976D2" />
            <stop offset="100%" stopColor="#1565C0" />
          </linearGradient>
          
          <filter id="cleanShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.1)" />
          </filter>
        </defs>
        
        {/* Dino Body */}
        <ellipse
          cx="50"
          cy="65"
          rx="24"
          ry="18"
          fill="url(#cleanBodyGradient)"
          filter="url(#cleanShadow)"
        />
        
        {/* Dino Head */}
        <ellipse
          cx="46"
          cy="38"
          rx="18"
          ry="16"
          fill="url(#cleanBodyGradient)"
          filter="url(#cleanShadow)"
        />
        
        {/* Dino Snout */}
        <ellipse
          cx="38"
          cy="42"
          rx="7"
          ry="5"
          fill="url(#cleanBodyGradient)"
        />
        
        {/* Clean Belly */}
        <ellipse
          cx="50"
          cy="67"
          rx="14"
          ry="11"
          fill="url(#cleanBellyGradient)"
        />
        
        {/* Clean Spots */}
        <circle cx="42" cy="32" r="2.5" fill="url(#cleanSpotGradient)" />
        <circle cx="54" cy="28" r="2" fill="url(#cleanSpotGradient)" />
        <circle cx="48" cy="58" r="1.8" fill="url(#cleanSpotGradient)" />
        <circle cx="58" cy="62" r="2.2" fill="url(#cleanSpotGradient)" />
        
        {/* Clean Eyes */}
        <circle cx="42" cy="32" r="5" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5" />
        <circle cx="54" cy="30" r="5" fill="#FFFFFF" stroke="#E0E0E0" strokeWidth="0.5" />
        
        {/* Eye pupils */}
        <circle cx="43" cy="33" r="2.5" fill="#1976D2" />
        <circle cx="55" cy="31" r="2.5" fill="#1976D2" />
        
        {/* Eye shine */}
        <circle cx="44" cy="31.5" r="1" fill="#FFFFFF" />
        <circle cx="56" cy="29.5" r="1" fill="#FFFFFF" />
        
        {/* Clean Nostrils */}
        <ellipse cx="34" cy="40" rx="0.8" ry="1.2" fill="#1976D2" />
        <ellipse cx="37" cy="41" rx="0.8" ry="1.2" fill="#1976D2" />
        
        {/* Clean Smile */}
        <path
          d="M 30 46 Q 38 49 46 46"
          stroke="#1976D2"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Clean Arms */}
        <ellipse
          cx="28"
          cy="58"
          rx="5"
          ry="10"
          fill="url(#cleanBodyGradient)"
          transform="rotate(-15 28 58)"
          filter="url(#cleanShadow)"
        />
        <ellipse
          cx="72"
          cy="58"
          rx="5"
          ry="10"
          fill="url(#cleanBodyGradient)"
          transform="rotate(15 72 58)"
          filter="url(#cleanShadow)"
        />
        
        {/* Clean Legs */}
        <ellipse
          cx="42"
          cy="80"
          rx="5"
          ry="8"
          fill="url(#cleanBodyGradient)"
          filter="url(#cleanShadow)"
        />
        <ellipse
          cx="58"
          cy="80"
          rx="5"
          ry="8"
          fill="url(#cleanBodyGradient)"
          filter="url(#cleanShadow)"
        />
        
        {/* Clean Feet */}
        <ellipse cx="42" cy="86" rx="6" ry="3" fill="url(#cleanSpotGradient)" />
        <ellipse cx="58" cy="86" rx="6" ry="3" fill="url(#cleanSpotGradient)" />
        
        {/* Clean Tail */}
        <ellipse
          cx="72"
          cy="68"
          rx="6"
          ry="12"
          fill="url(#cleanBodyGradient)"
          transform="rotate(25 72 68)"
          filter="url(#cleanShadow)"
        />
        
        {/* Clean Spikes */}
        <polygon
          points="38,22 42,18 46,22"
          fill="url(#cleanSpotGradient)"
        />
        <polygon
          points="46,20 50,15 54,20"
          fill="url(#cleanSpotGradient)"
        />
        <polygon
          points="54,22 58,18 62,22"
          fill="url(#cleanSpotGradient)"
        />
      </svg>
      
      <style>
        {`
          @keyframes cleanFloat {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-3px);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default DinoLogo;