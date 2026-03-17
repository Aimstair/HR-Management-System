import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import ThemeToggle from '../ThemeToggle';

/**
 * Header Component
 * Displays page title, search bar, and notifications
 */
const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Get page title from route
  const getPageTitle = (): string => {
    const routeMap: Record<string, string> = {
      '/portal/dashboard': 'Dashboard',
      '/portal/profile': 'My Profile',
      '/portal/attendance': 'Attendance',
      '/portal/requests': 'My Requests',
      '/portal/evaluations': 'Evaluations',
      '/admin/dashboard': 'Dashboard',
      '/admin/employees': 'Employees',
      '/admin/organization': 'Organization',
      '/admin/requests': 'Request Management',
      '/admin/shifts': 'Shift Management',
      '/admin/reports': 'Reports & Analytics',
    };

    return routeMap[location.pathname] || 'HR Management System';
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">{getPageTitle()}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {user?.department} • {user?.schoolBranch}
        </p>
      </div>

      {/* Right Section: Search + Actions + Profile */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="hidden md:flex items-center">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>

        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
