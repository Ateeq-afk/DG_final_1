import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { user, userData, loading } = useAuth();
  const location = useLocation();

  // Debug logs
  console.log('RequireAuth - loading:', loading, 'user:', !!user, 'userData:', userData);

  // Show loading screen while auth state is being determined
  if (loading) {
    return <LoadingScreen />;
  }

  // For Bolt preview, allow access without authentication in development mode
  if (!user && process.env.NODE_ENV === 'development') {
    console.log('Development mode: bypassing authentication');
    return <>{children}</>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Redirect to the login page with the current location
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    // Redirect to unauthorized page or dashboard with limited access
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}