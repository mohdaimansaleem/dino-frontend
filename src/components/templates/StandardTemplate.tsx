import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const StandardTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#1565c0',
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
        background: '#fafafa',
        color: '#333333'
      }}
    >
      <Paper
        elevation={2}
        sx={{
          background: '#ffffff',
          border: `1px solid ${primaryColor}30`,
          padding: `${padding}px`,
          margin: 0,
          textAlign: 'center',
          borderRadius: '8px'
        }}
      >
        {/* Standard Header */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h2"
            sx={{
              color: primaryColor,
              fontWeight: 600,
              fontSize: layout === 'compact' ? '2rem' : layout === 'large' ? '3rem' : '2.5rem',
              marginBottom: '12px',
              fontFamily: '"Roboto", "Arial", sans-serif'
            }}
          >
            🦕 DINO
          </Typography>
          
          <Box
            sx={{
              height: '3px',
              background: primaryColor,
              width: '50px',
              margin: '0 auto 16px auto',
              borderRadius: '2px'
            }}
          />
          
          <Typography
            variant="h4"
            sx={{
              color: '#333333',
              fontWeight: 500,
              fontSize: layout === 'compact' ? '1.3rem' : layout === 'large' ? '1.9rem' : '1.6rem',
              marginBottom: '6px',
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

        {/* Standard QR Code */}
        <Box
          sx={{
            margin: '30px auto',
            padding: '20px',
            background: '#f5f5f5',
            border: `2px solid ${primaryColor}20`,
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

        {/* Standard Instructions */}
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
              Scan QR Code for Menu
            </Typography>
            <Typography
              sx={{
                fontSize: layout === 'compact' ? '0.8rem' : '0.9rem',
                color: '#666666',
                lineHeight: 1.4,
                fontFamily: '"Roboto", sans-serif'
              }}
            >
              Use your phone's camera to scan and view our digital menu
            </Typography>
          </Box>
        )}

        {/* Standard Footer */}
        <Box
          sx={{
            borderTop: `1px solid ${primaryColor}20`,
            paddingTop: '15px',
            marginTop: '25px'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box
              sx={{
                width: '8px',
                height: '8px',
                background: primaryColor,
                borderRadius: '50%'
              }}
            />
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#999999',
                fontFamily: '"Roboto", sans-serif'
              }}
            >
              Digital Menu Service
            </Typography>
            <Box
              sx={{
                width: '8px',
                height: '8px',
                background: primaryColor,
                borderRadius: '50%'
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default StandardTemplate;