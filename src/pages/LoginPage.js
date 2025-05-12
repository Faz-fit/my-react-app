import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://arunalusupermarket.shop:3000/api/token/', {
        username,
        password,
      });

      if (response.status === 200) {
        // Store tokens in localStorage
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Decode the JWT access token to get the role and outlets information
        const decoded = JSON.parse(atob(response.data.access.split('.')[1]));
        const role = decoded.role;  // Assuming the role is part of the JWT payload
        const outlets = decoded.outlets || []; // Assuming outlets are part of the JWT payload

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
          setError('Unknown role');
        }
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
      console.error(error); // Log the actual error for debugging
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default LoginPage;
