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
import { QRCodeData, qrService } from '../services/api';

interface QRCodeViewerProps {
  open: boolean;
  onClose: () => void;
  tableId?: string;
  venueId?: string;
  venueName?: string;
  tableNumber?: string;
  qrData?: QRCodeData;
  // Legacy compatibility
  cafeId?: string;
  cafeName?: string;
}

const QRCodeViewer: React.FC<QRCodeViewerProps> = ({
  open,
  onClose,
  tableId,
  venueId,
  venueName,
  tableNumber,
  qrData: initialQrData,
  // Legacy compatibility
  cafeId,
  cafeName,
}) => {
  // Use venue props with fallback to legacy cafe props
  const actualVenueId = venueId || cafeId;
  const actualVenueName = venueName || cafeName;
  const [qrData, setQrData] = useState<QRCodeData | null>(initialQrData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [template, setTemplate] = useState<'classic' | 'modern' | 'elegant' | 'minimal' | 'premium' | 'colorful' | 'retro' | 'tech' | 'nature' | 'artistic' | 'corporate' | 'festive'>('classic');
  const [showInstructions, setShowInstructions] = useState(true);
  const [copied, setCopied] = useState(false);

  const generateQRCode = useCallback(async () => {
    if (!tableId || !actualVenueId || !actualVenueName || !tableNumber) return;

    setLoading(true);
    setError('');

    try {
      const newQrData = await qrService.generateTableQR({
        venueId: actualVenueId,
        tableId,
        venueName: actualVenueName,
        tableNumber,
        customization: {
          template,
          primaryColor: '#000000',
          secondaryColor: '#000000',
        },
      });
      setQrData(newQrData);
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }, [tableId, actualVenueId, actualVenueName, tableNumber, template]);



  useEffect(() => {
    if (open && !qrData && tableId && actualVenueId && actualVenueName && tableNumber) {
      generateQRCode();
    }
  }, [open, qrData, generateQRCode, tableId, actualVenueId, actualVenueName, tableNumber]);

  const handleRegenerateQR = async () => {
    if (!qrData) return;
    
    setLoading(true);
    setError('');

    try {
      const newQrData = await qrService.regenerateQR(qrData.id, {
        venueId: qrData.venueId || qrData.cafeId || '',
        tableId: qrData.tableId,
        venueName: qrData.venueName || qrData.cafeName || '',
        tableNumber: qrData.tableNumber,
        customization: {
          template,
          primaryColor: '#000000',
          secondaryColor: '#000000',
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
    link.download = `qr-code-${qrData.venueName || qrData.cafeName}-table-${qrData.tableNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!qrData) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${qrData.venueName || qrData.cafeName} - Table ${qrData.tableNumber}`,
          text: 'Scan this QR code to view the menu and place your order!',
          url: qrData.menuUrl,
        });
      } catch (err) {
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
      premium: generatePremiumTemplate(),
      colorful: generateColorfulTemplate(),
      retro: generateRetroTemplate(),
      tech: generateTechTemplate(),
      nature: generateNatureTemplate(),
      artistic: generateArtisticTemplate(),
      corporate: generateCorporateTemplate(),
      festive: generateFestiveTemplate(),
    };

    return templates[template];
  };

  const generateClassicTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
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
            border: 3px solid #000000;
            border-radius: 15px;
            padding: 30px;
            margin: 20px auto;
            max-width: 400px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          }
          .header {
            color: #000000;
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
            color: #000000;
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
          <div class="header">🦕 Dino</div>
          <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
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
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
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
          <div class="header">🦕 Dino</div>
          <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
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
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
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
          <div class="header">🦕 Dino</div>
          <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
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
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
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
          <div class="header">DINO</div>
          <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
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

  const generatePremiumTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
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
            position: relative;
            overflow: hidden;
          }
          .qr-container::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
            animation: rotate 20s linear infinite;
          }
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .content {
            position: relative;
            z-index: 1;
          }
          .header {
            color: #d4af37;
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            letter-spacing: 2px;
          }
          .cafe-name {
            font-size: 28px;
            color: #fff;
            margin-bottom: 10px;
            font-weight: 600;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
          }
          .table-number {
            font-size: 20px;
            color: #d4af37;
            margin-bottom: 25px;
            font-style: italic;
            font-weight: 500;
          }
          .qr-code {
            margin: 30px 0;
            padding: 25px;
            background: linear-gradient(45deg, #fff 0%, #f8f8f8 100%);
            border-radius: 15px;
            border: 2px solid #d4af37;
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
          }
          .qr-code img {
            max-width: 220px;
            height: auto;
            border-radius: 8px;
          }
          .instructions {
            font-size: 18px;
            color: #e0e0e0;
            margin-top: 25px;
            font-style: italic;
            text-align: center;
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
            letter-spacing: 1px;
          }
          .decorative-line {
            height: 2px;
            background: linear-gradient(to right, transparent, #d4af37, transparent);
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="premium-badge">PREMIUM</div>
          <div class="content">
            <div class="header">🦕 DINO</div>
            <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
            <div class="table-number">Table ${qrData?.tableNumber}</div>
            
            <div class="decorative-line"></div>
            
            <div class="qr-code">
              <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
            </div>
            
            <div class="decorative-line"></div>
            
            <div class="instructions">
              Scan for an exclusive dining experience
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateColorfulTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { 
            font-family: 'Comic Sans MS', 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
            background-size: 400% 400%;
            animation: gradientShift 8s ease infinite;
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .qr-container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 25px;
            padding: 35px;
            margin: 20px auto;
            max-width: 420px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.2);
            backdrop-filter: blur(10px);
            border: 3px solid rgba(255,255,255,0.3);
          }
          .header {
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .cafe-name {
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
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
            border-radius: 10px;
          }
          .instructions {
            font-size: 16px;
            color: #2c3e50;
            margin-top: 20px;
            font-weight: 600;
          }
          .fun-icons {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            font-size: 24px;
          }
          .icon {
            animation: bounce 2s infinite;
          }
          .icon:nth-child(2) { animation-delay: 0.2s; }
          .icon:nth-child(3) { animation-delay: 0.4s; }
          .icon:nth-child(4) { animation-delay: 0.6s; }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="header">🦕 DINO</div>
          <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
          <div class="table-number">Table ${qrData?.tableNumber}</div>
          
          <div class="fun-icons">
            <span class="icon">🍕</span>
            <span class="icon">🍔</span>
            <span class="icon">🍰</span>
            <span class="icon">☕</span>
          </div>
          
          <div class="qr-code">
            <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            Scan me for a colorful menu adventure! 🌈
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateRetroTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
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
            border-radius: 0;
            padding: 40px;
            margin: 20px auto;
            max-width: 400px;
            box-shadow: 8px 8px 0px #d2b48c;
            position: relative;
          }
          .qr-container::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            border: 2px dashed #8b4513;
            pointer-events: none;
          }
          .header {
            color: #8b4513;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 3px;
            text-shadow: 2px 2px 0px #d2b48c;
          }
          .cafe-name {
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
            letter-spacing: 1px;
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
            text-transform: uppercase;
            letter-spacing: 1px;
            transform: rotate(15deg);
          }
          .decorative-corners {
            position: absolute;
            width: 20px;
            height: 20px;
            border: 3px solid #8b4513;
          }
          .corner-tl { top: 15px; left: 15px; border-right: none; border-bottom: none; }
          .corner-tr { top: 15px; right: 15px; border-left: none; border-bottom: none; }
          .corner-bl { bottom: 15px; left: 15px; border-right: none; border-top: none; }
          .corner-br { bottom: 15px; right: 15px; border-left: none; border-top: none; }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="vintage-badge">EST. 2024</div>
          <div class="decorative-corners corner-tl"></div>
          <div class="decorative-corners corner-tr"></div>
          <div class="decorative-corners corner-bl"></div>
          <div class="decorative-corners corner-br"></div>
          
          <div class="header">🦕 DINO</div>
          <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
          <div class="table-number">TABLE ${qrData?.tableNumber}</div>
          
          <div class="qr-code">
            <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            SCAN FOR CLASSIC MENU
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateTechTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
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
            position: relative;
            overflow: hidden;
          }
          .qr-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.1), transparent);
            animation: scan 3s infinite;
          }
          @keyframes scan {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          .content {
            position: relative;
            z-index: 1;
          }
          .header {
            color: #00ff41;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 0 0 10px #00ff41;
            letter-spacing: 2px;
          }
          .cafe-name {
            font-size: 22px;
            color: #ffffff;
            margin-bottom: 8px;
            font-weight: 600;
            text-shadow: 0 0 5px #ffffff;
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
            box-shadow: 0 0 20px rgba(0, 255, 65, 0.2);
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
            text-shadow: 0 0 5px #00ff41;
          }
          .tech-grid {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
            pointer-events: none;
          }
          .status-bar {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #00ff41;
            margin-bottom: 15px;
            opacity: 0.7;
          }
          .loading-bar {
            width: 100%;
            height: 2px;
            background: #333;
            margin: 15px 0;
            overflow: hidden;
          }
          .loading-progress {
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #00ff41, #00cc33);
            animation: loading 2s infinite;
          }
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="tech-grid"></div>
          <div class="content">
            <div class="status-bar">
              <span>SYSTEM: ONLINE</span>
              <span>TABLE: ${qrData?.tableNumber}</span>
              <span>STATUS: READY</span>
            </div>
            
            <div class="header">🦕 DINO.EXE</div>
            <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
            <div class="table-number">> TABLE_${qrData?.tableNumber}</div>
            
            <div class="loading-bar">
              <div class="loading-progress"></div>
            </div>
            
            <div class="qr-code">
              <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
            </div>
            
            <div class="instructions">
              > SCAN TO ACCESS DIGITAL MENU_
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateNatureTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
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
            position: relative;
            backdrop-filter: blur(5px);
          }
          .qr-container::before {
            content: '🌿';
            position: absolute;
            top: 15px;
            left: 15px;
            font-size: 24px;
            opacity: 0.3;
          }
          .qr-container::after {
            content: '🌱';
            position: absolute;
            bottom: 15px;
            right: 15px;
            font-size: 24px;
            opacity: 0.3;
          }
          .header {
            color: #4a7c59;
            font-size: 30px;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 1px 1px 2px rgba(74, 124, 89, 0.2);
          }
          .cafe-name {
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
            box-shadow: 0 8px 20px rgba(168, 230, 207, 0.3);
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
            border-radius: 10px;
          }
          .instructions {
            font-size: 16px;
            color: #2d5016;
            margin-top: 20px;
            font-style: italic;
          }
          .nature-elements {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            font-size: 20px;
          }
          .leaf-decoration {
            position: absolute;
            width: 30px;
            height: 30px;
            background: #4a7c59;
            border-radius: 0 100% 0 100%;
            opacity: 0.1;
          }
          .leaf-1 { top: 50px; left: 30px; transform: rotate(45deg); }
          .leaf-2 { top: 80px; right: 40px; transform: rotate(-30deg); }
          .leaf-3 { bottom: 60px; left: 50px; transform: rotate(15deg); }
          .organic-border {
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            bottom: 10px;
            border: 1px solid rgba(74, 124, 89, 0.2);
            border-radius: 20px;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="organic-border"></div>
          <div class="leaf-decoration leaf-1"></div>
          <div class="leaf-decoration leaf-2"></div>
          <div class="leaf-decoration leaf-3"></div>
          
          <div class="header">🦕 DINO</div>
          <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
          <div class="table-number">Table ${qrData?.tableNumber}</div>
          
          <div class="nature-elements">
            <span>🌱</span>
            <span>🍃</span>
            <span>🌿</span>
            <span>🌾</span>
          </div>
          
          <div class="qr-code">
            <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            Scan to discover our fresh, organic menu 🌱
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateArtisticTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
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
            position: relative;
            overflow: hidden;
          }
          .qr-container::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(from 0deg, #ff9a9e, #fecfef, #ff9a9e, #fecfef);
            opacity: 0.1;
            animation: rotate 20s linear infinite;
          }
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .content {
            position: relative;
            z-index: 1;
          }
          .header {
            background: linear-gradient(45deg, #ff6b6b, #ee5a24, #ff9ff3, #54a0ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          .cafe-name {
            font-size: 26px;
            color: #2c2c54;
            margin-bottom: 8px;
            font-weight: 600;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
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
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            position: relative;
          }
          .qr-code::before {
            content: '';
            position: absolute;
            top: -3px;
            left: -3px;
            right: -3px;
            bottom: -3px;
            background: linear-gradient(45deg, #ff6b6b, #ee5a24, #ff9ff3, #54a0ff);
            border-radius: 25px;
            z-index: -1;
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
            border-radius: 15px;
          }
          .instructions {
            font-size: 18px;
            color: #2c2c54;
            margin-top: 20px;
            font-weight: 600;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }
          .paint-splashes {
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            opacity: 0.3;
          }
          .splash-1 { top: 20px; left: 20px; background: #ff6b6b; }
          .splash-2 { top: 40px; right: 30px; background: #54a0ff; width: 15px; height: 15px; }
          .splash-3 { bottom: 30px; left: 40px; background: #ff9ff3; width: 25px; height: 25px; }
          .splash-4 { bottom: 50px; right: 20px; background: #ee5a24; width: 18px; height: 18px; }
          .artistic-frame {
            position: absolute;
            top: 15px;
            left: 15px;
            right: 15px;
            bottom: 15px;
            border: 2px dashed rgba(255, 107, 107, 0.3);
            border-radius: 25px;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="artistic-frame"></div>
          <div class="paint-splashes splash-1"></div>
          <div class="paint-splashes splash-2"></div>
          <div class="paint-splashes splash-3"></div>
          <div class="paint-splashes splash-4"></div>
          
          <div class="content">
            <div class="header">🦕 DINO</div>
            <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
            <div class="table-number">Table ${qrData?.tableNumber}</div>
            
            <div class="qr-code">
              <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
            </div>
            
            <div class="instructions">
              Scan to explore our creative menu! 🎨
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateCorporateTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
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
          .header {
            color: #0056b3;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 15px;
            letter-spacing: 1px;
          }
          .cafe-name {
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
            text-align: center;
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
          .company-info {
            border-top: 1px solid #dee2e6;
            padding-top: 15px;
            margin-top: 20px;
            font-size: 12px;
            color: #6c757d;
          }
          .logo-placeholder {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 40px;
            height: 40px;
            background: #0056b3;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          }
          .professional-line {
            height: 3px;
            background: linear-gradient(to right, #0056b3, #007bff, #0056b3);
            margin: 20px 0;
          }
          .contact-info {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: #6c757d;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="logo-placeholder">D</div>
          
          <div class="header">🦕 DINO</div>
          <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
          <div class="table-number">Table ${qrData?.tableNumber}</div>
          
          <div class="professional-line"></div>
          
          <div class="qr-code">
            <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            <strong>Digital Menu Access</strong><br>
            Please scan the QR code above with your mobile device to access our digital menu and place your order.
          </div>
          
          <div class="company-info">
            <div class="contact-info">
              <span>Professional Dining Solutions</span>
              <span>Est. 2024</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generateFestiveTemplate = (): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code - ${qrData?.venueName || qrData?.cafeName} Table ${qrData?.tableNumber}</title>
        <style>
          @page { margin: 15mm; size: A4; }
          body { 
            font-family: 'Comic Sans MS', cursive; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb, #ff9ff3, #54a0ff);
            background-size: 400% 400%;
            animation: festiveBackground 6s ease infinite;
            color: #2c2c54;
          }
          @keyframes festiveBackground {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .qr-container {
            background: rgba(255, 255, 255, 0.95);
            border: 4px solid #ff6b6b;
            border-radius: 30px;
            padding: 35px;
            margin: 20px auto;
            max-width: 420px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
            position: relative;
            overflow: hidden;
          }
          .qr-container::before {
            content: '🎉🎊🎈';
            position: absolute;
            top: 10px;
            left: 10px;
            right: 10px;
            font-size: 20px;
            text-align: center;
            animation: bounce 2s infinite;
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          .header {
            background: linear-gradient(45deg, #ff6b6b, #feca57, #48dbfb);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 15px;
            margin-top: 30px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            animation: textGlow 3s ease-in-out infinite alternate;
          }
          @keyframes textGlow {
            from { filter: drop-shadow(0 0 5px rgba(255, 107, 107, 0.5)); }
            to { filter: drop-shadow(0 0 15px rgba(255, 107, 107, 0.8)); }
          }
          .cafe-name {
            font-size: 24px;
            color: #2c2c54;
            margin-bottom: 8px;
            font-weight: 700;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
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
            box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
            animation: pulse 4s ease-in-out infinite;
          }
          @keyframes pulse {
            0% { box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3); }
            50% { box-shadow: 0 15px 40px rgba(255, 107, 107, 0.5); }
            100% { box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3); }
          }
          .qr-code img {
            max-width: 200px;
            height: auto;
            border-radius: 15px;
          }
          .instructions {
            font-size: 18px;
            color: #2c2c54;
            margin-top: 20px;
            font-weight: 600;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }
          .celebration-icons {
            display: flex;
            justify-content: space-around;
            margin: 20px 0;
            font-size: 24px;
          }
          .icon {
            animation: spin 3s linear infinite;
          }
          .icon:nth-child(2) { animation-delay: 0.5s; }
          .icon:nth-child(3) { animation-delay: 1s; }
          .icon:nth-child(4) { animation-delay: 1.5s; }
          @keyframes spin {
            0% { transform: rotate(0deg) scale(1); }
            50% { transform: rotate(180deg) scale(1.2); }
            100% { transform: rotate(360deg) scale(1); }
          }
          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #ff6b6b;
            animation: fall 3s linear infinite;
          }
          .confetti:nth-child(2) { left: 20%; background: #feca57; animation-delay: 0.5s; }
          .confetti:nth-child(3) { left: 40%; background: #48dbfb; animation-delay: 1s; }
          .confetti:nth-child(4) { left: 60%; background: #ff9ff3; animation-delay: 1.5s; }
          .confetti:nth-child(5) { left: 80%; background: #54a0ff; animation-delay: 2s; }
          @keyframes fall {
            0% { top: -10px; transform: rotate(0deg); }
            100% { top: 100%; transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <div class="confetti"></div>
          <div class="confetti"></div>
          <div class="confetti"></div>
          <div class="confetti"></div>
          <div class="confetti"></div>
          
          <div class="header">🦕 DINO</div>
          <div class="cafe-name">${qrData?.venueName || qrData?.cafeName}</div>
          <div class="table-number">Table ${qrData?.tableNumber}</div>
          
          <div class="celebration-icons">
            <span class="icon">🎉</span>
            <span class="icon">🎊</span>
            <span class="icon">🎈</span>
            <span class="icon">🎁</span>
          </div>
          
          <div class="qr-code">
            <img src="${qrData?.qrCodeBase64}" alt="QR Code" />
          </div>
          
          <div class="instructions">
            Scan for a celebration menu! 🎉
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
                  {qrData.venueName || qrData.cafeName}
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
                    <MenuItem value="classic">🏛️ Classic</MenuItem>
                    <MenuItem value="modern">🚀 Modern</MenuItem>
                    <MenuItem value="elegant">✨ Elegant</MenuItem>
                    <MenuItem value="minimal">⚪ Minimal</MenuItem>
                    <MenuItem value="premium">👑 Premium</MenuItem>
                    <MenuItem value="colorful">🌈 Colorful</MenuItem>
                    <MenuItem value="retro">📻 Retro</MenuItem>
                    <MenuItem value="tech">💻 Tech</MenuItem>
                    <MenuItem value="nature">🌿 Nature</MenuItem>
                    <MenuItem value="artistic">🎨 Artistic</MenuItem>
                    <MenuItem value="corporate">🏢 Corporate</MenuItem>
                    <MenuItem value="festive">🎉 Festive</MenuItem>
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
                    <Typography variant="body2">{qrData.venueName || qrData.cafeName}</Typography>
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
              Print
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeViewer;