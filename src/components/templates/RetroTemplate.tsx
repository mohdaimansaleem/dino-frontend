import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const RetroTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#8b4513',
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
        background: '#f4e4bc',
        position: 'relative',
        color: '#8b4513'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          background: '#fff8dc',
          border: '4px solid #8b4513',
          padding: `${padding}px`,
          margin: 0,
          textAlign: 'center',
          position: 'relative',
          boxShadow: '8px 8px 0px #d2b48c',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            bottom: '10px',
            border: '2px dashed #8b4513',
            pointerEvents: 'none'
          }
        }}
      >
        {/* Vintage Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: '-15px',
            right: '20px',
            background: '#8b4513',
            color: '#fff8dc',
            padding: '8px 16px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transform: 'rotate(15deg)',
            zIndex: 3
          }}
        >
          EST. 2024
        </Box>

        {/* Corner Decorations */}
        {[
          { top: '15px', left: '15px', borderRight: 'none', borderBottom: 'none' },
          { top: '15px', right: '15px', borderLeft: 'none', borderBottom: 'none' },
          { bottom: '15px', left: '15px', borderRight: 'none', borderTop: 'none' },
          { bottom: '15px', right: '15px', borderLeft: 'none', borderTop: 'none' }
        ].map((style, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              border: '3px solid #8b4513',
              ...style
            }}
          />
        ))}

        <Typography
          variant="h2"
          sx={{
            color: '#8b4513',
            fontWeight: 'bold',
            fontSize: layout === 'compact' ? '2rem' : layout === 'large' ? '3rem' : '2.5rem',
            marginBottom: '15px',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontFamily: '"Courier New", monospace',
            textShadow: '2px 2px 0px #d2b48c'
          }}
        >
          🦕 DINO
        </Typography>

        <Typography
          variant="h4"
          sx={{
            color: '#654321',
            fontWeight: 'bold',
            fontSize: layout === 'compact' ? '1.3rem' : layout === 'large' ? '1.9rem' : '1.6rem',
            marginBottom: '8px',
            textTransform: 'uppercase',
            fontFamily: '"Courier New", monospace'
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: '#8b4513',
            fontWeight: 'bold',
            fontSize: layout === 'compact' ? '1.1rem' : layout === 'large' ? '1.5rem' : '1.3rem',
            marginBottom: '25px',
            fontFamily: '"Courier New", monospace'
          }}
        >
          TABLE {tableNumber}
        </Typography>

        <Box
          sx={{
            margin: '25px auto',
            padding: '20px',
            background: '#ffffff',
            border: '3px solid #8b4513',
            boxShadow: '4px 4px 0px #d2b48c',
            width: 'fit-content'
          }}
        >
          <img
            src={qrCodeBase64}
            alt="QR Code"
            style={{
              width: qrSize,
              height: qrSize,
              filter: 'sepia(20%)',
              display: 'block'
            }}
          />
        </Box>

        {includeInstructions && (
          <Typography
            sx={{
              fontSize: layout === 'compact' ? '0.9rem' : layout === 'large' ? '1.2rem' : '1rem',
              color: '#654321',
              marginTop: '20px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: '"Courier New", monospace'
            }}
          >
            SCAN FOR CLASSIC MENU
          </Typography>
        )}


      </Paper>
    </Box>
  );
};

export default RetroTemplate;