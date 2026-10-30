import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Film, MapPin, Calendar, Clock, Ticket, Printer, CheckCircle } from 'lucide-react';

const TicketView = ({ booking, onPrint }) => {
  if (!booking) return null;

  const movie = booking.movie || {};
  const theatre = booking.theatre || {};
  const payment = booking.payment || {};

  const qrData = JSON.stringify({
    ref: booking.bookingReference,
    movie: movie.title,
    theatre: theatre.name,
    seats: booking.seats?.map((s) => s.seatNumber).join(','),
    date: booking.showDate,
    time: booking.showTime
  });

  return (
    <div className="ticket-view-container mx-auto" style={{ maxWidth: '780px' }}>
      <div className="digital-ticket">
        <div className="row g-0">
          {/* Main Ticket Information (Left Side) */}
          <div className="col-md-8 p-4 d-flex flex-column justify-content-between">
            <div>
              {/* Header Badge */}
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-1 rounded bg-info bg-opacity-25 text-info">
                    <Film size={18} />
                  </div>
                  <span className="fw-bold tracking-wider text-info display-font small">IMOVIES E-TICKET</span>
                </div>
                <span className={`badge ${booking.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'} px-3 py-1 rounded-pill small`}>
                  {booking.bookingStatus?.toUpperCase()}
                </span>
              </div>

              {/* Movie Title & Info */}
              <h4 className="fw-bold text-white mb-1">{movie.title}</h4>
              <p className="text-secondary small mb-3">
                {movie.language?.join(', ')} • {movie.certification || 'UA'} • {movie.duration} Mins
              </p>

              {/* Cinema Venue & Screen */}
              <div className="glass-card p-3 mb-3 bg-dark bg-opacity-50 border-secondary border-opacity-25">
                <div className="d-flex align-items-start gap-2 mb-2">
                  <MapPin size={16} className="text-info mt-1 flex-shrink-0" />
                  <div>
                    <div className="fw-semibold text-white small">{theatre.name}</div>
                    <div className="text-muted extra-small" style={{ fontSize: '11px' }}>
                      {theatre.address || theatre.location}
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-4 text-light small mt-2 pt-2 border-top border-secondary border-opacity-25">
                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={14} className="text-info" />
                    <span>{booking.showDate}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <Clock size={14} className="text-info" />
                    <span>{booking.showTime}</span>
                  </div>
                  <div className="ms-auto text-info fw-semibold">
                    {booking.screenName || 'Audi 1'}
                  </div>
                </div>
              </div>

              {/* Seat Details */}
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div>
                  <span className="text-muted extra-small text-uppercase">Selected Seats</span>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {booking.seats?.map((seat) => (
                      <span key={seat.seatNumber} className="badge bg-primary bg-opacity-25 text-info border border-info border-opacity-50 px-2 py-1">
                        {seat.seatNumber} ({seat.category})
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-end">
                  <span className="text-muted extra-small text-uppercase">Total Paid</span>
                  <div className="fs-5 fw-bold text-success">₹{booking.totalAmount}</div>
                </div>
              </div>
            </div>

            {/* Bottom Reference */}
            <div className="pt-3 border-top border-secondary border-opacity-25 d-flex align-items-center justify-content-between text-muted extra-small" style={{ fontSize: '11px' }}>
              <span>Booking ID: <strong className="text-white">{booking.bookingReference}</strong></span>
              <span>Payment: <strong className="text-white">{payment.paymentMethod || 'UPI (Simulated)'}</strong></span>
            </div>
          </div>

          {/* Ticket Stub (Right Side) */}
          <div className="col-md-4 p-4 ticket-divider bg-dark bg-opacity-75 d-flex flex-column align-items-center justify-content-center text-center position-relative">
            <div className="ticket-notch-top" />
            <div className="ticket-notch-bottom" />

            <div className="bg-white p-3 rounded-3 shadow mb-3">
              <QRCodeSVG
                value={qrData}
                size={135}
                level="H"
                includeMargin={false}
              />
            </div>

            <p className="extra-small text-secondary mb-1" style={{ fontSize: '11px' }}>
              Scan at cinema gate for entry
            </p>
            <p className="fw-mono text-white fw-bold mb-3 small tracking-widest">
              {booking.bookingReference}
            </p>

            {onPrint && (
              <button
                className="btn btn-outline-info btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-2 no-print"
                onClick={onPrint}
              >
                <Printer size={14} />
                <span>Print Ticket</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketView;
