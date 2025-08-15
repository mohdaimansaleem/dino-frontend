import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  itemName: string;
  itemType: string;
  description?: string;
  loading?: boolean;
  additionalWarnings?: string[];
  requireTyping?: boolean;
  customConfirmText?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  description,
  loading = false,
  additionalWarnings = [],
  requireTyping = true,
  customConfirmText = 'delete',
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setConfirmText('');
      setIsDeleting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (requireTyping && confirmText.toLowerCase() !== customConfirmText.toLowerCase()) {
      return;
    }

    try {
      setIsDeleting(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Delete operation failed:', error);
      // Error handling is done by the parent component
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting && !loading) {
      onClose();
    }
  };

  const isConfirmDisabled = requireTyping 
    ? confirmText.toLowerCase() !== customConfirmText.toLowerCase() || isDeleting || loading
    : isDeleting || loading;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: 'error.50',
              color: 'error.main',
            }}
          >
            <WarningIcon sx={{ fontSize: 20 }} />
          </Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {title}
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={isDeleting || loading}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
            Are you sure you want to delete {itemType}{' '}
            <Chip
              label={itemName}
              size="small"
              sx={{
                backgroundColor: 'error.50',
                color: 'error.main',
                fontWeight: 600,
                mx: 0.5,
              }}
            />
            ?
          </Typography>

          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>
          )}

          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={500}>
              This action cannot be undone!
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              All data associated with this {itemType} will be permanently removed.
            </Typography>
          </Alert>

          {additionalWarnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                Additional considerations:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {additionalWarnings.map((warning, index) => (
                  <Typography
                    key={index}
                    component="li"
                    variant="body2"
                    sx={{ mb: 0.5 }}
                  >
                    {warning}
                  </Typography>
                ))}
              </Box>
            </Alert>
          )}
        </Box>

        {requireTyping && (
          <Box>
            <Typography variant="body2" color="text.primary" sx={{ mb: 1.5 }}>
              To confirm deletion, please type{' '}
              <Typography
                component="span"
                variant="body2"
                fontWeight={700}
                sx={{
                  backgroundColor: 'grey.100',
                  px: 1,
                  py: 0.25,
                  borderRadius: 0.5,
                  fontFamily: 'monospace',
                }}
              >
                {customConfirmText}
              </Typography>{' '}
              below:
            </Typography>
            <TextField
              fullWidth
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${customConfirmText}" to confirm`}
              disabled={isDeleting || loading}
              error={requireTyping && confirmText.length > 0 && confirmText.toLowerCase() !== customConfirmText.toLowerCase()}
              helperText={
                requireTyping && confirmText.length > 0 && confirmText.toLowerCase() !== customConfirmText.toLowerCase()
                  ? `Please type "${customConfirmText}" exactly`
                  : ''
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused': {
                    '& fieldset': {
                      borderColor: confirmText.toLowerCase() === customConfirmText.toLowerCase() 
                        ? 'success.main' 
                        : 'error.main',
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          gap: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isDeleting || loading}
          variant="outlined"
          sx={{
            minWidth: 100,
            textTransform: 'none',
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          variant="contained"
          color="error"
          startIcon={
            isDeleting || loading ? undefined : <DeleteIcon sx={{ fontSize: 18 }} />
          }
          sx={{
            minWidth: 120,
            textTransform: 'none',
            fontWeight: 600,
            '&:disabled': {
              backgroundColor: 'action.disabledBackground',
              color: 'action.disabled',
            },
          }}
        >
          {isDeleting || loading ? 'Deleting...' : `Delete ${itemType}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationModal;