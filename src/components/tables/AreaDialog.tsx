import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
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

interface AreaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (area: any) => void;
  area: any | null;
  isMobile?: boolean;
}

const AreaDialog: React.FC<AreaDialogProps> = ({
  open,
  onClose,
  onSave,
  area,
  isMobile = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#2196F3',
    active: true,
  });

  useEffect(() => {
    if (area) {
      setFormData(area);
    } else {
      setFormData({
        name: '',
        description: '',
        color: '#2196F3',
        active: true,
      });
    }
  }, [area, open]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const colorOptions = [
    '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#607D8B', '#795548', '#FF5722'
  ];

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
              maxWidth: '450px',
              maxHeight: '85vh',
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
                  {area ? 'Edit Area' : 'Add Area'}
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
                  label="Area Name"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  size="medium"
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={formData.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                  size="medium"
                />
                <Box>
                  <Typography variant="body2" gutterBottom fontWeight="600" sx={{ mb: 0.5 }}>
                    Color
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {colorOptions.map((color) => (
                      <Box
                        key={color}
                        sx={{
                          width: 36,
                          height: 36,
                          backgroundColor: color,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: formData.color === color ? '3px solid #000' : '1px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: 2
                          }
                        }}
                        onClick={() => handleChange('color', color)}
                      />
                    ))}
                  </Box>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active !== undefined ? formData.active : true}
                      onChange={(e) => handleChange('active', e.target.checked)}
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
                  {area ? 'Update' : 'Add'} Area
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
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          m: 2,
          maxHeight: 'calc(100vh - 64px)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight="600">
          {area ? 'Edit Area' : 'Add Area'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ 
        px: { xs: 2, sm: 3 }, 
        py: { xs: 3, sm: 4 }
      }}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Area Name"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={2}
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom fontWeight="600" sx={{ mb: 1.5 }}>
              Color
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
              {colorOptions.map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 44,
                    height: 44,
                    backgroundColor: color,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: formData.color === color ? '3px solid #000' : '1px solid #ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: 2
                    }
                  }}
                  onClick={() => handleChange('color', color)}
                />
              ))}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active !== undefined ? formData.active : true}
                  onChange={(e) => handleChange('active', e.target.checked)}
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
          {area ? 'Update' : 'Add'} Area
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AreaDialog;