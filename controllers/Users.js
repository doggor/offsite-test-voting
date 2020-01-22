const utils = require("../utils/writer.js");
const UsersService = require("../services/UsersService");
const { errorToStatusCode } = require("../utils/error");

module.exports.addUser = async function addUser(req, res) {
    try {
        const body = req.swagger.params["body"].value;

        const result = await UsersService.addUser(body);

        utils.writeJson(res, result);
    }
    catch (err) {
        utils.writeJson(res, err.message, errorToStatusCode(err));
    }
};

module.exports.listUser = async function listUser(req, res) {
    try {
        const result = await UsersService.listUser();

        utils.writeJson(res, result);
    }
    catch (err) {
        utils.writeJson(res, err.message, errorToStatusCode(err));
    }
};
