const seatLockService = require('../services/seatLockService');

const initSeatSocket = (io) => {
  seatLockService.setIO(io);

  io.on('connection', (socket) => {
    // Join a specific show room
    socket.on('join-show', async ({ showId }) => {
      if (!showId) return;
      const room = `show_${showId}`;
      socket.join(room);

      // Clean expired locks and send fresh seat snapshot
      try {
        const show = await seatLockService.cleanShowExpiredLocks(showId);
        if (show) {
          socket.emit('seat-sync', {
            showId,
            seats: show.seats.map((s) => ({
              seatNumber: s.seatNumber,
              category: s.category,
              price: s.price,
              status: s.status,
              lockedBy: s.lockedBy,
              lockExpiresAt: s.lockExpiresAt
            }))
          });
        }
      } catch (err) {
        console.error(`[Socket] Error syncing show ${showId}:`, err.message);
      }
    });

    // Leave show room
    socket.on('leave-show', ({ showId }) => {
      if (showId) {
        socket.leave(`show_${showId}`);
      }
    });

    // Client requests locking seats
    socket.on('request-lock-seats', async ({ showId, seats, userId }, callback) => {
      try {
        if (!showId || !seats || !seats.length || !userId) {
          if (callback) callback({ success: false, message: 'Invalid lock request parameters' });
          return;
        }

        const result = await seatLockService.lockSeats(showId, seats, userId);
        if (callback) callback({ success: true, ...result });
      } catch (err) {
        if (callback) callback({ success: false, message: err.message });
      }
    });

    // Client requests unlocking seats
    socket.on('request-unlock-seats', async ({ showId, seats, userId }, callback) => {
      try {
        if (!showId || !seats || !seats.length) {
          if (callback) callback({ success: false });
          return;
        }

        await seatLockService.unlockSeats(showId, seats, userId);
        if (callback) callback({ success: true });
      } catch (err) {
        if (callback) callback({ success: false, message: err.message });
      }
    });

    socket.on('disconnect', () => {
      // User disconnected
    });
  });
};

module.exports = initSeatSocket;
