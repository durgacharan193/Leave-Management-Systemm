import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  DarkMode,
  LightMode,
  Logout,
  Person,
  NotificationsNoneOutlined,
  Business,
  Shield,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { ROLE_CONFIG, DEPARTMENT_CONFIG } from '../../constants/departments';

/**
 * Top navigation bar — frosted glass effect with refined user actions
 */
const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const roleInfo = ROLE_CONFIG[user?.role] || ROLE_CONFIG.employee;
  const deptInfo = DEPARTMENT_CONFIG[user?.department] || { emoji: '🏢', color: '#64748b' };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(8, 10, 20, 0.75)'
            : 'rgba(255, 255, 255, 0.8)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1, py: 0.5 }}>
        {/* Mobile menu toggle */}
        <IconButton
          onClick={onMenuToggle}
          sx={{
            display: { md: 'none' },
            color: 'text.primary',
            '&:hover': { transform: 'scale(1.05)' },
            transition: 'transform 0.2s ease',
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Greeting area */}
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: 700, color: 'text.primary' }}
            >
              {getGreeting()}, {user?.name?.split(' ')[0]}
            </Typography>
            <Typography variant="body1" component="span">
              👋
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.2 }}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.72rem',
              }}
            >
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Typography>
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  bgcolor: 'text.disabled',
                }}
              />
              <Chip
                label={`${deptInfo.emoji} ${user?.department || 'General'}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  bgcolor: `${deptInfo.color}10`,
                  color: deptInfo.color,
                  border: `1px solid ${deptInfo.color}15`,
                  '& .MuiChip-label': { px: 0.8 },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Notification icon (decorative) */}
          <Tooltip title="Notifications">
            <IconButton
              sx={{
                color: 'text.secondary',
                transition: 'all 0.2s ease',
                '&:hover': { color: 'primary.main', transform: 'scale(1.05)' },
              }}
            >
              <NotificationsNoneOutlined sx={{ fontSize: 22 }} />
            </IconButton>
          </Tooltip>

          {/* Theme toggle */}
          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton
              onClick={toggleTheme}
              sx={{
                color: 'text.secondary',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'rotate(30deg) scale(1.05)',
                  color: mode === 'dark' ? '#fbbf24' : '#6366f1',
                },
              }}
            >
              {mode === 'dark' ? (
                <LightMode sx={{ fontSize: 22 }} />
              ) : (
                <DarkMode sx={{ fontSize: 22 }} />
              )}
            </IconButton>
          </Tooltip>

          {/* User avatar */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                p: 0.5,
                ml: 0.5,
                transition: 'transform 0.2s ease',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}88)`,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  border: '2px solid',
                  borderColor: 'divider',
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              mt: 1.5,
              minWidth: 260,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backdropFilter: 'blur(12px)',
            },
          }}
        >
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {user?.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
              <Chip
                icon={<Shield sx={{ fontSize: '14px !important' }} />}
                label={roleInfo.label}
                size="small"
                sx={{
                  height: 24,
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  bgcolor: roleInfo.bg,
                  color: roleInfo.color,
                  '& .MuiChip-icon': { color: roleInfo.color },
                }}
              />
              <Chip
                icon={<Business sx={{ fontSize: '14px !important' }} />}
                label={user?.department || 'General'}
                size="small"
                sx={{
                  height: 24,
                  fontWeight: 600,
                  fontSize: '0.68rem',
                  bgcolor: `${deptInfo.color}10`,
                  color: deptInfo.color,
                  '& .MuiChip-icon': { color: deptInfo.color },
                }}
              />
            </Box>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate('/dashboard');
            }}
            sx={{ py: 1.2 }}
          >
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Profile
            </Typography>
          </MenuItem>
          <Divider sx={{ mx: 1 }} />
          <MenuItem
            onClick={handleLogout}
            sx={{ color: 'error.main', py: 1.2 }}
          >
            <ListItemIcon>
              <Logout fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Sign Out
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
