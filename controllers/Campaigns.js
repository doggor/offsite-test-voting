const utils = require("../utils/writer.js");
const CampaignsService = require("../services/CampaignsService");

module.exports.addCampaign = function addCampaign(req, res, next) {
    const body = req.swagger.params["body"].value;
    CampaignsService.addCampaign(body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.deleteCampaign = function deleteCampaign(req, res, next) {
    const campaignId = req.swagger.params["campaignId"].value;
    CampaignsService.deleteCampaign(campaignId)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.findCampaign = function findCampaign(req, res, next) {
    const campaignId = req.swagger.params["campaignId"].value;
    const userId = req.swagger.params["userId"].value;
    CampaignsService.findCampaign(campaignId, userId)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.listCampaigns = function listCampaigns(req, res, next) {
    const userId = req.swagger.params["userId"].value;
    CampaignsService.listCampaigns(userId)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.updateCampaign = function updateCampaign(req, res, next) {
    const campaignId = req.swagger.params["campaignId"].value;
    const body = req.swagger.params["body"].value;
    CampaignsService.updateCampaign(campaignId, body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.voteCampaign = function voteCampaign(req, res, next) {
    const campaignId = req.swagger.params["campaignId"].value;
    const userId = req.swagger.params["userId"].value;
    CampaignsService.voteCampaign(campaignId, userId)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};
