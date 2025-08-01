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

import { 
  CONTACT_INFO, 
  CONTACT_DEPARTMENTS, 
  FAQS,
  COMPANY_INFO 
} from '../data/info';

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

  // Transform contact info for display
  const contactInfo = CONTACT_INFO.map(info => ({
    icon: React.createElement(info.icon),
    title: info.title,
    details: info.details,
    description: info.description
  }));

  // Transform departments for display
  const departments = CONTACT_DEPARTMENTS.map(dept => ({
    icon: React.createElement(dept.icon),
    title: dept.title,
    email: dept.email,
    description: dept.description
  }));

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
          {FAQS.slice(5, 9).map((faq, index) => (
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
              {COMPANY_INFO.name} Headquarters
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
              {COMPANY_INFO.contact.address.street}<br />
              {COMPANY_INFO.contact.address.city}, {COMPANY_INFO.contact.address.state} {COMPANY_INFO.contact.address.pincode}<br />
              {COMPANY_INFO.contact.address.country}
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