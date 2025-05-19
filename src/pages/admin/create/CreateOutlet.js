import React, { useState, useEffect } from 'react';
import api from 'utils/api';
import { useForm } from 'react-hook-form';
import {
  Box, Button, TextField, MenuItem, Typography
} from '@mui/material';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

const CreateOutlet = ({ onSuccess }) => {
  const [managers, setManagers] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [marker, setMarker] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDZJHqgolRe_S3fjSzvktXaBqLEaMHp4_M',
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    api.get('http://127.0.0.1:8000/api/getemployees').then(res => setManagers(res.data));
    api.get('http://127.0.0.1:8000/api/agencies/').then(res => setAgencies(res.data));
  }, []);

  const onMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    setValue('latitude', lat);
    setValue('longitude', lng);
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      latitude: marker.lat,
      longitude: marker.lng,
    };

    try {
      const response = await api.post('/api/outlets/create', payload);
      alert('Outlet created successfully!');
      if (onSuccess) onSuccess();
      console.log(response.data);
    } catch (err) {
      alert('Failed to create outlet');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Create New Outlet</Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="Outlet Name"
          fullWidth margin="normal"
          {...register('name', { required: 'Outlet name is required' })}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          label="Address"
          fullWidth margin="normal"
          {...register('address', { required: 'Address is required' })}
          error={!!errors.address}
          helperText={errors.address?.message}
        />

        <TextField
          label="Radius (meters)"
          fullWidth margin="normal"
          type="number"
          {...register('radius_meters', {
            required: 'Radius is required',
            valueAsNumber: true,
          })}
          error={!!errors.radius_meters}
          helperText={errors.radius_meters?.message}
        />

        <TextField
          label="Manager"
          select
          fullWidth margin="normal"
          defaultValue=""
          {...register('manager')}
        >
          <MenuItem value="">None</MenuItem>
          {managers.map((m) => (
            <MenuItem key={m.employee_id} value={m.employee_id}>
              {m.fullname}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Agency"
          select
          fullWidth margin="normal"
          defaultValue=""
          {...register('agency')}
        >
          <MenuItem value="">None</MenuItem>
          {agencies.map((a) => (
            <MenuItem key={a.id} value={a.id}>
              {a.name}
            </MenuItem>
          ))}
        </TextField>

        <Typography variant="body1" sx={{ mt: 2 }}>
          Select Location on Map
        </Typography>

        {isLoaded && (
          <GoogleMap
            center={marker}
            zoom={12}
            mapContainerStyle={{ width: '100%', height: '300px', marginTop: '8px' }}
            onClick={onMapClick}
          >
            <Marker position={marker} />
          </GoogleMap>
        )}

        <Button variant="contained" type="submit" fullWidth sx={{ mt: 3 }}>
          Create Outlet
        </Button>
      </form>
    </Box>
  );
};

export default CreateOutlet;
