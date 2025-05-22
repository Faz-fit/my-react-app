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
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from 'utils/api';

// Validation schema
const schema = yup.object({
  hcode: yup.string().required('Hcode is required'),
  holiday_type: yup.string().required('Holiday type is required'),
  holiday_type_name: yup.string().required('Holiday type name is required'),
  holiday_name: yup.string().required('Holiday name is required'),
  hdate: yup.date().required('Holiday date is required').typeError('Invalid date'),
  active: yup.boolean(),
  holiday_ot_pay_percentage: yup
    .number()
    .typeError('OT must be a number')
    .min(0, 'Cannot be negative')
    .required('Holiday OT is required'),
  holiday_regular_pay_percentage: yup
    .number()
    .typeError('Pay Percentage must be a number')
    .min(0, 'Cannot be negative')
    .max(100, 'Cannot be more than 100')
    .required('Pay Percentage is required'),
}).required();

// Dummy options — you can extract these from your data
const hcodeOptions = ['PoD', 'TTPD', 'ND', 'MD', 'RFD', 'NY', 'MayD', 'HFD', 'MUN', 'DFD', 'CHD'];
const holidayTypeOptions = ['PBM', 'PB'];
const holidayTypeNameOptions = ['Public/Bank/Mercantile', 'Public/Bank'];
const holidayNameOptions = [
  'Duruthu Full Moon Poya Day',
  'Tamil Thai Ponga Day',
  'National Day',
  'Mahasivarathri Day',
  'Ramazan Festival Day',
  'May Day',
  'Christmas Day',
  // add more from your data
];

export default function HolidayGrid() {
  const [holidayData, setHolidayData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editHoliday, setEditHoliday] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHolidays = async () => {
    try {
      const res = await api.get('/api/holidays/');

      setHolidayData(res.data);
    } catch (err) {
      console.error('Failed to fetch Holidays:', err);
    }
  };

  useEffect(() => {
    fetchHolidays()
  }, [])


  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      hcode: '',
      holiday_type: '',
      holiday_type_name: '',
      holiday_name: '',
      hdate: null,
      active: true,
      holiday_ot_pay_percentage: '',
      holiday_regular_pay_percentage: '',
    },
  });

  const openAddDialog = () => {
    setEditHoliday(null);
    reset({
      hcode: '',
      holiday_type: '',
      holiday_type_name: '',
      holiday_name: '',
      hdate: null,
      active: true,
      holiday_ot_pay_percentage: '',
      holiday_regular_pay_percentage: '',
    });
    setOpenDialog(true);
  };

  const openEditDialog = (row) => {
    // Need to convert date string to Date object if stored as string
    const holidayDate = row.hdate instanceof Date ? row.hdate : new Date(row.hdate);
    setEditHoliday(row);
    reset({ ...row, hdate: holidayDate });
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setEditHoliday(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const formattedData = {
        ...data,
        hdate: new Date(data.hdate).toISOString().split('T')[0],
        holiday_ot_pay_percentage: data.holiday_ot_pay_percentage ? Number(data.holiday_ot_pay_percentage).toFixed(2) : null,
        holiday_regular_pay_percentage: data.holiday_regular_pay_percentage ? Number(data.holiday_regular_pay_percentage).toFixed(2) : null,
      };

      let response;
      if (editHoliday) {
        response = await api.put(`api/holidays/${editHoliday.id}/`, formattedData);
        const updatedHoliday = response.data;

        setHolidayData((prev) =>
          prev.map((item) => (item.id === editHoliday.id ? updatedHoliday : item))
        );
      } else {
        response = await api.post('api/holidays/', formattedData);
        const newHoliday = response.data;

        setHolidayData((prev) => [...prev, newHoliday]);
      }

      closeDialog();
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };



  const columns = [
    { field: 'hcode', headerName: 'Hcode', width: 100 },
    { field: 'holiday_type', headerName: 'Holiday Type', width: 120 },
    { field: 'holiday_type_name', headerName: 'Holiday Type Name', flex: 1, minWidth: 180 },
    { field: 'holiday_name', headerName: 'Holiday Name', flex: 1, minWidth: 180 },
    {
      field: 'hdate',
      headerName: 'Date',
      width: 130,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'active',
      headerName: 'Active',
      width: 90,
      type: 'boolean',
    },
    {
      field: 'holiday_ot_pay_percentage',
      headerName: 'Holiday OT',
      width: 110,
      type: 'number',
    },
    {
      field: 'holiday_regular_pay_percentage',
      headerName: 'Pay %',
      width: 110,
      type: 'text',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 90,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Tooltip title="Edit"><EditIcon /></Tooltip>}
          label="Edit"
          onClick={() => openEditDialog(params.row)}
          showInMenu={false}
          key="edit"
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 600, width: '95%', mx: 'auto', mt: 5, position: 'relative' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
        Holiday
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ position: 'absolute', top: 0, right: 0, zIndex: 10 }}
        onClick={openAddDialog}
      >
        Add Holiday
      </Button>

      <DataGrid
        rows={holidayData}
        columns={columns}
        pageSize={7}
        rowsPerPageOptions={[5, 7, 10]}
        disableSelectionOnClick
        sx={{ mt: 4 }}
      />

      <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editHoliday ? 'Edit Holiday' : 'Add Holiday'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogContent sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
            <Controller
              name="hcode"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Hcode"
                  sx={{ minWidth: 150, flexGrow: 1 }}
                  error={!!errors.hcode}
                  helperText={errors.hcode?.message}
                  disabled={loading}
                >
                  <MenuItem value="">Select Hcode</MenuItem>
                  {hcodeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="holiday_type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Holiday Type"
                  sx={{ minWidth: 150, flexGrow: 1 }}
                  error={!!errors.holiday_type}
                  helperText={errors.holiday_type?.message}
                  disabled={loading}
                >
                  <MenuItem value="">Select Holiday Type</MenuItem>
                  {holidayTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="holiday_type_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Holiday Type Name"
                  sx={{ minWidth: 200, flexGrow: 2 }}
                  error={!!errors.holiday_type_name}
                  helperText={errors.holiday_type_name?.message}
                  disabled={loading}
                >
                  <MenuItem value="">Select Holiday Type Name</MenuItem>
                  {holidayTypeNameOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="holiday_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Holiday Name"
                  sx={{ minWidth: 300, flexGrow: 3 }}
                  error={!!errors.holiday_name}
                  helperText={errors.holiday_name?.message}
                  disabled={loading}
                >
                  <MenuItem value="">Select Holiday Name</MenuItem>
                  {holidayNameOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="hdate"
              control={control}
              render={({ field }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Holiday Date"
                    {...field}
                    onChange={(date) => field.onChange(date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        sx={{ minWidth: 200 }}
                        error={!!errors.hdate}
                        helperText={errors.hdate?.message}
                        disabled={loading}
                      />
                    )}
                  />
                </LocalizationProvider>
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
              name="holiday_ot_pay_percentage"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Holiday OT"
                  type="text"
                  sx={{ minWidth: 150 }}
                  error={!!errors.holiday_ot_pay_percentage}
                  helperText={errors.holiday_ot_pay_percentage?.message}
                  disabled={loading}
                  inputProps={{ min: 0 }}
                />
              )}
            />

            <Controller
              name="holiday_regular_pay_percentage"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Pay Percentage"
                  type="text"
                  sx={{ minWidth: 150 }}
                  error={!!errors.holiday_regular_pay_percentage}
                  helperText={errors.holiday_regular_pay_percentage?.message}
                  disabled={loading}
                  inputProps={{ min: 0, max: 100 }}
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
