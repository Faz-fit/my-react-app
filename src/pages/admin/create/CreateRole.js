import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Snackbar } from '@mui/material';
import axios from 'axios';

const CreateRolePage = () => {
  const [roleName, setRoleName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleInputChange = (event) => {
    setRoleName(event.target.value);
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!roleName.trim()) {
      setError('Role name is required.');
      return;
    }

    setLoading(true);

    // Get the Bearer token from localStorage (or sessionStorage, or context)
    const token = localStorage.getItem('access_token'); // Modify this based on where your token is stored

    if (!token) {
      setError('No authorization token found.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://139.59.243.2:8000/api/create-role/',
        { name: roleName },
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Add Bearer token to the headers
          },
        }
      );
      setSuccessMessage(response.data.message); // Show success message
      setRoleName(''); // Clear the input field
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.error); // Show error message from API
      } else {
        setError('Failed to create role. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5, padding: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Create New Role</Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Role Name"
          variant="outlined"
          fullWidth
          value={roleName}
          onChange={handleInputChange}
          error={!!error}
          helperText={error || ''}
          sx={{ mb: 2 }}
          required
        />
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mb: 2 }}
          disabled={loading}
        >
          {loading ? 'Creating Role...' : 'Create Role'}
        </Button>
      </form>

      {successMessage && (
        <Snackbar
          open={true}
          autoHideDuration={4000}
          onClose={() => setSuccessMessage('')}
          message={successMessage}
        />
      )}
    </Box>
  );
};

export default CreateRolePage;
