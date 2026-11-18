import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  CalendarMonth,
  ArrowForward,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/**
 * Login Page — Premium centered card with animated background orbs
 */
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? '#06070e'
            : '#f4f6fb',
      }}
    >
      {/* Animated background orbs */}
      <Box
        sx={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 8s ease-in-out infinite',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(20,184,166,0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 10s ease-in-out infinite reverse',
        }}
      />

      <Box sx={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            mb: 5,
            animation: 'fadeIn 0.7s ease-out',
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              animation: 'glow 3s ease-in-out infinite',
            }}
          >
            <CalendarMonth sx={{ fontSize: 28, color: '#ffffff' }} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #818cf8, #2dd4bf)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1.1,
              }}
            >
              LeaveFlow
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: '0.65rem',
              }}
            >
              Leave Management System
            </Typography>
          </Box>
        </Box>

        <Card
          sx={{
            animation: 'fadeIn 0.6s ease-out 0.15s both',
            '&:hover': {
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 8px 40px rgba(0,0,0,0.5)'
                  : '0 8px 40px rgba(0,0,0,0.08)',
            },
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              Welcome back
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mb: 3.5 }}
            >
              Sign in to your account to continue
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  borderRadius: 3,
                  '& .MuiAlert-message': { fontWeight: 500 },
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                id="login-email"
                name="email"
                label="Email Address"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                id="login-password"
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                value={formData.password}
                onChange={handleChange}
                sx={{ mb: 3.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                id="login-submit"
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                endIcon={!loading && <ArrowForward sx={{ fontSize: 18 }} />}
                sx={{
                  py: 1.6,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: 3,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Chip
                label="OR"
                size="small"
                sx={{ fontSize: '0.7rem', fontWeight: 600, px: 1 }}
              />
            </Divider>

            <Typography
              variant="body2"
              sx={{ textAlign: 'center', color: 'text.secondary' }}
            >
              Don&apos;t have an account?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Create one
              </Link>
            </Typography>
          </CardContent>
        </Card>

        {/* Demo credentials */}
        <Card
          sx={{
            mt: 2.5,
            animation: 'fadeIn 0.6s ease-out 0.4s both',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(99,102,241,0.05)'
                : 'rgba(99,102,241,0.03)',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(99,102,241,0.12)'
                : 'rgba(99,102,241,0.08)',
          }}
        >
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                display: 'block',
                mb: 1,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'primary.main',
                fontSize: '0.68rem',
              }}
            >
              Demo Credentials
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
              {[
                { role: 'Admin', email: 'admin@company.com', pass: 'admin123' },
                { role: 'Manager', email: 'sarah.manager@company.com', pass: 'manager123' },
                { role: 'Employee', email: 'alice@company.com', pass: 'employee123' },
              ].map((cred) => (
                <Box key={cred.role} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={cred.role}
                    size="small"
                    sx={{
                      minWidth: 72,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      height: 22,
                    }}
                    variant="outlined"
                    color="primary"
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                    {cred.email} / {cred.pass}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;
