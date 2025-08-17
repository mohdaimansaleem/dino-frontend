import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Button,
  List,
  ListItem,
  Avatar,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { Edit, Delete, LocationOn, Add, TableRestaurant } from '@mui/icons-material';

interface TableAreasProps {
  areas: any[];
  tables: any[];
  onEditArea: (area: any) => void;
  onDeleteArea: (areaId: string) => void;
  onAddArea: () => void;
}

const TableAreas: React.FC<TableAreasProps> = ({
  areas,
  tables,
  onEditArea,
  onDeleteArea,
  onAddArea
}) => {
  return (
    <Box sx={{ 
      backgroundColor: 'white',
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'grey.200',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        p: 3,
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LocationOn sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="700" sx={{ color: 'text.primary', mb: 0.5 }}>
              Seating Areas
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {areas.length} areas • {tables.length} total tables
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddArea}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            fontWeight: 600,
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          Add Area
        </Button>
      </Box>
      
      {/* Content */}
      <Box sx={{ p: 3 }}>
        {areas.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4
          }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
              <LocationOn sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h6" fontWeight="600" gutterBottom color="text.primary">
              No Areas Found
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
              Create your first seating area to organize your tables
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={onAddArea}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              Create Area
            </Button>
          </Box>
        ) : (
          <Box>
            {/* Area Cards Grid */}
            <Grid container spacing={2}>
              {areas.map((area) => {
                const tablesInArea = tables.filter(t => t.location === area.id);
                return (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={area.id}>
                    <Card
                      sx={{
                        backgroundColor: 'white',
                        border: '2px solid',
                        borderColor: area.color,
                        borderRadius: 3,
                        transition: 'all 0.2s ease-in-out',
                        position: 'relative',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${area.color}40`,
                          borderColor: area.color
                        }
                      }}
                    >
                      <CardContent sx={{ p: 2, textAlign: 'center', position: 'relative' }}>
                        {/* Action Buttons */}
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8,
                          display: 'flex',
                          gap: 0.5
                        }}>
                          <IconButton 
                            size="small" 
                            onClick={() => onEditArea(area)}
                            sx={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              color: 'text.secondary',
                              width: 28,
                              height: 28,
                              '&:hover': { 
                                backgroundColor: 'primary.50',
                                color: 'primary.main',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <Edit sx={{ fontSize: 16 }} />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => onDeleteArea(area.id)}
                            sx={{ 
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              color: 'text.secondary',
                              width: 28,
                              height: 28,
                              '&:hover': { 
                                backgroundColor: 'error.50',
                                color: 'error.main',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>

                        {/* Area Icon - Centered */}
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: area.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2
                          }}
                        >
                          <LocationOn sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                        
                        {/* Area Name - Centered */}
                        <Typography 
                          variant="h6" 
                          fontWeight="700" 
                          sx={{ 
                            color: 'text.primary',
                            mb: 1,
                            fontSize: '1rem',
                            textAlign: 'center'
                          }}
                        >
                          {area.name}
                        </Typography>
                        
                        {/* Table Count - Centered */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1.5 }}>
                          <Typography 
                            variant="h5" 
                            fontWeight="700" 
                            sx={{ color: area.color }}
                          >
                            {tablesInArea.length}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ color: 'text.secondary' }}
                          >
                            {tablesInArea.length === 1 ? 'table' : 'tables'}
                          </Typography>
                        </Box>
                        
                        {/* Description - Centered */}
                        {area.description && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'text.secondary',
                              mb: 1.5,
                              fontSize: '0.85rem',
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical'
                            }}
                          >
                            {area.description}
                          </Typography>
                        )}
                        
                        {/* Status Chip - Centered */}
                        <Box sx={{ textAlign: 'center' }}>
                          <Chip
                            label={area.active ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              backgroundColor: area.active ? `${area.color}20` : 'grey.100',
                              color: area.active ? area.color : 'text.secondary',
                              fontWeight: 600,
                              border: `1px solid ${area.active ? `${area.color}40` : 'grey.300'}`
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TableAreas;