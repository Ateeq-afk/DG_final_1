import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import TrackingPage from './pages/TrackingPage';
import SignInPage from './pages/SignInPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import RequireAuth from './components/auth/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/track" element={<TrackingPage />} />
        <Route path="/track/:lrNumber" element={<TrackingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />
        
        <Route path="/dashboard/*" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />
        
        {/* Admin-only routes */}
        <Route path="/admin/*" element={
          <RequireAuth allowedRoles={['admin']}>
            <Dashboard />
          </RequireAuth>
        } />
        
        {/* Finance routes */}
        <Route path="/finance/*" element={
          <RequireAuth allowedRoles={['admin', 'accountant']}>
            <Dashboard />
          </RequireAuth>
        } />
        
        {/* Catch-all route */}
        <Route path="*" element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;