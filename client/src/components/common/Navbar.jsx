import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  MapPin,
  Search,
  Bell,
  User,
  Shield,
  Ticket,
  LogOut,
  ChevronDown,
  Menu,
  X,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CITIES = ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai'];

const Navbar = () => {
  const { user, isAdmin, logout, selectedCity, setSelectedCity } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch notifications if logged in
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top border-bottom border-secondary border-opacity-25" style={{ backgroundColor: 'rgba(8, 12, 21, 0.95)', backdropFilter: 'blur(16px)' }}>
      <div className="container-fluid px-lg-5 py-2">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 me-4">
          <div className="p-2 rounded-3" style={{ background: 'var(--accent-gradient)' }}>
            <Film className="text-white" size={24} />
          </div>
          <span className="fs-3 fw-bold tracking-tight text-white display-font">
            I<span className="glow-text">MOVIES</span>
          </span>
        </Link>

        {/* City Selector */}
        <div className="dropdown me-3 d-none d-md-block">
          <button
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1 text-light border-opacity-50 d-flex align-items-center gap-2 dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            <MapPin size={16} className="text-info" />
            <span className="small fw-semibold">{selectedCity}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-dark bg-secondary border-secondary shadow-lg">
            {CITIES.map((city) => (
              <li key={city}>
                <button
                  className={`dropdown-item ${selectedCity === city ? 'active bg-primary' : ''}`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="d-none d-lg-flex position-relative me-auto" style={{ width: '320px' }}>
          <input
            type="text"
            className="form-control form-control-sm cinematic-input pe-5 rounded-pill"
            placeholder="Search movies, theatres, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn position-absolute end-0 top-50 translate-middle-y text-secondary pe-3 border-0">
            <Search size={16} />
          </button>
        </form>

        {/* Mobile Toggle Button */}
        <button
          className="btn btn-outline-secondary d-lg-none text-white border-0"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation Links */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show mt-3' : ''}`} id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-1">
            <li className="nav-item">
              <Link className={`nav-link px-3 fw-semibold ${location.pathname === '/' ? 'text-white active fw-bold border-bottom border-info border-2' : 'text-secondary'}`} to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link px-3 fw-semibold ${location.pathname.startsWith('/movies') ? 'text-white active fw-bold border-bottom border-info border-2' : 'text-secondary'}`} to="/movies">
                Movies
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link px-3 fw-semibold ${location.pathname.startsWith('/theatres') ? 'text-white active fw-bold border-bottom border-info border-2' : 'text-secondary'}`} to="/theatres">
                Theatres
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className={`nav-link px-3 fw-semibold ${location.pathname === '/my-bookings' ? 'text-white active fw-bold border-bottom border-info border-2' : 'text-secondary'}`} to="/my-bookings">
                  My Bookings
                </Link>
              </li>
            )}
          </ul>

          {/* Right Action Icons & Auth */}
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="position-relative" ref={notifRef}>
                  <button
                    className="btn btn-dark rounded-circle p-2 text-secondary position-relative border-0 hover-light"
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    title="Notifications"
                  >
                    <Bell size={20} className="text-light" />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown Drawer */}
                  {showNotifDropdown && (
                    <div
                      className="dropdown-menu dropdown-menu-end dropdown-menu-dark show p-0 shadow-lg border-secondary rounded-4 position-absolute"
                      style={{ width: '340px', right: 0, top: '45px', zIndex: 1050, background: '#111827' }}
                    >
                      <div className="d-flex align-items-center justify-content-between p-3 border-bottom border-secondary border-opacity-50">
                        <span className="fw-bold text-white small">Notifications</span>
                        {unreadCount > 0 && (
                          <button
                            className="btn btn-link btn-sm text-info p-0 text-decoration-none small"
                            onClick={handleMarkAllRead}
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-muted small">No notifications yet</div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n._id}
                              className={`p-3 border-bottom border-secondary border-opacity-25 ${!n.isRead ? 'bg-secondary bg-opacity-25' : ''}`}
                            >
                              <div className="d-flex align-items-start gap-2">
                                <CheckCircle size={16} className="text-info mt-1 flex-shrink-0" />
                                <div>
                                  <div className="fw-semibold text-light small">{n.title}</div>
                                  <div className="text-secondary small mt-1">{n.message}</div>
                                  <div className="text-muted extra-small mt-1" style={{ fontSize: '11px' }}>
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Dropdown */}
                <div className="position-relative" ref={profileRef}>
                  <button
                    className="btn btn-dark d-flex align-items-center gap-2 rounded-pill px-3 py-1 border border-secondary border-opacity-50"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                      alt={user.name}
                      className="rounded-circle"
                      style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                    />
                    <span className="small fw-semibold text-white d-none d-sm-inline">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-secondary" />
                  </button>

                  {showProfileDropdown && (
                    <div
                      className="dropdown-menu dropdown-menu-end dropdown-menu-dark show p-2 shadow-lg border-secondary rounded-4 position-absolute"
                      style={{ width: '230px', right: 0, top: '45px', zIndex: 1050, background: '#111827' }}
                    >
                      <div className="px-3 py-2 border-bottom border-secondary border-opacity-50 mb-2">
                        <div className="fw-bold text-white small">{user.name}</div>
                        <div className="text-secondary extra-small" style={{ fontSize: '12px' }}>{user.email}</div>
                        <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'} extra-small mt-1`}>
                          {user.role.toUpperCase()}
                        </span>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="dropdown-item d-flex align-items-center gap-2 rounded-3 text-warning py-2 mb-1"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <Shield size={16} />
                          <span className="small fw-semibold">Admin Dashboard</span>
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="dropdown-item d-flex align-items-center gap-2 rounded-3 py-2 mb-1"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <User size={16} />
                        <span className="small">My Profile</span>
                      </Link>

                      <Link
                        to="/my-bookings"
                        className="dropdown-item d-flex align-items-center gap-2 rounded-3 py-2 mb-1"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <Ticket size={16} />
                        <span className="small">My Tickets</span>
                      </Link>

                      <hr className="dropdown-divider border-secondary border-opacity-50" />

                      <button
                        className="dropdown-item d-flex align-items-center gap-2 rounded-3 text-danger py-2"
                        onClick={() => {
                          setShowProfileDropdown(false);
                          logout();
                        }}
                      >
                        <LogOut size={16} />
                        <span className="small fw-semibold">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn glow-btn-outline btn-sm rounded-pill px-3 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn glow-btn btn-sm rounded-pill px-3 py-2">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
