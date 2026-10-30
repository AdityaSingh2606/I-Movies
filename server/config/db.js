const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies';

  try {
    // Attempt local/configured connection first with 3s timeout
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[MongoDB] Local MongoDB connection at '${mongoUri}' failed: ${err.message}`);
    console.log('[MongoDB] Initializing embedded MongoDB server fallback for seamless zero-config evaluation...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB] Embedded In-Memory MongoDB connected at: ${inMemoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[MongoDB] Failed to start embedded MongoDB: ${memErr.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
