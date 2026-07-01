import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <main className="md:ml-64 pt-16 min-h-screen flex flex-col">
        <div className="flex-1 p-6">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
}

export default DashboardLayout;