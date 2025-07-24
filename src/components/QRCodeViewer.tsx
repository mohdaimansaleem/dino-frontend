import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Tooltip,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Close,
  Print,
  Download,
  Share,
  Refresh,
  QrCode,
  Restaurant,
  TableRestaurant,
  Smartphone,
  ContentCopy,
  Launch,
} from '@mui/icons-material';
import { QRCodeData, qrService } from '../services/qrService';

interface QRCodeViewerProps {
  open: boolean;
  onClose: () => void;
  tableId?: string;
  cafeId?: string;
  cafeName?: string;
  tableNumber?: string;
  qrData?: QRCodeData;
}

const QRCodeViewer: React.FC<QRCodeViewerProps> = ({
  open,
  onClose,
  tableId,
  cafeId,
  cafeName,
  tableNumber,
  qrData: initialQrData,
}) => {
  const [qrData, setQrData] = useState<QRCodeData | null>(initialQrData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [template, setTemplate] = useState<'classic' | 'modern' | 'elegant' | 'minimal'>('classic');
  const [showInstructions, setShowInstructions] = useState(true);
  const [copied, setCopied] = useState(false);

  const generateQRCode = useCallback(async () => {
    if (!tableId || !cafeId || !cafeName || !tableNumber) return;

    setLoading(true);
    setError('');

    try {
      // For demo mode, generate a mock QR code
      const isDemoMode = localStorage.getItem('dino_demo_mode') === 'true' || cafeId === 'dino-cafe-1';
      
      if (isDemoMode) {
        // Generate demo QR data
        const demoQrData = {
          id: `qr-${tableId}-${Date.now()}`,
          cafeId,
          tableId,
          cafeName,
          tableNumber,
          qrCodeUrl: `/api/qr/demo-${tableId}.png`,
          qrCodeBase64: generateDemoQRCode(),
          menuUrl: `${window.location.origin}/menu/${cafeId}/${tableId}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setQrData(demoQrData);
      } else {
        const newQrData = await qrService.generateTableQR({
          cafeId,
          tableId,
          cafeName,
          tableNumber,
          customization: {
            template,
            primaryColor: '#2e7d32',
            secondaryColor: '#1b5e20',
          },
        });
        setQrData(newQrData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }, [tableId, cafeId, cafeName, tableNumber, template]);

  // Generate a demo QR code as base64 image
  const generateDemoQRCode = () => {
    // This is a simple demo QR code - in a real app, you'd use a QR library
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    if (ctx) {
      // Fill with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 200, 200);
      
      // Draw a simple QR-like pattern
      ctx.fillStyle = 'black';
      for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
          if ((i + j) % 3 === 0) {
            ctx.fillRect(i * 10, j * 10, 8, 8);
          }
        }
      }
      
      // Add corner squares
      ctx.fillRect(0, 0, 60, 60);
      ctx.fillRect(140, 0, 60, 60);
      ctx.fillRect(0, 140, 60, 60);
      
      // Add white inner squares
      ctx.fillStyle = 'white';
      ctx.fillRect(10, 10, 40, 40);
      ctx.fillRect(150, 10, 40, 40);
      ctx.fillRect(10, 150, 40, 40);
      
      // Add black center squares
      ctx.fillStyle = 'black';
      ctx.fillRect(20, 20, 20, 20);
      ctx.fillRect(160, 20, 20, 20);
      ctx.fillRect(20, 160, 20, 20);
    }
    
    return canvas.toDataURL('image/png');
  };

  useEffect(() => {
    if (open && !qrData && tableId && cafeId && cafeName && tableNumber) {
      generateQRCode();
    }
  }, [open, qrData, generateQRCode, tableId, cafeId, cafeName, tableNumber]);

  const handleRegenerateQR = async () => {
    if (!qrData) return;
    
    setLoading(true);
    setError('');

    try {
      const newQrData = await qrService.regenerateQR(qrData.id, {
        cafeId: qrData.cafeId,
        tableId: qrData.tableId,
        cafeName: qrData.cafeName,
        tableNumber: qrData.tableNumber,
        customization: {
          template,
          primaryColor: '#2e7d32',
          secondaryColor: '#1b5e20',
        },
      });

      setQrData(newQrData);
    } catch (err: any) {
      setError(err.message || 'Failed to regenerate QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!qrData) return;

    try {
      await navigator.clipboard.writeText(qrData.menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handlePrint = () => {
    if (!qrData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generatePrintTemplate();
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownload = () => {
    if (!qrData) return;

    const link = document.createElement('a');
    link.href = qrData.qrCodeBase64;
    link.download = `qr-code-${qrData.cafeName}-table-${qrData.tableNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!qrData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${qrData.cafeName} - Table ${qrData.tableNumber}`,
          text: 'Scan this QR code to view the menu and place your order!',
          url: qrData.menuUrl,
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback to copying URL
      handleCopyUrl();
    }
  };

  const generatePrintTemplate = (): string => {
    if (!qrData) return '';

    const templates = {
      classic: generateClassicTemplate(),
      modern: generateModernTemplate(),
      elegant: generateElegantTemplate(),
      minimal: generateMinimalTemplate(),
    };

    return templates[template];
  };

  const generateClassicTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.cafeName} Table ${qrData?.tableNumber}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            text-align: center;
            background: white;
          }
          .qr-container {
            border: 3px solid #2e7d32;
            border-radius: 15px;
            padding: 30px;
            margin: 20px auto;
            max-width: 400px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          }
          .header {
            color: #2e7d32;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .cafe-name {
            font-size: 24px;
            color: #333;
            margin-bottom: 5px;
          }
          .table-number {
            font-size: 20px;
            color: #2e7d32;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .qr-code {
            margin: 20px 0;
            padding: 15px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
          }
          .instructions {
            font-size: 16px;
            color: #666;
            margin-top: 15px;
            line-height: 1.4;
          }
          .footer {
            margin-top: 30px;
            font-size: 14px;
            color: #999;
          }
          .steps {
            text-align: left;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .step {
            margin: 8px 0;
            font-size: 14px;
            color: #555;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 Dino E-Menu</div>
          <div class="cafe-name">${qrData?.cafeName}</div>
          <div class="table-number">Table ${qrData?.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            <strong>Scan to view menu & order</strong>
          </div>
          
          <div class="steps">
            <div class="step">1. Open your phone camera</div>
            <div class="step">2. Point at the QR code</div>
            <div class="step">3. Tap the notification</div>
            <div class="step">4. Browse menu & order!</div>
          </div>
          
          <div class="footer">
            No app download required • Fast & secure ordering
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateModernTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.cafeName} Table ${qrData?.tableNumber}</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .qr-container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin: 20px auto;
            max-width: 450px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            color: #333;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 15px;
          }
          .cafe-name {
            font-size: 26px;
            color: #2c3e50;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .table-number {
            font-size: 22px;
            color: #667eea;
            font-weight: bold;
            margin-bottom: 25px;
          }
          .qr-code {
            margin: 25px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 15px;
            border: 2px solid #e9ecef;
          }
          .qr-code img {
            max-width: 220px;
            height: auto;
          }
          .instructions {
            font-size: 18px;
            color: #495057;
            margin-top: 20px;
            font-weight: 600;
          }
          .features {
            display: flex;
            justify-content: space-around;
            margin: 25px 0;
            flex-wrap: wrap;
          }
          .feature {
            text-align: center;
            margin: 10px;
            flex: 1;
            min-width: 100px;
          }
          .feature-icon {
            font-size: 24px;
            margin-bottom: 5px;
          }
          .feature-text {
            font-size: 12px;
            color: #6c757d;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 Dino E-Menu</div>
          <div class="cafe-name">${qrData?.cafeName}</div>
          <div class="table-number">Table ${qrData?.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            Scan with your camera to get started
          </div>
          
          <div class="features">
            <div class="feature">
              <div class="feature-icon">📱</div>
              <div class="feature-text">No App Needed</div>
            </div>
            <div class="feature">
              <div class="feature-icon">⚡</div>
              <div class="feature-text">Instant Access</div>
            </div>
            <div class="feature">
              <div class="feature-icon">🔒</div>
              <div class="feature-text">Secure</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateElegantTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.cafeName} Table ${qrData?.tableNumber}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { 
            font-family: 'Georgia', serif; 
            margin: 0; 
            padding: 30px; 
            background: #f8f6f0;
            color: #2c2c2c;
          }
          .qr-container {
            background: white;
            border: 2px solid #d4af37;
            padding: 40px;
            margin: 20px auto;
            max-width: 420px;
            box-shadow: 0 8px 32px rgba(212, 175, 55, 0.2);
            position: relative;
          }
          .qr-container::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 1px solid #d4af37;
            pointer-events: none;
          }
          .header {
            color: #d4af37;
            font-size: 28px;
            font-weight: normal;
            margin-bottom: 15px;
            font-style: italic;
          }
          .cafe-name {
            font-size: 24px;
            color: #2c2c2c;
            margin-bottom: 8px;
            font-weight: bold;
          }
          .table-number {
            font-size: 18px;
            color: #d4af37;
            margin-bottom: 25px;
            font-style: italic;
          }
          .qr-code {
            margin: 25px 0;
            padding: 20px;
            background: #fafafa;
            border: 1px solid #e0e0e0;
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
          }
          .instructions {
            font-size: 16px;
            color: #555;
            margin-top: 20px;
            font-style: italic;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #d4af37, transparent);
            margin: 20px 0;
          }
          .tagline {
            font-size: 14px;
            color: #888;
            margin-top: 20px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 Dino E-Menu</div>
          <div class="cafe-name">${qrData?.cafeName}</div>
          <div class="table-number">Table ${qrData?.tableNumber}</div>
          
          <div class="divider"></div>
          
          <div class="qr-code">
            <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            Scan to discover our culinary offerings
          </div>
          
          <div class="divider"></div>
          
          <div class="tagline">
            Experience dining reimagined
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateMinimalTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.cafeName} Table ${qrData?.tableNumber}</title>
        <style>
          @page { margin: 25mm; size: A4; }
          body { 
            font-family: 'Helvetica Neue', Arial, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: white;
            color: #333;
          }
          .qr-container {
            border: 1px solid #e0e0e0;
            padding: 50px;
            margin: 20px auto;
            max-width: 350px;
          }
          .header {
            color: #333;
            font-size: 24px;
            font-weight: 300;
            margin-bottom: 20px;
            letter-spacing: 1px;
          }
          .cafe-name {
            font-size: 20px;
            color: #333;
            margin-bottom: 10px;
            font-weight: 500;
          }
          .table-number {
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
            font-weight: 300;
          }
          .qr-code {
            margin: 30px 0;
          }
          .qr-code img {
            max-width: 180px;
            height: auto;
          }
          .instructions {
            font-size: 14px;
            color: #666;
            margin-top: 25px;
            font-weight: 300;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">DINO E-MENU</div>
          <div class="cafe-name">${qrData?.cafeName}</div>
          <div class="table-number">Table ${qrData?.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            Scan with camera to view menu
          </div>
        </div>
      </body>
      </html>
    `;
  };

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
          <QrCode color="primary" />
          <Typography variant="h5" fontWeight="bold">
            QR Code Manager
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : qrData ? (
          <Grid container spacing={3}>
            {/* QR Code Display */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                }}
              >
                <Typography variant="h6" gutterBottom fontWeight="600" color="primary">
                  {qrData.cafeName}
                </Typography>
                <Typography variant="subtitle1" gutterBottom color="text.secondary">
                  Table {qrData.tableNumber}
                </Typography>

                <Box
                  sx={{
                    width: 200,
                    height: 200,
                    mx: 'auto',
                    mb: 2,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 2,
                  }}
                >
                  <img
                    src={qrData.qrCodeBase64}
                    alt="QR Code"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Scan to view menu & order
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Tooltip title="Copy Menu URL">
                    <IconButton size="small" onClick={handleCopyUrl} color={copied ? 'success' : 'default'}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open Menu">
                    <IconButton size="small" onClick={() => window.open(qrData.menuUrl, '_blank')}>
                      <Launch fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share">
                    <IconButton size="small" onClick={handleShare}>
                      <Share fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Regenerate">
                    <IconButton size="small" onClick={handleRegenerateQR}>
                      <Refresh fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>

            {/* Controls and Info */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  Print Settings
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Template Style</InputLabel>
                  <Select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value as any)}
                    label="Template Style"
                  >
                    <MenuItem value="classic">Classic</MenuItem>
                    <MenuItem value="modern">Modern</MenuItem>
                    <MenuItem value="elegant">Elegant</MenuItem>
                    <MenuItem value="minimal">Minimal</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={showInstructions}
                      onChange={(e) => setShowInstructions(e.target.checked)}
                    />
                  }
                  label="Include instructions"
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  QR Code Details
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Cafe:</Typography>
                    <Typography variant="body2">{qrData.cafeName}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Table:</Typography>
                    <Typography variant="body2">{qrData.tableNumber}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Created:</Typography>
                    <Typography variant="body2">
                      {new Date(qrData.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Menu URL:</Typography>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {qrData.menuUrl}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {showInstructions && (
                <Card sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom fontWeight="600">
                      How customers use this QR code:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[
                        { icon: <Smartphone />, text: 'Open phone camera' },
                        { icon: <QrCode />, text: 'Point at QR code' },
                        { icon: <Restaurant />, text: 'Tap notification to view menu' },
                        { icon: <TableRestaurant />, text: 'Browse and order!' },
                      ].map((step, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ color: 'primary.main', fontSize: 16 }}>{step.icon}</Box>
                          <Typography variant="body2" color="text.secondary">
                            {index + 1}. {step.text}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <QrCode sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No QR Code Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate a QR code to get started
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} size="large">
          Close
        </Button>
        {qrData && (
          <>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownload}
              size="large"
            >
              Download
            </Button>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrint}
              size="large"
            >
              Print QR Code
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeViewer;