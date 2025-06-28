import * as React from 'react';
import { useState } from 'react';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import MapIcon from '@mui/icons-material/Map';
import {
  GridRowModes,
  DataGrid,
  GridActionsCellItem,
  GridRowEditStopReasons,
  Toolbar,
  ToolbarButton,
  
} from '@mui/x-data-grid';
import { Autocomplete, TextField ,Typography} from '@mui/material';
import api from 'utils/api';
import MapDialog from 'components/MapDialog';
import CreateOutlet from './create/CreateOutlet'
import { Dialog,DialogContent, IconButton, Box } from '@mui/material';

// Helper random ID generator (replace with your method)
const randomId = () => Math.random().toString(36).substr(2, 9);

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = randomId();
    setRows((oldRows) => [
      ...oldRows,
      { id, name: '', age: '', role: '', isNew: true },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    
    <Toolbar>
      <Tooltip title="Add record">
        <ToolbarButton onClick={handleClick}>
          <AddIcon fontSize="small" />
        </ToolbarButton>
      </Tooltip>
    </Toolbar>
  );
}

function ManagerEditCell({ id, field, value, api, options }) {
  const selectedOption = options.find((opt) => opt.employee_id === value) ?? null;

  const handleChange = (event, newValue) => {
    api.setEditCellValue(
      { id, field, value: newValue ? newValue.employee_id : null },
      { debounceMs: 200 }
    );
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(opt) => opt.fullname || ''}
      value={selectedOption}
      onChange={handleChange}
      isOptionEqualToValue={(opt, val) => opt.employee_id === val.employee_id}
      renderInput={(params) => <TextField {...params} variant="standard" />}
      size="small"
      disableClearable
      sx={{ width: '100%' }}
    />
  );
}

function AgencyEditCell({ id, field, value, api, options }) {
  const selectedOption = options.find((opt) => opt.id === value) ?? null;

  const handleChange = (event, newValue) => {
    api.setEditCellValue(
      { id, field, value: newValue ? newValue.id : null },
      { debounceMs: 200 }
    );
  };

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(opt) => opt.name || ''}
      value={selectedOption}
      onChange={handleChange}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      renderInput={(params) => <TextField {...params} variant="standard" />}
      size="small"
      disableClearable
      sx={{ width: '100%' }}
    />
  );
}


export default function FullFeaturedCrudGrid() {
  const [rows, setRows] = useState([]); // Use outlets here later
  const [rowModesModel, setRowModesModel] = useState({});
  const [setOutlets] = useState([]);

  const [agencies, setAgencies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);


const fetchOutlets = React.useCallback(async () => {
  try {
    const res = await api.get('/api/outlets/');
    // Filter out outlets where the status is 0
    const filteredData = res.data.filter((outlet) => outlet.status !== 0);
    
    const transformedData = filteredData.map((outlet) => ({
      ...outlet,
      coordinates: {
        lat: outlet.latitude,
        lng: outlet.longitude,
      },
    }));
    setRows(transformedData); // Update state with filtered data
    setOutlets(res.data); // You can use filtered data here if needed
    setRowModesModel({});
  } catch (err) {
    console.error('Failed to fetch outlets:', err);
  }
}, [setOutlets]);


const fetchAgencies = React.useCallback(async () => {
  try {
    const res = await api.get('/api/getagencies/');
    setAgencies(res.data);
  } catch (err) {
    console.error('Failed to fetch agencies:', err);
  }
}, []);

const fetchEmployees = React.useCallback(async () => {
  try {
    const res = await api.get('/api/getemployees/');
    setEmployees(res.data);
  } catch (err) {
    console.error('Failed to fetch employees:', err);
  }
}, []);

// ✅ Call them inside useEffect after defining
React.useEffect(() => {
  fetchOutlets();
  fetchAgencies();
  fetchEmployees();
}, [fetchOutlets, fetchAgencies, fetchEmployees]);


  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => async () => {
    try {
      await api.delete(`/api/outlets/manage/${id}/`);
    } catch (error) {
      console.error('Failed to delete outlet:', error);
    }
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow?.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow) => {
    try {
      // Coordinates is now { lat, lng }, so we need to flatten it before sending
      const payload = {
        ...newRow,
        latitude: newRow.coordinates?.lat,
        longitude: newRow.coordinates?.lng,
      };

      delete payload.coordinates;
      delete payload.isNew;

      await api.patch(`/api/outlets/manage/${newRow.id}/`, payload);

      const updatedRow = {
        ...newRow,
        isNew: false,
      };
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === updatedRow.id ? updatedRow : row))
      );
      return updatedRow;
    } catch (error) {
      console.error('Failed to save row:', error);
      throw error;
    }
  };

  // Handle map dialog (just stub here)
  const handleOpenMapDialog = (id, coordinates, api) => {
    setSelectedOutlet({ id, coordinates, api });
    setMapDialogOpen(true);
  };

  const handleSaveCoordinates = async ({ lat, lng }) => {
    if (!selectedOutlet) return;
    const { id, api } = selectedOutlet;

    try {
      await api.setEditCellValue({
        id,
        field: 'coordinates',
        value: { lat, lng },
      });
      // api.startRowEditMode({ id });
    } catch (err) {
      console.error('Failed to update coordinates:', err);
    } finally {
      setMapDialogOpen(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      editable: true,
    },
    {
      field: 'address',
      headerName: 'Address',
      flex: 2,
      editable: true,
    },
    {
      field: 'coordinates',
      headerName: 'Coordinates',
      flex: 2,
      editable: true,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const { lat, lng } = params.value || {};
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <span>{lat}, {lng}</span>
          </Box>
        );
      },
      renderEditCell: (params) => {
        const { id, value = {} } = params;
        const { lat, lng } = value;

        return (
          <Box display="flex" alignItems="center" gap={1}>
            <span>{lat}, {lng}</span>
            <IconButton
              size="small"
              onClick={() => handleOpenMapDialog(id, { lat, lng }, params.api)}
            >
              <MapIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      },
    },
    {
      field: 'radius_meters',
      headerName: 'Radius (m)',
      type: 'number',
      flex: 0.5,
      editable: true,
    },
    {
      field: 'manager',
      headerName: 'Manager',
      flex: 1,
      editable: true,
      renderCell: (params) => {
        if (!params.row) return '';
        const emp = employees.find((e) => e.employee_id === params?.value);
        return emp ? emp.fullname : '';
      },
      type: 'singleSelect',
      valueOptions: employees.map((e) => ({
        value: e.employee_id,
        label: e.fullname,
      })),
      renderEditCell: (params) => (
        <ManagerEditCell {...params} options={employees} />
      ),
      valueFormatter: (params) => {
        const emp = employees.find((e) => e.employee_id === params?.value);
        return emp ? emp.fullname : '';
      }
    },
    {
      field: 'agency',
      headerName: 'Agency',
      flex: 1,
      editable: true,
      type: 'singleSelect',
      renderCell: (params) => {
        if (!params.row) return '';
        const agency = agencies.find((a) => a.id === params?.value);
        return agency ? agency.name : '';
      },
      valueOptions: agencies.map((e) => ({
        value: e.id,
        label: e.name,
      })),
      renderEditCell: (params) => (
        <AgencyEditCell {...params} options={agencies} />
      ),
      valueFormatter: (params) => {
        const agency = agencies.find((e) => e.id === params?.value);
        return agency ? agency.name : '';
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
              color="primary"
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ position: 'relative', height: 500, width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 1 }} fontWeight="bold">
        OUTLETS
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
         
        <IconButton
          sx={{ backgroundColor: 'primary.main', color: 'white', '&:hover': { backgroundColor: 'primary.dark' } }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <AddIcon />
        </IconButton>
      </Box>

      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={setRowModesModel}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{ toolbar: EditToolbar }}
        slotProps={{ toolbar: { setRows, setRowModesModel } }}
        experimentalFeatures={{ newEditingApi: true }}
      />

      <MapDialog
        open={mapDialogOpen}
        onClose={() => setMapDialogOpen(false)}
        onSave={handleSaveCoordinates}
        initialCoordinates={{
  lat: selectedOutlet?.coordinates?.lat ?? 7.2906,
  lng: selectedOutlet?.coordinates?.lng ?? 80.6337,
}}

      />

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <CreateOutlet
            onSuccess={() => {
              setCreateDialogOpen(false);
              fetchOutlets();
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
