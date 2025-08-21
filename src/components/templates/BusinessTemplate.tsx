import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const BusinessTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#1976d2',
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
        background: '#ffffff',
        color: '#333333'
      }}
    >
      <Paper
        elevation={2}
        sx={{
          background: '#ffffff',
          border: `2px solid ${primaryColor}`,
          padding: `${padding}px`,
          margin: 0,
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Header Section */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h2"
            sx={{
              color: primaryColor,
              fontWeight: 600,
              fontSize: layout === 'compact' ? '1.8rem' : layout === 'large' ? '2.8rem' : '2.3rem',
              marginBottom: '8px',
              fontFamily: '"Roboto", "Arial", sans-serif',
              letterSpacing: '1px'
            }}
          >
            🦕 DINO
          </Typography>
          
          <Box
            sx={{
              height: '2px',
              background: primaryColor,
              width: '60px',
              margin: '0 auto 16px auto'
            }}
          />
          
          <Typography
            variant="h4"
            sx={{
              color: '#333333',
              fontWeight: 500,
              fontSize: layout === 'compact' ? '1.2rem' : layout === 'large' ? '1.8rem' : '1.5rem',
              marginBottom: '4px',
              fontFamily: '"Roboto", sans-serif'
            }}
          >
            {venueName}
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: '#666666',
              fontWeight: 400,
              fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.3rem' : '1.1rem',
              fontFamily: '"Roboto", sans-serif'
            }}
          >
            Table {tableNumber}
          </Typography>
        </Box>

        {/* QR Code Section */}
        <Box
          sx={{
            margin: '30px auto',
            padding: '20px',
            background: '#f8f9fa',
            border: `1px solid ${primaryColor}20`,
            borderRadius: '8px',
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

        {/* Instructions */}
        {includeInstructions && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#333333',
                fontWeight: 500,
                fontSize: layout === 'compact' ? '0.9rem' : layout === 'large' ? '1.2rem' : '1rem',
                marginBottom: '8px',
                fontFamily: '"Roboto", sans-serif'
              }}
            >
              Digital Menu Access
            </Typography>
            <Typography
              sx={{
                fontSize: layout === 'compact' ? '0.8rem' : '0.9rem',
                color: '#666666',
                lineHeight: 1.5,
                fontFamily: '"Roboto", sans-serif'
              }}
            >
              Scan the QR code with your mobile device to view our menu
            </Typography>
          </Box>
        )}

        {/* Footer */}
        <Box
          sx={{
            borderTop: `1px solid ${primaryColor}20`,
            paddingTop: '15px',
            marginTop: '25px'
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#999999',
              fontFamily: '"Roboto", sans-serif'
            }}
          >
            Professional Dining Experience
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default BusinessTemplate;