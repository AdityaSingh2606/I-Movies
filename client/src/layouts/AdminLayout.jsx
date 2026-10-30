import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';
import { ToastContainer } from 'react-toastify';

const AdminLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNavbar />
      <div className="d-flex flex-grow-1">
        <AdminSidebar />
        <main className="flex-grow-1 p-4 overflow-auto" style={{ backgroundColor: '#0a0e19' }}>
          <Outlet />
        </main>
      </div>
      <ToastContainer theme="dark" position="top-right" autoClose={3500} />
    </div>
  );
};

export default AdminLayout;
