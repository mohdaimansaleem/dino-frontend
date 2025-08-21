import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const MinimalTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#333333',
  includeInstructions = true,
  layout = 'standard'
}) => {
  const getLayoutSize = () => {
    switch (layout) {
      case 'compact': return { width: 300, padding: 25, qrSize: 160 };
      case 'large': return { width: 500, padding: 55, qrSize: 240 };
      default: return { width: 400, padding: 40, qrSize: 200 };
    }
  };

  const { width, padding, qrSize } = getLayoutSize();

  return (
    <Box
      sx={{
        width,
        margin: '20px auto',
        padding: `${padding}px`,
        background: 'white',
        color: '#333'
      }}
    >
      <Paper
        elevation={1}
        sx={{
          background: 'white',
          border: '1px solid #e0e0e0',
          padding: `${padding}px`,
          margin: 0,
          textAlign: 'center'
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: primaryColor,
            fontWeight: 300,
            fontSize: layout === 'compact' ? '1.8rem' : layout === 'large' ? '2.8rem' : '2.3rem',
            marginBottom: '20px',
            letterSpacing: '2px',
            fontFamily: '"Helvetica Neue", Arial, sans-serif'
          }}
        >
          DINO
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: '#333',
            fontWeight: 500,
            fontSize: layout === 'compact' ? '1.2rem' : layout === 'large' ? '1.8rem' : '1.5rem',
            marginBottom: '10px',
            fontFamily: '"Helvetica Neue", Arial, sans-serif'
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: '#666',
            fontWeight: 300,
            fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.4rem' : '1.2rem',
            marginBottom: '30px',
            fontFamily: '"Helvetica Neue", Arial, sans-serif'
          }}
        >
          Table {tableNumber}
        </Typography>

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

        {includeInstructions && (
          <Typography
            sx={{
              fontSize: layout === 'compact' ? '0.9rem' : layout === 'large' ? '1.2rem' : '1rem',
              color: '#666',
              marginTop: '25px',
              fontWeight: 300,
              lineHeight: 1.5,
              fontFamily: '"Helvetica Neue", Arial, sans-serif'
            }}
          >
            Scan with camera to view menu
          </Typography>
        )}


      </Paper>
    </Box>
  );
};

export default MinimalTemplate;