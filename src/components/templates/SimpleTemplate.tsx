import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const SimpleTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#424242',
  includeInstructions = true,
  layout = 'standard'
}) => {
  const getLayoutSize = () => {
    switch (layout) {
      case 'compact': return { width: 300, padding: 20, qrSize: 150 };
      case 'large': return { width: 500, padding: 50, qrSize: 230 };
      default: return { width: 400, padding: 35, qrSize: 190 };
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
        elevation={0}
        sx={{
          background: '#ffffff',
          border: '1px solid #e0e0e0',
          padding: `${padding}px`,
          margin: 0,
          textAlign: 'center'
        }}
      >
        {/* Simple Header */}
        <Typography
          variant="h3"
          sx={{
            color: primaryColor,
            fontWeight: 300,
            fontSize: layout === 'compact' ? '1.5rem' : layout === 'large' ? '2.5rem' : '2rem',
            marginBottom: '10px',
            fontFamily: '"Helvetica Neue", "Arial", sans-serif',
            letterSpacing: '2px'
          }}
        >
          DINO
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: '#666666',
            fontWeight: 400,
            fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.5rem' : '1.2rem',
            marginBottom: '8px',
            fontFamily: '"Helvetica Neue", sans-serif'
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: '#999999',
            fontWeight: 300,
            fontSize: layout === 'compact' ? '0.9rem' : layout === 'large' ? '1.2rem' : '1rem',
            marginBottom: '30px',
            fontFamily: '"Helvetica Neue", sans-serif'
          }}
        >
          Table {tableNumber}
        </Typography>

        {/* Simple QR Code */}
        <Box
          sx={{
            margin: '30px auto',
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

        {/* Simple Instructions */}
        {includeInstructions && (
          <Typography
            sx={{
              fontSize: layout === 'compact' ? '0.8rem' : layout === 'large' ? '1.1rem' : '0.9rem',
              color: '#666666',
              marginTop: '25px',
              fontWeight: 300,
              lineHeight: 1.4,
              fontFamily: '"Helvetica Neue", sans-serif'
            }}
          >
            Scan to view menu
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default SimpleTemplate;