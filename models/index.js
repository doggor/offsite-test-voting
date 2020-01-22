const mongoose = require("mongoose");

/** hold the mongodb connection */
let connectionPromise;

/**
 * Function to initialize mongodb connection.
 * Must call before using models.
 */
exports.init = async function () {
    if (connectionPromise) {
        return await connectionPromise;
    }

    const connectionString = process.env.MONGODB_CONN;

    if (!connectionString) {
        throw new Error("Env variable MONGODB_CONN not found!");
    }

    connectionPromise = mongoose.connect(connectionString,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            keepAlive: true,
            poolSize: 1,
            autoIndex: false,
        }
    );

    return await connectionPromise;
};
