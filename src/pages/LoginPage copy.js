import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from '@mui/material';
import { loginUser } from '../utils/auth.js';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear any previous error
    setLoading(true);

    // Call the loginUser function
    const { success, message, token, role, refresh, outlets } = await loginUser(username, password);
    
    setLoading(false); // Stop loading spinner

    if (success) {
      // Store tokens, role, and outlets in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refresh', refresh);
      localStorage.setItem('role', role);
      
      // Handle navigation based on the role
      if (role === 'admin') {
        navigate('/Admindashboard'); // Admin dashboard
      } else if (role === 'manager') {
        if (outlets.length === 1) {
          localStorage.setItem('outlet', outlets[0]); // Only one outlet, set it
          navigate('/dashboard'); // Manager dashboard
        } else {
          localStorage.setItem('outletList', JSON.stringify(outlets)); // Multiple outlets, select one
          navigate('/select-outlet');
        }
      } else {
        setErrorMessage('Unknown role');
      }
    } else {
      setErrorMessage(message); // Display error message
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

          {errorMessage && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {errorMessage}
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
}

export default LoginPage;
