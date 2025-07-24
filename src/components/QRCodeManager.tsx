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
} from '@mui/icons-material';
import { QRCodeData, qrService, QRGenerationRequest } from '../services/qrService';

interface Table {
  id: string;
  number: string;
  cafeId: string;
  cafeName: string;
}

interface QRCodeManagerProps {
  open: boolean;
  onClose: () => void;
  tables: Table[];
  cafeId: string;
  cafeName: string;
}

interface QRGenerationStatus {
  tableId: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  qrData?: QRCodeData;
  error?: string;
}

const QRCodeManager: React.FC<QRCodeManagerProps> = ({
  open,
  onClose,
  tables,
  cafeId,
  cafeName,
}) => {
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [generationStatus, setGenerationStatus] = useState<QRGenerationStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState<'classic' | 'modern' | 'elegant' | 'minimal'>('classic');
  const [includeInstructions, setIncludeInstructions] = useState(true);
  const [progress, setProgress] = useState(0);

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
    }
  }, [open, tables]);

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

  const generateQRCodes = async () => {
    if (selectedTables.length === 0) return;

    setIsGenerating(true);
    setProgress(0);

    const requests: QRGenerationRequest[] = selectedTables.map(tableId => {
      const table = tables.find(t => t.id === tableId)!;
      return {
        cafeId,
        tableId,
        cafeName,
        tableNumber: table.number,
        customization: {
          template,
          primaryColor: '#2e7d32',
          secondaryColor: '#1b5e20',
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

    // Generate QR codes one by one (or in small batches)
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
        link.download = `qr-code-${cafeName}-table-${qrData.tableNumber}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 200); // Stagger downloads
    });
  };

  const generateBulkPrintTemplate = (qrStatuses: QRGenerationStatus[]): string => {
    const qrCodesPerPage = 4; // 2x2 grid
    const pages: QRGenerationStatus[][] = [];
    
    for (let i = 0; i < qrStatuses.length; i += qrCodesPerPage) {
      pages.push(qrStatuses.slice(i, i + qrCodesPerPage));
    }

    const pageTemplates = pages.map(pageQRs => generatePageTemplate(pageQRs)).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes - ${cafeName}</title>
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
            border-bottom: 2px solid #2e7d32;
          }
          .page-title {
            font-size: 24px;
            color: #2e7d32;
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
            border: 2px solid #2e7d32;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .qr-cafe-name {
            font-size: 18px;
            color: #333;
            margin-bottom: 5px;
            font-weight: bold;
          }
          .qr-table-number {
            font-size: 16px;
            color: #2e7d32;
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
          <div class="qr-cafe-name">${qrData.cafeName}</div>
          <div class="qr-table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code-container">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="qr-instructions">
              <strong>Scan to view menu & order</strong><br>
              1. Open camera • 2. Point at QR • 3. Tap notification
            </div>
          ` : ''}
          
          <div class="qr-url">https://google.com</div>
        </div>
      `;
    }).join('');

    // Fill empty slots if needed
    const emptySlots = 4 - pageQRs.length;
    const emptyItems = Array(emptySlots).fill('<div class="qr-item" style="border: 2px dashed #ccc; background: #f9f9f9;"></div>').join('');

    return `
      <div class="page">
        <div class="page-header">
          <div class="page-title">🦕 ${cafeName} - QR Codes</div>
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <QrCode color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Bulk QR Code Manager
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Grid container spacing={3}>
          {/* Settings Panel */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" gutterBottom fontWeight="600">
                Generation Settings
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Template Style</InputLabel>
                <Select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value as any)}
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
                    checked={includeInstructions}
                    onChange={(e) => setIncludeInstructions(e.target.checked)}
                    disabled={isGenerating}
                  />
                }
                label="Include instructions"
              />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom fontWeight="600">
                Table Selection
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Button
                  size="small"
                  startIcon={<SelectAll />}
                  onClick={handleSelectAll}
                  disabled={isGenerating}
                >
                  {selectedTables.length === tables.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Typography variant="body2" color="text.secondary">
                  ({selectedTables.length} of {tables.length} selected)
                </Typography>
              </Box>

              <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                {tables.map(table => (
                  <ListItem key={table.id} sx={{ px: 0 }}>
                    <Checkbox
                      checked={selectedTables.includes(table.id)}
                      onChange={() => handleTableSelect(table.id)}
                      disabled={isGenerating}
                    />
                    <ListItemText
                      primary={`Table ${table.number}`}
                      secondary={table.cafeName}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Status Panel */}
          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="600">
                  Generation Status
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
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
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Generating QR codes... {Math.round(progress)}%
                  </Typography>
                </Box>
              )}

              <List sx={{ maxHeight: 300, overflow: 'auto' }}>
                {generationStatus
                  .filter(status => selectedTables.includes(status.tableId))
                  .map(status => {
                    const table = tables.find(t => t.id === status.tableId);
                    if (!table) return null;

                    return (
                      <ListItem key={status.tableId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                          {getStatusIcon(status.status)}
                        </Box>
                        <ListItemText
                          primary={`Table ${table.number}`}
                          secondary={
                            status.status === 'error' 
                              ? status.error 
                              : status.status === 'success'
                              ? 'QR code generated successfully'
                              : status.status === 'generating'
                              ? 'Generating QR code...'
                              : 'Waiting to generate'
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
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} size="large">
          Close
        </Button>
        
        {successCount > 0 && (
          <>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={downloadAllQRCodes}
              size="large"
            >
              Download All ({successCount})
            </Button>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={printAllQRCodes}
              size="large"
            >
              Print All ({successCount})
            </Button>
          </>
        )}
        
        <Button
          variant="contained"
          startIcon={isGenerating ? <QrCode /> : <Refresh />}
          onClick={generateQRCodes}
          disabled={isGenerating || selectedTables.length === 0}
          size="large"
        >
          {isGenerating ? 'Generating...' : `Generate QR Codes (${selectedTables.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeManager;