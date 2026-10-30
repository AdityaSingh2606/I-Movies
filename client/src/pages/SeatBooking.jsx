import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Calendar,
  Ticket,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import api from '../services/api';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/booking/SeatMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const LOCK_TIMER_SECONDS = 300; // 5 minutes

const SeatBooking = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(LOCK_TIMER_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const timerRef = useRef(null);

  // 1. Fetch initial Show & Seat Data
  useEffect(() => {
    fetchShowData();

    // 2. Setup Socket.IO real-time synchronization
    socket.emit('join-show', { showId });

    socket.on('seat-sync', ({ showId: sId, seats: freshSeats }) => {
      if (sId === showId) {
        setSeats(freshSeats);
      }
    });

    socket.on('seats-locked', ({ showId: sId, seats: lockedSeatNumbers, lockedBy }) => {
      if (sId === showId) {
        setSeats((prev) =>
          prev.map((s) => {
            if (lockedSeatNumbers.includes(s.seatNumber)) {
              return { ...s, status: 'locked', lockedBy };
            }
            return s;
          })
        );
      }
    });

    socket.on('seats-unlocked', ({ showId: sId, seats: unlockedSeatNumbers }) => {
      if (sId === showId) {
        setSeats((prev) =>
          prev.map((s) => {
            if (unlockedSeatNumbers.includes(s.seatNumber)) {
              return { ...s, status: 'available', lockedBy: null };
            }
            return s;
          })
        );
      }
    });

    socket.on('booking-confirmed', ({ showId: sId, seats: bookedSeatNumbers }) => {
      if (sId === showId) {
        setSeats((prev) =>
          prev.map((s) => {
            if (bookedSeatNumbers.includes(s.seatNumber)) {
              return { ...s, status: 'booked', lockedBy: null };
            }
            return s;
          })
        );
      }
    });

    return () => {
      socket.emit('leave-show', { showId });
      socket.off('seat-sync');
      socket.off('seats-locked');
      socket.off('seats-unlocked');
      socket.off('booking-confirmed');
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showId]);

  const fetchShowData = async () => {
    try {
      const res = await api.get(`/shows/${showId}`);
      setShow(res.data.show);
      setSeats(res.data.show.seats || []);
    } catch (err) {
      console.error('Error fetching show details:', err);
      toast.error('Failed to load show details');
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown when seats are selected
  useEffect(() => {
    if (selectedSeats.length > 0 && !isTimerActive) {
      setIsTimerActive(true);
      setTimeLeft(LOCK_TIMER_SECONDS);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerActive(false);
            setSelectedSeats([]);
            toast.warn('Seat reservation time expired. Please reselect your seats.');
            return LOCK_TIMER_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (selectedSeats.length === 0 && isTimerActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsTimerActive(false);
      setTimeLeft(LOCK_TIMER_SECONDS);
    }
  }, [selectedSeats.length, isTimerActive]);

  // Handle seat click toggle
  const handleSeatClick = (seat) => {
    if (!user) {
      toast.info('Please sign in to select and reserve seats');
      navigate('/login');
      return;
    }

    const alreadySelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);

    if (alreadySelected) {
      // Remove seat
      const updated = selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber);
      setSelectedSeats(updated);
      socket.emit('request-unlock-seats', {
        showId,
        seats: [seat.seatNumber],
        userId: user._id
      });
    } else {
      // Limit to 8 seats
      if (selectedSeats.length >= 8) {
        toast.warn('You can select a maximum of 8 seats per booking');
        return;
      }

      // Add seat
      setSelectedSeats([...selectedSeats, seat]);
      socket.emit('request-lock-seats', {
        showId,
        seats: [seat.seatNumber],
        userId: user._id
      });
    }
  };

  // Proceed to Checkout
  const handleProceedToCheckout = async () => {
    if (selectedSeats.length === 0) {
      toast.warn('Please select at least one seat to proceed');
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      const seatNumbers = selectedSeats.map((s) => s.seatNumber);
      const res = await api.post('/bookings/initiate', {
        showId,
        seatNumbers
      });

      const booking = res.data.booking;
      toast.success('Seats reserved! Proceeding to checkout payment simulation.');
      navigate(`/checkout/${booking._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reserve seats';
      toast.error(msg);
      // Refresh seat state
      fetchShowData();
      setSelectedSeats([]);
    } finally {
      setBookingLoading(false);
    }
  };

  // Format seconds to MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to auditorium seat grid..." />;
  }

  if (!show) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white">Show Not Found</h3>
        <Link to="/movies" className="btn glow-btn btn-sm rounded-pill mt-3">
          Back to Movies
        </Link>
      </div>
    );
  }

  const movie = show.movie || {};
  const theatre = show.theatre || {};
  const screen = show.screen || {};

  // Calculations
  const subtotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="seat-booking-page pb-5">
      {/* Top Header Bar */}
      <div className="bg-dark border-bottom border-secondary border-opacity-25 py-3 sticky-top" style={{ top: '65px', zIndex: 1020 }}>
        <div className="container-fluid px-lg-5 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-outline-secondary btn-sm rounded-circle p-2 text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h5 className="fw-bold text-white mb-0">{movie.title}</h5>
              <div className="text-secondary small d-flex align-items-center gap-2">
                <span>{theatre.name}</span>
                <span>•</span>
                <span className="text-info">{screen.name}</span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="glass-card px-3 py-1 d-flex align-items-center gap-2 bg-secondary bg-opacity-25">
              <Calendar size={14} className="text-info" />
              <span className="small text-white fw-semibold">{show.showDate}</span>
              <span className="text-secondary">•</span>
              <Clock size={14} className="text-info" />
              <span className="small text-white fw-semibold">{show.showTime}</span>
            </div>

            {isTimerActive && (
              <div className="badge bg-warning bg-opacity-20 text-warning border border-warning border-opacity-50 px-3 py-2 rounded-pill d-flex align-items-center gap-2">
                <Clock size={16} />
                <span className="fw-bold">Lock Timer: {formatTimer(timeLeft)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Seat Map Area */}
      <div className="container px-4 my-4">
        <SeatMap
          seats={seats}
          selectedSeats={selectedSeats}
          onSeatClick={handleSeatClick}
          currentUserId={user?._id}
          ticketPrices={show.ticketPrices}
        />
      </div>

      {/* Bottom Sticky Checkout Action Bar */}
      {selectedSeats.length > 0 && (
        <div
          className="fixed-bottom p-3 shadow-lg border-top border-secondary border-opacity-50"
          style={{ backgroundColor: 'rgba(14, 22, 38, 0.95)', backdropFilter: 'blur(16px)', zIndex: 1040 }}
        >
          <div className="container px-4 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="text-secondary small">Selected ({selectedSeats.length} Seats):</span>
                <span className="fw-bold text-white">
                  {selectedSeats.map((s) => s.seatNumber).join(', ')}
                </span>
              </div>
              <div className="fs-5 fw-bold text-white">
                Total: <span className="text-info">₹{subtotal}</span>
                <span className="text-muted extra-small ms-2 fw-normal">(Convenience fee & GST calculated at checkout)</span>
              </div>
            </div>

            <button
              className="btn glow-btn btn-lg rounded-pill px-5 py-2 d-flex align-items-center gap-2"
              onClick={handleProceedToCheckout}
              disabled={bookingLoading}
            >
              <Ticket size={20} />
              <span>{bookingLoading ? 'Reserving...' : 'Proceed to Checkout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatBooking;
