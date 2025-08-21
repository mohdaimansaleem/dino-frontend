import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const ElegantTemplate: React.FC<TemplateProps> = ({
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
    <Box
      sx={{
        width,
        margin: '20px auto',
        padding: `${padding}px`,
        background: '#f8f6f0',
        color: '#2c2c2c'
      }}
    >
      <Paper
        elevation={8}
        sx={{
          background: 'white',
          border: `2px solid ${primaryColor}`,
          padding: `${padding}px`,
          margin: 0,
          textAlign: 'center',
          position: 'relative',
          boxShadow: `0 8px 32px rgba(212, 175, 55, 0.2)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '15px',
            left: '15px',
            right: '15px',
            bottom: '15px',
            border: `1px solid ${primaryColor}`,
            pointerEvents: 'none'
          }
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: primaryColor,
            fontWeight: 'normal',
            fontSize: layout === 'compact' ? '2rem' : layout === 'large' ? '3rem' : '2.5rem',
            marginBottom: '15px',
            fontStyle: 'italic',
            fontFamily: '"Playfair Display", "Georgia", serif'
          }}
        >
          🦕 Dino
        </Typography>

        {/* Elegant Divider */}
        <Box
          sx={{
            height: '1px',
            background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
            margin: '20px auto',
            width: '60%'
          }}
        />

        <Typography
          variant="h4"
          sx={{
            color: '#2c2c2c',
            fontWeight: 'bold',
            fontSize: layout === 'compact' ? '1.4rem' : layout === 'large' ? '2rem' : '1.7rem',
            marginBottom: '8px',
            fontFamily: '"Playfair Display", serif'
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: primaryColor,
            fontSize: layout === 'compact' ? '1.1rem' : layout === 'large' ? '1.5rem' : '1.3rem',
            marginBottom: '25px',
            fontStyle: 'italic',
            fontFamily: '"Playfair Display", serif'
          }}
        >
          Table {tableNumber}
        </Typography>

        <Box
          sx={{
            height: '1px',
            background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
            margin: '20px auto',
            width: '40%'
          }}
        />

        <Box
          sx={{
            margin: '25px auto',
            padding: '20px',
            background: '#fafafa',
            border: `1px solid #e0e0e0`,
            width: 'fit-content'
          }}
        >
          <img
            src={qrCodeBase64}
            alt="QR Code"
            style={{
              width: qrSize,
              height: qrSize,
              display: 'block'
            }}
          />
        </Box>

        {includeInstructions && (
          <Typography
            sx={{
              fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.3rem' : '1.1rem',
              color: '#555',
              marginTop: '20px',
              fontStyle: 'italic',
              fontFamily: '"Playfair Display", serif'
            }}
          >
            Scan to discover our culinary offerings
          </Typography>
        )}

        <Box
          sx={{
            height: '1px',
            background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
            margin: '20px auto',
            width: '40%'
          }}
        />

        <Typography
          sx={{
            fontSize: layout === 'compact' ? '0.8rem' : '0.9rem',
            color: '#888',
            marginTop: '20px',
            fontStyle: 'italic',
            fontFamily: '"Playfair Display", serif'
          }}
        >
          Experience dining reimagined
        </Typography>


      </Paper>
    </Box>
  );
};

export default ElegantTemplate;