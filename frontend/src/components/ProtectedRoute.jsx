import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route component
 * Redirects to login if not authenticated
 * Redirects to dashboard if user doesn't have the required role
 *
 * @param {ReactNode} children - The protected page content
 * @param {string[]} roles - Array of roles allowed to access this route
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: (theme) => theme.palette.background.default,
        }}
      >
        <CircularProgress
          size={48}
          sx={{
            color: 'primary.main',
          }}
        />
      </Box>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role check — if roles are specified, verify the user has one
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
