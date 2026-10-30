const Show = require('../models/Show');

const LOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

class SeatLockService {
  constructor() {
    this.io = null;
    this.cleanupInterval = null;
  }

  setIO(io) {
    this.io = io;
    this.startCleanupTask();
  }

  // Periodic cleanup of expired locks
  startCleanupTask() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.releaseAllExpiredLocks();
      } catch (err) {
        console.error('[SeatLockService] Error in automatic expired locks cleanup:', err.message);
      }
    }, 10000); // Check every 10 seconds
  }

  // Release expired locks across all shows
  async releaseAllExpiredLocks() {
    const now = new Date();
    const showsWithExpiredSeats = await Show.find({
      'seats': {
        $elemMatch: {
          status: 'locked',
          lockExpiresAt: { $lt: now }
        }
      }
    });

    for (const show of showsWithExpiredSeats) {
      let modified = false;
      const unlockedSeatNumbers = [];

      show.seats.forEach((seat) => {
        if (seat.status === 'locked' && seat.lockExpiresAt && new Date(seat.lockExpiresAt) < now) {
          seat.status = 'available';
          seat.lockedBy = null;
          seat.lockedAt = null;
          seat.lockExpiresAt = null;
          unlockedSeatNumbers.push(seat.seatNumber);
          modified = true;
        }
      });

      if (modified) {
        await show.save();
        if (this.io) {
          this.io.to(`show_${show._id}`).emit('seats-unlocked', {
            showId: show._id,
            seats: unlockedSeatNumbers,
            reason: 'expired'
          });
        }
      }
    }
  }

  // Clean expired locks for a specific show before operations
  async cleanShowExpiredLocks(showId) {
    const now = new Date();
    const show = await Show.findById(showId);
    if (!show) return null;

    let modified = false;
    const unlockedSeats = [];

    show.seats.forEach((seat) => {
      if (seat.status === 'locked' && seat.lockExpiresAt && new Date(seat.lockExpiresAt) < now) {
        seat.status = 'available';
        seat.lockedBy = null;
        seat.lockedAt = null;
        seat.lockExpiresAt = null;
        unlockedSeats.push(seat.seatNumber);
        modified = true;
      }
    });

    if (modified) {
      await show.save();
      if (this.io) {
        this.io.to(`show_${showId}`).emit('seats-unlocked', {
          showId,
          seats: unlockedSeats,
          reason: 'expired'
        });
      }
    }

    return show;
  }

  // Lock specific seats for a user
  async lockSeats(showId, seatNumbers, userId) {
    // 1. Release expired locks first
    let show = await this.cleanShowExpiredLocks(showId);
    if (!show) {
      throw new Error('Show not found');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + LOCK_DURATION_MS);

    // 2. Validate availability
    const unavailableSeats = [];
    show.seats.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        if (seat.status === 'booked') {
          unavailableSeats.push(`${seat.seatNumber} (Already Booked)`);
        } else if (
          seat.status === 'locked' &&
          seat.lockedBy &&
          seat.lockedBy.toString() !== userId.toString()
        ) {
          unavailableSeats.push(`${seat.seatNumber} (Reserved by another user)`);
        }
      }
    });

    if (unavailableSeats.length > 0) {
      throw new Error(`Seats unavailable: ${unavailableSeats.join(', ')}`);
    }

    // 3. Apply lock
    const lockedSeatsDetails = [];
    show.seats.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        seat.status = 'locked';
        seat.lockedBy = userId;
        seat.lockedAt = now;
        seat.lockExpiresAt = expiresAt;
        lockedSeatsDetails.push({
          seatNumber: seat.seatNumber,
          category: seat.category,
          price: seat.price
        });
      }
    });

    await show.save();

    // 4. Notify room in real time
    if (this.io) {
      this.io.to(`show_${showId}`).emit('seats-locked', {
        showId,
        seats: seatNumbers,
        lockedBy: userId,
        expiresAt
      });
    }

    return {
      success: true,
      lockedSeats: lockedSeatsDetails,
      expiresAt
    };
  }

  // Unlock specific seats manually (e.g. user unselects or navigates away)
  async unlockSeats(showId, seatNumbers, userId) {
    const show = await Show.findById(showId);
    if (!show) return false;

    let modified = false;
    const unlocked = [];

    show.seats.forEach((seat) => {
      if (
        seatNumbers.includes(seat.seatNumber) &&
        seat.status === 'locked' &&
        (!userId || (seat.lockedBy && seat.lockedBy.toString() === userId.toString()))
      ) {
        seat.status = 'available';
        seat.lockedBy = null;
        seat.lockedAt = null;
        seat.lockExpiresAt = null;
        unlocked.push(seat.seatNumber);
        modified = true;
      }
    });

    if (modified) {
      await show.save();
      if (this.io) {
        this.io.to(`show_${showId}`).emit('seats-unlocked', {
          showId,
          seats: unlocked,
          reason: 'user_action'
        });
      }
    }

    return true;
  }

  // Finalize booking on show seats
  async confirmBookingOnSeats(showId, seatNumbers, userId, bookingId) {
    const show = await Show.findById(showId);
    if (!show) throw new Error('Show not found');

    show.seats.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber)) {
        seat.status = 'booked';
        seat.bookedBy = userId;
        seat.bookingId = bookingId;
        seat.lockedBy = null;
        seat.lockedAt = null;
        seat.lockExpiresAt = null;
      }
    });

    // Calculate show filling status
    const total = show.seats.length;
    const booked = show.seats.filter((s) => s.status === 'booked').length;
    const ratio = booked / total;

    if (ratio >= 0.95) {
      show.status = 'Housefull';
    } else if (ratio >= 0.7) {
      show.status = 'Almost Full';
    } else if (ratio >= 0.4) {
      show.status = 'Filling Fast';
    }

    await show.save();

    if (this.io) {
      this.io.to(`show_${showId}`).emit('booking-confirmed', {
        showId,
        seats: seatNumbers,
        bookingId
      });
    }

    return show;
  }

  // Release seats when booking is cancelled
  async releaseBookedSeats(showId, seatNumbers) {
    const show = await Show.findById(showId);
    if (!show) return false;

    show.seats.forEach((seat) => {
      if (seatNumbers.includes(seat.seatNumber) && seat.status === 'booked') {
        seat.status = 'available';
        seat.bookedBy = null;
        seat.bookingId = null;
      }
    });

    show.status = 'Scheduled';
    await show.save();

    if (this.io) {
      this.io.to(`show_${showId}`).emit('seats-unlocked', {
        showId,
        seats: seatNumbers,
        reason: 'cancellation'
      });
    }

    return true;
  }
}

module.exports = new SeatLockService();
