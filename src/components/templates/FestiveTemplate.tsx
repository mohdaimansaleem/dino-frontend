import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const FestiveTemplate: React.FC<TemplateProps> = ({
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
      elevation={20}
      sx={{
        width,
        margin: '20px auto',
        padding: `${padding}px`,
        background: 'linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff)',
        borderRadius: '35px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Inner Content Container */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.95)',
          border: '4px solid #ff6b6b',
          borderRadius: '30px',
          padding: `${padding * 0.8}px`,
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          color: '#2c2c54'
        }}
      >


        {/* Party Banner */}
        <Box
          sx={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            textAlign: 'center',
            fontSize: '1.2rem'
          }}
        >
          🎉🎊🎈
        </Box>

        <Typography
          variant="h2"
          sx={{
            background: 'linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 900,
            fontSize: layout === 'compact' ? '2.2rem' : layout === 'large' ? '3.2rem' : '2.8rem',
            marginBottom: '15px',
            marginTop: '30px',
            fontFamily: '"Comic Sans MS", cursive',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',

          }}
        >
          🦕 DINO
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: '#2c2c54',
            fontWeight: 700,
            fontSize: layout === 'compact' ? '1.4rem' : layout === 'large' ? '2rem' : '1.7rem',
            marginBottom: '8px',
            fontFamily: '"Comic Sans MS", cursive',
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            background: 'linear-gradient(45deg, #ff6b6b, #feca57)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontSize: layout === 'compact' ? '1.2rem' : layout === 'large' ? '1.6rem' : '1.4rem',
            marginBottom: '25px',
            fontFamily: '"Comic Sans MS", cursive'
          }}
        >
          Table {tableNumber}
        </Typography>

        {/* Celebration Icons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '20px'
          }}
        >
          {['🎉', '🎊', '🎈', '🎁'].map((icon, index) => (
            <Typography
              key={index}
              sx={{
                fontSize: '1.5rem',

              }}
            >
              {icon}
            </Typography>
          ))}
        </Box>

        {/* QR Code Container */}
        <Box
          sx={{
            position: 'relative',
            margin: '25px auto',
            width: 'fit-content'
          }}
        >
          <Box
            sx={{
              padding: '30px',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '30px',
              border: '4px solid #ff6b6b',
              boxShadow: '0 15px 35px rgba(255, 107, 107, 0.3)'
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
        </Box>

        {/* Instructions */}
        {includeInstructions && (
          <Typography
            variant="h6"
            sx={{
              color: '#2c2c54',
              fontWeight: 600,
              fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.3rem' : '1.1rem',
              marginTop: '20px',
              fontFamily: '"Comic Sans MS", cursive',
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            Scan for a celebration menu! 🎉
          </Typography>
        )}


      </Box>
    </Paper>
  );
};

export default FestiveTemplate;