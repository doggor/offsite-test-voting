const utils = require("../utils/writer.js");
const Users = require("../service/UsersService");

module.exports.addUser = function addUser(req, res, next) {
    const body = req.swagger.params["body"].value;
    Users.addUser(body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.listUser = function listUser(req, res, next) {
    Users.listUser()
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};
