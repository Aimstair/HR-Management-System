import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { ScrollArea } from '../../../components/ui/scroll-area';

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
        <main className="flex-1 overflow-hidden z-10">
          <ScrollArea className="h-full w-full p-4">
            <div className="min-h-full w-full">
              <Outlet />
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default Layout;
