import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://arunalusupermarket.shop:3000/api/token/', {
        username,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        const decoded = JSON.parse(atob(response.data.access.split('.')[1]));
        const role = decoded.role;
        const outlets = decoded.outlets || [];

        if (role === 'admin') {
          navigate('/Admindashboard');
        } else if (role === 'manager') {
          if (outlets.length === 1) {
            localStorage.setItem('outlet', outlets[0]);
            navigate('/dashboard');
          } else {
            localStorage.setItem('outletList', JSON.stringify(outlets));
            navigate('/select-outlet');
          }
        } else {
          setError('Unknown role');
        }
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      console.error(error);
    }
    setLoading(false);
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
        {/* Left Side - Logo */}
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

        {/* Right Side - Form */}
        <Box
          sx={{
            width: '55%',
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" align="center" fontWeight="bold">
            Welcome!
          </Typography>

          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              variant="outlined"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              variant="outlined"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 3,
                backgroundColor: '#e6b904',
                color: '#000',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#d1a803',
                },
                borderRadius: 2,
                py: 1.5,
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
