import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const ClassicTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#2c3e50',
  includeInstructions = true,
  layout = 'standard'
}) => {
  const getLayoutSize = () => {
    switch (layout) {
      case 'compact': return { width: 300, padding: 20, qrSize: 160 };
      case 'large': return { width: 500, padding: 50, qrSize: 240 };
      default: return { width: 400, padding: 35, qrSize: 200 };
    }
  };

  const { width, padding, qrSize } = getLayoutSize();

  return (
    <Paper
      elevation={8}
      sx={{
        width,
        margin: '20px auto',
        padding: `${padding}px`,
        background: `linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)`,
        border: `4px solid ${primaryColor}`,
        borderRadius: '20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '"Playfair Display", "Times New Roman", serif',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '15px',
          left: '15px',
          right: '15px',
          bottom: '15px',
          border: `2px solid ${primaryColor}`,
          borderRadius: '15px',
          opacity: 0.3,
          pointerEvents: 'none'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h3"
          sx={{
            color: primaryColor,
            fontWeight: 700,
            fontSize: layout === 'compact' ? '1.8rem' : layout === 'large' ? '2.5rem' : '2.2rem',
            marginBottom: '8px',
            textShadow: `2px 2px 4px ${primaryColor}20`,
            fontFamily: '"Playfair Display", serif',
            letterSpacing: '2px'
          }}
        >
          🦕 DINO
        </Typography>
        
        <Box
          sx={{
            width: '80px',
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
            margin: '10px auto 20px',
            borderRadius: '2px'
          }}
        />

        <Typography
          variant="h4"
          sx={{
            color: '#2c3e50',
            fontWeight: 600,
            fontSize: layout === 'compact' ? '1.3rem' : layout === 'large' ? '1.8rem' : '1.5rem',
            marginBottom: '5px',
            fontFamily: '"Playfair Display", serif'
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: primaryColor,
            fontWeight: 500,
            fontSize: layout === 'compact' ? '1.1rem' : layout === 'large' ? '1.4rem' : '1.2rem',
            marginBottom: '25px',
            fontStyle: 'italic'
          }}
        >
          Table {tableNumber}
        </Typography>
      </Box>

      {/* QR Code Container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          margin: '25px auto',
          padding: '20px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          borderRadius: '15px',
          border: `3px solid ${primaryColor}`,
          boxShadow: `0 8px 25px ${primaryColor}20, inset 0 2px 10px rgba(0,0,0,0.05)`,
          width: 'fit-content'
        }}
      >
        <img
          src={qrCodeBase64}
          alt="QR Code"
          style={{
            width: qrSize,
            height: qrSize,
            borderRadius: '8px',
            display: 'block'
          }}
        />
      </Box>

      {/* Instructions */}
      {includeInstructions && (
        <Box sx={{ position: 'relative', zIndex: 1, marginTop: '20px' }}>
          <Typography
            variant="h6"
            sx={{
              color: '#34495e',
              fontWeight: 600,
              fontSize: layout === 'compact' ? '0.9rem' : layout === 'large' ? '1.2rem' : '1rem',
              marginBottom: '15px',
              fontFamily: '"Playfair Display", serif'
            }}
          >
            Scan to View Menu & Order
          </Typography>
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '15px',
              padding: '15px',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: '10px',
              border: `1px solid ${primaryColor}30`
            }}
          >
            {[
              { icon: '📱', text: 'Open Camera' },
              { icon: '🎯', text: 'Point at QR' },
              { icon: '👆', text: 'Tap Link' },
              { icon: '🍽️', text: 'Order!' }
            ].map((step, index) => (
              <Box key={index} sx={{ textAlign: 'center', flex: '1 1 80px' }}>
                <Typography sx={{ fontSize: '1.2rem', marginBottom: '5px' }}>
                  {step.icon}
                </Typography>
                <Typography
                  sx={{
                    fontSize: layout === 'compact' ? '0.7rem' : '0.8rem',
                    color: '#5a6c7d',
                    fontWeight: 500
                  }}
                >
                  {step.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}



      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '30px',
          height: '30px',
          background: `linear-gradient(45deg, ${primaryColor}, ${primaryColor}80)`,
          borderRadius: '50%',
          opacity: 0.1
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '25px',
          height: '25px',
          background: `linear-gradient(45deg, ${primaryColor}, ${primaryColor}80)`,
          borderRadius: '50%',
          opacity: 0.1
        }}
      />
    </Paper>
  );
};

export default ClassicTemplate;