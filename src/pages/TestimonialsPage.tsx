import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Paper,
  Chip,
  Button,
} from '@mui/material';
import {
  Restaurant,

  FormatQuote,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  TESTIMONIALS, 
  TESTIMONIAL_STATS, 
  SUCCESS_STORIES 
} from '../data/info';

const TestimonialsPage: React.FC = () => {
  const navigate = useNavigate();

  const testimonials = TESTIMONIALS;

  // Transform stats for display
  const stats = TESTIMONIAL_STATS.map(stat => ({
    number: stat.number,
    label: stat.label,
    icon: React.createElement(stat.icon, { sx: { fontSize: 40, color: 'primary.main' } })
  }));

  const successStories = SUCCESS_STORIES;

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Basic':
        return 'info';
      case 'Premium':
        return 'primary';
      case 'Enterprise':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          backgroundColor: 'primary.main',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" gutterBottom fontWeight="bold">
            Success Stories
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
            See how restaurants across India are transforming their business with Dino
          </Typography>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    backgroundColor: 'transparent',
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  {stat.number}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Grid */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom fontWeight="600">
              What Our Customers Say
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Real feedback from real restaurant owners
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={6} key={testimonial.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease'
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                      <Chip
                        label={testimonial.plan}
                        color={getPlanColor(testimonial.plan) as any}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        src={testimonial.avatar}
                        sx={{ width: 64, height: 64, mr: 2 }}
                      >
                        {testimonial.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight="600">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.position}, {testimonial.restaurant}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {testimonial.location}
                        </Typography>
                      </Box>
                    </Box>

                    <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />

                    <Box sx={{ position: 'relative', mb: 3 }}>
                      <FormatQuote
                        sx={{
                          position: 'absolute',
                          top: -8,
                          left: -8,
                          fontSize: 32,
                          color: 'primary.main',
                          opacity: 0.3
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{ fontStyle: 'italic', pl: 2 }}
                      >
                        "{testimonial.quote}"
                      </Typography>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            {testimonial.metrics.orderIncrease}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Order Increase
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="bold" color="primary.main">
                            {testimonial.metrics.timeReduction}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Time Saved
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h6" fontWeight="bold" color="warning.main">
                            {testimonial.metrics.customerSatisfaction}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Satisfaction
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Success Stories */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" gutterBottom fontWeight="600">
            Success Stories
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Detailed case studies of transformation
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {successStories.map((story, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  overflow: 'hidden',
                  height: '100%',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                <Box
                  sx={{
                    height: 200,
                    backgroundColor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Restaurant sx={{ fontSize: 64, color: 'grey.400' }} />
                </Box>
                <Box sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    {story.title}
                  </Typography>
                  <Typography variant="subtitle2" color="primary.main" gutterBottom>
                    {story.restaurant}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {story.story}
                  </Typography>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom fontWeight="600">
                      Key Results:
                    </Typography>
                    {story.results.map((result, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary">
                        • {result}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ py: 10, backgroundColor: 'primary.main', color: 'white', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom fontWeight="600">
            Ready to Write Your Success Story?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join hundreds of restaurants that have transformed their business with Dino
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'grey.100',
                }
              }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/contact')}
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Contact Sales
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default TestimonialsPage;