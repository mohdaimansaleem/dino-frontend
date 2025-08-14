import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  IconButton,
  Chip,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Card,
  CardContent,
  Stack,
  Slider,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  Print,
  Download,
  QrCode,
  CheckCircle,
  Error,
  Refresh,
  SelectAll,
  NavigateBefore,
  NavigateNext,
  GetApp,
  Settings,
  Visibility,
  TableRestaurant,
} from '@mui/icons-material';
import { QRCodeData, qrService, QRGenerationRequest } from '../services/qrService';

interface Table {
  id: string;
  number: string;
  venueId: string;
  venueName: string;
}

interface QRCodeManagerProps {
  open: boolean;
  onClose: () => void;
  tables: Table[];
  venueId: string;
  venueName: string;
}

interface QRGenerationStatus {
  tableId: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  qrData?: QRCodeData;
  error?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`qr-tabpanel-${index}`}
      aria-labelledby={`qr-tab-${index}`}
      style={{ 
        height: '100%', 
        display: value === index ? 'flex' : 'none',
        flexDirection: 'column'
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{ 
          pt: { xs: 1, sm: 2 }, 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'auto'
        }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const QRCodeManager: React.FC<QRCodeManagerProps> = ({
  open,
  onClose,
  tables,
  venueId,
  venueName,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Tab state
  const [currentTab, setCurrentTab] = useState(0);
  
  // Shared table selection state
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [generationStatus, setGenerationStatus] = useState<QRGenerationStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Preview slider state
  const [previewQRCodes, setPreviewQRCodes] = useState<QRCodeData[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Configuration state
  const [config, setConfig] = useState({
    template: 'classic' as 'classic' | 'modern' | 'elegant' | 'minimal',
    primaryColor: '#000000',
    includeInstructions: true,
  });

  useEffect(() => {
    if (open) {
      // Initialize with all tables selected
      setSelectedTables(tables.map(table => table.id));
      setGenerationStatus(
        tables.map(table => ({
          tableId: table.id,
          status: 'pending',
        }))
      );
      
      // Reset preview state
      setPreviewQRCodes([]);
      setCurrentPreviewIndex(0);
    }
  }, [open, tables]);

  // Generate QR code for preview
  const generatePreviewQR = async (table: Table): Promise<QRCodeData> => {
    return await qrService.generateTableQR({
      venueId,
      tableId: table.id,
      venueName,
      tableNumber: table.number,
      customization: {
        template: config.template,
        primaryColor: config.primaryColor,
        secondaryColor: '#000000',
      },
    });
  };

  // Generate preview QR codes for selected tables
  const generateSelectedPreviewQRs = async () => {
    if (selectedTables.length === 0) return;
    
    setPreviewLoading(true);
    try {
      const selectedTableObjects = tables.filter(table => selectedTables.includes(table.id));
      const newQrCodes: QRCodeData[] = [];
      
      for (let i = 0; i < selectedTableObjects.length; i++) {
        const qrData = await generatePreviewQR(selectedTableObjects[i]);
        newQrCodes.push(qrData);
      }
      
      setPreviewQRCodes(newQrCodes);
      setCurrentPreviewIndex(0);
    } catch (error) {
      console.error('Error generating preview QR codes:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Navigation functions for preview
  const goToPrevious = () => {
    setCurrentPreviewIndex(prev => prev > 0 ? prev - 1 : previewQRCodes.length - 1);
  };

  const goToNext = () => {
    setCurrentPreviewIndex(prev => prev < previewQRCodes.length - 1 ? prev + 1 : 0);
  };

  // Download current preview QR
  const downloadCurrentPreviewQR = () => {
    if (!previewQRCodes[currentPreviewIndex]) return;
    
    const qrData = previewQRCodes[currentPreviewIndex];
    const link = document.createElement('a');
    link.href = qrData.qrCodeBase64;
    link.download = `qr-${venueName.replace(/\s+/g, '-')}-${qrData.tableNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download all preview QR codes
  const downloadAllPreviewQRs = () => {
    previewQRCodes.forEach((qrData, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = qrData.qrCodeBase64;
        link.download = `qr-${venueName.replace(/\s+/g, '-')}-${qrData.tableNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 500);
    });
  };

  // Print current preview QR
  const printCurrentPreviewQR = () => {
    if (!previewQRCodes[currentPreviewIndex]) return;
    
    const qrData = previewQRCodes[currentPreviewIndex];
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 20px; 
            margin: 0;
          }
          .qr-container { 
            border: 3px solid ${config.primaryColor || '#000000'}; 
            border-radius: 15px; 
            padding: 30px; 
            margin: 20px auto; 
            max-width: 400px; 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          }
          .header { 
            color: ${config.primaryColor || '#000000'}; 
            font-size: 28px; 
            font-weight: bold; 
            margin-bottom: 10px; 
          }
          .venue-name { 
            font-size: 24px; 
            color: #333; 
            margin-bottom: 5px; 
          }
          .table-number { 
            font-size: 20px; 
            color: ${config.primaryColor || '#000000'}; 
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
          .url { 
            font-size: 12px; 
            color: #999; 
            margin-top: 10px; 
            word-break: break-all; 
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 Dino E-Menu</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            <strong>Scan to view menu & order</strong><br>
            1. Open camera • 2. Point at QR • 3. Tap notification
          </div>
          
          <div class="url">${qrData.menuUrl}</div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Shared table selection functions
  const handleSelectAll = () => {
    if (selectedTables.length === tables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(tables.map(table => table.id));
    }
  };

  const handleTableSelect = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId)
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  // Bulk generation functions
  const generateQRCodes = async () => {
    if (selectedTables.length === 0) return;

    setIsGenerating(true);
    setProgress(0);

    const requests: QRGenerationRequest[] = selectedTables.map(tableId => {
      const table = tables.find(t => t.id === tableId)!;
      return {
        venueId,
        tableId,
        venueName,
        tableNumber: table.number,
        customization: {
          template: config.template,
          primaryColor: config.primaryColor,
          secondaryColor: '#000000',
        },
      };
    });

    // Update status to generating
    setGenerationStatus(prev =>
      prev.map(status =>
        selectedTables.includes(status.tableId)
          ? { ...status, status: 'generating' as const }
          : status
      )
    );

    let completed = 0;
    const total = requests.length;

    // Generate QR codes one by one
    for (const request of requests) {
      try {
        const qrData = await qrService.generateTableQR(request);
        
        setGenerationStatus(prev =>
          prev.map(status =>
            status.tableId === request.tableId
              ? { ...status, status: 'success', qrData }
              : status
          )
        );
      } catch (error: any) {
        setGenerationStatus(prev =>
          prev.map(status =>
            status.tableId === request.tableId
              ? { ...status, status: 'error', error: error.message }
              : status
          )
        );
      }

      completed++;
      setProgress((completed / total) * 100);

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsGenerating(false);
  };

  const printAllQRCodes = () => {
    const successfulQRs = generationStatus.filter(
      status => status.status === 'success' && status.qrData
    );

    if (successfulQRs.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generateBulkPrintTemplate(successfulQRs);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const downloadAllQRCodes = () => {
    const successfulQRs = generationStatus.filter(
      (status): status is QRGenerationStatus & { qrData: QRCodeData } => 
        status.status === 'success' && !!status.qrData
    );

    successfulQRs.forEach((status, index) => {
      const qrData = status.qrData;

      setTimeout(() => {
        const link = document.createElement('a');
        link.href = qrData.qrCodeBase64;
        link.download = `qr-code-${venueName}-table-${qrData.tableNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 200);
    });
  };

  const generateBulkPrintTemplate = (qrStatuses: QRGenerationStatus[]): string => {
    const qrCodesPerPage = 4;
    const pages: QRGenerationStatus[][] = [];
    
    for (let i = 0; i < qrStatuses.length; i += qrCodesPerPage) {
      pages.push(qrStatuses.slice(i, i + qrCodesPerPage));
    }

    const pageTemplates = pages.map(pageQRs => generatePageTemplate(pageQRs)).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes - ${venueName}</title>
        <style>
          @page { 
            margin: 15mm; 
            size: A4; 
          }
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 0;
            background: white;
          }
          .page {
            page-break-after: always;
            height: 100vh;
            display: flex;
            flex-direction: column;
          }
          .page:last-child {
            page-break-after: avoid;
          }
          .page-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #000000;
          }
          .page-title {
            font-size: 24px;
            color: #000000;
            font-weight: bold;
            margin: 0;
          }
          .page-subtitle {
            font-size: 16px;
            color: #666;
            margin: 5px 0 0 0;
          }
          .qr-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            flex: 1;
          }
          .qr-item {
            border: 2px solid #000000;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .qr-venue-name {
            font-size: 18px;
            color: #333;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .qr-table-number {
            font-size: 16px;
            color: #000000;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .qr-code-container {
            margin: 15px 0;
            padding: 10px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .qr-code-container img {
            max-width: 120px;
            height: auto;
          }
          .qr-instructions {
            font-size: 12px;
            color: #666;
            margin-top: 10px;
            line-height: 1.3;
          }
          .qr-url {
            font-size: 10px;
            color: #999;
            margin-top: 5px;
            word-break: break-all;
          }
        </style>
      </head>
      <body>
        ${pageTemplates}
      </body>
      </html>
    `;
  };

  const generatePageTemplate = (pageQRs: QRGenerationStatus[]): string => {
    const qrItems = pageQRs.map(status => {
      const qrData = status.qrData;
      if (!qrData) return '';
      
      return `
        <div class="qr-item">
          <div class="qr-venue-name">${qrData.venueName}</div>
          <div class="qr-table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code-container">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${config.includeInstructions ? `
            <div class="qr-instructions">
              <strong>Scan to view menu & order</strong><br>
              1. Open camera • 2. Point at QR • 3. Tap notification
            </div>
          ` : ''}
          
          <div class="qr-url">${qrData.menuUrl}</div>
        </div>
      `;
    }).join('');

    const emptySlots = 4 - pageQRs.length;
    const emptyItems = Array(emptySlots).fill('<div class="qr-item" style="border: 2px dashed #ccc; background: #f9f9f9;"></div>').join('');

    return `
      <div class="page">
        <div class="page-header">
          <div class="page-title">🦕 ${venueName} - QR Codes</div>
          <div class="page-subtitle">Table QR Codes for Digital Menu Access</div>
        </div>
        <div class="qr-grid">
          ${qrItems}
          ${emptyItems}
        </div>
      </div>
    `;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <Error color="error" />;
      case 'generating': return <QrCode color="primary" />;
      default: return <QrCode color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'generating': return 'primary';
      default: return 'default';
    }
  };

  const successCount = generationStatus.filter(s => s.status === 'success').length;
  const errorCount = generationStatus.filter(s => s.status === 'error').length;
  const generatingCount = generationStatus.filter(s => s.status === 'generating').length;

  const currentPreviewQR = previewQRCodes[currentPreviewIndex];
  const selectedTableObjects = tables.filter(table => selectedTables.includes(table.id));
  const currentSelectedTable = selectedTableObjects[currentPreviewIndex];

  // Table Selection Component
  const TableSelectionComponent = ({ showTitle = true }: { showTitle?: boolean }) => (
    <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
      {showTitle && (
        <Typography variant="h6" gutterBottom fontWeight="600">
          Table Configuration
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button
          size="small"
          startIcon={<SelectAll />}
          onClick={handleSelectAll}
          disabled={isGenerating || previewLoading}
          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        >
          {selectedTables.length === tables.length ? 'Deselect All' : 'Select All'}
        </Button>
        <Typography variant="body2" color="text.secondary">
          ({selectedTables.length} of {tables.length} selected)
        </Typography>
      </Box>

      <List dense sx={{ maxHeight: { xs: 200, sm: 250 }, overflow: 'auto' }}>
        {tables.map(table => (
          <ListItem key={table.id} sx={{ px: 0, py: { xs: 0.5, sm: 1 } }}>
            <Checkbox
              checked={selectedTables.includes(table.id)}
              onChange={() => handleTableSelect(table.id)}
              disabled={isGenerating || previewLoading}
              size={isMobile ? 'small' : 'medium'}
            />
            <ListItemText
              primary={
                <Typography variant={isMobile ? 'body2' : 'body1'} fontWeight="500">
                  Table {table.number}
                </Typography>
              }
              secondary={
                <Typography variant={isMobile ? 'caption' : 'body2'} color="text.secondary">
                  {table.venueName}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { 
          borderRadius: isMobile ? 0 : 3, 
          maxHeight: isMobile ? '100vh' : '90vh', 
          height: isMobile ? '100vh' : '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        pb: 1,
        flexShrink: 0,
        px: { xs: 2, sm: 3 }
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <QrCode color="primary" />
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
              QR Code Manager
            </Typography>
          </Box>
          <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
            {currentTab === 0 ? 'Configure and preview QR codes' : 'Generate QR codes for selected tables'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size={isMobile ? 'small' : 'medium'}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        px: { xs: 2, sm: 3 },
        py: 1,
        flexShrink: 0,
        backgroundColor: 'background.paper',
        minHeight: { xs: 56, sm: 64 }
      }}>
        <Tabs 
          value={currentTab} 
          onChange={(_, newValue) => {
            console.log('Tab changed to:', newValue);
            setCurrentTab(newValue);
          }}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{ 
            minHeight: { xs: 40, sm: 48 },
            '& .MuiTab-root': {
              minHeight: { xs: 40, sm: 48 },
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 500,
              px: { xs: 1, sm: 2 }
            }
          }}
        >
          <Tab 
            label={isMobile ? "Preview" : "Preview & Configure"} 
            icon={<Visibility />} 
            iconPosition="start"
          />
          <Tab 
            label={isMobile ? "Bulk Gen" : "Bulk Generation"} 
            icon={<TableRestaurant />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ 
        pt: 0, 
        flex: 1, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 1, sm: 3 }
      }}>
        {/* Preview Tab */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ height: '100%' }}>
            {/* Configuration Panel */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={{ xs: 2, sm: 3 }}>
                <TableSelectionComponent />
                
                <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Settings /> Settings
                  </Typography>
                  
                  <Stack spacing={{ xs: 2, sm: 3 }}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Template Style</InputLabel>
                      <Select
                        value={config.template}
                        onChange={(e) => setConfig(prev => ({ ...prev, template: e.target.value as any }))}
                        label="Template Style"
                      >
                        <MenuItem value="classic">Classic</MenuItem>
                        <MenuItem value="modern">Modern</MenuItem>
                        <MenuItem value="elegant">Elegant</MenuItem>
                        <MenuItem value="minimal">Minimal</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Box>
                      <Typography variant="body2" gutterBottom fontWeight="500">
                        Primary Color
                      </Typography>
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                        style={{
                          width: '100%',
                          height: isMobile ? 40 : 48,
                          border: '1px solid #ccc',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                      />
                    </Box>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.includeInstructions}
                          onChange={(e) => setConfig(prev => ({ ...prev, includeInstructions: e.target.checked }))}
                          size={isMobile ? "small" : "medium"}
                        />
                      }
                      label={
                        <Typography variant={isMobile ? "body2" : "body1"}>
                          Include instructions
                        </Typography>
                      }
                    />
                    
                    <Button
                      variant="contained"
                      size={isMobile ? "medium" : "large"}
                      startIcon={previewLoading ? <CircularProgress size={20} color="inherit" /> : <QrCode />}
                      onClick={generateSelectedPreviewQRs}
                      disabled={previewLoading || selectedTables.length === 0}
                      fullWidth
                      sx={{ py: { xs: 1, sm: 1.5 } }}
                    >
                      {previewLoading ? 'Generating...' : `Generate ${selectedTables.length} QR Codes`}
                    </Button>

                    {previewQRCodes.length > 0 && (
                      <Stack spacing={2}>
                        <Divider />
                        <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                          Generated {previewQRCodes.length} QR codes • Currently viewing: {currentSelectedTable?.number}
                        </Typography>
                        
                        <Button
                          variant="outlined"
                          startIcon={<GetApp />}
                          onClick={downloadAllPreviewQRs}
                          fullWidth
                          size={isMobile ? "small" : "medium"}
                        >
                          Download All QR Codes
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            {/* QR Code Preview Slider */}
            <Grid item xs={12} lg={8}>
              {previewQRCodes.length > 0 ? (
                <Paper elevation={1} sx={{ p: { xs: 2, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant={isMobile ? "h6" : "h5"} gutterBottom fontWeight="600" textAlign="center">
                    QR Code Preview Slider
                  </Typography>
                  
                  {/* Navigation Header */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <IconButton 
                      onClick={goToPrevious}
                      disabled={previewQRCodes.length <= 1}
                      size={isMobile ? "small" : "large"}
                    >
                      <NavigateBefore />
                    </IconButton>
                    
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant={isMobile ? "body1" : "h6"} color="primary">
                        Table {currentSelectedTable?.number}
                      </Typography>
                      <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                        {currentPreviewIndex + 1} of {previewQRCodes.length}
                      </Typography>
                    </Box>
                    
                    <IconButton 
                      onClick={goToNext}
                      disabled={previewQRCodes.length <= 1}
                      size={isMobile ? "small" : "large"}
                    >
                      <NavigateNext />
                    </IconButton>
                  </Box>

                  {/* QR Code Display */}
                  {currentPreviewQR && (
                    <Card sx={{ maxWidth: { xs: '100%', sm: 500 }, mx: 'auto', mb: 3 }}>
                      <CardContent sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
                        <Typography variant={isMobile ? "body1" : "h6"} color="primary" gutterBottom>
                          {currentPreviewQR.venueName}
                        </Typography>
                        <Typography variant={isMobile ? "body2" : "subtitle1"} color="text.secondary" gutterBottom>
                          Table {currentPreviewQR.tableNumber}
                        </Typography>
                        
                        <Box
                          sx={{
                            width: { xs: 250, sm: 300 },
                            height: { xs: 250, sm: 300 },
                            mx: 'auto',
                            mb: 3,
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
                            src={currentPreviewQR.qrCodeBase64}
                            alt={`QR Code for ${currentPreviewQR.tableNumber}`}
                            style={{ maxWidth: '100%', height: 'auto' }}
                          />
                        </Box>
                        
                        <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary" gutterBottom sx={{ wordBreak: 'break-all' }}>
                          URL: {currentPreviewQR.menuUrl}
                        </Typography>
                        
                        <Stack direction={isMobile ? "column" : "row"} spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                          <Chip 
                            label={`Template: ${config.template}`} 
                            size="small" 
                            variant="outlined" 
                          />
                          <Chip 
                            label={`Table ID: ${currentPreviewQR.tableId.slice(-8)}`} 
                            size="small" 
                            color="primary" 
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  )}

                  {/* Slider Navigation */}
                  {previewQRCodes.length > 1 && (
                    <Box sx={{ px: { xs: 1, sm: 2 }, mb: 3 }}>
                      <Slider
                        value={currentPreviewIndex}
                        onChange={(_, value) => setCurrentPreviewIndex(value as number)}
                        min={0}
                        max={previewQRCodes.length - 1}
                        step={1}
                        marks={previewQRCodes.map((_, index) => ({
                          value: index,
                          label: selectedTableObjects[index]?.number || `${index + 1}`
                        }))}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => selectedTableObjects[value]?.number || `${value + 1}`}
                        size={isMobile ? "small" : "medium"}
                      />
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Stack 
                    direction={isMobile ? "column" : "row"}
                    spacing={2} 
                    justifyContent="center"
                  >
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={downloadCurrentPreviewQR}
                      size={isMobile ? "medium" : "large"}
                      fullWidth={isMobile}
                    >
                      Download Current
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Print />}
                      onClick={printCurrentPreviewQR}
                      size={isMobile ? "medium" : "large"}
                      fullWidth={isMobile}
                    >
                      Print Current
                    </Button>
                  </Stack>
                </Paper>
              ) : (
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: { xs: 3, sm: 6 }, 
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: 'divider'
                  }}
                >
                  <TableRestaurant sx={{ fontSize: { xs: 60, sm: 80 }, color: 'text.secondary', mb: 2 }} />
                  <Typography variant={isMobile ? "h6" : "h5"} color="text.secondary" gutterBottom>
                    No QR Codes Generated Yet
                  </Typography>
                  <Typography variant={isMobile ? "body2" : "body1"} color="text.secondary" sx={{ mb: 3 }}>
                    Select tables and click "Generate QR Codes" to create a preview slider
                  </Typography>
                  <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary" sx={{ mb: 3 }}>
                    {selectedTables.length > 0 
                      ? `Will generate ${selectedTables.length} QR codes for selected tables`
                      : 'Please select tables first'
                    }
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<QrCode />}
                    onClick={generateSelectedPreviewQRs}
                    size={isMobile ? "medium" : "large"}
                    disabled={previewLoading || selectedTables.length === 0}
                  >
                    Generate QR Codes
                  </Button>
                </Paper>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Bulk Generation Tab */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {/* Settings Panel */}
            <Grid item xs={12} md={4}>
              <Stack spacing={{ xs: 2, sm: 3 }}>
                <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    Generation Settings
                  </Typography>
                  
                  <Stack spacing={{ xs: 2, sm: 3 }}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Template Style</InputLabel>
                      <Select
                        value={config.template}
                        onChange={(e) => setConfig(prev => ({ ...prev, template: e.target.value as any }))}
                        label="Template Style"
                        disabled={isGenerating}
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
                          checked={config.includeInstructions}
                          onChange={(e) => setConfig(prev => ({ ...prev, includeInstructions: e.target.checked }))}
                          disabled={isGenerating}
                          size={isMobile ? "small" : "medium"}
                        />
                      }
                      label={
                        <Typography variant={isMobile ? "body2" : "body1"}>
                          Include instructions
                        </Typography>
                      }
                    />
                  </Stack>
                </Paper>

                <TableSelectionComponent />
              </Stack>
            </Grid>

            {/* Status Panel */}
            <Grid item xs={12} md={8}>
              <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" fontWeight="600">
                    Generation Status
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<CheckCircle />}
                      label={`${successCount} Success`}
                      color="success"
                      size="small"
                    />
                    <Chip
                      icon={<Error />}
                      label={`${errorCount} Error`}
                      color="error"
                      size="small"
                    />
                    {generatingCount > 0 && (
                      <Chip
                        icon={<QrCode />}
                        label={`${generatingCount} Generating`}
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>

                {isGenerating && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary" sx={{ mt: 1 }}>
                      Generating QR codes... {Math.round(progress)}%
                    </Typography>
                  </Box>
                )}

                <List sx={{ maxHeight: { xs: 250, sm: 300 }, overflow: 'auto' }}>
                  {generationStatus
                    .filter(status => selectedTables.includes(status.tableId))
                    .map(status => {
                      const table = tables.find(t => t.id === status.tableId);
                      if (!table) return null;

                      return (
                        <ListItem key={status.tableId} sx={{ px: 0, py: { xs: 0.5, sm: 1 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                            {getStatusIcon(status.status)}
                          </Box>
                          <ListItemText
                            primary={
                              <Typography variant={isMobile ? "body2" : "body1"} fontWeight="500">
                                Table {table.number}
                              </Typography>
                            }
                            secondary={
                              <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                                {status.status === 'error' 
                                  ? status.error 
                                  : status.status === 'success'
                                  ? 'QR code generated successfully'
                                  : status.status === 'generating'
                                  ? 'Generating QR code...'
                                  : 'Waiting to generate'
                                }
                              </Typography>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Chip
                              label={status.status}
                              color={getStatusColor(status.status) as any}
                              size="small"
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    })}
                </List>

                {successCount > 0 && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    {successCount} QR code{successCount > 1 ? 's' : ''} generated successfully! 
                    You can now print or download them.
                  </Alert>
                )}

                {errorCount > 0 && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorCount} QR code{errorCount > 1 ? 's' : ''} failed to generate. 
                    Please try regenerating them.
                  </Alert>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ 
        p: { xs: 2, sm: 3 }, 
        pt: 1, 
        flexShrink: 0,
        borderTop: 1,
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 0
      }}>
        <Button onClick={onClose} size={isMobile ? "medium" : "large"} fullWidth={isMobile}>
          Close
        </Button>
        
        {currentTab === 1 && successCount > 0 && (
          <Stack direction={isMobile ? "column" : "row"} spacing={1} sx={{ width: isMobile ? '100%' : 'auto' }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadAllQRCodes}
              size={isMobile ? "medium" : "large"}
              fullWidth={isMobile}
            >
              Download All ({successCount})
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={printAllQRCodes}
              size={isMobile ? "medium" : "large"}
              fullWidth={isMobile}
            >
              Print All ({successCount})
            </Button>
          </Stack>
        )}
        
        {currentTab === 1 && (
          <Button
            variant="contained"
            startIcon={isGenerating ? <QrCode /> : <Refresh />}
            onClick={generateQRCodes}
            disabled={isGenerating || selectedTables.length === 0}
            size={isMobile ? "medium" : "large"}
            fullWidth={isMobile}
          >
            {isGenerating ? 'Generating...' : `Generate QR Codes (${selectedTables.length})`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeManager;