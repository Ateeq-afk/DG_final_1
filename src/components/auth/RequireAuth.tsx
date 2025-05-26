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

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // Redirect to the login page if not logged in
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    // Redirect to unauthorized page or dashboard with limited access
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}