import { useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Edit, AddCircleOutline } from '@mui/icons-material';
import api from '../api/axios';
import { useLeaveTypes } from '../context/LeaveTypeContext';
import toast from 'react-hot-toast';

const LeaveTypeTable = () => {
  const { leaveTypes, refreshLeaveTypes } = useLeaveTypes();
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: '',
    name: '',
    identifier: '',
    defaultBalance: 0,
    genderRestrict: 'none',
    color: '#818cf8',
    icon: '🏖️',
    isActive: true,
  });

  const handleOpen = (type = null) => {
    if (type) {
      setIsEditing(true);
      setFormData({ ...type });
    } else {
      setIsEditing(false);
      setFormData({
        _id: '',
        name: '',
        identifier: '',
        defaultBalance: 0,
        genderRestrict: 'none',
        color: '#818cf8',
        icon: '🏖️',
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await api.put(`/leave-types/${formData._id}`, formData);
        toast.success('Leave type updated');
      } else {
        await api.post('/leave-types', formData);
        toast.success('Leave type created');
      }
      refreshLeaveTypes();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save leave type');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddCircleOutline />}
          onClick={() => handleOpen()}
        >
          Add Leave Type
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>Icon & Name</TableCell>
              <TableCell>Identifier</TableCell>
              <TableCell>Default Balance</TableCell>
              <TableCell>Gender Restriction</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaveTypes.map((type) => (
              <TableRow key={type._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: type.color,
                      }}
                    />
                    {type.icon} {type.name}
                  </Box>
                </TableCell>
                <TableCell>{type.identifier}</TableCell>
                <TableCell>{type.defaultBalance} days</TableCell>
                <TableCell sx={{ textTransform: 'capitalize' }}>
                  {type.genderRestrict}
                </TableCell>
                <TableCell>
                  <Chip
                    label={type.isActive ? 'Active' : 'Inactive'}
                    color={type.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(type)}>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {leaveTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No leave types found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {isEditing ? 'Edit Leave Type' : 'Create Leave Type'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          <TextField
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Casual Leave"
            required
            sx={{ mt: 1 }}
          />
          <TextField
            label="Identifier"
            fullWidth
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value.toLowerCase() })}
            placeholder="e.g. casual"
            required
            disabled={isEditing}
          />
          <TextField
            label="Default Balance"
            type="number"
            fullWidth
            value={formData.defaultBalance}
            onChange={(e) => setFormData({ ...formData, defaultBalance: Number(e.target.value) })}
            required
          />
          <FormControl fullWidth>
            <InputLabel>Gender Restriction</InputLabel>
            <Select
              value={formData.genderRestrict}
              label="Gender Restriction"
              onChange={(e) => setFormData({ ...formData, genderRestrict: e.target.value })}
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="male">Male Only</MenuItem>
              <MenuItem value="female">Female Only</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Hex Color"
            fullWidth
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            placeholder="#000000"
          />
          <TextField
            label="Emoji Icon"
            fullWidth
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="🏖️"
          />
          {isEditing && (
             <FormControl fullWidth>
               <InputLabel>Status</InputLabel>
               <Select
                 value={formData.isActive}
                 label="Status"
                 onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' || e.target.value === true })}
               >
                 <MenuItem value={true}>Active</MenuItem>
                 <MenuItem value={false}>Inactive</MenuItem>
               </Select>
             </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveTypeTable;
