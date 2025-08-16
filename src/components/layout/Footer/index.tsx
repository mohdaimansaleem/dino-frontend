import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  IconButton,
  Divider,
  keyframes,
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  Restaurant,
  TrackChanges,
  MenuBook,
  QrCode,
  Analytics,
  Twitter,
  Facebook,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';
import { 
  COMPANY_INFO, 
  FOOTER_FEATURES, 
  NAVIGATION 
} from '../../../data/info';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const slideInUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const wave = keyframes`
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.5); }
  50% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.8), 0 0 30px rgba(25, 118, 210, 0.6); }
`;

interface FooterProps {
  variant?: 'default' | 'minimal';
}

const Footer: React.FC<FooterProps> = ({ variant = 'default' }) => {
  const currentYear = new Date().getFullYear();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (variant === 'minimal') {
    return (
      <Box
        component="footer"
        sx={{
          background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
          color: 'white',
          py: 2,
          mt: 'auto',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
            animation: `${shimmer} 3s ease-in-out infinite`,
          }
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: 1,
            position: 'relative',
            zIndex: 1,
          }}>
            <Restaurant 
              sx={{ 
                fontSize: 20,
                animation: `${wave} 2s ease-in-out infinite`,
              }} 
            />
            <Typography 
              variant="body2" 
              sx={{ 
                textAlign: 'center',
                animation: `${slideInUp} 1s ease-out`,
              }}
            >
              {COMPANY_INFO.legal.copyright.replace('2024', currentYear.toString())}
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  const iconMap: Record<string, React.ComponentType> = {
    TrackChanges,
    MenuBook,
    QrCode,
    Analytics,
  };

  const features = FOOTER_FEATURES.map(feature => ({
    iconComponent: iconMap[feature.icon] || Restaurant,
    title: feature.title,
    description: feature.description
  }));

  return (
    <Box
      component="footer"
      sx={{
        background: `
          linear-gradient(135deg, 
            #0D47A1 0%, 
            #1565C0 25%, 
            #1976D2 50%, 
            #1565C0 75%, 
            #0D47A1 100%
          )
        `,
        color: 'white',
        py: 6,
        mt: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.05) 50%, transparent 70%)
          `,
          animation: `${shimmer} 4s ease-in-out infinite`,
        }
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: `${float} 6s ease-in-out infinite`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: '80px',
          height: '80px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: `${float} 4s ease-in-out infinite`,
          animationDelay: '2s',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
        {/* Features Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            sx={{
              textAlign: 'center',
              mb: 4,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #E3F2FD 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: `${slideInUp} 1s ease-out`,
            }}
          >
            🦕 Revolutionizing Restaurant Experience
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: `${slideInUp} 1s ease-out`,
                    animationDelay: `${index * 0.2}s`,
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-10px) scale(1.05)',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'inline-flex',
                      p: 2,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                      mb: 2,
                      animation: `${pulse} 2s ease-in-out infinite`,
                      animationDelay: `${index * 0.5}s`,
                      '& svg': {
                        fontSize: 32,
                        color: 'white'
                      }
                    }}
                  >
                    {React.createElement(feature.iconComponent)}
                  </Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />

        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box 
              sx={{ 
                animation: `${slideInUp} 1s ease-out`,
                animationDelay: '0.2s',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Restaurant 
                  sx={{ 
                    fontSize: 32, 
                    color: 'white',
                    animation: `${rotate} 10s linear infinite`,
                  }} 
                />
                <Typography variant="h5" fontWeight="bold">
                  {COMPANY_INFO.name}
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                  {COMPANY_INFO.tagline}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.9, lineHeight: 1.6 }}>
                {COMPANY_INFO.description}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {COMPANY_INFO.socialMedia.map((social, index) => {
                  const socialIconMap: Record<string, React.ComponentType> = {
                    Twitter,
                    Facebook,
                    Instagram,
                    LinkedIn,
                  };
                  
                  return (
                    <IconButton
                      key={index}
                      size="small"
                      sx={{ 
                        color: 'white',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s ease',
                        animation: `${float} 3s ease-in-out infinite`,
                        animationDelay: `${index * 0.2}s`,
                        '&:hover': { 
                          backgroundColor: social.color,
                          transform: 'scale(1.2) translateY(-5px)',
                          boxShadow: `0 10px 20px ${social.color}40`,
                        } 
                      }}
                    >
                      {React.createElement(socialIconMap[social.icon] || Restaurant)}
                    </IconButton>
                  );
                })}
              </Box>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Box 
              sx={{ 
                animation: `${slideInUp} 1s ease-out`,
                animationDelay: '0.4s',
              }}
            >
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                Platform
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {NAVIGATION.footer.platform.map((item, index) => (
                  <Link
                    key={item}
                    href="#"
                    color="inherit"
                    underline="none"
                    sx={{ 
                      opacity: 0.9,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': { 
                        opacity: 1,
                        transform: 'translateX(10px)',
                        color: '#E3F2FD',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '0',
                        height: '2px',
                        background: 'linear-gradient(90deg, #E3F2FD, transparent)',
                        transition: 'width 0.3s ease',
                      },
                      '&:hover::before': {
                        width: '20px',
                      }
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={3}>
            <Box 
              sx={{ 
                animation: `${slideInUp} 1s ease-out`,
                animationDelay: '0.6s',
              }}
            >
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                Solutions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {NAVIGATION.footer.solutions.map((item) => (
                  <Link
                    key={item}
                    href="#"
                    color="inherit"
                    underline="none"
                    sx={{ 
                      opacity: 0.9,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': { 
                        opacity: 1,
                        transform: 'translateX(10px)',
                        color: '#E3F2FD',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        left: '-10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '0',
                        height: '2px',
                        background: 'linear-gradient(90deg, #E3F2FD, transparent)',
                        transition: 'width 0.3s ease',
                      },
                      '&:hover::before': {
                        width: '20px',
                      }
                    }}
                  >
                    {item}
                  </Link>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Box 
              sx={{ 
                animation: `${slideInUp} 1s ease-out`,
                animationDelay: '0.8s',
              }}
            >
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                Get in Touch
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { icon: <LocationOn />, text: COMPANY_INFO.contact.address.full },
                  { icon: <Phone />, text: COMPANY_INFO.contact.phone.primary },
                  { icon: <Email />, text: COMPANY_INFO.contact.email.primary },
                ].map((contact, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)',
                        animation: `${pulse} 2s ease-in-out infinite`,
                        animationDelay: `${index * 0.3}s`,
                      }}
                    >
                      {React.cloneElement(contact.icon, { sx: { fontSize: 20 } })}
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.9, flex: 1 }}>
                      {contact.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            animation: `${slideInUp} 1s ease-out`,
            animationDelay: '1s',
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            {COMPANY_INFO.legal.copyright.replace('2024', currentYear.toString())}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;