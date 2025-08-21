import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const ArtisticTemplate: React.FC<TemplateProps> = ({
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
      case 'compact': return { width: 340, padding: 30, qrSize: 180 };
      case 'large': return { width: 540, padding: 60, qrSize: 260 };
      default: return { width: 440, padding: 45, qrSize: 220 };
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
        background: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 25%, #fecfef 75%, #ff9a9e 100%)',
        borderRadius: '30px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: '#4a4a4a'
      }}
    >
      {/* Inner Content Container */}
      <Box
        sx={{
          background: '#ffffff',
          borderRadius: '25px',
          padding: `${padding * 0.8}px`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >


        {/* Paint Splashes */}
        {[
          { top: '10%', left: '10%', color: '#ff6b6b', size: '20px' },
          { top: '15%', right: '15%', color: '#54a0ff', size: '15px' },
          { bottom: '20%', left: '20%', color: '#ff9ff3', size: '25px' },
          { bottom: '25%', right: '10%', color: '#ee5a24', size: '18px' }
        ].map((splash, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              width: splash.size,
              height: splash.size,
              background: splash.color,
              borderRadius: '50%',
              opacity: 0.3,
              ...splash
            }}
          />
        ))}

        {/* Header */}
        <Typography
          variant="h2"
          sx={{
            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24, #ff9ff3, #54a0ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontSize: layout === 'compact' ? '2.2rem' : layout === 'large' ? '3.2rem' : '2.8rem',
            marginBottom: '15px',
            fontFamily: '"Brush Script MT", cursive',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 2,
            transform: 'rotate(-2deg)'
          }}
        >
          🦕 DINO
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: '#2c2c54',
            fontWeight: 600,
            fontSize: layout === 'compact' ? '1.4rem' : layout === 'large' ? '2rem' : '1.7rem',
            marginBottom: '8px',
            fontFamily: '"Brush Script MT", cursive',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
            position: 'relative',
            zIndex: 2
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontSize: layout === 'compact' ? '1.2rem' : layout === 'large' ? '1.6rem' : '1.4rem',
            marginBottom: '30px',
            fontFamily: '"Brush Script MT", cursive',
            position: 'relative',
            zIndex: 2
          }}
        >
          Table {tableNumber}
        </Typography>

        {/* Artistic QR Frame */}
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
              padding: '30px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '30px',
              border: '4px solid transparent',
              backgroundClip: 'padding-box',
              position: 'relative',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-4px',
                left: '-4px',
                right: '-4px',
                bottom: '-4px',
                background: 'linear-gradient(45deg, #ff6b6b, #ee5a24, #ff9ff3, #54a0ff)',
                borderRadius: '30px',
                zIndex: -1
              }
            }}
          >
            <img
              src={qrCodeBase64}
              alt="QR Code"
              style={{
                width: qrSize,
                height: qrSize,
                borderRadius: '20px',
                display: 'block'
              }}
            />
          </Box>

          {/* Artistic Frame */}
          <Box
            sx={{
              position: 'absolute',
              top: '15px',
              left: '15px',
              right: '15px',
              bottom: '15px',
              border: '2px dashed rgba(255, 107, 107, 0.3)',
              borderRadius: '25px',
              pointerEvents: 'none'
            }}
          />
        </Box>

        {/* Creative Instructions */}
        {includeInstructions && (
          <Box sx={{ marginTop: '25px', position: 'relative', zIndex: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#2c2c54',
                fontWeight: 600,
                fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.3rem' : '1.1rem',
                marginBottom: '20px',
                fontFamily: '"Brush Script MT", cursive',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              Scan to explore our creative menu! 🎨
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
                { icon: '📱', text: 'Camera', color: '#ff6b6b' },
                { icon: '🎨', text: 'Scan Art', color: '#54a0ff' },
                { icon: '🖼️', text: 'View Menu', color: '#ff9ff3' },
                { icon: '✨', text: 'Create!', color: '#ee5a24' }
              ].map((step, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: 'center',
                    padding: '15px 10px',
                    background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                    borderRadius: '20px',
                    border: `2px solid ${step.color}40`,
                    transform: `rotate(${(index % 2 === 0 ? 1 : -1) * 2}deg)`
                  }}
                >
                  <Typography sx={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                    {step.icon}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: layout === 'compact' ? '0.7rem' : '0.8rem',
                      color: step.color,
                      fontWeight: 600,
                      fontFamily: '"Brush Script MT", cursive'
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

export default ArtisticTemplate;