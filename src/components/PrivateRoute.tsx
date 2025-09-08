import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedPermission: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedPermission }) => {
  const { currentUser, isLoading,currentPermissionList } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading spinner or message
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
const hasPermission = allowedPermission?.some(permission =>
  currentPermissionList.includes(permission)
);

  if (!hasPermission) {
    return <Navigate to={'/admin/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;