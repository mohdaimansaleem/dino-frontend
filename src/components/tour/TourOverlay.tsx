import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  ArrowBack,
  ArrowForward,
  SkipNext,
  CheckCircle,
} from '@mui/icons-material';
import { useTour } from '../../contexts/TourContext';

interface TourOverlayProps {
  className?: string;
}

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

const TourOverlay: React.FC<TourOverlayProps> = ({ className }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const {
    isActive,
    currentStep,
    steps,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
  } = useTour();

  const [highlightPosition, setHighlightPosition] = useState<HighlightPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  // Update highlight position when step changes
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(currentStepData.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        const position: HighlightPosition = {
          top: rect.top + scrollTop,
          left: rect.left + scrollLeft,
          width: rect.width,
          height: rect.height,
        };

        setHighlightPosition(position);

        // Calculate tooltip position based on placement
        let tooltipTop = position.top + position.height + 20;
        let tooltipLeft = position.left + position.width / 2 - 200;

        // Adjust for different placements
        switch (currentStepData.placement) {
          case 'top':
            tooltipTop = position.top - 320; // Tooltip height + margin
            break;
          case 'bottom':
            tooltipTop = position.top + position.height + 20;
            break;
          case 'left':
            tooltipTop = position.top + position.height / 2 - 150;
            tooltipLeft = position.left - 420;
            break;
          case 'right':
            tooltipTop = position.top + position.height / 2 - 150;
            tooltipLeft = position.left + position.width + 20;
            break;
          case 'center':
            tooltipTop = window.innerHeight / 2 - 150 + scrollTop;
            tooltipLeft = window.innerWidth / 2 - 200;
            break;
        }

        // Ensure tooltip stays within viewport
        tooltipLeft = Math.max(20, Math.min(
          window.innerWidth - (isMobile ? window.innerWidth - 40 : 420),
          tooltipLeft
        ));

        tooltipTop = Math.max(20, Math.min(
          window.innerHeight + scrollTop - 320,
          tooltipTop
        ));

        setTooltipPosition({ top: tooltipTop, left: tooltipLeft });

        // Scroll element into view with delay
        setTimeout(() => {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
        }, 100);
      } else {
        console.warn(`Tour target element not found: ${currentStepData.target}`);
      }
    };

    // Initial position update with delay to ensure DOM is ready
    const timer = setTimeout(updatePosition, 100);

    // Update position on window resize or scroll
    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isActive, currentStep, currentStepData, isMobile]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          skipTour();
          break;
        case 'ArrowRight':
        case 'Enter':
          event.preventDefault();
          if (isLastStep) {
            completeTour();
          } else {
            nextStep();
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (currentStep > 0) {
            previousStep();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, currentStep, nextStep, previousStep, skipTour, completeTour, isLastStep]);

  // Don't render if tour is not active or missing data
  if (!isActive || !currentStepData) {
    return null;
  }

  const overlayContent = (
    <Box 
      className={className}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {/* Dark backdrop with cutout */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(1px)',
        }}
      />

      {/* Highlight cutout */}
      {highlightPosition && (
        <Box
          sx={{
            position: 'absolute',
            top: `${highlightPosition.top - 8}px`,
            left: `${highlightPosition.left - 8}px`,
            width: `${highlightPosition.width + 16}px`,
            height: `${highlightPosition.height + 16}px`,
            border: '3px solid',
            borderColor: 'primary.main',
            borderRadius: 2,
            backgroundColor: 'white',
            boxShadow: `
              0 0 0 8px rgba(255, 255, 255, 0.1),
              0 0 20px rgba(0, 0, 0, 0.3),
              inset 0 0 0 3px ${theme.palette.primary.main}
            `,
            animation: 'tourPulse 2s infinite',
            '@keyframes tourPulse': {
              '0%': {
                boxShadow: `
                  0 0 0 0 ${theme.palette.primary.main}40,
                  0 0 20px rgba(0, 0, 0, 0.3),
                  inset 0 0 0 3px ${theme.palette.primary.main}
                `,
              },
              '70%': {
                boxShadow: `
                  0 0 0 10px ${theme.palette.primary.main}00,
                  0 0 20px rgba(0, 0, 0, 0.3),
                  inset 0 0 0 3px ${theme.palette.primary.main}
                `,
              },
              '100%': {
                boxShadow: `
                  0 0 0 0 ${theme.palette.primary.main}00,
                  0 0 20px rgba(0, 0, 0, 0.3),
                  inset 0 0 0 3px ${theme.palette.primary.main}
                `,
              },
            },
          }}
        />
      )}

      {/* Tour tooltip */}
      {tooltipPosition && (
        <Fade in={true} timeout={300}>
          <Paper
            elevation={16}
            sx={{
              position: 'absolute',
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              width: isMobile ? 'calc(100vw - 40px)' : '400px',
              maxWidth: 'calc(100vw - 40px)',
              pointerEvents: 'auto',
              borderRadius: 3,
              overflow: 'hidden',
              border: '2px solid',
              borderColor: 'primary.main',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Progress bar */}
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'primary.main',
                },
              }}
            />

            {/* Header */}
            <Box
              sx={{
                p: 2,
                pb: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                backgroundColor: 'primary.50',
                borderBottom: '1px solid',
                borderColor: 'primary.100',
              }}
            >
              <Box sx={{ flex: 1, mr: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'primary.main',
                    mb: 0.5,
                    lineHeight: 1.3,
                  }}
                >
                  {currentStepData.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}
                >
                  Step {currentStep + 1} of {steps.length}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={skipTour}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'error.50',
                    color: 'error.main',
                  },
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: 3, pt: 2 }}>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  lineHeight: 1.6,
                  mb: 3,
                  fontSize: '0.95rem',
                }}
              >
                {currentStepData.content}
              </Typography>

              {/* Action buttons */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                }}
              >
                {/* Previous button */}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ArrowBack />}
                  onClick={previousStep}
                  disabled={currentStep === 0}
                  sx={{
                    minWidth: 'auto',
                    px: 2,
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'primary.50',
                    },
                    '&:disabled': {
                      borderColor: 'divider',
                      color: 'text.disabled',
                    },
                  }}
                >
                  Back
                </Button>

                <Box sx={{ 
                  display: 'flex', 
                  gap: 1,
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                  justifyContent: 'flex-end',
                  flex: 1,
                }}>
                  {/* Skip button */}
                  {currentStepData.showSkip !== false && (
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<SkipNext />}
                      onClick={skipTour}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: 'grey.100',
                        },
                      }}
                    >
                      Skip Tour
                    </Button>
                  )}

                  {/* Next/Complete button */}
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={isLastStep ? <CheckCircle /> : <ArrowForward />}
                    onClick={isLastStep ? completeTour : nextStep}
                    sx={{
                      minWidth: 'auto',
                      px: 3,
                      fontWeight: 600,
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    {isLastStep ? 'Complete' : currentStepData.nextButtonText || 'Next'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}
    </Box>
  );

  // Render in portal to ensure it's on top of everything
  return createPortal(overlayContent, document.body);
};

export default TourOverlay;