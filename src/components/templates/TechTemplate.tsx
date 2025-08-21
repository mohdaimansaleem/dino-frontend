import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { TemplateProps } from './index';

const TechTemplate: React.FC<TemplateProps> = ({
  qrCodeBase64,
  venueName,
  tableNumber,
  menuUrl,
  primaryColor = '#00ff41',
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
    <Paper
      elevation={20}
      sx={{
        width,
        margin: '20px auto',
        padding: `${padding}px`,
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d1421 100%)',
        border: `2px solid ${primaryColor}`,
        borderRadius: '15px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        color: primaryColor,
        boxShadow: `0 0 40px ${primaryColor}30, inset 0 1px 0 rgba(255,255,255,0.1)`
      }}
    >
      {/* Tech Grid Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(${primaryColor}20 1px, transparent 1px),
            linear-gradient(90deg, ${primaryColor}20 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          opacity: 0.3
        }}
      />

      {/* Scanning Line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${primaryColor}30, transparent)`,
          display: 'none'
        }}
      />

      {/* Status Bar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          marginBottom: '20px',
          opacity: 0.8,
          fontFamily: '"Courier New", monospace',
          position: 'relative',
          zIndex: 2
        }}
      >
        <span>SYSTEM: ONLINE</span>
        <span>TABLE: {tableNumber}</span>
        <span>STATUS: READY</span>
      </Box>

      {/* Header */}
      <Typography
        variant="h2"
        sx={{
          color: primaryColor,
          fontWeight: 'bold',
          fontSize: layout === 'compact' ? '2rem' : layout === 'large' ? '3rem' : '2.5rem',
          marginBottom: '15px',
          fontFamily: '"Courier New", monospace',
          letterSpacing: '3px',
          textShadow: `0 0 20px ${primaryColor}, 0 0 40px ${primaryColor}50`,
          position: 'relative',
          zIndex: 2,
          
        }}
      >
        🦕 DINO.EXE
      </Typography>

      {/* Loading Bar */}
      <Box
        sx={{
          width: '100%',
          height: '3px',
          background: '#333',
          margin: '15px 0',
          overflow: 'hidden',
          borderRadius: '2px',
          position: 'relative',
          zIndex: 2
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, ${primaryColor}, #00cc33)`
          }}
        />
      </Box>

      <Typography
        variant="h4"
        sx={{
          color: '#ffffff',
          fontWeight: 600,
          fontSize: layout === 'compact' ? '1.3rem' : layout === 'large' ? '1.9rem' : '1.6rem',
          marginBottom: '8px',
          fontFamily: '"Courier New", monospace',
          textShadow: '0 0 10px #ffffff50',
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
          fontWeight: 'bold',
          fontSize: layout === 'compact' ? '1.1rem' : layout === 'large' ? '1.5rem' : '1.3rem',
          marginBottom: '30px',
          fontFamily: '"Courier New", monospace',
          position: 'relative',
          zIndex: 2
        }}
      >
        &gt; TABLE_{tableNumber}
      </Typography>

      {/* Tech QR Container */}
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
            background: '#ffffff',
            borderRadius: '10px',
            border: `2px solid ${primaryColor}`,
            boxShadow: `
              0 0 30px ${primaryColor}40,
              inset 0 0 20px rgba(0,255,65,0.1)
            `,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              background: `linear-gradient(45deg, ${primaryColor}, #00cc33, ${primaryColor})`,
              borderRadius: '10px',
              zIndex: -1,
              filter: 'blur(2px)',
              opacity: 0.7
            }
          }}
        >
          <img
            src={qrCodeBase64}
            alt="QR Code"
            style={{
              width: qrSize,
              height: qrSize,
              borderRadius: '5px',
              display: 'block'
            }}
          />
        </Box>

        {/* Tech Corner Brackets */}
        {[
          { top: '-10px', left: '-10px', borderTop: `3px solid ${primaryColor}`, borderLeft: `3px solid ${primaryColor}` },
          { top: '-10px', right: '-10px', borderTop: `3px solid ${primaryColor}`, borderRight: `3px solid ${primaryColor}` },
          { bottom: '-10px', left: '-10px', borderBottom: `3px solid ${primaryColor}`, borderLeft: `3px solid ${primaryColor}` },
          { bottom: '-10px', right: '-10px', borderBottom: `3px solid ${primaryColor}`, borderRight: `3px solid ${primaryColor}` }
        ].map((style, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              width: '20px',
              height: '20px',
              ...style,
              opacity: 0.8
            }}
          />
        ))}
      </Box>

      {/* Tech Instructions */}
      {includeInstructions && (
        <Box sx={{ marginTop: '25px', position: 'relative', zIndex: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: primaryColor,
              fontWeight: 500,
              fontSize: layout === 'compact' ? '0.9rem' : layout === 'large' ? '1.2rem' : '1rem',
              marginBottom: '20px',
              fontFamily: '"Courier New", monospace',
              textShadow: `0 0 10px ${primaryColor}50`
            }}
          >
            &gt; SCAN TO ACCESS DIGITAL MENU_
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
              { icon: '📱', text: 'DEVICE', cmd: 'camera.exe' },
              { icon: '🎯', text: 'TARGET', cmd: 'scan.exe' },
              { icon: '🔗', text: 'CONNECT', cmd: 'link.exe' },
              { icon: '🍽️', text: 'ACCESS', cmd: 'menu.exe' }
            ].map((step, index) => (
              <Box
                key={index}
                sx={{
                  textAlign: 'center',
                  padding: '15px 10px',
                  background: `linear-gradient(135deg, ${primaryColor}10, transparent)`,
                  border: `1px solid ${primaryColor}40`,
                  borderRadius: '8px',

                }}
              >
                <Typography sx={{ fontSize: '1.2rem', marginBottom: '5px' }}>
                  {step.icon}
                </Typography>
                <Typography
                  sx={{
                    fontSize: layout === 'compact' ? '0.6rem' : '0.7rem',
                    color: primaryColor,
                    fontWeight: 'bold',
                    fontFamily: '"Courier New", monospace',
                    marginBottom: '3px'
                  }}
                >
                  {step.text}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.6rem',
                    color: `${primaryColor}80`,
                    fontFamily: '"Courier New", monospace'
                  }}
                >
                  {step.cmd}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}



      {/* Floating Tech Elements */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            background: primaryColor,
            borderRadius: '50%',
            top: `${20 + i * 15}%`,
            right: `${10 + i * 5}%`,
            opacity: 0.5
          }}
        />
      ))}
    </Paper>
  );
};

export default TechTemplate;