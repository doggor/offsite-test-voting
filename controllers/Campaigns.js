const utils = require("../utils/writer.js");
const CampaignsService = require("../services/CampaignsService");
const { errorToStatusCode } = require("../utils/error");

module.exports.addCampaign = async function addCampaign(req, res, next) {
    try {
        const body = req.swagger.params["body"].value;

        const result = await CampaignsService.addCampaign(body);

        utils.writeJson(res, result);
    }
    catch (err) {
        utils.writeJson(res, err.message, errorToStatusCode(err));
    }
};

module.exports.deleteCampaign = async function deleteCampaign(req, res, next) {
    try {
        const campaignId = req.swagger.params["campaignId"].value;

        await CampaignsService.deleteCampaign(campaignId);

        utils.writeJson(res);
    }
    catch (err) {
        utils.writeJson(res, err.message, errorToStatusCode(err));
    }
};

module.exports.findCampaign = async function findCampaign(req, res, next) {
    try {
        const campaignId = req.swagger.params["campaignId"].value;
        const userId = req.swagger.params["userId"].value;

        const result = await CampaignsService.findCampaign(campaignId, userId);

        utils.writeJson(res, result);
    }
    catch (err) {
        utils.writeJson(res, err.message, errorToStatusCode(err));
    }
};

module.exports.listCampaigns = async function listCampaigns(req, res, next) {
    try {
        const userId = req.swagger.params["userId"].value;

        const result = await CampaignsService.listCampaigns(userId);

        utils.writeJson(res, result);
    }
    catch (err) {
        utils.writeJson(res, err.message, errorToStatusCode(err));
    }
};

module.exports.updateCampaign = async function updateCampaign(req, res, next) {
    try {
        const campaignId = req.swagger.params["campaignId"].value;
        const body = req.swagger.params["body"].value;

        const result = await CampaignsService.updateCampaign(campaignId, body);

        utils.writeJson(res, result);
    }
    catch (err) {
        utils.writeJson(res, err.message, errorToStatusCode(err));
    }
};

module.exports.voteCampaign = async function voteCampaign(req, res, next) {
    try {
        const campaignId = req.swagger.params["campaignId"].value;
        const body = req.swagger.params['body'].value;

        await CampaignsService.voteCampaign(campaignId, body);

        utils.writeJson(res);
    }
    catch (err) {
        utils.writeJson(res, err.message, errorToStatusCode(err));
    }
};
