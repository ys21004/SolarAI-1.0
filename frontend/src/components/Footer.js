import React from 'react';
import { Box, Typography, Container, Grid, Link, Divider } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box sx={{ 
      bgcolor: 'primary.dark', 
      color: 'white', 
      py: 4, 
      mt: 'auto' 
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              SolarAI
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Advanced AI-powered monitoring and optimization for solar panel installations.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Features
            </Typography>
            <Box component="ul" sx={{ 
              listStyle: 'none', 
              pl: 0,
              '& li': {
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                '&::before': {
                  content: '"•"',
                  color: 'secondary.main',
                  display: 'inline-block',
                  width: '1em',
                  mr: 1
                }
              }
            }}>
              <li>Real-time panel monitoring</li>
              <li>AI maintenance predictions</li>
              <li>Performance analytics</li>
              <li>Thermal visualization</li>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2">
              Email: info@solarai.tech
            </Typography>
            <Typography variant="body2">
              Phone: (555) 123-4567
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2 
        }}>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
            &copy; {currentYear} SolarAI. All rights reserved.
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)">
            Version 1.0
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 