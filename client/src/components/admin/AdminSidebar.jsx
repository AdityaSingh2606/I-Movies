import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building2,
  CalendarDays,
  Ticket,
  Users,
  CreditCard,
  ArrowLeft
} from 'lucide-react';

const AdminSidebar = () => {
  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/movies', label: 'Movie Management', icon: Film },
    { to: '/admin/theatres', label: 'Theatre Management', icon: Building2 },
    { to: '/admin/shows', label: 'Show Management', icon: CalendarDays },
    { to: '/admin/bookings', label: 'Booking Management', icon: Ticket },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/payments', label: 'Payment Ledger', icon: CreditCard }
  ];

  return (
    <aside className="admin-sidebar p-3 d-flex flex-column justify-content-between">
      <div>
        <div className="px-3 py-2 mb-4">
          <div className="badge bg-danger mb-2">ADMIN PORTAL</div>
          <h5 className="fw-bold text-white mb-0 display-font">Cinema Console</h5>
        </div>

        <nav className="nav flex-column gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `admin-link text-decoration-none ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-3 border-top border-secondary border-opacity-25">
        <Link to="/" className="btn btn-outline-secondary btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center gap-2">
          <ArrowLeft size={16} />
          <span>Back to IMovies</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
