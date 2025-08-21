import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const CorporateTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#0056b3',
  includeInstructions = true,
  layout = 'standard'
}) => {
  const getLayoutSize = () => {
    switch (layout) {
      case 'compact': return { width: 320, padding: 25, qrSize: 160 };
      case 'large': return { width: 520, padding: 55, qrSize: 240 };
      default: return { width: 420, padding: 40, qrSize: 200 };
    }
  };

  const { width, padding, qrSize } = getLayoutSize();

  return (
    <Box
      sx={{
        width,
        margin: '20px auto',
        padding: `${padding}px`,
        background: '#f8f9fa',
        color: '#212529'
      }}
    >
      <Paper
        elevation={4}
        sx={{
          background: '#ffffff',
          border: '1px solid #dee2e6',
          padding: `${padding}px`,
          margin: 0,
          textAlign: 'center',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        {/* Logo Placeholder */}
        <Box
          sx={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            width: '40px',
            height: '40px',
            background: primaryColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          D
        </Box>

        <Typography
          variant="h2"
          sx={{
            color: primaryColor,
            fontWeight: 700,
            fontSize: layout === 'compact' ? '2rem' : layout === 'large' ? '3rem' : '2.5rem',
            marginBottom: '15px',
            letterSpacing: '1px',
            fontFamily: '"Arial", sans-serif'
          }}
        >
          🦕 DINO
        </Typography>

        {/* Professional Line */}
        <Box
          sx={{
            height: '3px',
            background: `linear-gradient(to right, ${primaryColor}, #007bff, ${primaryColor})`,
            margin: '20px auto',
            width: '80px'
          }}
        />

        <Typography
          variant="h4"
          sx={{
            color: '#212529',
            fontWeight: 600,
            fontSize: layout === 'compact' ? '1.3rem' : layout === 'large' ? '1.9rem' : '1.6rem',
            marginBottom: '8px',
            fontFamily: '"Arial", sans-serif'
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: '#6c757d',
            fontWeight: 500,
            fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.4rem' : '1.2rem',
            marginBottom: '25px',
            fontFamily: '"Arial", sans-serif'
          }}
        >
          Table {tableNumber}
        </Typography>

        <Box
          sx={{
            margin: '25px auto',
            padding: '20px',
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
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
          <Box sx={{ marginTop: '20px' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#495057',
                fontWeight: 600,
                fontSize: layout === 'compact' ? '0.9rem' : layout === 'large' ? '1.2rem' : '1rem',
                marginBottom: '10px',
                fontFamily: '"Arial", sans-serif'
              }}
            >
              Digital Menu Access
            </Typography>
            <Typography
              sx={{
                fontSize: layout === 'compact' ? '0.8rem' : '0.9rem',
                color: '#495057',
                lineHeight: 1.5,
                fontFamily: '"Arial", sans-serif'
              }}
            >
              Please scan the QR code above with your mobile device to access our digital menu and place your order.
            </Typography>
          </Box>
        )}

        {/* Company Info */}
        <Box
          sx={{
            borderTop: '1px solid #dee2e6',
            paddingTop: '15px',
            marginTop: '20px'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#6c757d'
            }}
          >
            <span>Professional Dining Solutions</span>
            <span>Est. 2024</span>
          </Box>

        </Box>
      </Paper>
    </Box>
  );
};

export default CorporateTemplate;