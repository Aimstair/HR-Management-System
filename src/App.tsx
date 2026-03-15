import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import { UserRole } from './types';

// Page imports - Auth
import LoginPage from './pages/auth/LoginPage';

// Page imports - Employee Portal
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeeRequests from './pages/employee/EmployeeRequests';
import EmployeeEvaluations from './pages/employee/EmployeeEvaluations';

// Page imports - HR Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminOrganization from './pages/admin/AdminOrganization';
import AdminRequests from './pages/admin/AdminRequests';
import AdminShifts from './pages/admin/AdminShifts';
import AdminReports from './pages/admin/AdminReports';

/**
 * Protected Route Component
 * Ensures only authenticated users with correct role can access route
 */
interface ProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Main App Component
 * Defines routing structure for entire application
 */
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ===== AUTHENTICATION ROUTES ===== */}
      <Route path="/login" element={<LoginPage />} />

      {/* ===== EMPLOYEE PORTAL ROUTES ===== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/portal/dashboard" element={<EmployeeDashboard />} />
        <Route path="/portal/profile" element={<EmployeeProfile />} />
        <Route path="/portal/attendance" element={<EmployeeAttendance />} />
        <Route path="/portal/requests" element={<EmployeeRequests />} />
        <Route path="/portal/evaluations" element={<EmployeeEvaluations />} />
      </Route>

      {/* ===== HR ADMIN ROUTES ===== */}
      <Route
        element={
          <ProtectedRoute allowedRoles={[UserRole.HR]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<AdminEmployees />} />
        <Route path="/admin/organization" element={<AdminOrganization />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
        <Route path="/admin/shifts" element={<AdminShifts />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Route>

      {/* ===== ROOT & FALLBACK ROUTES ===== */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={user.role === UserRole.EMPLOYEE ? '/portal/dashboard' : '/admin/dashboard'}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * Root App Component with Providers
 */
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
