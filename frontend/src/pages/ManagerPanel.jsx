import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  FilterList,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import api from '../api/axios';
import { DEPARTMENT_CONFIG } from '../constants/departments';
import { useLeaveTypes } from '../context/LeaveTypeContext';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  cancelled: 'default',
};

const TYPE_COLORS = {
  casual: '#6366f1',
  sick: '#ef4444',
  paid: '#10b981',
  maternity: '#e879f9',
};

/**
 * Manager Panel
 * View and review team leave requests
 */
const ManagerPanel = () => {
  const { leaveTypes } = useLeaveTypes();
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });
  const [filters, setFilters] = useState({ status: '', leaveType: '' });
  const [loading, setLoading] = useState(true);

  // Review dialog state
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Detail dialog
  const [detailDialog, setDetailDialog] = useState(false);
  const [detailLeave, setDetailLeave] = useState(null);

  const fetchTeamLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.leaveType) params.leaveType = filters.leaveType;

      const res = await api.get('/leaves/team', { params });
      setLeaves(res.data.data.leaves);
      setPagination((prev) => ({ ...prev, ...res.data.data.pagination }));
    } catch (err) {
      toast.error('Failed to load team leaves');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchTeamLeaves();
  }, [fetchTeamLeaves]);

  const openReview = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewComment('');
    setReviewDialog(true);
  };

  const handleReview = async () => {
    setReviewLoading(true);
    try {
      await api.patch(`/leaves/${selectedLeave._id}/review`, {
        status: reviewAction,
        reviewComment,
      });
      toast.success(`Leave ${reviewAction} successfully`);
      setReviewDialog(false);
      fetchTeamLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review leave');
    } finally {
      setReviewLoading(false);
    }
  };

  const pendingCount = leaves.filter((l) => l.status === 'pending').length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Team Requests
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Manage your team's leave applications
          {pendingCount > 0 && (
            <Chip
              label={`${pendingCount} pending`}
              size="small"
              color="warning"
              sx={{ ml: 1, fontWeight: 600, fontSize: '0.7rem' }}
            />
          )}
        </Typography>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <FilterList sx={{ color: 'text.secondary' }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status}
            label="Status"
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, status: e.target.value }));
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.leaveType}
            label="Type"
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, leaveType: e.target.value }));
              setPagination((prev) => ({ ...prev, page: 1 }));
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
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

      {/* Requests Table */}
      {!loading && leaves.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No team leave requests found
          </Typography>
          <Typography variant="body2">
            No employees have submitted leave requests yet
          </Typography>
        </Box>
      ) : (
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
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.map((leave) => {
                const duration =
                  leave.duration ||
                  dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1;
                
                const typeObj = leaveTypes.find(t => t.identifier === leave.leaveType) || {};
                const typeColor = typeObj.color || '#6366f1';
                const typeName = typeObj.name || leave.leaveType;

                return (
                  <TableRow
                    key={leave._id}
                    sx={{
                      transition: 'background 0.15s ease',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            bgcolor: 'primary.main',
                          }}
                        >
                          {leave.employee?.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600 }}
                          >
                            {leave.employee?.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                            <Typography component="span" sx={{ fontSize: '0.7rem' }}>
                              {(DEPARTMENT_CONFIG[leave.employee?.department] || {}).emoji || '🏢'}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 500 }}
                            >
                              {leave.employee?.department}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={typeName}
                        size="small"
                        sx={{
                          bgcolor: `${typeColor}18`,
                          color: typeColor,
                          fontWeight: 700,
                          textTransform: 'capitalize',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {dayjs(leave.startDate).format('MMM D')} —{' '}
                        {dayjs(leave.endDate).format('MMM D')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {duration} day{duration > 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.status}
                        size="small"
                        color={STATUS_COLORS[leave.status]}
                        variant="outlined"
                        sx={{
                          textTransform: 'capitalize',
                          fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setDetailLeave(leave);
                            setDetailDialog(true);
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {leave.status === 'pending' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              onClick={() => openReview(leave, 'approved')}
                              sx={{ color: 'success.main' }}
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              onClick={() => openReview(leave, 'rejected')}
                              sx={{ color: 'error.main' }}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={(_, page) =>
              setPagination((prev) => ({ ...prev, page }))
            }
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      {/* Review Dialog */}
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
          {reviewAction === 'approved' ? '✅ Approve' : '❌ Reject'} Leave
          Request
        </DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <Box sx={{ mb: 2, mt: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>{selectedLeave.employee?.name}</strong> is requesting{' '}
                <strong>{selectedLeave.leaveType}</strong> leave from{' '}
                <strong>
                  {dayjs(selectedLeave.startDate).format('MMM D, YYYY')}
                </strong>{' '}
                to{' '}
                <strong>
                  {dayjs(selectedLeave.endDate).format('MMM D, YYYY')}
                </strong>
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mb: 2 }}
              >
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
            onClick={handleReview}
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

      {/* Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
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
        <DialogTitle sx={{ fontWeight: 700 }}>Leave Request Details</DialogTitle>
        <DialogContent>
          {detailLeave && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              {[
                { label: 'Employee', value: detailLeave.employee?.name },
                { label: 'Email', value: detailLeave.employee?.email },
                { label: 'Department', value: `${(DEPARTMENT_CONFIG[detailLeave.employee?.department] || {}).emoji || '🏢'} ${detailLeave.employee?.department || 'N/A'}` },
                {
                  label: 'Type',
                  value: leaveTypes.find((t) => t.identifier === detailLeave.leaveType)?.name || detailLeave.leaveType,
                },
                {
                  label: 'From',
                  value: dayjs(detailLeave.startDate).format('MMM D, YYYY'),
                },
                {
                  label: 'To',
                  value: dayjs(detailLeave.endDate).format('MMM D, YYYY'),
                },
                { label: 'Reason', value: detailLeave.reason },
                { label: 'Status', value: detailLeave.status },
                {
                  label: 'Applied',
                  value: dayjs(detailLeave.createdAt).format(
                    'MMM D, YYYY h:mm A'
                  ),
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      textAlign: 'right',
                      maxWidth: '60%',
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
              {detailLeave.reviewComment && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: 'action.hover',
                    borderLeft: '3px solid',
                    borderColor:
                      detailLeave.status === 'approved'
                        ? 'success.main'
                        : 'error.main',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Review Comment:
                  </Typography>
                  <Typography variant="body2">
                    {detailLeave.reviewComment}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerPanel;
