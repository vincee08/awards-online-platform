import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AwardsPage = lazy(() => import('./pages/AwardsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const WaitingApprovalPage = lazy(() => import('./pages/WaitingApprovalPage'));
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AwardsManagement = lazy(() => import('./pages/admin/AwardsManagement'));
const AwardForm = lazy(() => import('./pages/admin/AwardForm'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F3FF]">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/awards" element={<AwardsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/waiting-approval" element={<WaitingApprovalPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="awards" element={<AwardsManagement />} />
            <Route path="awards/add" element={<AwardForm />} />
            <Route path="awards/edit/:id" element={<AwardForm />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="settings" element={<div className="p-8 text-center bg-white rounded-3xl border border-gray-100">Settings Page (Coming Soon)</div>} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
