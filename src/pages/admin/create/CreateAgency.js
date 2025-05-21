import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const MAX_LENGTH = 255;

const initialAgencies = [
  { id: 1, name: 'Tech Solutions', address: '123 Tech St, Silicon Valley' },
  { id: 2, name: 'HealthCare Ltd', address: '456 Wellness Ave, New York' },
  { id: 3, name: 'EduWorld', address: '789 Learning Rd, London' },
];

export default function AgencyGrid() {
  const [agencies, setAgencies] = useState(initialAgencies);
  const [openDialog, setOpenDialog] = useState(false);
  const [editAgency, setEditAgency] = useState(null);
  const [form, setForm] = useState({ name: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Open dialog for add or edit
  const openAddDialog = () => {
    setEditAgency(null);
    setForm({ name: '', address: '' });
    setError('');
    setOpenDialog(true);
  };

  const openEditDialog = (agency) => {
    setEditAgency(agency);
    setForm({ name: agency.name, address: agency.address });
    setError('');
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setEditAgency(null);
    setError('');
    setForm({ name: '', address: '' });
  };

  const handleChange = (e) => {
    if (e.target.value.length <= MAX_LENGTH) {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
      if (error) setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    // Simulate API delay
    setTimeout(() => {
      if (editAgency) {
        // Update existing
        setAgencies((prev) =>
          prev.map((a) => (a.id === editAgency.id ? { ...a, ...form } : a))
        );
      } else {
        // Add new agency
        const newId = agencies.length ? Math.max(...agencies.map((a) => a.id)) + 1 : 1;
        setAgencies((prev) => [...prev, { id: newId, ...form }]);
      }
      setLoading(false);
      closeDialog();
    }, 600);
  };

  const columns = [
    { field: 'name', headerName: 'Agency Name', flex: 1, minWidth: 180 },
    { field: 'address', headerName: 'Address', flex: 1, minWidth: 250 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 80,
      getActions: (params) => [
        <GridActionsCellItem
          icon={
            <Tooltip title="Edit">
              <EditIcon />
            </Tooltip>
          }
          label="Edit"
          onClick={() => openEditDialog(params.row)}
          showInMenu={false}
          key="edit"
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 500, width: '90%', mx: 'auto', mt: 5, position: 'relative' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        Agencies
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}
        onClick={openAddDialog}
      >
        Add Agency
      </Button>

      <DataGrid
        rows={agencies}
        columns={columns}
        pageSize={7}
        rowsPerPageOptions={[5, 7, 10]}
        disableSelectionOnClick
        sx={{ mt: 4 }}
      />

      <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editAgency ? 'Edit Agency' : 'Add New Agency'}</DialogTitle>
        <form onSubmit={handleSubmit} noValidate>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Agency Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
              helperText={`${form.name.length}/${MAX_LENGTH}`}
              inputProps={{ maxLength: MAX_LENGTH }}
              error={!!error && !form.name.trim()}
            />
            <TextField
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              fullWidth
              required
              helperText={`${form.address.length}/${MAX_LENGTH}`}
              inputProps={{ maxLength: MAX_LENGTH }}
              error={!!error && !form.address.trim()}
            />
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? (editAgency ? 'Saving...' : 'Creating...') : editAgency ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
