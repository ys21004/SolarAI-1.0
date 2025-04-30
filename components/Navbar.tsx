import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Link from 'next/link';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          SolarAI
        </Typography>
        <Box>
          <Link href="/" passHref>
            <Button color="inherit">Home</Button>
          </Link>
          <Link href="/dashboard" passHref>
            <Button color="inherit">Dashboard</Button>
          </Link>
          <Link href="/analytics" passHref>
            <Button color="inherit">Analytics</Button>
          </Link>
          <Link href="/solar-maintenance" passHref>
            <Button color="inherit">AI Maintenance Check</Button>
          </Link>
          <Link href="/settings" passHref>
            <Button color="inherit">Settings</Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 