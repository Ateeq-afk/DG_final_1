import React from 'react';
import { Navigate } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RequireAuth({ children }: RequireAuthProps) {
  // In demo mode, we always allow access
  return <>{children}</>;
}