import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
  alpha,
} from '@mui/material';
import {
  ExitToApp,
  Warning,
} from '@mui/icons-material';

interface LogoutConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName?: string;
}

const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  userName,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
          overflow: 'visible',
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pb: 1,
          pt: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${alpha(theme.palette.warning.main, 0.2)}`,
            }}
          >
            <Warning
              sx={{
                fontSize: 32,
                color: 'warning.main',
              }}
            />
          </Box>
          <Typography
            variant="h5"
            fontWeight={600}
            color="text.primary"
            sx={{ mt: 1 }}
          >
            Confirm Logout
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', px: 3, py: 2 }}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 2, lineHeight: 1.6 }}
        >
          Are you sure you want to logout{userName ? ` as ${userName}` : ''}?
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.875rem' }}
        >
          You will need to sign in again to access your account.
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: 'center',
          gap: 2,
          px: 3,
          pb: 3,
          pt: 1,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          size="large"
          sx={{
            minWidth: 120,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'text.secondary',
              backgroundColor: alpha(theme.palette.text.primary, 0.04),
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          size="large"
          startIcon={<ExitToApp />}
          sx={{
            minWidth: 120,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
            '&:hover': {
              boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          }}
        >
          Logout
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutConfirmationModal;