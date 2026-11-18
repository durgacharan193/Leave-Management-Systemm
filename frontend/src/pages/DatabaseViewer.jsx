import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Grid,
  TextField,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Storage,
  People,
  EventNote,
  Search,
  Circle,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from '../api/axios';
import StatsCard from '../components/StatsCard';
import { DEPARTMENT_CONFIG, ROLE_CONFIG } from '../constants/departments';
import { useLeaveTypes } from '../context/LeaveTypeContext';

/**
 * Database Viewer — Read-only admin view of all data
 */
const DatabaseViewer = () => {
  const { leaveTypes } = useLeaveTypes();
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [leaveSearch, setLeaveSearch] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, leavesRes] = await Promise.all([
        api.get('/users', { params: { limit: 100 } }),
        api.get('/leaves', { params: { limit: 100 } }),
      ]);
      setUsers(usersRes.data.data.users || []);
      setLeaves(leavesRes.data.data.leaves || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter helpers
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.department?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredLeaves = leaves.filter(
    (l) =>
      l.employee?.name?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      l.employee?.department?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      l.leaveType?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      l.status?.toLowerCase().includes(leaveSearch.toLowerCase()) ||
      l.reason?.toLowerCase().includes(leaveSearch.toLowerCase())
  );

  // Stats
  const roleCount = { admin: 0, manager: 0, employee: 0 };
  users.forEach((u) => {
    if (roleCount[u.role] !== undefined) roleCount[u.role]++;
  });

  const statusCount = { pending: 0, approved: 0, rejected: 0, cancelled: 0 };
  leaves.forEach((l) => {
    if (statusCount[l.status] !== undefined) statusCount[l.status]++;
  });

  const statusChipSx = {
    pending: { bgcolor: 'rgba(251,191,36,0.12)', color: '#fbbf24' },
    approved: { bgcolor: 'rgba(52,211,153,0.12)', color: '#34d399' },
    rejected: { bgcolor: 'rgba(248,113,113,0.12)', color: '#f87171' },
    cancelled: { bgcolor: 'rgba(136,146,176,0.12)', color: '#8892b0' },
  };

  const leaveTypeColors = {};
  leaveTypes.forEach(t => {
    leaveTypeColors[t.identifier] = t.color;
  });

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
          📊 Database Viewer
        </Typography>
        <LinearProgress sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Storage sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Database Viewer
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Read-only view of all system data • {users.length} users • {leaves.length} leave records
          </Typography>
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Total Users"
            value={users.length}
            icon={<People />}
            color="#6366f1"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Admins"
            value={roleCount.admin}
            icon={<People />}
            color={ROLE_CONFIG.admin.color}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Managers"
            value={roleCount.manager}
            icon={<People />}
            color={ROLE_CONFIG.manager.color}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="Employees"
            value={roleCount.employee}
            icon={<People />}
            color={ROLE_CONFIG.employee.color}
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
          <Tab
            icon={<People sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Users Collection (${users.length})`}
          />
          <Tab
            icon={<EventNote sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label={`Leaves Collection (${leaves.length})`}
          />
        </Tabs>
      </Card>

      {/* ─── Users Tab ─── */}
      {tab === 0 && (
        <Box>
          <TextField
            size="small"
            placeholder="Search users by name, email, role, department..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            sx={{ mb: 2, minWidth: 340 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              maxHeight: 520,
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Manager</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Leave Balance</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user, idx) => {
                  const roleInfo = ROLE_CONFIG[user.role] || ROLE_CONFIG.employee;
                  const deptInfo = DEPARTMENT_CONFIG[user.department] || { emoji: '🏢', color: '#64748b' };
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
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {idx + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar
                            sx={{
                              width: 30,
                              height: 30,
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              bgcolor: roleInfo.color,
                            }}
                          >
                            {user.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${roleInfo.icon} ${roleInfo.label}`}
                          size="small"
                          sx={{
                            bgcolor: roleInfo.bg,
                            color: roleInfo.color,
                            fontWeight: 700,
                            fontSize: '0.68rem',
                            height: 24,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <Typography component="span" sx={{ fontSize: '0.8rem' }}>
                            {deptInfo.emoji}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                            {user.department}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>
                          {user.gender === 'female' ? '♀️' : user.gender === 'male' ? '♂️' : '⚧️'} {user.gender}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                          {user.manager?.name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {leaveTypes.map((lt) => {
                            if (lt.genderRestrict !== 'none' && user.gender !== lt.genderRestrict) return null;
                            const bal = user.leaveBalance?.[lt.identifier] ?? lt.defaultBalance;
                            return (
                              <Tooltip key={lt.identifier} title={`${lt.identifier}: ${bal} days`} arrow>
                                <Chip
                                  label={`${lt.name.charAt(0)}:${bal}`}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.62rem',
                                    fontWeight: 700,
                                    bgcolor: `${lt.color}12`,
                                    color: lt.color,
                                    '& .MuiChip-label': { px: 0.6 },
                                  }}
                                />
                              </Tooltip>
                            );
                          })}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<Circle sx={{ fontSize: '8px !important' }} />}
                          label={user.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            bgcolor: user.isActive ? 'rgba(52,211,153,0.1)' : 'rgba(136,146,176,0.1)',
                            color: user.isActive ? '#34d399' : '#8892b0',
                            '& .MuiChip-icon': {
                              color: user.isActive ? '#34d399' : '#8892b0',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {dayjs(user.createdAt).format('MMM D, YYYY')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No users match your search</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
            Showing {filteredUsers.length} of {users.length} users
          </Typography>
        </Box>
      )}

      {/* ─── Leaves Tab ─── */}
      {tab === 1 && (
        <Box>
          {/* Leave stats */}
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {[
              { label: 'Pending', count: statusCount.pending, color: '#fbbf24', icon: '⏳' },
              { label: 'Approved', count: statusCount.approved, color: '#34d399', icon: '✅' },
              { label: 'Rejected', count: statusCount.rejected, color: '#f87171', icon: '❌' },
              { label: 'Cancelled', count: statusCount.cancelled, color: '#8892b0', icon: '🚫' },
            ].map((s) => (
              <Grid item xs={6} sm={3} key={s.label}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: `${s.color}06`,
                    border: `1px solid ${s.color}12`,
                    textAlign: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>
                    {s.count}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {s.icon} {s.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <TextField
            size="small"
            placeholder="Search leaves by employee, department, type, status, reason..."
            value={leaveSearch}
            onChange={(e) => setLeaveSearch(e.target.value)}
            sx={{ mb: 2, minWidth: 400 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          <TableContainer
            component={Paper}
            sx={{
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 'none',
              maxHeight: 480,
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dates</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reviewed By</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Review Note</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeaves.map((leave, idx) => {
                  const duration =
                    leave.duration ||
                    dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1;
                  const typeColor = leaveTypeColors[leave.leaveType] || '#818cf8';
                  const statusSx = statusChipSx[leave.status] || statusChipSx.pending;
                  const deptInfo = DEPARTMENT_CONFIG[leave.employee?.department] || { emoji: '🏢' };

                  return (
                    <TableRow
                      key={leave._id}
                      sx={{
                        transition: 'background 0.15s ease',
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {idx + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              bgcolor: 'primary.main',
                            }}
                          >
                            {leave.employee?.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}>
                              {leave.employee?.name || 'N/A'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                              {leave.employee?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <Typography component="span" sx={{ fontSize: '0.75rem' }}>
                            {deptInfo.emoji}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 500 }}>
                            {leave.employee?.department || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={leaveTypes.find(t => t.identifier === leave.leaveType)?.name || leave.leaveType}
                          size="small"
                          sx={{
                            bgcolor: `${typeColor}12`,
                            color: typeColor,
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            fontSize: '0.68rem',
                            height: 22,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {dayjs(leave.startDate).format('MMM D')} → {dayjs(leave.endDate).format('MMM D')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          {duration} day{duration > 1 ? 's' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status}
                          size="small"
                          sx={{
                            ...statusSx,
                            fontWeight: 700,
                            textTransform: 'capitalize',
                            fontSize: '0.68rem',
                            height: 22,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={leave.reason} arrow>
                          <Typography
                            variant="caption"
                            sx={{
                              maxWidth: 160,
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {leave.reason}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {leave.reviewedBy?.name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {leave.reviewComment ? (
                          <Tooltip title={leave.reviewComment} arrow>
                            <Typography
                              variant="caption"
                              sx={{
                                maxWidth: 140,
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontStyle: 'italic',
                                color: 'text.secondary',
                              }}
                            >
                              💬 {leave.reviewComment}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {dayjs(leave.createdAt).format('MMM D, YYYY')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredLeaves.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No leave records match your search</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
            Showing {filteredLeaves.length} of {leaves.length} leave records
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DatabaseViewer;
