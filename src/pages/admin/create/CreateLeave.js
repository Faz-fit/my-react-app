import React, { useState, useEffect } from 'react';
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
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from 'utils/api'

// Validation schema
const schema = yup.object({
  AttType: yup.string().required('AttType is required'),
  AttType_Name: yup.string().required('Name is required'),
  active: yup.boolean(),
  PayPercen: yup
    .number()
    .typeError('Pay Percent must be a number')
    .min(0)
    .max(100)
    .required('Pay Percent is required'),
  YearStartDate: yup.date().required('Start Date is required').typeError('Invalid date'),
  YearEndDate: yup.date().required('End Date is required').typeError('Invalid date'),
}).required();

// Mapping AttType to Name
const attTypeMap = {
  A: 'Annual',
  C: 'Casual Leave',
  C19q: 'Covid 19 Quarantine',
  Co: 'Compassionate',
  H1: 'Half Day Leave1',
  H2: 'Half Day Leave2',
  M: 'Maternity Leave',
  NP: 'No Pay',
  NwL: 'non-working Leave',
  O: 'Day Off',
  P: 'Paternity Leave',
  S: 'Sick Leave',
  SL: 'Short Leave',
  V: 'Vacation',
  W: 'Work from Home',
  PCUR: 'Police curfew',
};

const initialHolidayData = [
  {
    id: 1,
    AttType: 'A',
    AttType_Name: 'Annual',
    active: true,
    PayPercen: 100,
    YearStartDate: new Date('2019-01-01'),
    YearEndDate: new Date('2019-12-31'),
  },
  {
    id: 2,
    AttType: 'C',
    AttType_Name: 'Casual Leave',
    active: true,
    PayPercen: 100,
    YearStartDate: new Date('2019-01-01'),
    YearEndDate: new Date('2019-12-31'),
  },
];

export default function HolidayGrid() {
  const [leaveData, setLeaveData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editHoliday, setEditHoliday] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/api/leavetypes/');

      setLeaveData(res.data);
    } catch (err) {
      console.error('Failed to fetch Holidays:', err);
    }
  };

  useEffect(() => {
    fetchLeaves()
  }, [])

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      AttType: '',
      AttType_Name: '',
      active: true,
      PayPercen: '',
      YearStartDate: null,
      YearEndDate: null,
    },
  });

  const openAddDialog = () => {
    setEditHoliday(null);
    reset({
      AttType: '',
      AttType_Name: '',
      active: true,
      PayPercen: '',
      YearStartDate: null,
      YearEndDate: null,
    });
    setOpenDialog(true);
  };

  const openEditDialog = (row) => {
    const start = row.YearStartDate instanceof Date ? row.YearStartDate : new Date(row.YearStartDate);
    const end = row.YearEndDate instanceof Date ? row.YearEndDate : new Date(row.YearEndDate);
    setEditHoliday(row);
    reset({ ...row, YearStartDate: start, YearEndDate: end });
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setEditHoliday(null);
  };

  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      if (editHoliday) {
        setLeaveData((prev) =>
          prev.map((item) => (item.id === editHoliday.id ? { ...item, ...data } : item))
        );
      } else {
        const newId = leaveData.length ? Math.max(...leaveData.map((item) => item.id)) + 1 : 1;
        setLeaveData((prev) => [...prev, { id: newId, ...data }]);
      }
      setLoading(false);
      closeDialog();
    }, 600);
  };

  const columns = [
    { field: 'AttType', headerName: 'AttType', width: 100 },
    { field: 'AttType_Name', headerName: 'Name', flex: 1, minWidth: 150 },
    {
      field: 'active',
      headerName: 'Active',
      width: 90,
      type: 'boolean',
      valueFormatter: (params) => (params.value ? 'Y' : 'N'),
    },
    {
      field: 'PayPercen',
      headerName: 'Pay Percent',
      width: 120,
      type: 'number',
    },
    {
      field: 'YearStartDate',
      headerName: 'Start Date',
      width: 130,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : '',
    },
    {
      field: 'YearEndDate',
      headerName: 'End Date',
      width: 130,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : '',
    },
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
        Leave
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}
        onClick={openAddDialog}
      >
        Add Attendance Type
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
        <DialogTitle>{editHoliday ? 'Edit Attendance Type' : 'Add Attendance Type'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Controller
              name="AttType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="AttType"
                  fullWidth
                  error={!!errors.AttType}
                  helperText={errors.AttType?.message}
                  disabled={loading}
                  onChange={(e) => {
                    field.onChange(e);
                    const selectedName = attTypeMap[e.target.value] || '';
                    setValue('AttType_Name', selectedName);
                  }}
                >
                  <MenuItem value="">Select AttType</MenuItem>
                  {Object.keys(attTypeMap).map((key) => (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="AttType_Name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Name"
                  fullWidth
                  error={!!errors.AttType_Name}
                  helperText={errors.AttType_Name?.message}
                  disabled={loading}
                  InputProps={{ readOnly: true }}
                />
              )}
            />

            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} disabled={loading} />}
                  label="Active"
                />
              )}
            />

            <Controller
              name="PayPercen"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Pay Percent"
                  type="number"
                  fullWidth
                  error={!!errors.PayPercen}
                  helperText={errors.PayPercen?.message}
                  disabled={loading}
                  inputProps={{ min: 0, max: 100 }}
                />
              )}
            />

            <Controller
              name="YearStartDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Start Date"
                  type="date"
                  fullWidth
                  error={!!errors.YearStartDate}
                  helperText={errors.YearStartDate?.message}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => field.onChange(e.target.value)}
                  value={field.value ? field.value.toISOString().substr(0, 10) : ''}
                />
              )}
            />

            <Controller
              name="YearEndDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="End Date"
                  type="date"
                  fullWidth
                  error={!!errors.YearEndDate}
                  helperText={errors.YearEndDate?.message}
                  disabled={loading}
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) => field.onChange(e.target.value)}
                  value={field.value ? field.value.toISOString().substr(0, 10) : ''}
                />
              )}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={closeDialog} disabled={loading}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={loading}>
              {loading ? (editHoliday ? 'Saving...' : 'Creating...') : editHoliday ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
