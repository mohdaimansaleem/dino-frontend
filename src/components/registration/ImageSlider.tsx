import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography, CircularProgress, Fade } from '@mui/material';
import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

interface SlideData {
  src: string;
  title: string;
  description: string;
}

// Generate unique timestamp for cache busting - NEW IMAGES LOADED
const cacheBreaker = Date.now() + Math.random();

const sliderImages: SlideData[] = [
  {
    src: `/img/signup_registration.jpg?v=${cacheBreaker}&t=${Math.random().toString(36)}`,
    title: 'Easy Registration',
    description: 'Get started with your restaurant management system in minutes'
  },
  {
    src: `/img/signup_order_management.jpg?v=${cacheBreaker}&t=${Math.random().toString(36)}`,
    title: 'Order Management',
    description: 'Streamline your order processing and kitchen operations'
  },
  {
    src: `/img/order_analytics.jpg?v=${cacheBreaker}&t=${Math.random().toString(36)}`,
    title: 'Analytics & Insights',
    description: 'Track performance and make data-driven decisions'
  }
];

const ImageSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [imageLoadStates, setImageLoadStates] = useState<boolean[]>(new Array(sliderImages.length).fill(false));
  const [imageErrors, setImageErrors] = useState<boolean[]>(new Array(sliderImages.length).fill(false));
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // Force reload images with cache busting
  useEffect(() => {
    setImagesLoaded(false);
    setImageLoadStates(new Array(sliderImages.length).fill(false));
    setImageErrors(new Array(sliderImages.length).fill(false));
    
    const imagePromises = sliderImages.map((image, index) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          setImageLoadStates(prev => {
            const newStates = [...prev];
            newStates[index] = true;
            return newStates;
          });
          resolve(img);
        };
        
        img.onerror = (error) => {
          setImageErrors(prev => {
            const newErrors = [...prev];
            newErrors[index] = true;
            return newErrors;
          });
          reject(error);
        };
        
        // Add refresh key to force new load
        const cacheBustedSrc = `${image.src}&refresh=${refreshKey}`;
        img.src = cacheBustedSrc;
      });
    });

    Promise.allSettled(imagePromises)
      .then(() => {
        setImagesLoaded(true);
      });
  }, [refreshKey]);

  // Auto-advance slider
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [imagesLoaded]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0f0f0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >




      {/* Loading State */}
      {!imagesLoaded && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10,
            gap: 2,
          }}
        >
          <CircularProgress size={60} sx={{ color: 'primary.main' }} />
          <Typography variant="body1" color="white" sx={{ opacity: 0.7 }}>
            Loading images...
          </Typography>
        </Box>
      )}

      {/* Main Slider Container */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100vh',
        }}
      >
        {/* Slides */}
        {sliderImages.map((image, index) => (
          <Fade
            key={`${index}-${cacheBreaker}`}
            in={currentSlide === index}
            timeout={800}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Image Container with Perfect Fit */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {imageErrors[index] ? (
                  // Fallback gradient if image fails
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(135deg, 
                        ${index === 0 ? '#667eea, #764ba2' : 
                          index === 1 ? '#f093fb, #f5576c' : 
                          '#4facfe, #00f2fe'})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    <Typography variant="h4" color="white" sx={{ opacity: 0.9, textAlign: 'center' }}>
                      {image.title}
                    </Typography>
                    <Typography variant="body1" color="white" sx={{ opacity: 0.7, textAlign: 'center', maxWidth: '80%' }}>
                      {image.description}
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    component="img"
                    src={`${image.src}&refresh=${refreshKey}`}
                    alt={image.title}
                    key={`img-${index}-${refreshKey}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center center',
                      filter: 'brightness(0.6) contrast(1.1)',
                      transition: 'all 0.8s ease-in-out',
                      transform: currentSlide === index ? 'scale(1)' : 'scale(1.05)',
                    }}
                    onError={(e) => {
                      setImageErrors(prev => {
                        const newErrors = [...prev];
                        newErrors[index] = true;
                        return newErrors;
                      });
                    }}
                  />
                )}
              </Box>
              
              {/* Multi-layer Gradient Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: `
                    linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%),
                    linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.1) 100%)
                  `,
                  zIndex: 1,
                }}
              />

              {/* Content Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 2,
                  color: 'white',
                  p: { xs: 4, md: 6, lg: 8, xl: 10 },
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.4) 70%, transparent 100%)',
                }}
              >
                <Fade in={currentSlide === index} timeout={1200}>
                  <Box>
                    <Typography
                      variant="h1"
                      component="h2"
                      fontWeight="900"
                      sx={{
                        mb: { xs: 2, md: 3, lg: 4 },
                        textShadow: '0 6px 20px rgba(0,0,0,0.9)',
                        fontSize: { xs: '1.8rem', md: '2.5rem', lg: '3rem', xl: '3.5rem' },
                        lineHeight: { xs: 1.1, md: 1.05 },
                        letterSpacing: { xs: '-0.02em', md: '-0.03em' },
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        maxWidth: { xs: '100%', md: '90%', lg: '80%' },
                      }}
                    >
                      {image.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 300,
                        textShadow: '0 4px 12px rgba(0,0,0,0.8)',
                        lineHeight: 1.4,
                        fontSize: { xs: '1rem', md: '1.2rem', lg: '1.4rem', xl: '1.6rem' },
                        maxWidth: { xs: '100%', md: '85%', lg: '75%' },
                        opacity: 0.95,
                        letterSpacing: '0.01em',
                        color: 'rgba(255, 255, 255, 0.9)',
                      }}
                    >
                      {image.description}
                    </Typography>
                  </Box>
                </Fade>
              </Box>
            </Box>
          </Fade>
        ))}
      </Box>

      {/* Navigation Arrows */}
      <IconButton
        onClick={prevSlide}
        sx={{
          position: 'absolute',
          top: '50%',
          left: { xs: 20, md: 30, lg: 40 },
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(30px)',
          color: 'white',
          zIndex: 5,
          width: { xs: 50, md: 60, lg: 70 },
          height: { xs: 50, md: 60, lg: 70 },
          border: '2px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '50%',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            transform: 'translateY(-50%) scale(1.1)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ArrowBackIos sx={{ fontSize: { xs: 22, md: 26, lg: 30 }, ml: 0.5 }} />
      </IconButton>
      
      <IconButton
        onClick={nextSlide}
        sx={{
          position: 'absolute',
          top: '50%',
          right: { xs: 20, md: 30, lg: 40 },
          transform: 'translateY(-50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(30px)',
          color: 'white',
          zIndex: 5,
          width: { xs: 50, md: 60, lg: 70 },
          height: { xs: 50, md: 60, lg: 70 },
          border: '2px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '50%',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            transform: 'translateY(-50%) scale(1.1)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <ArrowForwardIos sx={{ fontSize: { xs: 22, md: 26, lg: 30 } }} />
      </IconButton>



      {/* Progress Bar */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          zIndex: 5,
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${((currentSlide + 1) / sliderImages.length) * 100}%`,
            backgroundColor: 'primary.main',
            transition: 'width 0.5s ease-in-out',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          }}
        />
      </Box>
    </Box>
  );
};

export default ImageSlider;