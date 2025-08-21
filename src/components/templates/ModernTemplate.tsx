import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const ModernTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#667eea',
  includeInstructions = true,
  layout = 'standard'
}) => {
  const getLayoutSize = () => {
    switch (layout) {
      case 'compact': return { width: 320, padding: 25, qrSize: 170 };
      case 'large': return { width: 520, padding: 55, qrSize: 250 };
      default: return { width: 420, padding: 40, qrSize: 210 };
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
        background: `linear-gradient(135deg, ${primaryColor} 0%, #764ba2 50%, #667eea 100%)`,
        borderRadius: '25px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
          pointerEvents: 'none'
        }
      }}
    >


      {/* Content Container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: `${padding * 0.8}px`,
          color: '#2c3e50',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}
      >
        {/* Header */}
        <Typography
          variant="h2"
          sx={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #764ba2 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 900,
            fontSize: layout === 'compact' ? '2rem' : layout === 'large' ? '3rem' : '2.5rem',
            marginBottom: '10px',
            fontFamily: '"Inter", "Segoe UI", sans-serif',
            letterSpacing: '1px',
            textShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          🦕 DINO
        </Typography>

        {/* Modern Divider */}
        <Box
          sx={{
            width: '100px',
            height: '4px',
            background: `linear-gradient(90deg, ${primaryColor}, #764ba2, ${primaryColor})`,
            margin: '15px auto 25px',
            borderRadius: '2px',
            boxShadow: `0 2px 8px ${primaryColor}40`
          }}
        />

        <Typography
          variant="h4"
          sx={{
            color: '#2c3e50',
            fontWeight: 700,
            fontSize: layout === 'compact' ? '1.4rem' : layout === 'large' ? '2rem' : '1.7rem',
            marginBottom: '8px',
            fontFamily: '"Inter", sans-serif',
            letterSpacing: '0.5px'
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #764ba2 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 600,
            fontSize: layout === 'compact' ? '1.1rem' : layout === 'large' ? '1.5rem' : '1.3rem',
            marginBottom: '30px',
            fontFamily: '"Inter", sans-serif'
          }}
        >
          Table {tableNumber}
        </Typography>

        {/* QR Code with Modern Frame */}
        <Box
          sx={{
            position: 'relative',
            margin: '30px auto',
            width: 'fit-content'
          }}
        >
          <Box
            sx={{
              padding: '25px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              borderRadius: '20px',
              border: `3px solid transparent`,
              backgroundClip: 'padding-box',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '-3px',
                left: '-3px',
                right: '-3px',
                bottom: '-3px',
                background: `linear-gradient(135deg, ${primaryColor}, #764ba2, ${primaryColor})`,
                borderRadius: '20px',
                zIndex: -1
              }
            }}
          >
            <img
              src={qrCodeBase64}
              alt="QR Code"
              style={{
                width: qrSize,
                height: qrSize,
                borderRadius: '12px',
                display: 'block',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }}
            />
          </Box>


        </Box>

        {/* Modern Instructions */}
        {includeInstructions && (
          <Box sx={{ marginTop: '25px' }}>
            <Typography
              variant="h6"
              sx={{
                color: '#2c3e50',
                fontWeight: 600,
                fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.3rem' : '1.1rem',
                marginBottom: '20px',
                fontFamily: '"Inter", sans-serif'
              }}
            >
              Scan with your camera to get started
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                gap: '15px',
                marginTop: '20px'
              }}
            >
              {[
                { icon: '📱', text: 'Camera', color: '#3498db' },
                { icon: '⚡', text: 'Instant', color: '#e74c3c' },
                { icon: '🔒', text: 'Secure', color: '#27ae60' },
                { icon: '🚀', text: 'Fast', color: '#f39c12' }
              ].map((feature, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: 'center',
                    padding: '15px 10px',
                    background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                    borderRadius: '12px',
                    border: `1px solid ${feature.color}30`,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Typography sx={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                    {feature.icon}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: layout === 'compact' ? '0.7rem' : '0.8rem',
                      color: feature.color,
                      fontWeight: 600,
                      fontFamily: '"Inter", sans-serif'
                    }}
                  >
                    {feature.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}


      </Box>
    </Paper>
  );
};

export default ModernTemplate;