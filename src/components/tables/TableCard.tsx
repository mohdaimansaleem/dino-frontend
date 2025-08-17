import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  QrCode,
  Print,
  People
} from '@mui/icons-material';

interface TableCardProps {
  table: any;
  getAreaName: (areaId: string) => string;
  getAreaColor: (areaId: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactElement;
  onToggleTableStatus: (tableId: string) => void;
  onGenerateQR: (tableId: string) => void;
  onPrintQR: (tableId: string) => void;
  onEditTable: (table: any) => void;
  onDeleteTable: (tableId: string) => void;
  isMobile?: boolean;
}

const TableCard: React.FC<TableCardProps> = ({
  table,
  getAreaName,
  getAreaColor,
  getStatusColor,
  getStatusIcon,
  onToggleTableStatus,
  onGenerateQR,
  onPrintQR,
  onEditTable,
  onDeleteTable,
  isMobile = false
}) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid', 
        borderColor: 'grey.200',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        borderLeft: `4px solid ${getAreaColor(table.location || '')}`,
        opacity: table.is_active ? 1 : 0.6,
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': { 
          borderColor: 'primary.main',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ 
        p: 2, 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: 180
      }}>
        {/* Header */}
        <Stack 
          direction="row"
          justifyContent="space-between" 
          alignItems="flex-start" 
          spacing={1}
          sx={{ mb: 1.5 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              fontWeight="700" 
              color="text.primary"
              noWrap
              sx={{ 
                fontSize: '1rem',
                letterSpacing: '-0.01em',
                mb: 0.25
              }}
            >
              Table {table.table_number}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              noWrap
              sx={{ fontSize: '0.75rem' }}
            >
              {getAreaName(table.location || '')}
            </Typography>
          </Box>
          
          <Tooltip title={table.is_active ? 'Deactivate' : 'Activate'}>
            <IconButton 
              size="small" 
              onClick={() => onToggleTableStatus(table.id)}
              sx={{ 
                color: table.is_active ? 'success.main' : 'text.disabled',
                width: 28,
                height: 28
              }}
            >
              {table.is_active ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Content */}
        <Stack spacing={1} sx={{ flexGrow: 1 }}>
          {/* Capacity */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1.25,
              backgroundColor: 'grey.50',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'grey.100'
            }}
          >
            <People sx={{ fontSize: 16, color: 'primary.main' }} />
            <Typography variant="body2" color="text.primary" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
              {table.capacity} people
            </Typography>
          </Box>

          {/* Status */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              p: 1.25,
              backgroundColor: 'grey.50',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'grey.100'
            }}
          >
            {React.cloneElement(getStatusIcon(table.table_status || table.status), { 
              sx: { fontSize: 16, color: getStatusColor(table.table_status || table.status) === 'success' ? 'success.main' : 
                                   getStatusColor(table.table_status || table.status) === 'error' ? 'error.main' :
                                   getStatusColor(table.table_status || table.status) === 'warning' ? 'warning.main' : 'primary.main' }
            })}
            <Chip 
              label={(table.table_status || table.status).charAt(0).toUpperCase() + (table.table_status || table.status).slice(1)}
              size="small"
              color={getStatusColor(table.table_status || table.status) as any}
              sx={{ 
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                height: 20,
                '& .MuiChip-label': { px: 1 }
              }}
            />
          </Box>

          {/* Description */}
          {table.description && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.75rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3
              }}
            >
              {table.description}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        {/* Actions */}
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Stack direction="row" spacing={0.75}>
            <Tooltip title="Generate QR Code">
              <IconButton 
                size="small" 
                onClick={() => onGenerateQR(table.id)}
                sx={{ 
                  color: 'primary.main',
                  backgroundColor: 'primary.50',
                  border: '1px solid',
                  borderColor: 'primary.200',
                  width: 32,
                  height: 32,
                  '&:hover': { 
                    backgroundColor: 'primary.100',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <QrCode sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print QR Code">
              <IconButton 
                size="small" 
                onClick={() => onPrintQR(table.id)}
                sx={{ 
                  color: 'text.secondary',
                  backgroundColor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  width: 32,
                  height: 32,
                  '&:hover': { 
                    backgroundColor: 'grey.200',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Print sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={0.75}>
            <Tooltip title="Edit Table">
              <IconButton 
                size="small" 
                onClick={() => onEditTable(table)}
                sx={{ 
                  color: 'text.secondary',
                  backgroundColor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  width: 32,
                  height: 32,
                  '&:hover': { 
                    backgroundColor: 'grey.200',
                    color: 'primary.main',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Edit sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Table">
              <IconButton 
                size="small" 
                onClick={() => onDeleteTable(table.id)}
                sx={{ 
                  color: 'text.secondary',
                  backgroundColor: 'grey.100',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  width: 32,
                  height: 32,
                  '&:hover': { 
                    backgroundColor: 'error.50',
                    color: 'error.main',
                    borderColor: 'error.200',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                <Delete sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default TableCard;