const fs = require("fs");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const swaggerTools = require("swagger-tools");
const jsyaml = require("js-yaml");
const { init: modelInit } = require("./models");
const startDaemon = require("./daemon");

const app = require("connect")();

const serverPort = process.env.PORT || 8080;

// swaggerRouter configuration
const options = {
    swaggerUi: path.join(__dirname, "/swagger.json"),
    controllers: path.join(__dirname, "./controllers"),
    useStubs: process.env.NODE_ENV === "development" // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
const spec = fs.readFileSync(path.join(__dirname, "api/swagger.yaml"), "utf8");
const swaggerDoc = jsyaml.safeLoad(spec);

// The main function
async function main() {
    // Initialize the Swagger middleware
    const { swaggerMetadata, swaggerValidator, swaggerRouter, swaggerUi } = await new Promise(resolve => {
        swaggerTools.initializeMiddleware(swaggerDoc, resolve);
    });

    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(swaggerMetadata());

    // Validate Swagger requests
    app.use(swaggerValidator());

    // Route validated requests to appropriate controller
    app.use(swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    app.use(swaggerUi());

    // Establish DB connection
    await modelInit();

    // Create http server
    const server = http.createServer(app);

    // Bind socketio to server
    const io = socketio.listen(server)

    // Start server
    await new Promise(resolve => {
        server.listen(serverPort, resolve);
    });

    // Start daemon
    startDaemon(io).catch(err => {
        console.error(err);
        process.exit(1);
    });

    // PM2 graceful start notification
    if (typeof process.send === "function") {
        process.send("ready");
    }

    // Echo messages for launch success
    console.log("Your server is listening on port %d (http://localhost:%d)", serverPort, serverPort);
    console.log("Swagger-ui is available on http://localhost:%d/docs", serverPort);
    console.log("Please call any HTTP API with the prefix: http://localhost:%d/api/v1", serverPort);
    console.log("You may found the vote distributions of all campaigns at http://localhost:%d/api/v1/pages/charts through a modern web browser");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
