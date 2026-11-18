import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  LinearProgress,
  Chip,
  Button,
} from '@mui/material';
import { FilterList, Refresh } from '@mui/icons-material';
import api from '../api/axios';
import LeaveCard from '../components/LeaveCard';
import { useLeaveTypes } from '../context/LeaveTypeContext';
import toast from 'react-hot-toast';

/**
 * Leave History Page
 * Shows the current employee's leave records with filtering and pagination
 */
const LeaveHistory = () => {
  const { leaveTypes } = useLeaveTypes();
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });
  const [filters, setFilters] = useState({ status: '', leaveType: '' });
  const [loading, setLoading] = useState(true);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 9 };
      if (filters.status) params.status = filters.status;
      if (filters.leaveType) params.leaveType = filters.leaveType;

      const res = await api.get('/leaves/my', { params });
      setLeaves(res.data.data.leaves);
      setPagination((prev) => ({ ...prev, ...res.data.data.pagination }));
    } catch (err) {
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleCancel = async (leaveId) => {
    try {
      await api.patch(`/leaves/${leaveId}/cancel`);
      toast.success('Leave request cancelled');
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ status: '', leaveType: '' });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasFilters = filters.status || filters.leaveType;

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            My Leaves
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            View and manage your leave requests
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={fetchLeaves}
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
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
            onChange={(e) => handleFilterChange('status', e.target.value)}
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
            value={filters.leaveType}
            label="Type"
            onChange={(e) => handleFilterChange('leaveType', e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {leaveTypes.map(type => (
              <MenuItem key={type.identifier} value={type.identifier}>
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {hasFilters && (
          <Chip
            label="Clear filters"
            onDelete={clearFilters}
            size="small"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          />
        )}
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', ml: 'auto' }}
        >
          {pagination.total} total record{pagination.total !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

      {/* Leave Cards Grid */}
      {!loading && leaves.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            No leave requests found
          </Typography>
          <Typography variant="body2">
            {hasFilters
              ? 'Try adjusting your filters'
              : "You haven't applied for any leave yet"}
          </Typography>
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
                animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
                '@keyframes fadeInUp': {
                  from: { opacity: 0, transform: 'translateY(12px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <LeaveCard leave={leave} onCancel={handleCancel} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.pages}
            page={pagination.page}
            onChange={(_, page) =>
              setPagination((prev) => ({ ...prev, page }))
            }
            color="primary"
            shape="rounded"
            sx={{
              '& .MuiPaginationItem-root': {
                fontWeight: 600,
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default LeaveHistory;
