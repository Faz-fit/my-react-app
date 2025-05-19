import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';

const LoginPage = () => {
  const accounts = {
    Admin: { username: 'adminuser', password: 'adminpass123' },
    manager: { username: 'manageruser', password: 'managerpass123' },
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Autofill admin creds by default
  useEffect(() => {
    setUsername(accounts.Admin.username);
    setPassword(accounts.Admin.password);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      console.log('Trying login with:', username, password);

      if (
        username === accounts.Admin.username &&
        password === accounts.Admin.password
      ) {
        console.log('Admin login triggered');
        localStorage.setItem('auth', 'true');
        localStorage.setItem('role', 'Admin');
        navigate('/Admindashboard');
        window.location.reload();  // force reload to update auth state
      } else if (
        username === accounts.manager.username &&
        password === accounts.manager.password
      ) {
        console.log('Manager login triggered');
        localStorage.setItem('auth', 'true');
        localStorage.setItem('role', 'manager');
        const outlets = ['outlet1']; // simulate outlets

        // const role = decoded.role;
        const role = 'manager';
        const getUserDetails = async () => {
          try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://arunalusupermarket.shop:3000/api/user/', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const outlets = response.data.outlets;
            console.log('User outlets:', outlets);

            if (role === 'Admin') {
              navigate('/Admindashboard');
            } else if (role === 'manager') {
              if (outlets.length === 1) {
                localStorage.setItem('outlet', outlets[0]); // Consider using JSON.stringify
                navigate('/dashboard');
              } else {
                localStorage.setItem('outletList', JSON.stringify(outlets));
                navigate('/select-outlet');
              }
            } else {
              setError('Unknown role');
            }

          } catch (error) {
            console.error('Failed to get user details:', error);
          }
        };
        getUserDetails();
      }
      setLoading(false);
    }, 1000);
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

        <Box
          sx={{
            width: '55%',
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" align="center" fontWeight="bold" sx={{ mb: 4 }}>
            Welcome!
          </Typography>

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              variant="outlined"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
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
              disabled={loading}
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
