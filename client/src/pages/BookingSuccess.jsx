import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Ticket, Home, ArrowRight } from 'lucide-react';
import api from '../services/api';
import TicketView from '../components/booking/TicketView';
import LoadingSpinner from '../components/common/LoadingSpinner';

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
    launchConfetti();
  }, [bookingId]);

  const launchConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignored if canvas-confetti is not loaded
    }
  };

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data.booking);
    } catch (err) {
      console.error('Error loading booking confirmation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Generating your verified digital cinema ticket..." />;
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white">Booking Record Not Found</h3>
        <Link to="/" className="btn glow-btn btn-sm rounded-pill mt-3">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 px-lg-5 py-5 text-center">
      {/* Celebration Header */}
      <div className="mb-4">
        <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-25 text-success mb-3 shadow">
          <CheckCircle2 size={54} />
        </div>
        <h2 className="display-5 fw-bold text-white display-font mb-1">
          Booking Confirmed!
        </h2>
        <p className="text-secondary small">
          Your reservation reference is{' '}
          <strong className="text-info">{booking.bookingReference}</strong>. A copy has been saved to your dashboard.
        </p>
      </div>

      {/* Digital Ticket */}
      <div className="my-5 text-start">
        <TicketView booking={booking} onPrint={handlePrint} />
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-wrap justify-content-center gap-3 no-print mt-4">
        <Link to="/my-bookings" className="btn glow-btn rounded-pill px-4 py-2 d-flex align-items-center gap-2">
          <Ticket size={18} />
          <span>View All My Tickets</span>
        </Link>
        <Link to="/" className="btn glow-btn-outline rounded-pill px-4 py-2 d-flex align-items-center gap-2">
          <Home size={18} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccess;
