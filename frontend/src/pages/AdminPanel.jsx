import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  LinearProgress,
  Grid,
  InputAdornment,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  PersonAdd,
  Search,
  Group,
  EventNote,
  AdminPanelSettings,
} from '@mui/icons-material';
import api from '../api/axios';
import UserTable from '../components/UserTable';
import LeaveCard from '../components/LeaveCard';
import StatsCard from '../components/StatsCard';
import LeaveTypeTable from '../components/LeaveTypeTable';
import { DEPARTMENTS, DEPARTMENT_CONFIG } from '../constants/departments';
import { useLeaveTypes } from '../context/LeaveTypeContext';
import toast from 'react-hot-toast';

/**
 * Admin Panel — Tabbed interface for user management, all leaves, and analytics
 */
const AdminPanel = () => {
  const [tab, setTab] = useState(0);
  const { leaveTypes } = useLeaveTypes();

  // Users state
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [userPagination, setUserPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });
  const [userSearch, setUserSearch] = useState('');
  const [userLoading, setUserLoading] = useState(false);

  // Leaves state
  const [leaves, setLeaves] = useState([]);
  const [leavePagination, setLeavePagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });
  const [leaveFilters, setLeaveFilters] = useState({
    status: '',
    leaveType: '',
  });
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Stats
  const [stats, setStats] = useState(null);

  // Create user dialog
  const [createDialog, setCreateDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    manager: '',
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Review leave dialog
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const params = { page: userPagination.page, limit: 10 };
      if (userSearch) params.search = userSearch;

      const res = await api.get('/users', { params });
      setUsers(res.data.data.users);
      setUserPagination((prev) => ({ ...prev, ...res.data.data.pagination }));
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setUserLoading(false);
    }
  }, [userPagination.page, userSearch]);

  // Fetch managers for dropdown
  const fetchManagers = async () => {
    try {
      const res = await api.get('/users/managers');
      setManagers(res.data.data.managers);
    } catch {
      /* silent */
    }
  };

  // Fetch all leaves
  const fetchLeaves = useCallback(async () => {
    setLeaveLoading(true);
    try {
      const params = { page: leavePagination.page, limit: 12 };
      if (leaveFilters.status) params.status = leaveFilters.status;
      if (leaveFilters.leaveType) params.leaveType = leaveFilters.leaveType;

      const res = await api.get('/leaves', { params });
      setLeaves(res.data.data.leaves);
      setLeavePagination((prev) => ({
        ...prev,
        ...res.data.data.pagination,
      }));
    } catch (err) {
      toast.error('Failed to load leaves');
    } finally {
      setLeaveLoading(false);
    }
  }, [leavePagination.page, leaveFilters]);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await api.get('/leaves/stats');
      setStats(res.data.data);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    fetchManagers();
    fetchStats();
  }, []);

  useEffect(() => {
    if (tab === 0) fetchUsers();
  }, [tab, fetchUsers]);

  useEffect(() => {
    if (tab === 1) fetchLeaves();
  }, [tab, fetchLeaves]);

  // Create user
  const handleCreateUser = async () => {
    setCreateLoading(true);
    try {
      await api.post('/users', {
        ...newUser,
        manager: newUser.manager || undefined,
      });
      toast.success('User created successfully');
      setCreateDialog(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'employee',
        department: '',
        manager: '',
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (userId, data) => {
    try {
      await api.put(`/users/${userId}`, data);
      toast.success('User updated successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  // Delete (deactivate) user
  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  // Open review dialog
  const openReviewDialog = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewComment('');
    setReviewDialog(true);
  };

  // Submit review
  const handleReviewLeave = async () => {
    setReviewLoading(true);
    try {
      await api.patch(`/leaves/${selectedLeave._id}/review`, {
        status: reviewAction,
        reviewComment: reviewComment,
      });
      toast.success(`Leave ${reviewAction} successfully`);
      setReviewDialog(false);
      fetchLeaves();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review leave');
    } finally {
      setReviewLoading(false);
    }
  };

  const statusStats = stats?.statusStats || {};

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <AdminPanelSettings
          sx={{ fontSize: 32, color: 'primary.main' }}
        />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Admin Panel
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Manage users, leaves, and view organization analytics
          </Typography>
        </Box>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Total Users"
            value={userPagination.total || users.length}
            icon={<Group />}
            color="#6366f1"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Total Leaves"
            value={statusStats.total || 0}
            icon={<EventNote />}
            color="#14b8a6"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Pending"
            value={statusStats.pending || 0}
            icon={<EventNote />}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Approved"
            value={statusStats.approved || 0}
            icon={<EventNote />}
            color="#10b981"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.9rem',
            },
          }}
        >
          <Tab label="User Management" />
          <Tab label="All Leave Records" />
          <Tab label="Leave Configurations" />
        </Tabs>
      </Card>

      {/* Tab: User Management */}
      {tab === 0 && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2.5,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <TextField
              size="small"
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setUserPagination((prev) => ({ ...prev, page: 1 }));
              }}
              sx={{ minWidth: 260 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setCreateDialog(true)}
            >
              Create User
            </Button>
          </Box>

          {userLoading && (
            <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />
          )}

          <UserTable
            users={users}
            managers={managers}
            onUpdate={handleUpdateUser}
            onDelete={handleDeleteUser}
          />

          {userPagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={userPagination.pages}
                page={userPagination.page}
                onChange={(_, page) =>
                  setUserPagination((prev) => ({ ...prev, page }))
                }
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Box>
      )}

      {/* Tab: All Leaves */}
      {tab === 1 && (
        <Box>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              mb: 2.5,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={leaveFilters.status}
                label="Status"
                onChange={(e) => {
                  setLeaveFilters((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }));
                  setLeavePagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={leaveFilters.leaveType}
                label="Type"
                onChange={(e) => {
                  setLeaveFilters((prev) => ({
                    ...prev,
                    leaveType: e.target.value,
                  }));
                  setLeavePagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <MenuItem value="">All</MenuItem>
                {leaveTypes.map(type => (
                  <MenuItem key={type.identifier} value={type.identifier}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', ml: 'auto' }}
            >
              {leavePagination.total} total records
            </Typography>
          </Box>

          {leaveLoading && (
            <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />
          )}

          {!leaveLoading && leaves.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                color: 'text.secondary',
              }}
            >
              <Typography variant="h6">No leave records found</Typography>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {leaves.map((leave, index) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  lg={4}
                  key={leave._id}
                  sx={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.04}s both`,
                    '@keyframes fadeInUp': {
                      from: { opacity: 0, transform: 'translateY(10px)' },
                      to: { opacity: 1, transform: 'translateY(0)' },
                    },
                  }}
                >
                  <LeaveCard leave={leave} showEmployee onReview={openReviewDialog} />
                </Grid>
              ))}
            </Grid>
          )}

          {leavePagination.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={leavePagination.pages}
                page={leavePagination.page}
                onChange={(_, page) =>
                  setLeavePagination((prev) => ({ ...prev, page }))
                }
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Box>
      )}

      {/* Tab: Leave Types Management */}
      {tab === 2 && (
        <Box>
          <LeaveTypeTable />
        </Box>
      )}

      {/* Review Leave Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => setReviewDialog(false)}
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
        <DialogTitle sx={{ fontWeight: 700 }}>
          {reviewAction === 'approved' ? '✅ Approve' : '❌ Reject'} Leave Request
        </DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <Box sx={{ mb: 2, mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>{selectedLeave.employee?.name}</strong> is requesting{' '}
                <strong>{selectedLeave.leaveType}</strong> leave
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Reason: {selectedLeave.reason}
              </Typography>
            </Box>
          )}
          <TextField
            label="Comment (optional)"
            multiline
            rows={3}
            fullWidth
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Add a comment for the employee..."
            inputProps={{ maxLength: 300 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReviewLeave}
            disabled={reviewLoading}
            color={reviewAction === 'approved' ? 'success' : 'error'}
          >
            {reviewLoading
              ? 'Processing...'
              : reviewAction === 'approved'
              ? 'Approve'
              : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog
        open={createDialog}
        onClose={() => setCreateDialog(false)}
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
        <DialogTitle sx={{ fontWeight: 700 }}>Create New User</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            pt: '16px !important',
          }}
        >
          <TextField
            label="Full Name"
            fullWidth
            required
            value={newUser.name}
            onChange={(e) =>
              setNewUser({ ...newUser, name: e.target.value })
            }
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={newUser.email}
            onChange={(e) =>
              setNewUser({ ...newUser, email: e.target.value })
            }
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            value={newUser.password}
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newUser.role}
              label="Role"
              onChange={(e) =>
                setNewUser({ ...newUser, role: e.target.value })
              }
            >
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              value={newUser.gender || 'other'}
              label="Gender"
              onChange={(e) =>
                setNewUser({ ...newUser, gender: e.target.value })
              }
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
             <InputLabel>Department</InputLabel>
             <Select
               value={newUser.department}
               label="Department"
               onChange={(e) =>
                 setNewUser({ ...newUser, department: e.target.value })
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
          {newUser.role === 'employee' && (
            <FormControl fullWidth>
              <InputLabel>Assign Manager</InputLabel>
              <Select
                value={newUser.manager}
                label="Assign Manager"
                onChange={(e) =>
                  setNewUser({ ...newUser, manager: e.target.value })
                }
              >
                <MenuItem value="">None</MenuItem>
                {managers.map((m) => (
                  <MenuItem key={m._id} value={m._id}>
                    {m.name} ({m.department})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={
              createLoading || !newUser.name || !newUser.email || !newUser.password
            }
          >
            {createLoading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
