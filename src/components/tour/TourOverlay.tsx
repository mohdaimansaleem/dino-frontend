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
      // Handle center placement (no highlighting)
      if (currentStepData.target === 'center' || currentStepData.placement === 'center') {
        setHighlightPosition(null);
        setTooltipPosition({
          top: window.innerHeight / 2 - 150 + (window.pageYOffset || document.documentElement.scrollTop),
          left: window.innerWidth / 2 - 200
        });
        return;
      }

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
          default:
            // This handles 'center' and any other cases
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
        console.warn(`🚫 Tour target element not found: ${currentStepData.target}`);
        console.log('🔍 Available elements with data-tour attributes:', 
          Array.from(document.querySelectorAll('[data-tour]')).map(el => el.getAttribute('data-tour')));
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
  console.log('🎭 TourOverlay render check:', {
    isActive,
    hasCurrentStepData: !!currentStepData,
    currentStep,
    totalSteps: steps.length,
    currentStepData
  });

  if (!isActive || !currentStepData) {
    console.log('🚫 TourOverlay not rendering:', { isActive, hasCurrentStepData: !!currentStepData });
    return null;
  }

  console.log('✅ TourOverlay rendering with step:', currentStepData.title);

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
      {/* Modern backdrop with blur and cutout */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 100%)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          ...(highlightPosition && {
            clipPath: `polygon(
              0% 0%, 
              0% 100%, 
              ${highlightPosition.left - 8}px 100%, 
              ${highlightPosition.left - 8}px ${highlightPosition.top - 8}px, 
              ${highlightPosition.left + highlightPosition.width + 8}px ${highlightPosition.top - 8}px, 
              ${highlightPosition.left + highlightPosition.width + 8}px ${highlightPosition.top + highlightPosition.height + 8}px, 
              ${highlightPosition.left - 8}px ${highlightPosition.top + highlightPosition.height + 8}px, 
              ${highlightPosition.left - 8}px 100%, 
              100% 100%, 
              100% 0%
            )`,
          }),
        }}
      />

      {/* Blue outline highlight */}
      {highlightPosition && (
        <Box
          sx={{
            position: 'absolute',
            top: `${highlightPosition.top - 4}px`,
            left: `${highlightPosition.left - 4}px`,
            width: `${highlightPosition.width + 8}px`,
            height: `${highlightPosition.height + 8}px`,
            borderRadius: 2,
            border: '3px solid',
            borderColor: theme.palette.primary.main,
            background: 'transparent',
            pointerEvents: 'none',
            boxShadow: `
              0 0 0 2px rgba(255, 255, 255, 0.8),
              0 0 20px ${theme.palette.primary.main}60,
              0 4px 20px rgba(0, 0, 0, 0.1)
            `,
            animation: 'tourPulse 2s ease-in-out infinite',
            '@keyframes tourPulse': {
              '0%': {
                transform: 'scale(1)',
                borderColor: theme.palette.primary.main,
                boxShadow: `
                  0 0 0 2px rgba(255, 255, 255, 0.8),
                  0 0 20px ${theme.palette.primary.main}60,
                  0 4px 20px rgba(0, 0, 0, 0.1)
                `,
              },
              '50%': {
                transform: 'scale(1.02)',
                borderColor: theme.palette.primary.light,
                boxShadow: `
                  0 0 0 3px rgba(255, 255, 255, 0.9),
                  0 0 30px ${theme.palette.primary.main}80,
                  0 6px 25px rgba(0, 0, 0, 0.15)
                `,
              },
              '100%': {
                transform: 'scale(1)',
                borderColor: theme.palette.primary.main,
                boxShadow: `
                  0 0 0 2px rgba(255, 255, 255, 0.8),
                  0 0 20px ${theme.palette.primary.main}60,
                  0 4px 20px rgba(0, 0, 0, 0.1)
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
            elevation={0}
            sx={{
              position: 'absolute',
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              width: isMobile ? 'calc(100vw - 40px)' : '420px',
              maxWidth: 'calc(100vw - 40px)',
              pointerEvents: 'auto',
              borderRadius: 4,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.15),
                0 8px 25px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.8)
              `,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}40, transparent)`,
              },
            }}
          >
            {/* Modern progress bar */}
            <Box sx={{ position: 'relative', height: 6, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  borderRadius: '0 3px 3px 0',
                  transition: 'width 0.3s ease-in-out',
                  boxShadow: `0 0 10px ${theme.palette.primary.main}40`,
                }}
              />
            </Box>

            {/* Modern header */}
            <Box
              sx={{
                p: 3,
                pb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Box sx={{ flex: 1, mr: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
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
            <Box sx={{ p: 3, pt: 2.5 }}>
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

                  {/* Modern Next/Complete button */}
                  <Button
                    variant="contained"
                    size="medium"
                    endIcon={isLastStep ? <CheckCircle /> : <ArrowForward />}
                    onClick={isLastStep ? completeTour : nextStep}
                    sx={{
                      minWidth: 'auto',
                      px: 4,
                      py: 1,
                      fontWeight: 600,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      boxShadow: `0 4px 15px ${theme.palette.primary.main}40`,
                      textTransform: 'none',
                      fontSize: '0.95rem',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                        boxShadow: `0 6px 20px ${theme.palette.primary.main}50`,
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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