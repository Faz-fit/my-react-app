import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginUser = async (username, password, deviceType) => {
    try {
      const response = await axios.post('http://139.59.243.2:8000/api/token/', {
        username,
        password,
        device_type: deviceType,  // Added device type
      });
      return response.data;
    } catch (err) {
      throw new Error('Login failed. Please check your credentials.');
    }
  };


  const fetchUserDetails = async (token) => {
    try {
      const response = await axios.get('http://139.59.243.2:8000/api/user/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      throw new Error('Failed to get user details');
    }
  };

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const deviceType = "web";  // Add this line to define the device type as web


    if (!username || !password) {
      setError('Both fields are required.');
      setLoading(false);
      return;
    }

    try {
      const { access, refresh } = await loginUser(username, password, deviceType);  // Pass deviceType
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      const decoded = jwtDecode(access);
      const { role } = decoded;

      const userDetails = await fetchUserDetails(access);
      const { outlets } = userDetails;

      handleRoleBasedNavigation(role, outlets);

      // After successful login, perform a hard refresh
      window.location.reload();  // Force the page to reload

    } catch (err) {
      setError(err.message);
      console.error(err);
    }
    setLoading(false);
  };

  const handleRoleBasedNavigation = (role, outlets) => {
    const roleBasedRedirect = {
      Admin: '/Admindashboard',
      Manager: outlets.length === 1 ? '/dashboard' : '/select-outlet',
      //Manager: '/dashboard' ,

    };

    const navigateToRolePage = roleBasedRedirect[role] || '/';
    navigate(navigateToRolePage);
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
        <Box sx={{ width: '45%', backgroundColor: '#f8f8f8' }} >
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
              marginTop: 15,
              marginLeft:6,
              alignItems: 'center',
            }}
          >
            <img
              src="/logo.png"
              alt="Logo"
              style={{ width: '70%', height: '70%', objectFit: 'fill' }}
            />
          </Box>
        </Box>

        <Box sx={{ width: '55%', p: 6, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="h4" align="center" fontWeight="bold">Welcome!</Typography>

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
              required
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
                '&:hover': { backgroundColor: '#d1a803' },
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
