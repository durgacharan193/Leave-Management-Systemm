import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Skeleton,
} from '@mui/material';
import {
  EventAvailable,
  HourglassTop,
  CheckCircle,
  Cancel,
  TrendingUp,
  WavingHand,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useLeaveTypes } from '../context/LeaveTypeContext';
import api from '../api/axios';
import StatsCard from '../components/StatsCard';

const CHART_COLORS = ['#fbbf24', '#34d399', '#f87171', '#8892b0'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Role-adaptive Dashboard — Premium layout with rich charts and animated cards
 */
const Dashboard = () => {
  const { user } = useAuth();
  const { leaveTypes } = useLeaveTypes();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/leaves/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={50} sx={{ mb: 2 }} />
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={130} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const statusStats = stats?.statusStats || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  const typeStats = stats?.typeStats || {};

  // Pie chart data
  const pieData = [
    { name: 'Pending', value: statusStats.pending },
    { name: 'Approved', value: statusStats.approved },
    { name: 'Rejected', value: statusStats.rejected },
    { name: 'Cancelled', value: statusStats.cancelled || 0 },
  ].filter((d) => d.value > 0);

  // Bar chart data
  const monthlyData = (stats?.monthlyTrend || []).map((item) => ({
    name: MONTHS[item._id.month - 1],
    requests: item.count,
  }));

  // Leave type chart
  const typeData = leaveTypes
    .filter((type) => {
      if (type.genderRestrict !== 'none' && user?.gender !== type.genderRestrict) return false;
      return true;
    })
    .map((type) => ({
      name: type.name,
      value: typeStats[type.identifier] || 0,
      color: type.color,
    }));

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'dark' ? '#1a1d2e' : '#ffffff',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2.5,
          px: 2,
          py: 1.2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}
      >
        {label && (
          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.3 }}>
            {label}
          </Typography>
        )}
        {payload.map((entry, i) => (
          <Typography key={i} variant="caption" sx={{ color: entry.color || 'text.secondary' }}>
            {entry.name}: <strong>{entry.value}</strong>
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, animation: 'fadeIn 0.5s ease-out' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Dashboard
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {user?.role === 'admin'
            ? 'Organization-wide leave analytics & overview'
            : user?.role === 'manager'
            ? 'Your team\'s leave overview & analytics'
            : 'Track your leave balance and request history'}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Requests', value: statusStats.total, icon: <EventAvailable />, color: '#818cf8' },
          { title: 'Pending', value: statusStats.pending, icon: <HourglassTop />, color: '#fbbf24' },
          { title: 'Approved', value: statusStats.approved, icon: <CheckCircle />, color: '#34d399' },
          { title: 'Rejected', value: statusStats.rejected, icon: <Cancel />, color: '#f87171' },
        ].map((stat, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={stat.title}
            sx={{
              animation: `fadeIn 0.4s ease-out ${index * 0.08}s both`,
            }}
          >
            <StatsCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Leave Balance (Employee/Manager only) */}
        {user?.role !== 'admin' && (
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', animation: 'fadeIn 0.5s ease-out 0.3s both' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 3 }}
                >
                  Leave Balance
                </Typography>
                {leaveTypes
                  .filter((type) => {
                    if (type.genderRestrict !== 'none' && user?.gender !== type.genderRestrict) return false;
                    return true;
                  })
                  .map((type) => {
                    const balance = user?.leaveBalance?.[type.identifier] ?? type.defaultBalance;
                    return (
                      <Box key={type.identifier} sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Typography variant="body2" component="span">{type.icon}</Typography>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {type.name}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${balance} / ${type.defaultBalance}`}
                            size="small"
                            sx={{
                              bgcolor: `${type.color}12`,
                              color: type.color,
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 24,
                              border: `1px solid ${type.color}18`,
                            }}
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(balance / type.defaultBalance) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: `${type.color}10`,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              background: `linear-gradient(90deg, ${type.color}, ${type.color}aa)`,
                            },
                          }}
                        />
                      </Box>
                    );
                  })}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Pie chart — Status Distribution */}
        <Grid item xs={12} md={user?.role !== 'admin' ? 4 : 6}>
          <Card sx={{ height: '100%', animation: 'fadeIn 0.5s ease-out 0.4s both' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2 }}
              >
                Status Distribution
              </Typography>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    height: 220,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    No leave data yet
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  flexWrap: 'wrap',
                  mt: 1,
                }}
              >
                {pieData.map((entry, i) => (
                  <Box
                    key={entry.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.6,
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {entry.name} ({entry.value})
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Bar chart — Monthly Trend */}
        <Grid item xs={12} md={user?.role !== 'admin' ? 4 : 6}>
          <Card sx={{ height: '100%', animation: 'fadeIn 0.5s ease-out 0.5s both' }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                }}
              >
                <TrendingUp sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Monthly Trend
                </Typography>
              </Box>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(136,146,176,0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#8892b0', fontSize: 11, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#8892b0', fontSize: 11, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="requests"
                      fill="#818cf8"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    height: 220,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    No trend data yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Types Breakdown */}
        <Grid item xs={12}>
          <Card sx={{ animation: 'fadeIn 0.5s ease-out 0.6s both' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2.5 }}
              >
                Leave Types Breakdown
              </Typography>
              <Grid container spacing={2.5}>
                {typeData.map((type, index) => (
                  <Grid item xs={12} sm={4} key={type.name}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        bgcolor: `${type.color}06`,
                        border: `1px solid ${type.color}12`,
                        textAlign: 'center',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'default',
                        '&:hover': {
                          transform: 'translateY(-4px) scale(1.01)',
                          bgcolor: `${type.color}10`,
                          boxShadow: `0 8px 24px ${type.color}12`,
                        },
                      }}
                    >
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 800,
                          color: type.color,
                          mb: 0.5,
                          lineHeight: 1.1,
                        }}
                      >
                        {type.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: 'text.secondary',
                        }}
                      >
                            {type.name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
