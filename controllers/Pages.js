const fs = require("fs");
const path = require("path");
const utils = require('../utils/writer.js');
const { errorToStatusCode } = require("../utils/error");

module.exports.getPage = function getPage(req, res, next) {
    fs.readFile(path.resolve("./www/index.html"), "utf8", (err, data) => {
        if (err) {
            utils.writeJson(res, err.message, errorToStatusCode(err));
        }
        else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        }
    });
};
