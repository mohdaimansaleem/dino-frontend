import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const NatureTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#4a7c59',
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
        position: 'relative',
        borderRadius: '30px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #ffd3a5 100%)',
        padding: '8px'
      }}
    >
      <Paper
        elevation={12}
        sx={{
          padding: `${padding}px`,
          background: 'rgba(255, 255, 255, 0.95)',
          border: `3px solid ${primaryColor}`,
          borderRadius: '25px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(5px)',
          color: '#2d5016'
        }}
      >
        {/* Nature Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            fontSize: '2rem',
            opacity: 0.1,
            color: primaryColor,
            transform: 'rotate(-2deg)'
          }}
        >
          🌿
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '15px',
            right: '15px',
            fontSize: '1.8rem',
            opacity: 0.1,
            color: primaryColor,
            transform: 'rotate(2deg)'
          }}
        >
          🌱
        </Box>

        {/* Floating Leaves */}
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: '25px',
              height: '25px',
              background: primaryColor,
              borderRadius: '0 100% 0 100%',
              opacity: 0.08,
              top: `${15 + i * 12}%`,
              left: `${10 + i * 15}%`,
              transform: `rotate(${i * 45}deg)`
            }}
          />
        ))}

        {/* Header */}
        <Typography
          variant="h2"
          sx={{
            color: primaryColor,
            fontWeight: 700,
            fontSize: layout === 'compact' ? '2.2rem' : layout === 'large' ? '3.2rem' : '2.8rem',
            marginBottom: '15px',
            fontFamily: '"Merriweather", "Georgia", serif',
            textShadow: `1px 1px 3px ${primaryColor}30`,
            position: 'relative',
            zIndex: 2
          }}
        >
          🦕 DINO
        </Typography>

        {/* Nature Elements */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '20px',
            position: 'relative',
            zIndex: 2
          }}
        >
          {['🌱', '🍃', '🌿', '🌾'].map((element, index) => (
            <Typography
              key={index}
              sx={{
                fontSize: '1.5rem'
              }}
            >
              {element}
            </Typography>
          ))}
        </Box>

        <Typography
          variant="h4"
          sx={{
            color: '#2d5016',
            fontWeight: 600,
            fontSize: layout === 'compact' ? '1.4rem' : layout === 'large' ? '2rem' : '1.7rem',
            marginBottom: '8px',
            fontFamily: '"Merriweather", serif',
            position: 'relative',
            zIndex: 2
          }}
        >
          {venueName}
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: primaryColor,
            fontWeight: 500,
            fontSize: layout === 'compact' ? '1.1rem' : layout === 'large' ? '1.5rem' : '1.3rem',
            marginBottom: '30px',
            fontStyle: 'italic',
            fontFamily: '"Merriweather", serif',
            position: 'relative',
            zIndex: 2
          }}
        >
          Table {tableNumber}
        </Typography>

        {/* Organic QR Container */}
        <Box
          sx={{
            position: 'relative',
            margin: '30px auto',
            width: 'fit-content',
            zIndex: 2
          }}
        >
          <Box
            sx={{
              padding: '25px',
              background: 'linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%)',
              borderRadius: '25px',
              border: `3px solid ${primaryColor}`,
              boxShadow: `0 15px 35px ${primaryColor}20, inset 0 2px 10px rgba(74, 124, 89, 0.1)`,
              position: 'relative'
            }}
          >
            <img
              src={qrCodeBase64}
              alt="QR Code"
              style={{
                width: qrSize,
                height: qrSize,
                borderRadius: '15px',
                display: 'block'
              }}
            />
          </Box>

          {/* Organic Border */}
          <Box
            sx={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              right: '10px',
              bottom: '10px',
              border: `1px solid ${primaryColor}30`,
              borderRadius: '20px',
              pointerEvents: 'none'
            }}
          />

          {/* Growing Vines */}
          {[...Array(4)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: '3px',
                height: '25px',
                background: `linear-gradient(to bottom, ${primaryColor}, transparent)`,
                borderRadius: '2px',
                top: i % 2 === 0 ? '-15px' : 'calc(100% - 15px)',
                left: `${25 + i * 25}%`,
                opacity: 0.6
              }}
            />
          ))}
        </Box>

        {/* Nature Instructions */}
        {includeInstructions && (
          <Box sx={{ marginTop: '25px', position: 'relative', zIndex: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#2d5016',
                fontWeight: 500,
                fontSize: layout === 'compact' ? '1rem' : layout === 'large' ? '1.3rem' : '1.1rem',
                marginBottom: '20px',
                fontStyle: 'italic',
                fontFamily: '"Merriweather", serif'
              }}
            >
              Scan to discover our fresh, organic menu 🌱
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: '15px',
                marginTop: '20px'
              }}
            >
              {[
                { icon: '📱', text: 'Open Camera', color: '#27ae60' },
                { icon: '🌿', text: 'Scan Code', color: '#2ecc71' },
                { icon: '🍃', text: 'View Menu', color: '#58d68d' },
                { icon: '🌱', text: 'Order Fresh', color: '#82e0aa' }
              ].map((step, index) => (
                <Box
                  key={index}
                  sx={{
                    textAlign: 'center',
                    padding: '15px 10px',
                    background: `linear-gradient(135deg, ${step.color}15, ${step.color}05)`,
                    borderRadius: '20px',
                    border: `2px solid ${step.color}30`
                  }}
                >
                  <Typography sx={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                    {step.icon}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: layout === 'compact' ? '0.7rem' : '0.8rem',
                      color: step.color,
                      fontWeight: 600,
                      fontFamily: '"Merriweather", serif'
                    }}
                  >
                    {step.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Organic Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '30%',
            left: '5%',
            width: '40px',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${primaryColor}40, transparent)`,
            borderRadius: '1px',
            opacity: 0.6
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '70%',
            right: '5%',
            width: '35px',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${primaryColor}40, transparent)`,
            borderRadius: '1px',
            opacity: 0.6
          }}
        />
      </Paper>
    </Box>
  );
};

export default NatureTemplate;