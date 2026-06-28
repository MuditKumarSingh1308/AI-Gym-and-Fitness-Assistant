const mongoose = require("mongoose");

const { DATABASE_NAME, MONGODB_URI } = require("./config");
const { ensureCollections } = require("./models");

let connectionPromise = null;
let lastConnectionError = null;

function getConnectionStateLabel() {
  switch (mongoose.connection.readyState) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "unknown";
  }
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    const error = new Error("MONGODB_URI environment variable is required");
    lastConnectionError = error;
    throw error;
  }

  if (!DATABASE_NAME) {
    const error = new Error("DATABASE_NAME environment variable is required");
    lastConnectionError = error;
    throw error;
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(MONGODB_URI, {
      dbName: DATABASE_NAME,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    })
    .then(async () => {
      await ensureCollections();
      lastConnectionError = null;
      return mongoose.connection;
    })
    .catch((error) => {
      lastConnectionError = error;
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
}

function getDatabaseHealth() {
  return {
    connected: mongoose.connection.readyState === 1,
    state: getConnectionStateLabel(),
    database_name: DATABASE_NAME,
    uri_configured: Boolean(MONGODB_URI),
    last_error: lastConnectionError ? lastConnectionError.message : null,
    collections: require("./models").getCollectionNames(),
  };
}

async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connectionPromise = null;
}

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  getDatabaseHealth,
  mongoose,
};
