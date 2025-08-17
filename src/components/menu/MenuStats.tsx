import React from 'react';
import { Box, Grid, Typography, Stack, useTheme, alpha } from '@mui/material';
import { Restaurant, Category, Visibility, Nature, LocalDining } from '@mui/icons-material';

interface MenuStatsProps {
  menuItems: any[];
  categories: any[];
}

const MenuStats: React.FC<MenuStatsProps> = ({ menuItems, categories }) => {
  const theme = useTheme();

  const stats = [
    { 
      label: 'Categories', 
      value: categories.filter(cat => cat.active !== false).length, 
      color: '#FF9800', 
      icon: <Category />,
      description: 'Menu categories'
    },
    { 
      label: 'Total Menu Items', 
      value: menuItems.length, 
      color: '#2196F3', 
      icon: <Restaurant />,
      description: 'All menu items'
    },
    { 
      label: 'Available Items', 
      value: menuItems.filter(item => item.available ?? item.isAvailable).length, 
      color: '#4CAF50', 
      icon: <Visibility />,
      description: 'Currently available'
    },
    { 
      label: 'Vegetarian', 
      value: menuItems.filter(item => item.isVeg).length, 
      color: '#8BC34A', 
      icon: <Nature />,
      description: 'Vegetarian items'
    },
    { 
      label: 'Non-Vegetarian', 
      value: menuItems.filter(item => !item.isVeg).length, 
      color: '#F44336', 
      icon: <LocalDining />,
      description: 'Non-vegetarian items'
    },
  ];

  if (menuItems.length === 0 && categories.length === 0) return null;

  return (
    <Box sx={{ 
      px: { xs: 3, sm: 4 }, 
      py: { xs: 3, sm: 4 }, 
      backgroundColor: 'background.paper', 
      borderRadius: 3, 
      mb: 4,
      border: `1px solid ${theme.palette.grey[100]}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ mb: 3 }}>
        Menu Overview
      </Typography>
      
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: 2,
                backgroundColor: alpha(stat.color, 0.05),
                border: `1px solid ${alpha(stat.color, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(stat.color, 0.2)}`,
                  backgroundColor: alpha(stat.color, 0.08),
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                {/* Icon on the left */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: stat.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0,
                  }}
                >
                  {React.cloneElement(stat.icon, { fontSize: 'medium' })}
                </Box>
                
                {/* Text content on the right */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h4" 
                    fontWeight="700" 
                    color="text.primary" 
                    sx={{ 
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                      lineHeight: 1.2,
                      mb: 0.5
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    fontWeight="600"
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MenuStats;