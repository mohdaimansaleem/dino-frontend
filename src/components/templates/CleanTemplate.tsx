import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const CleanTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#34495e',
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
        color: '#2c3e50'
      }}
    >
      <Paper
        elevation={1}
        sx={{
          background: '#ffffff',
          border: 'none',
          padding: `${padding}px`,
          margin: 0,
          textAlign: 'center',
          borderRadius: '12px',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)'
        }}
      >
        {/* Clean Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h2"
            sx={{
              color: primaryColor,
              fontWeight: 500,
              fontSize: layout === 'compact' ? '1.8rem' : layout === 'large' ? '2.8rem' : '2.3rem',
              marginBottom: '16px',
              fontFamily: '"Inter", "Segoe UI", sans-serif',
              letterSpacing: '-0.5px'
            }}
          >
            🦕 Dino
          </Typography>
          
          <Typography
            variant="h4"
            sx={{
              color: '#2c3e50',
              fontWeight: 400,
              fontSize: layout === 'compact' ? '1.2rem' : layout === 'large' ? '1.8rem' : '1.5rem',
              marginBottom: '6px',
              fontFamily: '"Inter", sans-serif'
            }}
          >
            {venueName}
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: '#7f8c8d',
              fontWeight: 300,
              fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.3rem' : '1.1rem',
              fontFamily: '"Inter", sans-serif'
            }}
          >
            Table {tableNumber}
          </Typography>
        </Box>

        {/* Clean QR Code */}
        <Box
          sx={{
            margin: '40px auto',
            padding: '24px',
            background: '#f8f9fa',
            borderRadius: '16px',
            width: 'fit-content',
            border: '1px solid #ecf0f1'
          }}
        >
          <img
            src={qrCodeBase64}
            alt="QR Code"
            style={{
              width: qrSize,
              height: qrSize,
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>

        {/* Clean Instructions */}
        {includeInstructions && (
          <Box sx={{ mt: 3 }}>
            <Typography
              sx={{
                fontSize: layout === 'compact' ? '0.9rem' : layout === 'large' ? '1.2rem' : '1rem',
                color: '#34495e',
                fontWeight: 400,
                lineHeight: 1.5,
                fontFamily: '"Inter", sans-serif',
                marginBottom: '12px'
              }}
            >
              Scan to view our menu
            </Typography>
            <Typography
              sx={{
                fontSize: layout === 'compact' ? '0.75rem' : '0.85rem',
                color: '#95a5a6',
                fontWeight: 300,
                fontFamily: '"Inter", sans-serif'
              }}
            >
              Point your camera at the QR code
            </Typography>
          </Box>
        )}

        {/* Clean Footer */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #ecf0f1' }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              color: '#bdc3c7',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 300,
              letterSpacing: '0.5px'
            }}
          >
            MODERN DINING
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default CleanTemplate;