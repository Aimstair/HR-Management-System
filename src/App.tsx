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
import AdminEmployees from './pages/admin/employees';
import AdminOrganization from './pages/admin/AdminOrganization';
import AdminRequests from './pages/admin/AdminRequests';
import AdminShifts from './pages/admin/AdminShifts';
import AdminReports from './pages/admin/AdminAttendanceReport';
import AdminTardinessReport from './pages/admin/AdminTardinessReport';
import AdminMemo from './pages/admin/AdminMemo';
import LeaveReportPage from './pages/admin/reports/requests/pages/LeaveReportPage';
import ExpenseReportPage from './pages/admin/reports/requests/pages/ExpenseReportPage';
import FundRequestReportPage from './pages/admin/reports/requests/pages/FundRequestReportPage';
import GenericRequestReportPage from './pages/admin/reports/requests/pages/GenericRequestReportPage';
import OvertimeReportPage from './pages/admin/reports/requests/pages/OvertimeReportPage';
import UndertimeReportPage from './pages/admin/reports/requests/pages/UndertimeReportPage';
import WorkFromHomeReportPage from './pages/admin/reports/requests/pages/WorkFromHomeReportPage';
import TimeAdjustmentReportPage from './pages/admin/reports/requests/pages/TimeAdjustmentReportPage';
import ShiftAssignmentReportPage from './pages/admin/reports/requests/pages/ShiftAssignmentReportPage';
import { swapRequestRecords } from './pages/admin/reports/requests/mockData';

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
        <Route path="/admin/reports" element={<Navigate to="/admin/reports/attendance" replace />} />
        <Route path="/admin/reports/attendance" element={<AdminReports />} />
        <Route path="/admin/reports/tardiness" element={<AdminTardinessReport />} />
        <Route path="/admin/reports/requests" element={<Navigate to="/admin/reports/requests/leave" replace />} />
        <Route path="/admin/reports/requests/leave" element={<LeaveReportPage />} />
        <Route path="/admin/reports/requests/expense" element={<ExpenseReportPage />} />
        <Route path="/admin/reports/requests/fund" element={<FundRequestReportPage />} />
        <Route path="/admin/reports/requests/overtime" element={<OvertimeReportPage />} />
        <Route path="/admin/reports/requests/undertime" element={<UndertimeReportPage />} />
        <Route path="/admin/reports/requests/wfh" element={<WorkFromHomeReportPage />} />
        <Route path="/admin/reports/requests/time-adjustment" element={<TimeAdjustmentReportPage />} />
        <Route path="/admin/reports/requests/shift-assignment" element={<ShiftAssignmentReportPage />} />
        <Route
          path="/admin/reports/requests/swap-request"
          element={<GenericRequestReportPage title="Swap Request Report" description="Track schedule swap requests and decisions." rows={swapRequestRecords} />}
        />
        <Route path="/admin/memo" element={<AdminMemo />} />
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
