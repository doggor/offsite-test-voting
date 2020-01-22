const utils = require("../utils/writer.js");
const UsersService = require("../services/UsersService");

module.exports.addUser = function addUser(req, res, next) {
    const body = req.swagger.params["body"].value;
    UsersService.addUser(body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.listUser = function listUser(req, res, next) {
    UsersService.listUser()
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};
