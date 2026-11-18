import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Edit, Delete, PersonOff } from '@mui/icons-material';
import { DEPARTMENTS, DEPARTMENT_CONFIG, ROLE_CONFIG } from '../constants/departments';

const ROLE_COLORS = {
  admin: { bg: ROLE_CONFIG.admin.bg, color: ROLE_CONFIG.admin.color },
  manager: { bg: ROLE_CONFIG.manager.bg, color: ROLE_CONFIG.manager.color },
  employee: { bg: ROLE_CONFIG.employee.bg, color: ROLE_CONFIG.employee.color },
};

/**
 * Admin user management table
 * Supports inline editing, role changes, and user deactivation
 */
const UserTable = ({ users, managers, onUpdate, onDelete }) => {
  const [editDialog, setEditDialog] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const handleEdit = (user) => {
    setEditUser({ ...user });
    setEditDialog(true);
  };

  const handleSave = () => {
    onUpdate(editUser._id, {
      name: editUser.name,
      email: editUser.email,
      role: editUser.role,
      department: editUser.department,
      gender: editUser.gender,
      manager: editUser.manager?._id || editUser.manager || null,
    });
    setEditDialog(false);
    setEditUser(null);
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => {
              const roleConfig = ROLE_COLORS[user.role] || ROLE_COLORS.employee;
              return (
                <TableRow
                  key={user._id}
                  sx={{
                    transition: 'background 0.15s ease',
                    '&:hover': { bgcolor: 'action.hover' },
                    opacity: user.isActive ? 1 : 0.5,
                  }}
                >
                  <TableCell>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          bgcolor: roleConfig.color,
                        }}
                      >
                        {user.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      sx={{
                        bgcolor: roleConfig.bg,
                        color: roleConfig.color,
                        fontWeight: 700,
                        textTransform: 'capitalize',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Typography component="span" sx={{ fontSize: '0.85rem' }}>
                        {(DEPARTMENT_CONFIG[user.department] || {}).emoji || '🏢'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {user.department}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {user.manager?.name || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={user.isActive ? 'success' : 'default'}
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(user)}
                        sx={{ color: 'primary.main' }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deactivate">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(user._id)}
                        disabled={!user.isActive}
                        sx={{ color: 'error.main' }}
                      >
                        <PersonOff fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Edit User</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
          <TextField
            label="Name"
            fullWidth
            value={editUser?.name || ''}
            onChange={(e) =>
              setEditUser({ ...editUser, name: e.target.value })
            }
          />
          <TextField
            label="Email"
            fullWidth
            value={editUser?.email || ''}
            onChange={(e) =>
              setEditUser({ ...editUser, email: e.target.value })
            }
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={editUser?.role || 'employee'}
              label="Role"
              onChange={(e) =>
                setEditUser({ ...editUser, role: e.target.value })
              }
            >
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={editUser?.department || ''}
              label="Department"
              onChange={(e) =>
                setEditUser({ ...editUser, department: e.target.value })
              }
            >
              {DEPARTMENTS.map((dept) => {
                const cfg = DEPARTMENT_CONFIG[dept] || {};
                return (
                  <MenuItem key={dept} value={dept}>
                    {cfg.emoji || '🏢'} {dept}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              value={editUser?.gender || 'other'}
              label="Gender"
              onChange={(e) =>
                setEditUser({ ...editUser, gender: e.target.value })
              }
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Manager</InputLabel>
            <Select
              value={editUser?.manager?._id || editUser?.manager || ''}
              label="Manager"
              onChange={(e) =>
                setEditUser({ ...editUser, manager: e.target.value })
              }
            >
              <MenuItem value="">None</MenuItem>
              {managers?.map((m) => (
                <MenuItem key={m._id} value={m._id}>
                  {m.name} ({m.department})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserTable;
