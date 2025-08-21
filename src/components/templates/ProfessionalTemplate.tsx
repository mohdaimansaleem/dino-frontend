import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const ProfessionalTemplate: React.FC<TemplateProps> = ({
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
      case 'compact': return { width: 340, padding: 30, qrSize: 170 };
      case 'large': return { width: 540, padding: 60, qrSize: 250 };
      default: return { width: 440, padding: 45, qrSize: 210 };
    }
  };

  const { width, padding, qrSize } = getLayoutSize();

  return (
    <Box
      sx={{
        width,
        margin: '20px auto',
        padding: `${padding}px`,
        background: '#f5f5f5',
        color: '#333333'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          background: '#ffffff',
          padding: `${padding}px`,
          margin: 0,
          textAlign: 'center',
          position: 'relative',
          borderTop: `4px solid ${primaryColor}`
        }}
      >
        {/* Professional Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h2"
            sx={{
              color: primaryColor,
              fontWeight: 700,
              fontSize: layout === 'compact' ? '2rem' : layout === 'large' ? '3rem' : '2.5rem',
              marginBottom: '12px',
              fontFamily: '"Times New Roman", serif',
              letterSpacing: '1px'
            }}
          >
            🦕 DINO
          </Typography>
          
          <Box
            sx={{
              height: '1px',
              background: `linear-gradient(to right, transparent, ${primaryColor}, transparent)`,
              width: '80%',
              margin: '0 auto 20px auto'
            }}
          />
          
          <Typography
            variant="h4"
            sx={{
              color: '#2c3e50',
              fontWeight: 600,
              fontSize: layout === 'compact' ? '1.3rem' : layout === 'large' ? '1.9rem' : '1.6rem',
              marginBottom: '6px',
              fontFamily: '"Times New Roman", serif'
            }}
          >
            {venueName}
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: '#7f8c8d',
              fontWeight: 500,
              fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.3rem' : '1.1rem',
              fontFamily: '"Times New Roman", serif'
            }}
          >
            Table {tableNumber}
          </Typography>
        </Box>

        {/* Professional QR Code Frame */}
        <Box
          sx={{
            margin: '35px auto',
            padding: '25px',
            background: '#f8f9fa',
            border: `2px solid ${primaryColor}`,
            borderRadius: '4px',
            width: 'fit-content',
            position: 'relative'
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
          
          {/* Corner decorations */}
          <Box
            sx={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              width: '15px',
              height: '15px',
              border: `2px solid ${primaryColor}`,
              borderRight: 'none',
              borderBottom: 'none'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              width: '15px',
              height: '15px',
              border: `2px solid ${primaryColor}`,
              borderLeft: 'none',
              borderTop: 'none'
            }}
          />
        </Box>

        {/* Professional Instructions */}
        {includeInstructions && (
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#2c3e50',
                fontWeight: 600,
                fontSize: layout === 'compact' ? '0.9rem' : layout === 'large' ? '1.2rem' : '1rem',
                marginBottom: '10px',
                fontFamily: '"Times New Roman", serif'
              }}
            >
              Digital Menu Access
            </Typography>
            <Typography
              sx={{
                fontSize: layout === 'compact' ? '0.8rem' : '0.9rem',
                color: '#7f8c8d',
                lineHeight: 1.6,
                fontFamily: '"Times New Roman", serif',
                maxWidth: '300px',
                margin: '0 auto'
              }}
            >
              Please scan the QR code above with your mobile device camera to access our comprehensive digital menu and place your order.
            </Typography>
          </Box>
        )}

        {/* Professional Footer */}
        <Box
          sx={{
            borderTop: `1px solid ${primaryColor}30`,
            paddingTop: '20px',
            marginTop: '30px'
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              color: '#95a5a6',
              fontFamily: '"Times New Roman", serif',
              fontStyle: 'italic'
            }}
          >
            Excellence in Dining • Est. 2024
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfessionalTemplate;