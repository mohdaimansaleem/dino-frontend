import React from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Stack,
  IconButton,
  Chip
} from '@mui/material';
import { FilterList, LocationOn, Add, Refresh, Clear } from '@mui/icons-material';

interface TableFiltersProps {
  selectedArea: string;
  setSelectedArea: (value: string) => void;
  areas: any[];
  onAddArea: () => void;
  onAddTable: () => void;
  onRefresh: () => void;
  loading?: boolean;
  isMobile?: boolean;
}

const TableFilters: React.FC<TableFiltersProps> = ({
  selectedArea,
  setSelectedArea,
  areas,
  onAddArea,
  onAddTable,
  onRefresh,
  loading = false,
  isMobile = false
}) => {
  const activeFiltersCount = selectedArea !== 'all' ? 1 : 0;

  return (
    <Box 
      sx={{ 
        backgroundColor: 'white',
        borderRadius: 3,
        p: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FilterList sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="700" sx={{ color: 'text.primary', mb: 0.25 }}>
              Filters & Search
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
              Find and organize your tables
            </Typography>
          </Box>
        </Box>

        {activeFiltersCount > 0 && (
          <Chip
            label={`${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`}
            size="small"
            color="primary"
            variant="outlined"
            onDelete={() => setSelectedArea('all')}
            deleteIcon={<Clear sx={{ color: 'primary.main !important' }} />}
          />
        )}
      </Box>

      {/* Filters */}
      <Grid container spacing={2} alignItems="center">
        {/* Area Filter */}
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Area</InputLabel>
            <Select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              label="Filter by Area"
              size="medium"
              sx={{ 
                borderRadius: 2,
                backgroundColor: 'grey.50',
                '&:hover': {
                  backgroundColor: 'grey.100'
                }
              }}
            >
              <MenuItem value="all">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'primary.main' }} />
                  All Areas
                </Box>
              </MenuItem>
              {areas.map(area => (
                <MenuItem key={area.id} value={area.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        backgroundColor: area.color 
                      }} 
                    />
                    {area.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        {/* Actions */}
        <Grid item xs={12} md={8}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="flex-end"
            alignItems="center"
          >
            <Button
              variant="outlined"
              startIcon={<LocationOn />}
              onClick={onAddArea}
              size="medium"
              sx={{
                borderRadius: 2,
                borderColor: 'grey.300',
                color: 'text.primary',
                backgroundColor: 'white',
                minWidth: 140,
                fontWeight: 600,
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Manage Areas
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddTable}
              size="medium"
              sx={{
                borderRadius: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                minWidth: 140,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Add New Table
            </Button>
            <IconButton
              onClick={onRefresh}
              disabled={loading}
              sx={{ 
                backgroundColor: 'grey.100',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                width: 48,
                height: 48,
                '&:hover': { 
                  backgroundColor: 'grey.200',
                  color: 'primary.main',
                  borderColor: 'primary.main',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  opacity: 0.5,
                  backgroundColor: 'grey.100'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Refresh sx={{ 
                animation: loading ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }} />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TableFilters;