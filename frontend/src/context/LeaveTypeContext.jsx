import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const LeaveTypeContext = createContext();

export const LeaveTypeProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaveTypes = async () => {
    try {
      const res = await api.get('/leave-types');
      setLeaveTypes(res.data.data.leaveTypes);
    } catch (err) {
      console.error('Failed to load leave types', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaveTypes();
    } else {
      setLeaveTypes([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshLeaveTypes = () => {
    setLoading(true);
    fetchLeaveTypes();
  };

  return (
    <LeaveTypeContext.Provider
      value={{
        leaveTypes,
        loading,
        refreshLeaveTypes,
      }}
    >
      {children}
    </LeaveTypeContext.Provider>
  );
};

export const useLeaveTypes = () => {
  const context = useContext(LeaveTypeContext);
  if (!context) {
    throw new Error('useLeaveTypes must be used within a LeaveTypeProvider');
  }
  return context;
};
