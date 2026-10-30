import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  XCircle,
  Eye,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import api from '../services/api';
import TicketView from '../components/booking/TicketView';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      toast.error('Failed to load your bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      const res = await api.put(`/bookings/${cancelModalBooking._id}/cancel`);
      toast.success(res.data.message);
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b._id === cancelModalBooking._id ? res.data.booking : b))
      );
      setCancelModalBooking(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Cancellation failed';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') {
      const showDate = new Date(b.showDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return b.bookingStatus === 'confirmed' && showDate >= today;
    }
    if (activeTab === 'Past') {
      const showDate = new Date(b.showDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return b.bookingStatus === 'confirmed' && showDate < today;
    }
    if (activeTab === 'Cancelled') {
      return b.bookingStatus === 'cancelled';
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Retrieving your cinema tickets..." />;
  }

  return (
    <div className="container px-4 px-lg-5 py-5">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h1 className="fw-bold text-white display-font mb-1">
            My <span className="glow-text">Bookings</span>
          </h1>
          <p className="text-secondary small mb-0">View digital tickets, entry QR codes, and booking history</p>
        </div>

        {/* Status Tabs */}
        <div className="d-flex gap-2 p-1 rounded-pill bg-dark border border-secondary border-opacity-25">
          {['All', 'Upcoming', 'Past', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              className={`btn btn-sm rounded-pill px-3 py-1 ${
                activeTab === tab
                  ? 'btn-info text-dark fw-bold shadow'
                  : 'text-secondary border-0'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="glass-card p-5 text-center text-muted">
          <Ticket size={48} className="text-secondary opacity-50 mb-3" />
          <h4 className="text-white fw-bold mb-2">No Bookings in this Category</h4>
          <p className="text-secondary small mb-4">You have no {activeTab.toLowerCase()} bookings recorded.</p>
          <Link to="/movies" className="btn glow-btn btn-sm rounded-pill px-4 py-2">
            Explore Now Showing Movies
          </Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredBookings.map((b) => {
            const movie = b.movie || {};
            const theatre = b.theatre || {};
            const isCancelled = b.bookingStatus === 'cancelled';
            const isConfirmed = b.bookingStatus === 'confirmed';

            return (
              <div key={b._id} className="glass-card p-4">
                <div className="row g-4 align-items-center">
                  {/* Poster Thumbnail */}
                  <div className="col-auto">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="rounded-3 shadow object-fit-cover"
                      style={{ width: '85px', height: '115px' }}
                    />
                  </div>

                  {/* Main Details */}
                  <div className="col">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className={`badge ${isConfirmed ? 'bg-success' : isCancelled ? 'bg-danger' : 'bg-warning'} px-2 py-1 rounded-pill small`}>
                        {b.bookingStatus?.toUpperCase()}
                      </span>
                      <span className="text-secondary extra-small">Ref: {b.bookingReference}</span>
                    </div>

                    <h5 className="fw-bold text-white mb-2">{movie.title}</h5>

                    <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mb-2">
                      <span className="d-flex align-items-center gap-1 text-light">
                        <MapPin size={14} className="text-info" />
                        {theatre.name} ({b.screenName})
                      </span>
                      <span>•</span>
                      <span className="d-flex align-items-center gap-1">
                        <Calendar size={14} className="text-info" />
                        {b.showDate}
                      </span>
                      <span>•</span>
                      <span className="d-flex align-items-center gap-1">
                        <Clock size={14} className="text-info" />
                        {b.showTime}
                      </span>
                    </div>

                    {/* Seats Badges */}
                    <div className="d-flex flex-wrap gap-1 align-items-center">
                      <span className="text-muted extra-small me-1">Seats:</span>
                      {b.seats?.map((s) => (
                        <span key={s.seatNumber} className="badge bg-dark border border-secondary border-opacity-50 text-info extra-small">
                          {s.seatNumber} ({s.category})
                        </span>
                      ))}
                      <span className="text-white fw-bold ms-3 small">Paid: ₹{b.totalAmount}</span>
                      {isCancelled && b.refundAmount > 0 && (
                        <span className="badge bg-success bg-opacity-25 text-success ms-2">
                          Refunded ₹{b.refundAmount}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="col-12 col-md-auto d-flex flex-md-column gap-2">
                    <button
                      className="btn glow-btn btn-sm rounded-pill px-3 py-2 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => setSelectedTicket(b)}
                    >
                      <Eye size={16} />
                      <span>View Ticket</span>
                    </button>

                    {isConfirmed && (
                      <button
                        className="btn btn-outline-danger btn-sm rounded-pill px-3 py-2 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => setCancelModalBooking(b)}
                      >
                        <XCircle size={16} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark border border-secondary rounded-4 p-4 text-white">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="p-3 rounded-circle bg-danger bg-opacity-25 text-danger">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h5 className="fw-bold mb-1">Confirm Cancellation?</h5>
                  <p className="text-secondary small mb-0">Booking ID: {cancelModalBooking.bookingReference}</p>
                </div>
              </div>

              <div className="glass-card p-3 mb-4 bg-secondary bg-opacity-10 small text-secondary">
                <div className="d-flex justify-content-between mb-1">
                  <span>Ticket Price Refund:</span>
                  <span className="text-white fw-bold">₹{cancelModalBooking.subtotal}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Convenience Fee (Retained):</span>
                  <span>₹{cancelModalBooking.convenienceFee}</span>
                </div>
                <hr className="my-2 border-secondary" />
                <div className="d-flex justify-content-between fw-bold text-success">
                  <span>Total Simulated Refund:</span>
                  <span>₹{cancelModalBooking.subtotal}</span>
                </div>
              </div>

              <p className="text-muted extra-small mb-4">
                Upon confirmation, your selected seats will be immediately released back into the auditorium inventory.
              </p>

              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setCancelModalBooking(null)}
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  className="btn btn-danger rounded-pill px-4"
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                >
                  {cancelling ? 'Processing...' : 'Confirm & Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
