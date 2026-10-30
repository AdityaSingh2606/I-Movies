import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Shield, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar navbar-dark sticky-top border-bottom border-secondary border-opacity-25 px-4 py-2" style={{ backgroundColor: '#090d16' }}>
      <div className="container-fluid px-0">
        <Link to="/admin" className="navbar-brand d-flex align-items-center gap-2">
          <div className="p-1 rounded bg-danger bg-opacity-25 text-danger">
            <Shield size={20} />
          </div>
          <span className="fw-bold text-white display-font">
            IMOVIES <span className="text-danger">ADMIN</span>
          </span>
        </Link>

        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 text-white small">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name}
              className="rounded-circle border border-danger"
              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
            />
            <span className="fw-semibold d-none d-sm-inline">{user?.name}</span>
          </div>

          <button
            onClick={logout}
            className="btn btn-outline-danger btn-sm rounded-pill d-flex align-items-center gap-1 px-3 py-1"
          >
            <LogOut size={14} />
            <span className="small">Exit</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
