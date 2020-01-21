const mongoose = require("mongoose");

/** hold the mongodb connection */
let connection;

/**
 * Initialize mongodb connection.
 * Must call before using models.
 */
async function init() {
    if (connection) {
        return connection;
    }

    connection = await mongoose.connect("mongodb://localhost/voting",
        {
            useNewUrlParser: true,
            keepAlive: true,
            autoReconnect: true,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 500,
            poolSize: 1,
        },
        err => (err ? console.error(err) : void 0)
    );

    return connection;
}

module.exports = init;
