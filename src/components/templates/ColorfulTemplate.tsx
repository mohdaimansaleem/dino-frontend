import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const ColorfulTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#ff6b6b',
  includeInstructions = true,
  layout = 'standard'
}) => {
  const getLayoutSize = () => {
    switch (layout) {
      case 'compact': return { width: 330, padding: 25, qrSize: 170 };
      case 'large': return { width: 530, padding: 55, qrSize: 250 };
      default: return { width: 430, padding: 40, qrSize: 210 };
    }
  };

  const { width, padding, qrSize } = getLayoutSize();

  return (
    <Paper
      elevation={15}
      sx={{
        width,
        margin: '20px auto',
        padding: `${padding}px`,
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3)',
        borderRadius: '25px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Inner Content Container */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: `${padding * 0.8}px`,
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255,255,255,0.3)'
        }}
      >


        {/* Header */}
        <Typography
          variant="h2"
          sx={{
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 900,
            fontSize: layout === 'compact' ? '2.2rem' : layout === 'large' ? '3.2rem' : '2.8rem',
            marginBottom: '15px',
            fontFamily: '"Fredoka One", "Comic Sans MS", cursive',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 2,

          }}
        >
          🦕 DINO
        </Typography>

        {/* Fun Icons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '20px',
            position: 'relative',
            zIndex: 2
          }}
        >
          {['🍕', '🍔', '🍰', '☕'].map((icon, index) => (
            <Typography
              key={index}
              sx={{
                fontSize: '1.5rem'
              }}
            >
              {icon}
            </Typography>
          ))}
        </Box>

        <Typography
          variant="h4"
          sx={{
            color: '#2c3e50',
            fontWeight: 700,
            fontSize: layout === 'compact' ? '1.4rem' : layout === 'large' ? '2rem' : '1.7rem',
            marginBottom: '8px',
            fontFamily: '"Fredoka One", cursive',
            position: 'relative',
            zIndex: 2
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700,
            fontSize: layout === 'compact' ? '1.2rem' : layout === 'large' ? '1.6rem' : '1.4rem',
            marginBottom: '30px',
            fontFamily: '"Fredoka One", cursive',
            position: 'relative',
            zIndex: 2
          }}
        >
          Table {tableNumber}
        </Typography>

        {/* Colorful QR Container */}
        <Box
          sx={{
            position: 'relative',
            margin: '30px auto',
            width: 'fit-content',
            zIndex: 2
          }}
        >
          <Box
            sx={{
              padding: '25px',
              background: 'linear-gradient(45deg, #f8f9fa, #e9ecef)',
              borderRadius: '25px',
              border: '4px solid transparent',
              backgroundClip: 'padding-box',
              position: 'relative',
              boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                right: '-4px',
                bottom: '-4px',
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3)',
                borderRadius: '25px',
                zIndex: -1,

              }
            }}
          >
            <img
              src={qrCodeBase64}
              alt="QR Code"
              style={{
                width: qrSize,
                height: qrSize,
                borderRadius: '15px',
                display: 'block'
              }}
            />
          </Box>


        </Box>

        {/* Colorful Instructions */}
        {includeInstructions && (
          <Box sx={{ marginTop: '25px', position: 'relative', zIndex: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#2c3e50',
                fontWeight: 600,
                fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.3rem' : '1.1rem',
                marginBottom: '20px',
                fontFamily: '"Fredoka One", cursive'
              }}
            >
              Scan me for a colorful menu adventure! 🌈
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                gap: '15px',
                marginTop: '20px'
              }}
            >
              {[
                { icon: '📱', text: 'Open Camera', color: '#ff6b6b' },
                { icon: '🎯', text: 'Point & Scan', color: '#4ecdc4' },
                { icon: '🌈', text: 'Tap Link', color: '#45b7d1' },
                { icon: '🎉', text: 'Enjoy!', color: '#feca57' }
              ].map((step, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: 'center',
                    padding: '15px 10px',
                    background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                    borderRadius: '20px',
                    border: `2px solid ${step.color}40`,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px) scale(1.05)'
                    }
                  }}
                >
                  <Typography sx={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                    {step.icon}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: layout === 'compact' ? '0.7rem' : '0.8rem',
                      color: step.color,
                      fontWeight: 700,
                      fontFamily: '"Fredoka One", cursive'
                    }}
                  >
                    {step.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}


      </Box>
    </Paper>
  );
};

export default ColorfulTemplate;