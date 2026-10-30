import React, { useState, useEffect } from 'react';
import { Ticket, Search, Filter, Eye } from 'lucide-react';
import api from '../../services/api';
import TicketView from '../../components/booking/TicketView';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      const res = await api.get('/admin/bookings', { params });
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm) return true;
    return (
      b.bookingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-white display-font mb-1">Booking Transactions</h2>
        <p className="text-secondary small">Comprehensive registry of customer cinema reservations and e-ticket issuances</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 mb-4">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-md-5">
            <div className="position-relative">
              <input
                type="text"
                className="form-control form-control-sm cinematic-input pe-5 rounded-pill"
                placeholder="Search by Booking ID (e.g. IMV-...) or Email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} className="position-absolute end-0 top-50 translate-middle-y text-secondary me-3" />
            </div>
          </div>

          <div className="col-md-4 d-flex justify-content-md-end gap-2">
            {['All', 'confirmed', 'pending', 'cancelled'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm rounded-pill px-3 py-1 ${
                  statusFilter === st
                    ? 'btn-info text-dark fw-bold'
                    : 'btn-dark text-secondary border border-secondary border-opacity-25'
                }`}
                onClick={() => setStatusFilter(st)}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <LoadingSpinner message="Querying master booking ledger..." />
      ) : (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead className="text-secondary extra-small text-uppercase">
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Movie & Venue</th>
                  <th>Showtime</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th className="text-end">Ticket</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">No booking records found.</td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b._id}>
                      <td className="fw-mono text-info fw-bold small">{b.bookingReference}</td>
                      <td>
                        <div className="text-white small fw-semibold">{b.user?.name}</div>
                        <div className="text-muted extra-small">{b.user?.email}</div>
                      </td>
                      <td>
                        <div className="text-white small fw-semibold">{b.movie?.title}</div>
                        <div className="text-secondary extra-small">{b.theatre?.name}</div>
                      </td>
                      <td className="text-secondary small">
                        <div>{b.showDate}</div>
                        <div className="text-info extra-small">{b.showTime}</div>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {b.seats?.map((s) => (
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
                      <td className="text-end">
                        <button
                          className="btn btn-outline-info btn-sm rounded-circle p-2"
                          title="View Digital Ticket"
                          onClick={() => setSelectedTicket(b)}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedTicket && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-transparent border-0">
              <div className="text-end mb-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-circle text-white p-2"
                  onClick={() => setSelectedTicket(null)}
                >
                  ✕
                </button>
              </div>
              <TicketView booking={selectedTicket} onPrint={() => window.print()} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
