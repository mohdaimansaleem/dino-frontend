import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import {
  QrCode,
  Close,
  Smartphone,
  Restaurant,
  TableRestaurant,
  Launch,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CleanDinoLogo from './CleanDinoLogo';

interface QRCodeDemoProps {
  open: boolean;
  onClose: () => void;
}

const QRCodeDemo: React.FC<QRCodeDemoProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const step = 1; // Fixed step for demo

  const handleViewMenu = () => {
    onClose();
    // Navigate to the enhanced menu page with demo data
    navigate('/menu/demo-cafe/table-5');
  };

  const steps = [
    {
      title: "Customer scans QR code",
      description: "Each table has a unique QR code that customers can scan with their phone camera",
      icon: <QrCode sx={{ fontSize: 48, color: 'primary.main' }} />,
    },
    {
      title: "Menu opens instantly",
      description: "The digital menu opens in their browser - no app download required",
      icon: <Smartphone sx={{ fontSize: 48, color: 'primary.main' }} />,
    },
    {
      title: "Browse and order",
      description: "Customers can browse categories, view item details, and add items to their cart",
      icon: <Restaurant sx={{ fontSize: 48, color: 'primary.main' }} />,
    },
    {
      title: "Order sent to kitchen",
      description: "Orders are sent directly to the restaurant's system for preparation",
      icon: <TableRestaurant sx={{ fontSize: 48, color: 'primary.main' }} />,
    },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CleanDinoLogo size={32} />
          <Typography variant="h5" fontWeight="bold">
            QR Code Menu Experience
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          See how customers experience your digital menu when they scan the QR code at their table.
        </Typography>

        {/* QR Code Simulation */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            mb: 4,
            background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
            border: '2px dashed',
            borderColor: 'primary.main',
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight="600">
            Table 5 - Dino Restaurant
          </Typography>
          
          {/* Mock QR Code */}
          <Box
            sx={{
              width: 150,
              height: 150,
              mx: 'auto',
              mb: 3,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              backgroundImage: `
                linear-gradient(90deg, #000 50%, transparent 50%),
                linear-gradient(#000 50%, transparent 50%)
              `,
              backgroundSize: '10px 10px',
            }}
          >
            <QrCode sx={{ fontSize: 60, color: 'primary.main', backgroundColor: 'white', p: 1, borderRadius: 1 }} />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Scan with your phone camera or click below to preview
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<Launch />}
            onClick={handleViewMenu}
            size="large"
            sx={{ px: 4 }}
          >
            View Menu Demo
          </Button>
        </Paper>

        {/* How it Works */}
        <Typography variant="h6" gutterBottom fontWeight="600" sx={{ mb: 3 }}>
          How It Works
        </Typography>
        
        <Grid container spacing={3}>
          {steps.map((stepItem, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  border: '1px solid',
                  borderColor: step === index + 1 ? 'primary.main' : 'divider',
                  backgroundColor: step === index + 1 ? 'primary.50' : 'background.paper',
                  transition: 'all 0.3s ease',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={index + 1}
                      color={step === index + 1 ? 'primary' : 'default'}
                      sx={{ mb: 2, fontWeight: 'bold' }}
                    />
                    {stepItem.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    {stepItem.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stepItem.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Features Highlight */}
        <Typography variant="h6" gutterBottom fontWeight="600">
          Customer Experience Features
        </Typography>
        
        <Grid container spacing={2}>
          {[
            'Mobile-optimized design',
            'High-quality food images',
            'Detailed item descriptions',
            'Allergen information',
            'Real-time pricing',
            'Easy cart management',
            'Special instructions',
            'Order tracking',
          ].map((feature, index) => (
            <Grid item xs={6} sm={4} key={index}>
              <Chip
                label={feature}
                variant="outlined"
                color="primary"
                sx={{ width: '100%', justifyContent: 'flex-start' }}
              />
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} size="large">
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleViewMenu}
          startIcon={<Restaurant />}
          size="large"
        >
          Experience the Menu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeDemo;