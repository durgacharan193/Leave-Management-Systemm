import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { LeaveTypeProvider } from './context/LeaveTypeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import ManagerPanel from './pages/ManagerPanel';
import AdminPanel from './pages/AdminPanel';
import DatabaseViewer from './pages/DatabaseViewer';

/**
 * Main App Component
 * Defines all routes with role-based protection
 */
const App = () => {
  return (
    <LeaveTypeProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — wrapped in Layout */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard — all authenticated users */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Employee & Manager routes */}
          <Route
            path="/apply-leave"
            element={
              <ProtectedRoute roles={['employee', 'manager']}>
                <ApplyLeave />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-history"
            element={
              <ProtectedRoute roles={['employee', 'manager']}>
                <LeaveHistory />
              </ProtectedRoute>
            }
          />

          {/* Manager only */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute roles={['manager']}>
                <ManagerPanel />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/database"
            element={
              <ProtectedRoute roles={['admin']}>
                <DatabaseViewer />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </LeaveTypeProvider>
  );
};

export default App;
