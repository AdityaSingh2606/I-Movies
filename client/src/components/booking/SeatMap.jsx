import React from 'react';
import { Monitor, Info } from 'lucide-react';

const SeatMap = ({
  seats = [],
  selectedSeats = [],
  onSeatClick,
  currentUserId,
  ticketPrices
}) => {
  // Group seats by category and rows
  const silverSeats = seats.filter((s) => s.category === 'Silver');
  const goldSeats = seats.filter((s) => s.category === 'Gold');
  const platinumSeats = seats.filter((s) => s.category === 'Platinum');

  const groupByRow = (seatList) => {
    const rows = {};
    seatList.forEach((s) => {
      if (!rows[s.row]) rows[s.row] = [];
      rows[s.row].push(s);
    });
    return rows;
  };

  const renderSeatRow = (rowName, rowSeats) => {
    return (
      <div key={rowName} className="d-flex align-items-center justify-content-center mb-2">
        {/* Row Label Left */}
        <span className="text-secondary fw-bold me-3" style={{ width: '20px', textAlign: 'center' }}>
          {rowName}
        </span>

        {/* Seat Buttons */}
        <div className="d-flex flex-wrap justify-content-center">
          {rowSeats
            .sort((a, b) => a.number - b.number)
            .map((seat) => {
              const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
              const isBooked = seat.status === 'booked';
              const isLockedByOther =
                seat.status === 'locked' &&
                seat.lockedBy &&
                seat.lockedBy.toString() !== currentUserId?.toString();

              let seatClass = 'seat-available';
              if (isSelected) {
                seatClass = 'seat-selected';
              } else if (isBooked) {
                seatClass = 'seat-booked';
              } else if (isLockedByOther) {
                seatClass = 'seat-locked';
              }

              return (
                <button
                  key={seat.seatNumber}
                  className={`seat-btn ${seatClass}`}
                  disabled={isBooked || isLockedByOther}
                  onClick={() => onSeatClick(seat)}
                  title={`${seat.seatNumber} (${seat.category} - ₹${seat.price}) ${
                    isBooked ? '- Booked' : isLockedByOther ? '- Temporarily Reserved' : ''
                  }`}
                >
                  {seat.number}
                </button>
              );
            })}
        </div>

        {/* Row Label Right */}
        <span className="text-secondary fw-bold ms-3" style={{ width: '20px', textAlign: 'center' }}>
          {rowName}
        </span>
      </div>
    );
  };

  return (
    <div className="seat-map-wrapper text-center my-4">
      {/* Curved Screen */}
      <div className="cinema-screen-container">
        <div className="cinema-screen" />
        <div className="cinema-screen-glow" />
        <p className="text-secondary extra-small text-uppercase tracking-widest mt-2 fw-semibold" style={{ letterSpacing: '3px' }}>
          All Eyes This Way • Cinema Screen
        </p>
      </div>

      {/* Seat Rows Container */}
      <div className="seat-rows-layout py-3 overflow-auto">
        {/* Platinum Category */}
        {platinumSeats.length > 0 && (
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
              <span className="badge badge-platinum">PLATINUM</span>
              <span className="text-white small fw-bold">₹{ticketPrices?.platinum || 350}</span>
            </div>
            {Object.entries(groupByRow(platinumSeats)).map(([rowName, rowSeats]) =>
              renderSeatRow(rowName, rowSeats)
            )}
          </div>
        )}

        {/* Gold Category */}
        {goldSeats.length > 0 && (
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
              <span className="badge badge-gold">GOLD</span>
              <span className="text-white small fw-bold">₹{ticketPrices?.gold || 250}</span>
            </div>
            {Object.entries(groupByRow(goldSeats)).map(([rowName, rowSeats]) =>
              renderSeatRow(rowName, rowSeats)
            )}
          </div>
        )}

        {/* Silver Category */}
        {silverSeats.length > 0 && (
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
              <span className="badge badge-silver">SILVER</span>
              <span className="text-white small fw-bold">₹{ticketPrices?.silver || 180}</span>
            </div>
            {Object.entries(groupByRow(silverSeats)).map(([rowName, rowSeats]) =>
              renderSeatRow(rowName, rowSeats)
            )}
          </div>
        )}
      </div>

      {/* Seat Status Legend */}
      <div className="glass-card p-3 mx-auto mt-4 d-inline-flex flex-wrap align-items-center justify-content-center gap-4">
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-available" style={{ cursor: 'default' }}>1</div>
          <span className="small text-secondary">Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-selected" style={{ cursor: 'default' }}>2</div>
          <span className="small text-white fw-semibold">Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-locked" style={{ cursor: 'default' }}>3</div>
          <span className="small text-warning">Temporarily Locked</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <div className="seat-btn seat-booked" style={{ cursor: 'default' }}>4</div>
          <span className="small text-muted">Sold / Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
