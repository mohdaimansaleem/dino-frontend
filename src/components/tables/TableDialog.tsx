import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Modal,
  Backdrop,
  Fade,
  AppBar,
  Toolbar,
  IconButton,
  Stack
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface TableDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (table: any) => void;
  table: any | null;
  areas: any[];
  tables: any[];
  isMobile?: boolean;
}

const TableDialog: React.FC<TableDialogProps> = ({
  open,
  onClose,
  onSave,
  table,
  areas,
  tables,
  isMobile = false
}) => {
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: 0,
    location: '',
    table_status: 'available',
    is_active: true,
  });

  useEffect(() => {
    if (table) {
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity,
        location: table.location || '',
        table_status: table.table_status,
        is_active: table.is_active,
      });
    } else {
      // Suggest next available table number
      const usedNumbers = tables.map(t => parseInt(t.table_number) || 0).sort((a, b) => a - b);
      let nextNumber = 1;
      for (let i = 1; i <= usedNumbers.length + 1; i++) {
        if (!usedNumbers.includes(i)) {
          nextNumber = i;
          break;
        }
      }
      
      setFormData({
        table_number: '',
        capacity: 0,
        location: '',
        table_status: 'available',
        is_active: true,
      });
    }
  }, [table, open, tables]);

  const handleSave = () => {
    // Validate form data before saving
    if (!formData.table_number || formData.table_number.trim() === '') {
      alert('Please enter a valid table number');
      return;
    }
    if (!formData.capacity || formData.capacity <= 0) {
      alert('Please enter a valid capacity greater than 0');
      return;
    }
    
    // Check for duplicate table numbers (only for new tables)
    if (!table) {
      const isDuplicate = tables.some((t: any) => t.table_number === formData.table_number.trim() && t.is_active);
      if (isDuplicate) {
        alert(`Table number ${formData.table_number} already exists. Please choose a different number.`);
        return;
      }
    }
    
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isMobile) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '95%',
              maxWidth: '500px',
              maxHeight: '90vh',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {table ? 'Edit Table' : 'Add Table'}
                </Typography>
                <IconButton edge="end" color="inherit" onClick={onClose}>
                  <Close />
                </IconButton>
              </Toolbar>
            </AppBar>

            <Box sx={{ overflow: 'auto', p: { xs: 2, sm: 1.5 } }}>
              <Stack spacing={{ xs: 2, sm: 1 }}>
                <TextField
                  fullWidth
                  label="Table Number"
                  type="text"
                  value={formData.table_number}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || /^[0-9]+$/.test(value)) {
                      handleChange('table_number', value);
                    }
                  }}
                  placeholder="e.g., 1"
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*'
                  }}
                  error={!table && tables.some(t => t.table_number === formData.table_number.trim() && t.is_active)}
                  size="medium"
                />
                <FormControl fullWidth size="medium">
                  <InputLabel>Area</InputLabel>
                  <Select
                    value={formData.location || ''}
                    onChange={(e) => handleChange('location', e.target.value)}
                    label="Area"
                  >
                    {areas.map(area => (
                      <MenuItem key={area.id} value={area.id}>
                        {area.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    label="Capacity"
                    type="text"
                    value={formData.capacity === 0 ? '' : formData.capacity || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = value === '' ? 0 : parseInt(value);
                        handleChange('capacity', numValue);
                      }
                    }}
                    onFocus={(e) => {
                      if (e.target.value === '0') {
                        e.target.select();
                      }
                    }}
                    placeholder="Enter capacity"
                    error={formData.capacity !== undefined && formData.capacity <= 0}
                    helperText={formData.capacity !== undefined && formData.capacity <= 0 ? "Capacity must be greater than 0" : ""}
                    size="medium"
                  />
                  <FormControl fullWidth size="medium">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.table_status || 'available'}
                      onChange={(e) => handleChange('table_status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="available">Available</MenuItem>
                      <MenuItem value="occupied">Occupied</MenuItem>
                      <MenuItem value="reserved">Reserved</MenuItem>
                      <MenuItem value="maintenance">Maintenance</MenuItem>
                      <MenuItem value="out_of_service">Out of Service</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active !== undefined ? formData.is_active : true}
                      onChange={(e) => handleChange('is_active', e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 1.5 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Stack direction="row" spacing={2}>
                <Button onClick={onClose} fullWidth variant="outlined">
                  Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" fullWidth>
                  {table ? 'Update' : 'Add'} Table
                </Button>
              </Stack>
            </Box>
          </Box>
        </Fade>
      </Modal>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          m: 2,
          maxHeight: 'calc(100vh - 64px)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600">
          {table ? 'Edit Table' : 'Add Table'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ 
        px: { xs: 2, sm: 3 }, 
        py: { xs: 3, sm: 4 }
      }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Table Number"
              type="text"
              value={formData.table_number}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^[0-9]+$/.test(value)) {
                  handleChange('table_number', value);
                }
              }}
              placeholder="e.g., 1"
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              error={!table && tables.some(t => t.table_number === formData.table_number.trim() && t.is_active)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Area</InputLabel>
              <Select
                value={formData.location || ''}
                onChange={(e) => handleChange('location', e.target.value)}
                label="Area"
              >
                {areas.map(area => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Capacity"
              type="text"
              value={formData.capacity === 0 ? '' : formData.capacity || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) {
                  const numValue = value === '' ? 0 : parseInt(value);
                  handleChange('capacity', numValue);
                }
              }}
              onFocus={(e) => {
                if (e.target.value === '0') {
                  e.target.select();
                }
              }}
              placeholder="Enter capacity"
              error={formData.capacity !== undefined && formData.capacity <= 0}
              helperText={formData.capacity !== undefined && formData.capacity <= 0 ? "Capacity must be greater than 0" : ""}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.table_status || 'available'}
                onChange={(e) => handleChange('table_status', e.target.value)}
                label="Status"
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="out_of_service">Out of Service</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active !== undefined ? formData.is_active : true}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {table ? 'Update' : 'Add'} Table
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TableDialog;