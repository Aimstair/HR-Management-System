import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Main Layout component wrapping all authenticated routes
 * Provides consistent Sidebar + Header + Content structure
 */
const Layout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
