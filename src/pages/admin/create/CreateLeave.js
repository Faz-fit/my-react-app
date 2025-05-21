import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Tooltip,
  IconButton,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Validation schema
const schema = yup.object({
  leaveType: yup.string().required('Leave type is required'),
  description: yup.string().required('Description is required'),
  totalDays: yup
    .number()
    .typeError('Total days must be a number')
    .positive('Must be greater than zero')
    .required('Total days is required'),
}).required();

const leaveTypesOptions = ['Sick Leave', 'Casual Leave', 'Maternity Leave', 'Annual Leave'];

const initialLeaveData = [
  {
    id: 1,
    leaveType: 'Sick Leave',
    description: 'Used when you are sick',
    totalDays: 10,
  },
  {
    id: 2,
    leaveType: 'Annual Leave',
    description: 'Yearly vacation leave',
    totalDays: 15,
  },
];

export default function LeaveTypeGrid() {
  const [leaveData, setLeaveData] = useState(initialLeaveData);
  const [openDialog, setOpenDialog] = useState(false);
  const [editLeave, setEditLeave] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      leaveType: '',
      description: '',
      totalDays: '',
    },
  });

  // Open dialog for add new
  const openAddDialog = () => {
    setEditLeave(null);
    reset({ leaveType: '', description: '', totalDays: '' });
    setOpenDialog(true);
  };

  // Open dialog for edit existing
  const openEditDialog = (row) => {
    setEditLeave(row);
    reset(row);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setEditLeave(null);
  };

  const onSubmit = (data) => {
    setLoading(true);

    setTimeout(() => {
      if (editLeave) {
        // Update existing
        setLeaveData((prev) =>
          prev.map((item) => (item.id === editLeave.id ? { ...item, ...data } : item))
        );
      } else {
        // Add new
        const newId = leaveData.length ? Math.max(...leaveData.map((item) => item.id)) + 1 : 1;
        setLeaveData((prev) => [...prev, { id: newId, ...data }]);
      }
      setLoading(false);
      closeDialog();
    }, 600);
  };

  const columns = [
    { field: 'leaveType', headerName: 'Leave Type', flex: 1, minWidth: 150 },
    { field: 'description', headerName: 'Description', flex: 2, minWidth: 250 },
    { field: 'totalDays', headerName: 'Total Days', width: 120, type: 'number' },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 90,
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
        Leave Types
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}
        onClick={openAddDialog}
      >
        Add Leave Type
      </Button>

      <DataGrid
        rows={leaveData}
        columns={columns}
        pageSize={7}
        rowsPerPageOptions={[5, 7, 10]}
        disableSelectionOnClick
        sx={{ mt: 4 }}
      />

      <Dialog open={openDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editLeave ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Controller
              name="leaveType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Leave Type"
                  fullWidth
                  error={!!errors.leaveType}
                  helperText={errors.leaveType?.message}
                  disabled={loading}
                >
                  <MenuItem value="">Select leave type</MenuItem>
                  {leaveTypesOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  disabled={loading}
                />
              )}
            />

            <Controller
              name="totalDays"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Total Days"
                  type="number"
                  fullWidth
                  error={!!errors.totalDays}
                  helperText={errors.totalDays?.message}
                  disabled={loading}
                  inputProps={{ min: 1 }}
                />
              )}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={closeDialog} disabled={loading}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={loading}>
              {loading ? (editLeave ? 'Saving...' : 'Creating...') : editLeave ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
