import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EventNote as LeaveIcon,
  History as HistoryIcon,
  Group as TeamIcon,
  AdminPanelSettings as AdminIcon,
  CalendarMonth as CalendarIcon,
  Business as DeptIcon,
  Storage,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { ROLE_CONFIG, DEPARTMENT_CONFIG } from '../../constants/departments';

/**
 * Sidebar navigation — premium design with glassmorphism and animated active states
 */
const Sidebar = ({ drawerWidth, mobileOpen, onClose, isMobile }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Role-based menu items
  const getMenuItems = () => {
    const base = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    ];

    if (user?.role === 'employee' || user?.role === 'manager') {
      base.push(
        { text: 'Apply Leave', icon: <LeaveIcon />, path: '/apply-leave' },
        { text: 'My Leaves', icon: <HistoryIcon />, path: '/leave-history' }
      );
    }

    if (user?.role === 'manager') {
      base.push({
        text: 'Team Requests',
        icon: <TeamIcon />,
        path: '/manager',
      });
    }

    if (user?.role === 'admin') {
      base.push(
        { text: 'Admin Panel', icon: <AdminIcon />, path: '/admin' },
        { text: 'Database', icon: <Storage />, path: '/database' }
      );
    }

    return base;
  };

  const menuItems = getMenuItems();

  const roleInfo = ROLE_CONFIG[user?.role] || ROLE_CONFIG.employee;
  const deptInfo = DEPARTMENT_CONFIG[user?.department] || { emoji: '🏢', color: '#64748b' };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #080a14 0%, #0d0f1a 100%)'
            : 'linear-gradient(180deg, #f8f9fc 0%, #ffffff 100%)',
      }}
    >
      {/* Brand */}
      <Box
        sx={{
          p: 3,
          pb: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #14b8a6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            flexShrink: 0,
          }}
        >
          <CalendarIcon sx={{ fontSize: 22, color: '#ffffff' }} />
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #818cf8, #2dd4bf)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            LeaveFlow
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Management
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2.5, opacity: 0.4 }} />

      {/* Role & Department Card */}
      <Box
        sx={{
          mx: 2,
          mt: 2,
          mb: 1,
          p: 2,
          borderRadius: 3,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${roleInfo.color}08, ${deptInfo.color}06)`
              : `linear-gradient(135deg, ${roleInfo.color}06, ${deptInfo.color}04)`,
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark'
              ? `${roleInfo.color}15`
              : `${roleInfo.color}10`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography component="span" sx={{ fontSize: '1rem' }}>{roleInfo.icon}</Typography>
          <Chip
            label={roleInfo.label}
            size="small"
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 700,
              bgcolor: roleInfo.bg,
              color: roleInfo.color,
              letterSpacing: '0.02em',
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
          <DeptIcon sx={{ fontSize: 14, color: deptInfo.color, opacity: 0.8 }} />
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          >
            {user?.department || 'General'}
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ px: 2, py: 1.5, flexGrow: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 700,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            px: 1,
            mb: 1,
            display: 'block',
          }}
        >
          Navigation
        </Typography>
        <List sx={{ py: 0 }}>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.3 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) onClose();
                  }}
                  sx={{
                    borderRadius: 3,
                    py: 1.2,
                    px: 1.5,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    animation: `slideInLeft 0.35s ease-out ${index * 0.06}s both`,
                    ...(isActive
                      ? {
                          background: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(45,212,191,0.06))'
                              : 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(20,184,166,0.05))',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 3,
                            height: '60%',
                            borderRadius: '0 4px 4px 0',
                            background: 'linear-gradient(180deg, #818cf8, #2dd4bf)',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'primary.main',
                          },
                          '& .MuiListItemText-primary': {
                            fontWeight: 700,
                            color: 'primary.main',
                          },
                        }
                      : {
                          '&:hover': {
                            background: (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(136,146,176,0.06)'
                                : 'rgba(0,0,0,0.03)',
                            transform: 'translateX(2px)',
                          },
                        }),
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User info */}
      <Divider sx={{ mx: 2.5, opacity: 0.4 }} />
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}88)`,
            fontSize: '0.9rem',
            fontWeight: 800,
            boxShadow: `0 4px 12px ${roleInfo.color}30`,
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
        <Box sx={{ overflow: 'hidden', flex: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, lineHeight: 1.3 }}
            noWrap
          >
            {user?.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.65rem',
              fontWeight: 500,
            }}
            noWrap
          >
            {user?.email}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
