const ForbiddenError = require("../errors/ForbiddenError");
const InvalidDataError = require("../errors/InvalidDataError");
const NotFoundError = require("../errors/NotFoundError");

exports.errorToStatusCode = function (err) {
    if (err instanceof ForbiddenError) {
        return 403;
    }
    else if (err instanceof InvalidDataError) {
        return 400;
    }
    else if (err instanceof NotFoundError) {
        return 404;
    }

    return 500;
}
