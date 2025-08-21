import React from 'react';
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Stack,
  Chip,
  useTheme,
  Button,
  alpha,
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Category, 
} from '@mui/icons-material';

interface MenuCategoriesProps {
  categories: any[];
  menuItems: any[];
  onEditCategory: (category: any) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddCategory: () => void;
}

const MenuCategories: React.FC<MenuCategoriesProps> = ({
  categories,
  menuItems,
  onEditCategory,
  onDeleteCategory,
  onAddCategory
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      py: { xs: 4, sm: 5 }, 
      px: { xs: 3, sm: 4 },
      backgroundColor: 'background.paper', 
      borderRadius: 3, 
      border: '1px solid', 
      borderColor: 'grey.100',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      mb: { xs: 3, sm: 4 }
    }}>
      {/* Header with Add Category button on top right */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 4
      }}>
        {/* Left side - Categories title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Category sx={{ color: 'primary.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" fontWeight="700" color="text.primary">
              Menu Categories ({categories.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', mt: 0.5 }}>
              Organize your menu items into categories
            </Typography>
          </Box>
        </Box>

        {/* Right side - Add Category Button */}
        <Button
          variant="contained"
          startIcon={<Category />}
          onClick={onAddCategory}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            fontSize: '0.875rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              transform: 'translateY(-1px)',
            }
          }}
        >
          Add Category
        </Button>
      </Box>
      
      {/* Categories Grid with enhanced spacing */}
      {categories.length === 0 ? (
        // Empty state when no categories
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 6,
          textAlign: 'center'
        }}>
          <Category sx={{ 
            fontSize: 64, 
            color: 'text.disabled', 
            mb: 2 
          }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Menu Categories Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
            Create your first menu category to organize your dishes. Categories help customers navigate your menu more easily.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Category />}
            onClick={onAddCategory}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Create First Category
          </Button>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 3, sm: 4 }}>
          {categories.map(category => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
            <Box 
              sx={{ 
                backgroundColor: alpha(theme.palette.grey[50], 0.8),
                border: '1px solid', 
                borderColor: 'grey.200',
                borderRadius: 3,
                borderLeft: `5px solid ${theme.palette.primary.main}`,
                p: { xs: 3, sm: 3.5 },
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  borderColor: 'primary.main',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
                  transform: 'translateY(-4px)',
                  backgroundColor: 'background.paper'
                },
                height: '100%',
                minHeight: 140
              }}
            >
              <Stack 
                direction="row"
                justifyContent="space-between" 
                alignItems="flex-start"
                spacing={1.5}
                sx={{ height: '100%' }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="700" 
                    color="text.primary"
                    sx={{ 
                      mb: 1.5, 
                      fontSize: '1.1rem',
                      lineHeight: 1.2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {category.name}
                  </Typography>
                  {category.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 2,
                        lineHeight: 1.4,
                        fontSize: '0.85rem'
                      }}
                    >
                      {category.description}
                    </Typography>
                  )}
                  <Chip
                    label={`${menuItems.filter(item => item.category === category.id).length} items`}
                    size="small"
                    variant="filled"
                    color="primary"
                    sx={{ 
                      fontSize: '0.75rem',
                      height: 24,
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 1.5 }
                    }}
                  />
                </Box>
                <Stack direction="column" spacing={0.5}>
                  <IconButton 
                    size="small" 
                    onClick={() => onEditCategory(category)}
                    sx={{ 
                      color: 'text.secondary',
                      backgroundColor: alpha(theme.palette.grey[100], 0.8),
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: 'primary.main'
                      }
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => onDeleteCategory(category.id)}
                    sx={{ 
                      color: 'text.secondary',
                      backgroundColor: alpha(theme.palette.grey[100], 0.8),
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.error.main, 0.1),
                        color: 'error.main'
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MenuCategories;