import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  Schedule,
  Send,
  CheckCircle,
  Business,
  Support,
  Engineering,
} from '@mui/icons-material';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: <Phone />,
      title: 'Phone',
      details: ['+91 98765 43210', '+91 98765 43211'],
      description: 'Mon-Fri 9AM-6PM IST'
    },
    {
      icon: <Email />,
      title: 'Email',
      details: ['hello@dinoemenu.com', 'support@dinoemenu.com'],
      description: 'We reply within 24 hours'
    },
    {
      icon: <LocationOn />,
      title: 'Office',
      details: ['123 Tech Park, Sector 5', 'Hyderabad, Telangana 500032'],
      description: 'Visit us for demos'
    },
    {
      icon: <Schedule />,
      title: 'Business Hours',
      details: ['Monday - Friday: 9:00 AM - 6:00 PM', 'Saturday: 10:00 AM - 4:00 PM'],
      description: 'Sunday: Closed'
    }
  ];

  const departments = [
    {
      icon: <Business />,
      title: 'Sales',
      email: 'sales@dinoemenu.com',
      description: 'Questions about pricing, plans, and demos'
    },
    {
      icon: <Support />,
      title: 'Support',
      email: 'support@dinoemenu.com',
      description: 'Technical support and account help'
    },
    {
      icon: <Engineering />,
      title: 'Technical',
      email: 'tech@dinoemenu.com',
      description: 'API, integrations, and custom development'
    },
    {
      icon: <Business />,
      title: 'Partnerships',
      email: 'partners@dinoemenu.com',
      description: 'Business partnerships and collaborations'
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', formData);
      
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.email && formData.message;

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
            Get in Touch
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
            Have questions about Dino? We're here to help. Reach out to our team 
            and we'll get back to you as soon as possible.
          </Typography>
          
          <Chip
            label="Average Response Time: 2 hours"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontWeight: 500
            }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom fontWeight="600">
                Send us a Message
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Fill out the form below and we'll get back to you within 24 hours.
              </Typography>

              {submitted && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 3 }}
                  icon={<CheckCircle />}
                >
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company/Restaurant Name"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      multiline
                      rows={6}
                      variant="outlined"
                      placeholder="Tell us about your restaurant and how we can help..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={!isFormValid || loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                      sx={{ px: 4, py: 1.5 }}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom fontWeight="600">
                Contact Information
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Reach out to us through any of these channels.
              </Typography>

              <Grid container spacing={3}>
                {contactInfo.map((info, index) => (
                  <Grid item xs={12} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Avatar
                            sx={{
                              backgroundColor: 'primary.main',
                              mr: 2,
                              width: 40,
                              height: 40,
                            }}
                          >
                            {info.icon}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="600">
                              {info.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {info.description}
                            </Typography>
                          </Box>
                        </Box>
                        <List dense>
                          {info.details.map((detail, idx) => (
                            <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
                              <ListItemText 
                                primary={detail}
                                primaryTypographyProps={{ variant: 'body2' }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Departments */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom fontWeight="600">
              Contact by Department
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Get in touch with the right team for your specific needs
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {departments.map((dept, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease'
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        mx: 'auto',
                        mb: 2,
                        backgroundColor: 'primary.main',
                      }}
                    >
                      {dept.icon}
                    </Avatar>
                    
                    <Typography variant="h6" gutterBottom fontWeight="600">
                      {dept.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {dept.description}
                    </Typography>

                    <Button
                      variant="outlined"
                      size="small"
                      href={`mailto:${dept.email}`}
                      sx={{ fontSize: '0.8rem' }}
                    >
                      {dept.email}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" gutterBottom fontWeight="600">
            Quick Answers
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Common questions we receive
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              question: 'How quickly can I get started?',
              answer: 'You can start using Dino immediately with our free trial. Setup takes less than 15 minutes.'
            },
            {
              question: 'Do you offer training?',
              answer: 'Yes, we provide comprehensive training for all plans, including video tutorials and live sessions.'
            },
            {
              question: 'Can you integrate with my existing POS?',
              answer: 'We support integration with most popular POS systems. Contact our technical team for specific requirements.'
            },
            {
              question: 'What kind of support do you provide?',
              answer: 'We offer email support for all plans, with phone support and dedicated account managers for premium plans.'
            }
          ].map((faq, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Paper elevation={1} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom fontWeight="600">
                  {faq.question}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {faq.answer}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Map Section */}
      <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" gutterBottom fontWeight="600">
              Visit Our Office
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Schedule a demo or meet our team in person
            </Typography>
          </Box>

          <Paper
            elevation={2}
            sx={{
              p: 4,
              textAlign: 'center',
              backgroundColor: 'primary.main',
              color: 'white',
            }}
          >
            <Typography variant="h5" gutterBottom fontWeight="600">
              Dino Headquarters
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
              123 Tech Park, Sector 5<br />
              Hyderabad, Telangana 500032<br />
              India
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                }
              }}
            >
              Schedule a Visit
            </Button>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default ContactPage;