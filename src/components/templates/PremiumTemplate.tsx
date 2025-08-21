import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const PremiumTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#d4af37',
  includeInstructions = true,
  layout = 'standard'
}) => {
  const getLayoutSize = () => {
    switch (layout) {
      case 'compact': return { width: 340, padding: 30, qrSize: 180 };
      case 'large': return { width: 540, padding: 60, qrSize: 260 };
      default: return { width: 440, padding: 45, qrSize: 220 };
    }
  };

  const { width, padding, qrSize } = getLayoutSize();

  return (
    <Paper
      elevation={25}
      sx={{
        width,
        margin: '20px auto',
        padding: `${padding}px`,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #000000 100%)',
        border: `4px solid ${primaryColor}`,
        borderRadius: '25px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        boxShadow: `0 25px 60px rgba(212, 175, 55, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
      }}
    >
      {/* Luxury Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, ${primaryColor}15 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, ${primaryColor}10 0%, transparent 50%)
          `,
          opacity: 0.4
        }}
      />

      {/* Premium Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: `linear-gradient(135deg, ${primaryColor} 0%, #f4d03f 100%)`,
          color: '#000',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          boxShadow: `0 4px 15px ${primaryColor}40`,
          zIndex: 3
        }}
      >
        PREMIUM
      </Box>

      {/* Content */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <Typography
          variant="h2"
          sx={{
            color: primaryColor,
            fontWeight: 700,
            fontSize: layout === 'compact' ? '2.2rem' : layout === 'large' ? '3.2rem' : '2.8rem',
            marginBottom: '15px',
            fontFamily: '"Playfair Display", "Times New Roman", serif',
            letterSpacing: '3px',
            textShadow: `0 0 20px ${primaryColor}60, 2px 2px 4px rgba(0,0,0,0.8)`,
            marginTop: '20px'
          }}
        >
          🦕 DINO
        </Typography>

        {/* Luxury Divider */}
        <Box
          sx={{
            width: '120px',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
            margin: '20px auto',
            position: 'relative',
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              top: '-3px',
              width: '8px',
              height: '8px',
              background: primaryColor,
              borderRadius: '50%'
            },
            '&::before': { left: '20px' },
            '&::after': { right: '20px' }
          }}
        />

        <Typography
          variant="h4"
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            fontSize: layout === 'compact' ? '1.5rem' : layout === 'large' ? '2.2rem' : '1.8rem',
            marginBottom: '10px',
            fontFamily: '"Playfair Display", serif',
            textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: primaryColor,
            fontWeight: 500,
            fontSize: layout === 'compact' ? '1.2rem' : layout === 'large' ? '1.6rem' : '1.4rem',
            marginBottom: '35px',
            fontStyle: 'italic',
            fontFamily: '"Playfair Display", serif'
          }}
        >
          Table {tableNumber}
        </Typography>

        {/* Luxury QR Container */}
        <Box
          sx={{
            position: 'relative',
            margin: '35px auto',
            width: 'fit-content'
          }}
        >
          <Box
            sx={{
              padding: '30px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%)',
              borderRadius: '20px',
              border: `3px solid ${primaryColor}`,
              boxShadow: `
                0 0 30px ${primaryColor}40,
                inset 0 2px 10px rgba(0,0,0,0.1),
                0 15px 35px rgba(0,0,0,0.3)
              `,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                background: `linear-gradient(45deg, ${primaryColor}, #f4d03f, ${primaryColor})`,
                borderRadius: '20px',
                zIndex: -1,
                filter: 'blur(1px)'
              }
            }}
          >
            <img
              src={qrCodeBase64}
              alt="QR Code"
              style={{
                width: qrSize,
                height: qrSize,
                borderRadius: '12px',
                display: 'block'
              }}
            />
          </Box>

          {/* Floating Luxury Elements */}
          {[...Array(4)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: '6px',
                height: '6px',
                background: primaryColor,
                borderRadius: '50%',
                top: `${20 + i * 15}%`,
                left: i % 2 === 0 ? '-15px' : 'calc(100% + 15px)',
                opacity: 0.6
              }}
            />
          ))}
        </Box>

        {/* Premium Instructions */}
        {includeInstructions && (
          <Box sx={{ marginTop: '30px' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#e8e8e8',
                fontWeight: 500,
                fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.4rem' : '1.2rem',
                marginBottom: '20px',
                fontStyle: 'italic',
                fontFamily: '"Playfair Display", serif'
              }}
            >
              Scan for an exclusive dining experience
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '25px',
                flexWrap: 'wrap'
              }}
            >
              {[
                { icon: '👑', text: 'Premium Service' },
                { icon: '✨', text: 'Exclusive Menu' },
                { icon: '🥂', text: 'Fine Dining' }
              ].map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: 'center',
                    padding: '15px 20px',
                    background: `linear-gradient(135deg, ${primaryColor}20, transparent)`,
                    border: `1px solid ${primaryColor}40`,
                    borderRadius: '15px',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  <Typography sx={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                    {feature.icon}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: layout === 'compact' ? '0.7rem' : '0.8rem',
                      color: primaryColor,
                      fontWeight: 500,
                      fontFamily: '"Playfair Display", serif'
                    }}
                  >
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}


      </Box>

      {/* Corner Decorations */}
      <Box
        sx={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          width: '30px',
          height: '30px',
          border: `2px solid ${primaryColor}`,
          borderRight: 'none',
          borderBottom: 'none',
          opacity: 0.6
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          width: '30px',
          height: '30px',
          border: `2px solid ${primaryColor}`,
          borderLeft: 'none',
          borderTop: 'none',
          opacity: 0.6
        }}
      />
    </Paper>
  );
};

export default PremiumTemplate;