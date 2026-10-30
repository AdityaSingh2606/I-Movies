import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Building,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Film,
  Calendar,
  Clock,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { toast } from 'react-toastify';

const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI / QR Code', icon: QrCode },
  { id: 'Credit Card', label: 'Credit Card', icon: CreditCard },
  { id: 'Debit Card', label: 'Debit Card', icon: CreditCard },
  { id: 'Net Banking', label: 'Net Banking', icon: Building }
];

const Checkout = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Form Fields for simulation
  const [upiId, setUpiId] = useState('aditya@upi');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data.booking);
      if (res.data.booking.bookingStatus === 'confirmed') {
        navigate(`/booking-confirmation/${bookingId}`);
      }
    } catch (err) {
      console.error('Error fetching booking details:', err);
      toast.error('Booking not found or expired');
      navigate('/movies');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (simulateFailure = false) => {
    setProcessing(true);
    try {
      const paymentDetails = {
        upiId: paymentMethod === 'UPI' ? upiId : undefined,
        cardLast4: paymentMethod.includes('Card') ? cardNumber.slice(-4) : undefined,
        bankName: paymentMethod === 'Net Banking' ? selectedBank : undefined
      };

      const res = await api.post('/payments/process', {
        bookingId,
        paymentMethod,
        paymentDetails,
        simulateFailure
      });

      if (res.data.success) {
        toast.success('Payment simulated successfully! 🎟️');
        navigate(`/booking-confirmation/${bookingId}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment simulation failed';
      toast.error(msg);
      // Re-fetch booking state if seats were unlocked
      fetchBooking();
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Securing reservation checkout..." />;
  }

  if (!booking) {
    return null;
  }

  const movie = booking.movie || {};
  const theatre = booking.theatre || {};

  return (
    <div className="container px-4 px-lg-5 py-5" style={{ maxWidth: '1000px' }}>
      {/* Top Navigation */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline-secondary btn-sm rounded-pill text-white mb-4 d-flex align-items-center gap-2"
      >
        <ArrowLeft size={16} />
        <span>Back to Seat Selection</span>
      </button>

      {/* Demo Mode Alert Banner */}
      <div className="alert alert-warning bg-warning bg-opacity-10 border border-warning border-opacity-50 text-warning d-flex align-items-center gap-3 rounded-4 mb-4 p-3">
        <ShieldCheck size={28} className="flex-shrink-0" />
        <div>
          <div className="fw-bold">DEMO SIMULATION MODE ACTIVE</div>
          <small className="text-secondary">
            This application is for educational evaluation. No real payment will be charged.
            You can test both successful payment workflows and simulated gateway failures below.
          </small>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Payment Method Selection */}
        <div className="col-lg-7">
          <div className="glass-card p-4">
            <h4 className="fw-bold text-white display-font mb-3">Select Payment Method</h4>

            {/* Method Tabs */}
            <div className="d-flex flex-wrap gap-2 mb-4">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    className={`btn rounded-3 px-3 py-2 d-flex align-items-center gap-2 transition-all ${
                      isSelected
                        ? 'btn-info text-dark fw-bold shadow'
                        : 'btn-dark text-secondary border border-secondary border-opacity-25'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <Icon size={16} />
                    <span>{method.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Form based on selected method */}
            <div className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-4">
              {paymentMethod === 'UPI' && (
                <div>
                  <label className="form-label text-secondary small fw-semibold">Virtual Payment Address (UPI ID)</label>
                  <input
                    type="text"
                    className="form-control cinematic-input mb-3"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                  />
                  <div className="d-flex gap-2">
                    {['@okhdfcbank', '@okaxis', '@paytm', '@ybl'].map((suf) => (
                      <span
                        key={suf}
                        className="badge bg-secondary bg-opacity-25 text-info border border-secondary border-opacity-50 px-2 py-1 cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setUpiId(`demo${suf}`)}
                      >
                        {suf}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                <div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-semibold">Card Number (Simulated)</label>
                    <input
                      type="text"
                      className="form-control cinematic-input"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label text-secondary small fw-semibold">Expiry Date</label>
                      <input
                        type="text"
                        className="form-control cinematic-input"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-secondary small fw-semibold">CVV</label>
                      <input
                        type="password"
                        maxLength="4"
                        className="form-control cinematic-input"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Net Banking' && (
                <div>
                  <label className="form-label text-secondary small fw-semibold">Choose Your Bank</label>
                  <select
                    className="form-select cinematic-input"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                  </select>
                </div>
              )}
            </div>

            {/* Dual Simulation Buttons */}
            <div className="d-flex flex-column gap-3">
              <button
                className="btn glow-btn btn-lg rounded-pill py-3 d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleProcessPayment(false)}
                disabled={processing}
              >
                <CheckCircle2 size={20} />
                <span>
                  {processing ? 'Simulating Processing...' : `Pay ₹${booking.totalAmount} (Simulate Success)`}
                </span>
              </button>

              <button
                className="btn btn-outline-danger btn-sm rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
                onClick={() => handleProcessPayment(true)}
                disabled={processing}
              >
                <XCircle size={16} />
                <span>Test Failure Scenario (Simulate Error & Release Seats)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Pricing Breakdown */}
        <div className="col-lg-5">
          <div className="glass-card p-4">
            <h5 className="fw-bold text-white mb-3">Booking Summary</h5>

            {/* Movie Snippet */}
            <div className="d-flex gap-3 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="rounded-3 object-fit-cover shadow"
                style={{ width: '70px', height: '95px' }}
              />
              <div>
                <h6 className="fw-bold text-white mb-1">{movie.title}</h6>
                <div className="text-secondary small mb-1">{theatre.name}</div>
                <div className="text-info extra-small fw-semibold">{booking.screenName}</div>
                <div className="text-muted extra-small mt-1">
                  {booking.showDate} • {booking.showTime}
                </div>
              </div>
            </div>

            {/* Selected Seats Badges */}
            <div className="mb-3 pb-3 border-bottom border-secondary border-opacity-25">
              <div className="text-secondary small mb-1">Seats Booked ({booking.seatCount}):</div>
              <div className="d-flex flex-wrap gap-1">
                {booking.seats?.map((seat) => (
                  <span key={seat.seatNumber} className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-50">
                    {seat.seatNumber} ({seat.category}) - ₹{seat.price}
                  </span>
                ))}
              </div>
            </div>

            {/* Detailed Price Breakdown */}
            <div className="d-flex flex-column gap-2 text-secondary small mb-4">
              <div className="d-flex justify-content-between">
                <span>Tickets Subtotal:</span>
                <span className="text-white fw-semibold">₹{booking.subtotal}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Convenience Fee (₹30/seat):</span>
                <span className="text-white fw-semibold">₹{booking.convenienceFee}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Integrated GST (18%):</span>
                <span className="text-white fw-semibold">₹{booking.gst}</span>
              </div>
              <div className="d-flex justify-content-between pt-2 border-top border-secondary border-opacity-25 fs-5 fw-bold text-white">
                <span>Total Amount:</span>
                <span className="text-success">₹{booking.totalAmount}</span>
              </div>
            </div>

            <div className="p-3 rounded-3 bg-secondary bg-opacity-10 text-muted extra-small" style={{ fontSize: '11px' }}>
              🔒 Simulated SSL 256-bit encrypted checkout. All transactions are local sandbox simulations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
