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
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  Stack,
  Slider,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  Print,
  Download,
  QrCode,
  NavigateBefore,
  NavigateNext,
  GetApp,
  Settings,
  TableRestaurant,
} from '@mui/icons-material';
import { QRCodeData, qrService, QRGenerationRequest } from '../services/api';
import { TemplateRenderer, templateConfigs } from './templates';
import TemplatePreview from './templates/TemplatePreview';

// Extract template type from QRGenerationRequest
type TemplateType = NonNullable<QRGenerationRequest['customization']>['template'];

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

// Removed unused interfaces and helper functions

const QRCodeManager: React.FC<QRCodeManagerProps> = ({
  open,
  onClose,
  tables,
  venueId,
  venueName,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Remove tab state - simplified interface
  
  // Simplified state - no bulk generation needed
  
  // Preview slider state
  const [previewQRCodes, setPreviewQRCodes] = useState<QRCodeData[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  
  // Configuration state
  const [config, setConfig] = useState({
    template: 'classic' as keyof typeof templateConfigs,
    primaryColor: '#000000',
    includeInstructions: true,
    colorScheme: 'default' as 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red',
    layout: 'standard' as 'standard' | 'compact' | 'large',
  });

  useEffect(() => {
    if (open) {
      // Reset preview state when dialog opens
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
        template: config.template as TemplateType,
        primaryColor: config.primaryColor,
        secondaryColor: '#000000',
      },
    });
  };

  // Generate preview QR codes for all tables
  const generateSelectedPreviewQRs = async () => {
    if (tables.length === 0) return;
    
    setPreviewLoading(true);
    try {
      const newQrCodes: QRCodeData[] = [];
      
      for (let i = 0; i < tables.length; i++) {
        const qrData = await generatePreviewQR(tables[i]);
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

  // Download current preview QR as full template
  const downloadCurrentPreviewQR = () => {
    if (!previewQRCodes[currentPreviewIndex]) return;
    
    const qrData = previewQRCodes[currentPreviewIndex];
    const templateHtml = generateEnhancedPrintTemplate(qrData, config.template, config.primaryColor, config.includeInstructions);
    
    const blob = new Blob([templateHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-template-${venueName.replace(/\s+/g, '-')}-table-${qrData.tableNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download all preview QR codes as full templates
  const downloadAllPreviewQRs = () => {
    previewQRCodes.forEach((qrData, index) => {
      setTimeout(() => {
        const templateHtml = generateEnhancedPrintTemplate(qrData, config.template, config.primaryColor, config.includeInstructions);
        const blob = new Blob([templateHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-template-${venueName.replace(/\s+/g, '-')}-table-${qrData.tableNumber}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, index * 500);
    });
  };

  // Print current preview QR
  const printCurrentPreviewQR = () => {
    if (!previewQRCodes[currentPreviewIndex]) return;
    
    const qrData = previewQRCodes[currentPreviewIndex];
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generateEnhancedPrintTemplate(qrData, config.template, config.primaryColor, config.includeInstructions);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Print all preview QR codes
  const printAllPreviewQRs = () => {
    if (previewQRCodes.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = generateBulkPrintTemplateFromPreview(previewQRCodes);
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };



  // Removed bulk generation functions - simplified to preview-based approach

  const generateEnhancedPrintTemplate = (qrData: QRCodeData, template: string, primaryColor: string, includeInstructions: boolean): string => {
    const templates = {
      classic: generateClassicSingleTemplate(qrData, primaryColor, includeInstructions),
      modern: generateModernSingleTemplate(qrData, primaryColor, includeInstructions),
      elegant: generateElegantSingleTemplate(qrData, primaryColor, includeInstructions),
      minimal: generateMinimalSingleTemplate(qrData, primaryColor, includeInstructions),
      premium: generatePremiumSingleTemplate(qrData, primaryColor, includeInstructions),
      colorful: generateColorfulSingleTemplate(qrData, primaryColor, includeInstructions),
      retro: generateRetroSingleTemplate(qrData, primaryColor, includeInstructions),
      tech: generateTechSingleTemplate(qrData, primaryColor, includeInstructions),
      nature: generateNatureSingleTemplate(qrData, primaryColor, includeInstructions),
      artistic: generateArtisticSingleTemplate(qrData, primaryColor, includeInstructions),
      corporate: generateCorporateSingleTemplate(qrData, primaryColor, includeInstructions),
      festive: generateFestiveSingleTemplate(qrData, primaryColor, includeInstructions),
      business: generateBusinessSingleTemplate(qrData, primaryColor, includeInstructions),
      simple: generateSimpleSingleTemplate(qrData, primaryColor, includeInstructions),
      professional: generateProfessionalSingleTemplate(qrData, primaryColor, includeInstructions),
      clean: generateCleanSingleTemplate(qrData, primaryColor, includeInstructions),
      standard: generateStandardSingleTemplate(qrData, primaryColor, includeInstructions),
    };
    
    return templates[template as keyof typeof templates] || templates.classic;
  };

  const generateClassicSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { 
            font-family: 'Arial', sans-serif; 
            text-align: center; 
            padding: 20px; 
            margin: 0;
            background: white;
          }
          .qr-container { 
            border: 3px solid ${primaryColor}; 
            border-radius: 15px; 
            padding: 30px; 
            margin: 20px auto; 
            max-width: 400px; 
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          }
          .header { 
            color: ${primaryColor}; 
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
            color: ${primaryColor}; 
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
          <div class="header">🦕 Dino</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              <strong>Scan to view menu & order</strong><br>
              1. Open camera • 2. Point at QR • 3. Tap notification
            </div>
          ` : ''}
          
          <div class="url">${qrData.menuUrl}</div>
        </div>
      </body>
      </html>
    `;
  };

  const generateModernSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
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
            background: linear-gradient(135deg, ${primaryColor} 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 15px;
          }
          .venue-name {
            font-size: 26px;
            color: #2c3e50;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .table-number {
            font-size: 22px;
            color: ${primaryColor};
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
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 Dino</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              Scan with your camera to get started
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateElegantSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
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
            border: 2px solid ${primaryColor};
            padding: 40px;
            margin: 20px auto;
            max-width: 420px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            position: relative;
          }
          .qr-container::before {
            content: '';
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 1px solid ${primaryColor};
            pointer-events: none;
          }
          .header {
            color: ${primaryColor};
            font-size: 28px;
            font-weight: normal;
            margin-bottom: 15px;
            font-style: italic;
          }
          .venue-name {
            font-size: 24px;
            color: #2c2c2c;
            margin-bottom: 8px;
            font-weight: bold;
          }
          .table-number {
            font-size: 18px;
            color: ${primaryColor};
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
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 Dino</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              Scan to discover our culinary offerings
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateMinimalSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
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
            color: ${primaryColor};
            font-size: 24px;
            font-weight: 300;
            margin-bottom: 20px;
            letter-spacing: 1px;
          }
          .venue-name {
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
          <div class="header">DINO</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              Scan with camera to view menu
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  // New template functions for single QR codes
  const generatePremiumSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { 
            font-family: 'Playfair Display', 'Times New Roman', serif; 
            margin: 0; 
            padding: 30px; 
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #fff;
          }
          .qr-container {
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
            border: 3px solid #d4af37;
            border-radius: 20px;
            padding: 40px;
            margin: 20px auto;
            max-width: 450px;
            box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
            color: #333;
            position: relative;
          }
          .premium-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: #d4af37;
            color: #000;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
          }
          .header {
            color: #d4af37;
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          }
          .venue-name {
            font-size: 28px;
            color: #fff;
            margin-bottom: 10px;
            font-weight: 600;
          }
          .table-number {
            font-size: 22px;
            color: #d4af37;
            margin-bottom: 25px;
            font-style: italic;
          }
          .qr-code {
            margin: 30px 0;
            padding: 25px;
            background: linear-gradient(45deg, #fff 0%, #f8f8f8 100%);
            border-radius: 15px;
            border: 2px solid #d4af37;
          }
          .qr-code img {
            max-width: 220px;
            height: auto;
          }
          .instructions {
            font-size: 18px;
            color: #e0e0e0;
            margin-top: 25px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="premium-badge">PREMIUM</div>
          <div class="header">🦕 DINO</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              Scan for an exclusive dining experience
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateColorfulSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { 
            font-family: 'Comic Sans MS', 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
            background-size: 400% 400%;
          }
          .qr-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 25px;
            padding: 35px;
            margin: 20px auto;
            max-width: 420px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
          }
          .header {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 15px;
          }
          .venue-name {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 8px;
            font-weight: 700;
          }
          .table-number {
            font-size: 20px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 25px;
            font-weight: bold;
          }
          .qr-code {
            margin: 25px 0;
            padding: 20px;
            background: linear-gradient(45deg, #f8f9fa, #e9ecef);
            border-radius: 20px;
            border: 3px solid;
            border-image: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1) 1;
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
          }
          .instructions {
            font-size: 16px;
            color: #2c3e50;
            margin-top: 20px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 DINO</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              Scan me for a colorful menu adventure! 🌈
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateRetroSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { 
            font-family: 'Courier New', monospace; 
            margin: 0; 
            padding: 30px; 
            background: #f4e4bc;
            color: #8b4513;
          }
          .qr-container {
            background: #fff8dc;
            border: 4px solid #8b4513;
            padding: 40px;
            margin: 20px auto;
            max-width: 400px;
            box-shadow: 8px 8px 0px #d2b48c;
            position: relative;
          }
          .vintage-badge {
            position: absolute;
            top: -10px;
            right: 20px;
            background: #8b4513;
            color: #fff8dc;
            padding: 5px 15px;
            font-size: 12px;
            font-weight: bold;
            transform: rotate(15deg);
          }
          .header {
            color: #8b4513;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 3px;
          }
          .venue-name {
            font-size: 22px;
            color: #654321;
            margin-bottom: 8px;
            font-weight: bold;
            text-transform: uppercase;
          }
          .table-number {
            font-size: 18px;
            color: #8b4513;
            margin-bottom: 25px;
            font-weight: bold;
          }
          .qr-code {
            margin: 25px 0;
            padding: 20px;
            background: #ffffff;
            border: 3px solid #8b4513;
            box-shadow: 4px 4px 0px #d2b48c;
          }
          .qr-code img {
            max-width: 180px;
            height: auto;
            filter: sepia(20%);
          }
          .instructions {
            font-size: 14px;
            color: #654321;
            margin-top: 20px;
            font-weight: bold;
            text-transform: uppercase;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="vintage-badge">EST. 2024</div>
          <div class="header">🦕 DINO</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">TABLE ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              SCAN FOR CLASSIC MENU
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateTechSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { 
            font-family: 'Consolas', 'Monaco', monospace; 
            margin: 0; 
            padding: 20px; 
            background: #0a0a0a;
            color: #00ff41;
          }
          .qr-container {
            background: linear-gradient(135deg, #1a1a1a 0%, #0d1421 100%);
            border: 2px solid #00ff41;
            border-radius: 10px;
            padding: 35px;
            margin: 20px auto;
            max-width: 420px;
            box-shadow: 0 0 30px rgba(0, 255, 65, 0.3);
          }
          .header {
            color: #00ff41;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 0 0 10px #00ff41;
          }
          .venue-name {
            font-size: 22px;
            color: #ffffff;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .table-number {
            font-size: 18px;
            color: #00ff41;
            margin-bottom: 25px;
            font-weight: bold;
          }
          .qr-code {
            margin: 25px 0;
            padding: 20px;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #00ff41;
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
          }
          .instructions {
            font-size: 14px;
            color: #00ff41;
            margin-top: 20px;
            font-weight: 500;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 DINO.EXE</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">> TABLE_${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              > SCAN TO ACCESS DIGITAL MENU_
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateNatureSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { 
            font-family: 'Georgia', serif; 
            margin: 0; 
            padding: 25px; 
            background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #ffd3a5 100%);
            color: #2d5016;
          }
          .qr-container {
            background: rgba(255, 255, 255, 0.9);
            border: 3px solid #4a7c59;
            border-radius: 25px;
            padding: 40px;
            margin: 20px auto;
            max-width: 420px;
            box-shadow: 0 15px 35px rgba(74, 124, 89, 0.2);
          }
          .header {
            color: #4a7c59;
            font-size: 30px;
            font-weight: 700;
            margin-bottom: 15px;
          }
          .venue-name {
            font-size: 24px;
            color: #2d5016;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .table-number {
            font-size: 18px;
            color: #4a7c59;
            margin-bottom: 25px;
            font-style: italic;
          }
          .qr-code {
            margin: 25px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f8fff8 0%, #e8f5e8 100%);
            border-radius: 20px;
            border: 2px solid #a8e6cf;
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
          }
          .instructions {
            font-size: 16px;
            color: #2d5016;
            margin-top: 20px;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 DINO</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              Scan to discover our fresh, organic menu 🌱
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateArtisticSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { 
            font-family: 'Brush Script MT', cursive; 
            margin: 0; 
            padding: 25px; 
            background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 25%, #fecfef 75%, #ff9a9e 100%);
            color: #4a4a4a;
          }
          .qr-container {
            background: #ffffff;
            border-radius: 30px;
            padding: 40px;
            margin: 20px auto;
            max-width: 420px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24, #ff9ff3, #54a0ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .venue-name {
            font-size: 26px;
            color: #2c2c54;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .table-number {
            font-size: 20px;
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 25px;
            font-weight: bold;
          }
          .qr-code {
            margin: 25px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 25px;
            border: 3px solid transparent;
            background-clip: padding-box;
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
          }
          .instructions {
            font-size: 18px;
            color: #2c2c54;
            margin-top: 20px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 DINO</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              Scan to explore our creative menu! 🎨
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateCorporateSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 30px; 
            background: #f8f9fa;
            color: #212529;
          }
          .qr-container {
            background: #ffffff;
            border: 1px solid #dee2e6;
            padding: 40px;
            margin: 20px auto;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            position: relative;
          }
          .logo-placeholder {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 40px;
            height: 40px;
            background: ${primaryColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          }
          .header {
            color: ${primaryColor};
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 15px;
          }
          .venue-name {
            font-size: 22px;
            color: #212529;
            margin-bottom: 8px;
            font-weight: 600;
          }
          .table-number {
            font-size: 16px;
            color: #6c757d;
            margin-bottom: 25px;
            font-weight: 500;
          }
          .qr-code {
            margin: 25px 0;
            padding: 20px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
          }
          .qr-code img {
            max-width: 180px;
            height: auto;
          }
          .instructions {
            font-size: 14px;
            color: #495057;
            margin-top: 20px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="logo-placeholder">D</div>
          <div class="header">🦕 DINO</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              <strong>Digital Menu Access</strong><br>
              Please scan the QR code above with your mobile device to access our digital menu.
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateFestiveSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { 
            font-family: 'Comic Sans MS', cursive; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff);
            background-size: 400% 400%;
            color: #2c2c54;
          }
          .qr-container {
            background: rgba(255, 255, 255, 0.95);
            border: 4px solid #ff6b6b;
            border-radius: 30px;
            padding: 35px;
            margin: 20px auto;
            max-width: 420px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          }
          .header {
            background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 15px;
            margin-top: 30px;
          }
          .venue-name {
            font-size: 24px;
            color: #2c2c54;
            margin-bottom: 8px;
            font-weight: 700;
          }
          .table-number {
            font-size: 20px;
            background: linear-gradient(45deg, #ff6b6b, #feca57);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 25px;
            font-weight: bold;
          }
          .qr-code {
            margin: 25px 0;
            padding: 25px;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border-radius: 25px;
            border: 3px solid #ff6b6b;
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
          }
          .instructions {
            font-size: 18px;
            color: #2c2c54;
            margin-top: 20px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 DINO</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              Scan for a celebration menu! 🎉
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateBulkPrintTemplateFromPreview = (qrCodes: QRCodeData[]): string => {
    const qrCodesPerPage = 4;
    const pages: QRCodeData[][] = [];
    
    for (let i = 0; i < qrCodes.length; i += qrCodesPerPage) {
      pages.push(qrCodes.slice(i, i + qrCodesPerPage));
    }

    const pageTemplates = pages.map(pageQRs => generatePageTemplateFromPreview(pageQRs)).join('');

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
        </style>
      </head>
      <body>
        ${pageTemplates}
      </body>
      </html>
    `;
  };

  const generatePageTemplateFromPreview = (pageQRs: QRCodeData[]): string => {
    const qrItems = pageQRs.map(qrData => {
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

  const generateBusinessSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { 
            font-family: 'Roboto', 'Arial', sans-serif; 
            margin: 0; 
            padding: 30px; 
            background: #ffffff;
            color: #333333;
          }
          .qr-container {
            background: #ffffff;
            border: 2px solid ${primaryColor};
            padding: 40px;
            margin: 20px auto;
            max-width: 420px;
            text-align: center;
          }
          .header {
            color: ${primaryColor};
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
            letter-spacing: 1px;
          }
          .divider {
            height: 2px;
            background: ${primaryColor};
            width: 60px;
            margin: 0 auto 16px auto;
          }
          .venue-name {
            font-size: 22px;
            color: #333333;
            margin-bottom: 4px;
            font-weight: 500;
          }
          .table-number {
            font-size: 16px;
            color: #666666;
            margin-bottom: 30px;
            font-weight: 400;
          }
          .qr-code {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border: 1px solid ${primaryColor}20;
            border-radius: 8px;
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
          }
          .instructions {
            font-size: 14px;
            color: #333333;
            margin-top: 20px;
            font-weight: 500;
          }
          .footer {
            border-top: 1px solid ${primaryColor}20;
            padding-top: 15px;
            margin-top: 25px;
            font-size: 12px;
            color: #999999;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 DINO</div>
          <div class="divider"></div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              <strong>Digital Menu Access</strong><br>
              Scan the QR code with your mobile device to view our menu
            </div>
          ` : ''}
          
          <div class="footer">
            Professional Dining Experience
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateSimpleSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 25mm; size: A4; }
          body { 
            font-family: 'Helvetica Neue', 'Arial', sans-serif; 
            margin: 0; 
            padding: 35px; 
            background: #ffffff;
            color: #333333;
          }
          .qr-container {
            background: #ffffff;
            border: 1px solid #e0e0e0;
            padding: 35px;
            margin: 20px auto;
            max-width: 400px;
            text-align: center;
          }
          .header {
            color: ${primaryColor};
            font-size: 24px;
            font-weight: 300;
            margin-bottom: 10px;
            letter-spacing: 2px;
          }
          .venue-name {
            font-size: 18px;
            color: #666666;
            margin-bottom: 8px;
            font-weight: 400;
          }
          .table-number {
            font-size: 14px;
            color: #999999;
            margin-bottom: 30px;
            font-weight: 300;
          }
          .qr-code {
            margin: 30px 0;
          }
          .qr-code img {
            max-width: 190px;
            height: auto;
          }
          .instructions {
            font-size: 12px;
            color: #666666;
            margin-top: 25px;
            font-weight: 300;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">DINO</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              Scan to view menu
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  };

  const generateProfessionalSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { 
            font-family: 'Times New Roman', serif; 
            margin: 0; 
            padding: 45px; 
            background: #f5f5f5;
            color: #333333;
          }
          .qr-container {
            background: #ffffff;
            padding: 45px;
            margin: 20px auto;
            max-width: 440px;
            text-align: center;
            border-top: 4px solid ${primaryColor};
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .header {
            color: ${primaryColor};
            font-size: 30px;
            font-weight: 700;
            margin-bottom: 12px;
            letter-spacing: 1px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, ${primaryColor}, transparent);
            width: 80%;
            margin: 0 auto 20px auto;
          }
          .venue-name {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 6px;
            font-weight: 600;
          }
          .table-number {
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 35px;
            font-weight: 500;
          }
          .qr-code {
            margin: 35px 0;
            padding: 25px;
            background: #f8f9fa;
            border: 2px solid ${primaryColor};
            border-radius: 4px;
            position: relative;
          }
          .qr-code img {
            max-width: 210px;
            height: auto;
          }
          .corner-decoration {
            position: absolute;
            width: 15px;
            height: 15px;
            border: 2px solid ${primaryColor};
          }
          .corner-tl {
            top: 8px;
            left: 8px;
            border-right: none;
            border-bottom: none;
          }
          .corner-br {
            bottom: 8px;
            right: 8px;
            border-left: none;
            border-top: none;
          }
          .instructions {
            font-size: 14px;
            color: #2c3e50;
            margin-top: 25px;
            font-weight: 600;
            line-height: 1.6;
          }
          .footer {
            border-top: 1px solid ${primaryColor}30;
            padding-top: 20px;
            margin-top: 30px;
            font-size: 12px;
            color: #95a5a6;
            font-style: italic;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 DINO</div>
          <div class="divider"></div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <div class="corner-decoration corner-tl"></div>
            <div class="corner-decoration corner-br"></div>
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              <strong>Digital Menu Access</strong><br>
              Please scan the QR code above with your mobile device camera to access our comprehensive digital menu and place your order.
            </div>
          ` : ''}
          
          <div class="footer">
            Excellence in Dining • Est. 2024
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateCleanSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { 
            font-family: 'Inter', 'Segoe UI', sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: #ffffff;
            color: #2c3e50;
          }
          .qr-container {
            background: #ffffff;
            padding: 40px;
            margin: 20px auto;
            max-width: 420px;
            text-align: center;
            border-radius: 12px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.08);
          }
          .header {
            color: ${primaryColor};
            font-size: 28px;
            font-weight: 500;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
          }
          .venue-name {
            font-size: 22px;
            color: #2c3e50;
            margin-bottom: 6px;
            font-weight: 400;
          }
          .table-number {
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 40px;
            font-weight: 300;
          }
          .qr-code {
            margin: 40px 0;
            padding: 24px;
            background: #f8f9fa;
            border-radius: 16px;
            border: 1px solid #ecf0f1;
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
            border-radius: 8px;
          }
          .instructions {
            font-size: 14px;
            color: #34495e;
            margin-top: 20px;
            font-weight: 400;
            line-height: 1.5;
          }
          .sub-instructions {
            font-size: 12px;
            color: #95a5a6;
            margin-top: 8px;
            font-weight: 300;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            font-size: 10px;
            color: #bdc3c7;
            font-weight: 300;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 Dino</div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              Scan to view our menu
            </div>
            <div class="sub-instructions">
              Point your camera at the QR code
            </div>
          ` : ''}
          
          <div class="footer">
            MODERN DINING
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateStandardSingleTemplate = (qrData: QRCodeData, primaryColor: string, includeInstructions: boolean): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData.venueName} ${qrData.tableNumber}</title>
        <style>
          @page { margin: 20mm; size: A4; }
          body { 
            font-family: 'Roboto', 'Arial', sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: #fafafa;
            color: #333333;
          }
          .qr-container {
            background: #ffffff;
            border: 1px solid ${primaryColor}30;
            padding: 40px;
            margin: 20px auto;
            max-width: 420px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            color: ${primaryColor};
            font-size: 30px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .divider {
            height: 3px;
            background: ${primaryColor};
            width: 50px;
            margin: 0 auto 16px auto;
            border-radius: 2px;
          }
          .venue-name {
            font-size: 24px;
            color: #333333;
            margin-bottom: 6px;
            font-weight: 500;
          }
          .table-number {
            font-size: 16px;
            color: #666666;
            margin-bottom: 30px;
            font-weight: 400;
          }
          .qr-code {
            margin: 30px 0;
            padding: 20px;
            background: #f5f5f5;
            border: 2px solid ${primaryColor}20;
            border-radius: 8px;
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
          }
          .instructions {
            font-size: 14px;
            color: #333333;
            margin-top: 20px;
            font-weight: 500;
            line-height: 1.4;
          }
          .footer {
            border-top: 1px solid ${primaryColor}20;
            padding-top: 15px;
            margin-top: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
          }
          .footer-dot {
            width: 8px;
            height: 8px;
            background: ${primaryColor};
            border-radius: 50%;
          }
          .footer-text {
            font-size: 12px;
            color: #999999;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 DINO</div>
          <div class="divider"></div>
          <div class="venue-name">${qrData.venueName}</div>
          <div class="table-number">Table ${qrData.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData.qrCodeBase64}" alt="QR Code" />
          </div>
          
          ${includeInstructions ? `
            <div class="instructions">
              <strong>Scan QR Code for Menu</strong><br>
              Use your phone's camera to scan and view our digital menu
            </div>
          ` : ''}
          
          <div class="footer">
            <div class="footer-dot"></div>
            <div class="footer-text">Digital Menu Service</div>
            <div class="footer-dot"></div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Removed bulk generation template functions - using preview-based templates instead

  // Removed status helper functions - no longer needed without bulk generation

  const currentPreviewQR = previewQRCodes[currentPreviewIndex];
  const currentSelectedTable = tables[currentPreviewIndex];



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
            Configure templates and generate QR codes for all tables
          </Typography>
        </Box>
        <IconButton onClick={onClose} size={isMobile ? 'small' : 'medium'}>
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ 
        pt: 2, 
        flex: 1, 
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        px: { xs: 1, sm: 3 }
      }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ height: '100%' }}>
            {/* Configuration Panel */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={{ xs: 2, sm: 3 }}>

                
                <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 }, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Settings /> Settings
                  </Typography>
                  
                  <Stack spacing={{ xs: 2, sm: 3 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom fontWeight="600">
                        Choose Template Style
                      </Typography>
                      
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                          gap: 2,
                          height: 400,
                          overflow: 'auto',
                          p: 1
                        }}
                      >
                        {Object.keys(templateConfigs).map((templateKey) => (
                          <TemplatePreview
                            key={templateKey}
                            template={templateKey}
                            selected={config.template === templateKey}
                            onClick={() => setConfig(prev => ({ ...prev, template: templateKey as keyof typeof templateConfigs }))}
                          />
                        ))}
                      </Box>
                      
                      <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Selected: {templateConfigs[config.template]?.name || 'Classic'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {templateConfigs[config.template]?.description || 'Traditional design with clean borders and professional styling'}
                        </Typography>
                      </Box>
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
                      disabled={previewLoading || tables.length === 0}
                      fullWidth
                      sx={{ py: { xs: 1, sm: 1.5 } }}
                    >
                      {previewLoading ? 'Generating...' : `Generate QR Codes (${tables.length} tables)`}
                    </Button>

                    {previewQRCodes.length > 0 && (
                      <Stack spacing={2}>
                        <Divider />
                        <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary">
                          Generated {previewQRCodes.length} QR codes • Currently viewing: {currentSelectedTable?.number}
                        </Typography>
                        
                        <Stack direction={isMobile ? "column" : "row"} spacing={1}>
                          <Button
                            variant="outlined"
                            startIcon={<GetApp />}
                            onClick={downloadAllPreviewQRs}
                            fullWidth={isMobile}
                            size={isMobile ? "small" : "medium"}
                          >
                            Download All Templates
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Print />}
                            onClick={printAllPreviewQRs}
                            fullWidth={isMobile}
                            size={isMobile ? "small" : "medium"}
                          >
                            Print All
                          </Button>
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            {/* QR Code Preview Slider */}
            <Grid item xs={12} lg={8}>
              {previewQRCodes.length > 0 ? (
                <Paper elevation={1} sx={{ p: { xs: 2, sm: 4 }, border: '1px solid', borderColor: 'divider', height: 'fit-content' }}>
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

                  {/* Live Template Preview */}
                  {currentPreviewQR && (
                    <Box sx={{ 
                      maxHeight: 600, 
                      overflow: 'auto', 
                      mb: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: 'background.default'
                    }}>
                      <TemplateRenderer
                        template={config.template}
                        qrCodeBase64={currentPreviewQR.qrCodeBase64}
                        venueName={currentPreviewQR.venueName}
                        tableNumber={currentPreviewQR.tableNumber}
                        menuUrl={currentPreviewQR.menuUrl}
                        primaryColor={config.primaryColor}
                        includeInstructions={config.includeInstructions}
                        layout={config.layout}
                      />
                    </Box>
                  )}

                  {/* Template Info */}
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Stack direction={isMobile ? "column" : "row"} spacing={1} justifyContent="center">
                      <Chip 
                        label={`Template: ${config.template}`} 
                        size="small" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={`Table: ${currentSelectedTable?.number}`} 
                        size="small" 
                        color="primary" 
                      />
                      <Chip 
                        label={`Layout: ${config.layout}`} 
                        size="small" 
                        variant="outlined" 
                      />
                    </Stack>
                  </Box>

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
                          label: tables[index]?.number || `${index + 1}`
                        }))}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => tables[value]?.number || `${value + 1}`}
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
                    {tables.length > 0 
                      ? `Will generate ${tables.length} QR codes for all tables`
                      : 'No tables available'
                    }
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<QrCode />}
                    onClick={generateSelectedPreviewQRs}
                    size={isMobile ? "medium" : "large"}
                    disabled={previewLoading || tables.length === 0}
                  >
                    Generate QR Codes
                  </Button>
                </Paper>
              )}
            </Grid>
          </Grid>
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
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeManager;