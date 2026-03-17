import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  BarChart3,
  UserCog,
  BookOpen,
  Building2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Button } from '../../../components/ui/button';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiredRole: UserRole[];
}

/**
 * Sidebar Navigation Component
 * Displays different menu items based on user role
 */
const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Navigation items with role-based access control
  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: user.role === UserRole.EMPLOYEE ? '/portal/dashboard' : '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      requiredRole: [UserRole.EMPLOYEE, UserRole.HR],
    },
    ...(user.role === UserRole.EMPLOYEE
      ? [
          {
            label: 'Profile',
            href: '/portal/profile',
            icon: <UserCog className="w-5 h-5" />,
            requiredRole: [UserRole.EMPLOYEE],
          },
          {
            label: 'Attendance',
            href: '/portal/attendance',
            icon: <Calendar className="w-5 h-5" />,
            requiredRole: [UserRole.EMPLOYEE],
          },
          {
            label: 'Requests',
            href: '/portal/requests',
            icon: <FileText className="w-5 h-5" />,
            requiredRole: [UserRole.EMPLOYEE],
          },
          {
            label: 'Evaluations',
            href: '/portal/evaluations',
            icon: <BookOpen className="w-5 h-5" />,
            requiredRole: [UserRole.EMPLOYEE],
          },
        ]
      : []),
    ...(user.role === UserRole.HR
      ? [
          {
            label: 'Employees',
            href: '/admin/employees',
            icon: <Users className="w-5 h-5" />,
            requiredRole: [UserRole.HR],
          },
          {
            label: 'Organization',
            href: '/admin/organization',
            icon: <Building2 className="w-5 h-5" />,
            requiredRole: [UserRole.HR],
          },
          {
            label: 'Requests',
            href: '/admin/requests',
            icon: <FileText className="w-5 h-5" />,
            requiredRole: [UserRole.HR],
          },
          {
            label: 'Shifts',
            href: '/admin/shifts',
            icon: <Calendar className="w-5 h-5" />,
            requiredRole: [UserRole.HR],
          },
          {
            label: 'Reports',
            href: '/admin/reports',
            icon: <BarChart3 className="w-5 h-5" />,
            requiredRole: [UserRole.HR],
          },
        ]
      : []),
  ];

  const isActive = (href: string): boolean => location.pathname === href;

  return (
    <aside className="w-64 bg-primary text-primary-foreground border-r border-primary/70 flex flex-col h-screen">
      {/* Logo/Branding */}
      <div className="p-6 border-b border-primary/50">
        <h1 className="text-2xl font-bold text-primary-foreground">HR System</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">{user.role.replace('ROLE_', '')}</p>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm font-medium',
              isActive(item.href)
                ? 'bg-accent text-accent-foreground shadow-sm'
                : 'text-primary-foreground/85 hover:bg-primary-foreground/10 hover:text-primary-foreground'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Section & Logout */}
      <div className="border-t border-primary/50 p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/15 flex items-center justify-center text-primary-foreground font-bold border border-primary-foreground/25">
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary-foreground">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-primary-foreground/75">{user.email}</p>
          </div>
        </div>
        <Button
          onClick={logout}
          variant="secondary"
          className="w-full justify-start gap-2 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
          size="sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
