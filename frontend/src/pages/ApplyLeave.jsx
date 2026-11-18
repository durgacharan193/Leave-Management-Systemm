import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Send, EventNote } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useLeaveTypes } from '../context/LeaveTypeContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

/**
 * Leave Application Form
 * Allows employees and managers to submit leave requests
 */
const ApplyLeave = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaveTypes } = useLeaveTypes();
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Calculate duration
  const getDuration = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) return 0;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const duration = getDuration();

  // Get available balance for selected type
  const getBalance = () => {
    if (!formData.leaveType || !user?.leaveBalance) return null;
    const leaveTypeObj = leaveTypes.find(t => t.identifier === formData.leaveType);
    let bal = user.leaveBalance[formData.leaveType];
    if (bal === undefined && leaveTypeObj) {
      bal = leaveTypeObj.defaultBalance;
    }
    return bal ?? null;
  };

  const balance = getBalance();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be on or after start date');
      setLoading(false);
      return;
    }

    if (balance !== null && duration > balance) {
      setError(
        `Insufficient ${formData.leaveType} leave balance. Available: ${balance}, Requested: ${duration}`
      );
      setLoading(false);
      return;
    }

    try {
      await api.post('/leaves', formData);
      toast.success('Leave application submitted!');
      navigate('/leave-history');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to submit leave request';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Apply for Leave
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Fill in the details below to submit a leave request
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="leave-type-label">Leave Type</InputLabel>
                  <Select
                    id="leave-type-select"
                    labelId="leave-type-label"
                    name="leaveType"
                    value={formData.leaveType}
                    label="Leave Type"
                    onChange={handleChange}
                    required
                  >
                    {leaveTypes.map((type) => {
                      if (type.genderRestrict !== 'none' && user?.gender !== type.genderRestrict) {
                        return null; // Don't show if restricted
                      }
                      const bal = user?.leaveBalance?.[type.identifier] ?? type.defaultBalance;
                      return (
                        <MenuItem key={type.identifier} value={type.identifier}>
                          {type.icon} {type.name} (Balance: {bal})
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="start-date"
                      name="startDate"
                      label="Start Date"
                      type="date"
                      fullWidth
                      required
                      value={formData.startDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: new Date().toISOString().split('T')[0],
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      id="end-date"
                      name="endDate"
                      label="End Date"
                      type="date"
                      fullWidth
                      required
                      value={formData.endDate}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min:
                          formData.startDate ||
                          new Date().toISOString().split('T')[0],
                      }}
                    />
                  </Grid>
                </Grid>

                <TextField
                  id="leave-reason"
                  name="reason"
                  label="Reason for Leave"
                  multiline
                  rows={4}
                  fullWidth
                  required
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Please provide a brief reason for your leave request..."
                  sx={{ mb: 3 }}
                  inputProps={{ maxLength: 500 }}
                  helperText={`${formData.reason.length}/500 characters`}
                />

                <Button
                  id="submit-leave"
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <Send />
                    )
                  }
                  disabled={loading}
                  sx={{ px: 4 }}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary sidebar */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(20,184,166,0.05))'
                  : 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(20,184,166,0.02))',
              border: '1px solid',
              borderColor: 'primary.dark',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2.5,
                }}
              >
                <EventNote sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Request Summary
                </Typography>
              </Box>

              {[
                {
                  label: 'Leave Type',
                  value: formData.leaveType
                    ? (leaveTypes.find((t) => t.identifier === formData.leaveType)?.name ||
                      formData.leaveType)
                    : '—',
                },
                {
                  label: 'Start Date',
                  value: formData.startDate
                    ? new Date(formData.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—',
                },
                {
                  label: 'End Date',
                  value: formData.endDate
                    ? new Date(formData.endDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—',
                },
                {
                  label: 'Duration',
                  value: duration > 0 ? `${duration} day${duration > 1 ? 's' : ''}` : '—',
                },
                {
                  label: 'Available Balance',
                  value: balance !== null ? `${balance} days` : '—',
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1.2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary' }}
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}

              {balance !== null && duration > balance && (
                <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                  Insufficient balance!
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ApplyLeave;
