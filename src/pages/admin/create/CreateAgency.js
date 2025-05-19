// src/pages/admin/create/CreateAgency.js
import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';
import api from 'utils/api';

const CreateAgency = () => {
  const [form, setForm] = useState({ name: '', address: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/api/agencies/create', form);
      alert('Agency created successfully!');
      console.log(response.data);
      setForm({ name: '', address: '' });
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError('Failed to create agency');
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Agency Name"
          name="name"
          fullWidth
          margin="normal"
          value={form.name}
          onChange={handleChange}
          required
        />

        <TextField
          label="Address"
          name="address"
          fullWidth
          margin="normal"
          value={form.address}
          onChange={handleChange}
          required
        />

        {error && <div style={{ color: 'red', marginTop: '8px' }}>{error}</div>}

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          Create Agency
        </Button>
      </form>
    </Box>
  );
};

export default CreateAgency;
