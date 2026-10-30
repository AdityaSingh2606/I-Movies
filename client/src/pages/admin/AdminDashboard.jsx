import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Film,
  Building2,
  CalendarDays,
  Ticket,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/admin/dashboard-stats');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching admin dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating cinema telemetry and revenue metrics..." />;
  }

  const stats = data?.stats || {};
  const recentBookings = data?.recentBookings || [];
  const topMovies = data?.topMovies || [];
  const bookingTrends = data?.bookingTrends || [];

  const maxRevenue = Math.max(...bookingTrends.map((d) => d.revenue), 1000);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-bold text-white display-font mb-1">Executive Dashboard</h2>
          <p className="text-secondary small mb-0">Real-time performance analytics, revenue tracking, and booking flow</p>
        </div>
        <div className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-3 py-2 rounded-pill d-flex align-items-center gap-2">
          <span className="spinner-grow spinner-grow-sm" role="status" />
          <span className="fw-semibold">SYSTEM HEALTH: ONLINE</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-2">
          <div className="glass-card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-2">
              <span className="small fw-semibold">Total Revenue</span>
              <div className="p-2 rounded bg-success bg-opacity-25 text-success">
                <IndianRupee size={16} />
              </div>
            </div>
            <h3 className="fw-bold text-success mb-0">₹{stats.totalRevenue?.toLocaleString()}</h3>
            <small className="text-muted extra-small">Confirmed payments</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="glass-card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-2">
              <span className="small fw-semibold">Total Bookings</span>
              <div className="p-2 rounded bg-info bg-opacity-25 text-info">
                <Ticket size={16} />
              </div>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalBookings}</h3>
            <small className="text-info extra-small">{stats.confirmedBookings} Confirmed</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="glass-card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-2">
              <span className="small fw-semibold">Movies</span>
              <div className="p-2 rounded bg-primary bg-opacity-25 text-info">
                <Film size={16} />
              </div>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalMovies}</h3>
            <small className="text-muted extra-small">Catalogue active</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="glass-card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-2">
              <span className="small fw-semibold">Cinemas</span>
              <div className="p-2 rounded bg-warning bg-opacity-25 text-warning">
                <Building2 size={16} />
              </div>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalTheatres}</h3>
            <small className="text-muted extra-small">Multiplexes</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="glass-card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-2">
              <span className="small fw-semibold">Active Shows</span>
              <div className="p-2 rounded bg-danger bg-opacity-25 text-danger">
                <CalendarDays size={16} />
              </div>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalShows}</h3>
            <small className="text-muted extra-small">Upcoming dates</small>
          </div>
        </div>

        <div className="col-sm-6 col-xl-2">
          <div className="glass-card p-3 h-100">
            <div className="d-flex align-items-center justify-content-between text-secondary mb-2">
              <span className="small fw-semibold">Customers</span>
              <div className="p-2 rounded bg-purple bg-opacity-25 text-purple" style={{ color: '#c084fc' }}>
                <Users size={16} />
              </div>
            </div>
            <h3 className="fw-bold text-white mb-0">{stats.totalUsers}</h3>
            <small className="text-muted extra-small">Registered profiles</small>
          </div>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="row g-4 mb-4">
        {/* 7-Day Revenue Trend Chart */}
        <div className="col-lg-8">
          <div className="glass-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h5 className="fw-bold text-white mb-1">7-Day Revenue Trends</h5>
                <small className="text-secondary">Daily gross ticket sales in rupees</small>
              </div>
              <TrendingUp size={20} className="text-info" />
            </div>

            {/* Custom Responsive SVG/CSS Bar Graph */}
            <div className="d-flex align-items-end justify-content-between pt-4" style={{ height: '220px' }}>
              {bookingTrends.map((item, idx) => {
                const heightPercent = Math.max((item.revenue / maxRevenue) * 100, 10);
                return (
                  <div key={idx} className="d-flex flex-column align-items-center flex-grow-1 mx-2" style={{ height: '100%' }}>
                    <div className="text-info extra-small fw-bold mb-2">₹{item.revenue}</div>
                    <div className="w-100 flex-grow-1 d-flex align-items-end justify-content-center">
                      <div
                        className="rounded-3 transition-all"
                        style={{
                          width: '70%',
                          maxWidth: '45px',
                          height: `${heightPercent}%`,
                          background: 'linear-gradient(180deg, #06b6d4 0%, #8b5cf6 100%)',
                          boxShadow: '0 4px 15px rgba(6, 182, 212, 0.3)'
                        }}
                        title={`${item.day}: ₹${item.revenue} (${item.bookings} bookings)`}
                      />
                    </div>
                    <div className="text-secondary small mt-2 fw-semibold">{item.day}</div>
                    <div className="text-muted extra-small">{item.date}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Grossing Movies */}
        <div className="col-lg-4">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-white mb-1">Top Box Office</h5>
            <small className="text-secondary d-block mb-3">Highest revenue grossing films</small>

            <div className="d-flex flex-column gap-3">
              {topMovies.length === 0 ? (
                <div className="text-muted small py-4 text-center">No booking sales recorded yet.</div>
              ) : (
                topMovies.map((m, idx) => (
                  <div key={idx} className="d-flex align-items-center gap-3 p-2 rounded-3 bg-secondary bg-opacity-10">
                    <span className="fs-5 fw-bold text-info" style={{ width: '24px' }}>#{idx + 1}</span>
                    {m.poster && (
                      <img src={m.poster} alt={m.title} className="rounded object-fit-cover" style={{ width: '38px', height: '50px' }} />
                    )}
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="text-white fw-semibold small text-truncate">{m.title}</div>
                      <div className="text-muted extra-small">{m.ticketsSold || 0} tickets sold</div>
                    </div>
                    <div className="text-end">
                      <div className="text-success fw-bold small">₹{m.revenue?.toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="glass-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-bold text-white mb-0">Recent Customer Bookings</h5>
          <Link to="/admin/bookings" className="btn btn-outline-info btn-sm rounded-pill px-3">
            View All Bookings
          </Link>
        </div>

        <div className="table-responsive">
          <table className="table table-dark table-hover mb-0 align-middle">
            <thead className="text-secondary extra-small text-uppercase">
              <tr>
                <th>Booking Ref</th>
                <th>Customer</th>
                <th>Movie</th>
                <th>Cinema</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No bookings recorded.</td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="fw-mono text-info fw-bold small">{b.bookingReference}</td>
                    <td>
                      <div className="text-white small fw-semibold">{b.user?.name || 'Customer'}</div>
                      <div className="text-muted extra-small">{b.user?.email}</div>
                    </td>
                    <td>
                      <span className="text-white small fw-semibold">{b.movie?.title}</span>
                    </td>
                    <td className="text-secondary small">{b.theatre?.name}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {b.seats?.slice(0, 3).map((s) => (
                          <span key={s.seatNumber} className="badge bg-dark border border-secondary extra-small">
                            {s.seatNumber}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-success fw-bold small">₹{b.totalAmount}</td>
                    <td>
                      <span className={`badge ${b.bookingStatus === 'confirmed' ? 'bg-success' : b.bookingStatus === 'cancelled' ? 'bg-danger' : 'bg-warning'} px-2 py-1 rounded-pill extra-small`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="text-secondary extra-small">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
