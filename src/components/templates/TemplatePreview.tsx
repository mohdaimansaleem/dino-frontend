import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { templateConfigs } from './index';

interface TemplatePreviewProps {
  template: string;
  selected?: boolean;
  onClick?: () => void;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  selected = false,
  onClick
}) => {
  const config = templateConfigs[template];
  
  if (!config) return null;

  return (
    <Paper
      elevation={selected ? 8 : 2}
      onClick={onClick}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          elevation: 6,
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* Template Preview */}
      <Box
        sx={{
          height: 80,
          borderRadius: 1,
          background: config.previewGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: config.textColor,
          fontWeight: 'bold',
          fontSize: '0.875rem',
          marginBottom: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Typography variant="body2" sx={{ color: 'inherit', fontWeight: 'bold' }}>
          {config.icon} {config.name}
        </Typography>
        
        {/* Category Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '8px',
            fontSize: '0.6rem',
            textTransform: 'uppercase'
          }}
        >
          {config.category}
        </Box>
      </Box>

      {/* Template Info */}
      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
        {config.icon} {config.name}
      </Typography>
      
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
        {config.description}
      </Typography>
    </Paper>
  );
};

export default TemplatePreview;