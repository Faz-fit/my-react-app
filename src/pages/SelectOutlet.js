// src/pages/SelectOutlet.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material';

function SelectOutlet() {
  const navigate = useNavigate();
  const outlets = JSON.parse(localStorage.getItem('outletList') || '[]');
  const [selectedOutlet, setSelectedOutlet] = useState('');

  const handleSubmit = () => {
    if (selectedOutlet) {
      localStorage.setItem('outlet', selectedOutlet);
      navigate('/dashboard');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundImage: 'url("/bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Cal Sans', sans-serif",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          borderRadius: 4,
          width: '1000px',
          height: '600px',
          display: 'flex',
          overflow: 'hidden',
          boxShadow: '0px 20px 40px rgba(0,0,0,0.25)',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Left Side: Logo */}
        <Box
          sx={{
            width: '45%',
            backgroundColor: '#f8f8f8',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: 320,
              height: 320,
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0px 6px 20px rgba(0,0,0,0.2)',
              backgroundColor: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: '70%', height: '70%', objectFit: 'contain' }}
            />
          </Box>
        </Box>

        {/* Right Side: Form */}
        <Box
          sx={{
            width: '55%',
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
            Select an Outlet
          </Typography>

          <FormControl fullWidth sx={{ mt: 4 }}>
            <InputLabel>Outlet</InputLabel>
            <Select
              value={selectedOutlet}
              label="Outlet"
              onChange={(e) => setSelectedOutlet(e.target.value)}
              required
              sx={{
                backgroundColor: '#fafafa',
                borderRadius: 2,
              }}
            >
              {outlets.map((outlet, index) => (
                <MenuItem key={index} value={outlet}>
                  {outlet}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 4,
              backgroundColor: '#e6b904',
              color: '#000',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#d1a803',
              },
              borderRadius: 2,
              py: 1.5,
            }}
            onClick={handleSubmit}
            disabled={!selectedOutlet}
          >
            Continue to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default SelectOutlet;
