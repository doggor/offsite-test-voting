'use strict';

const utils = require('../utils/writer.js');
const Campaigns = require('../service/CampaignsService');

module.exports.addCampaign = function addCampaign(req, res, next) {
    const body = req.swagger.params['body'].value;
    Campaigns.addCampaign(body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.deleteCampaign = function deleteCampaign(req, res, next) {
    const campaignId = req.swagger.params['campaignId'].value;
    Campaigns.deleteCampaign(campaignId)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.findCampaign = function findCampaign(req, res, next) {
    const campaignId = req.swagger.params['campaignId'].value;
    const userId = req.swagger.params['userId'].value;
    Campaigns.findCampaign(campaignId, userId)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.listCampaigns = function listCampaigns(req, res, next) {
    const userId = req.swagger.params['userId'].value;
    Campaigns.listCampaigns(userId)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.updateCampaign = function updateCampaign(req, res, next) {
    const campaignId = req.swagger.params['campaignId'].value;
    const body = req.swagger.params['body'].value;
    Campaigns.updateCampaign(campaignId, body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};

module.exports.voteCampaign = function voteCampaign(req, res, next) {
    const campaignId = req.swagger.params['campaignId'].value;
    const userId = req.swagger.params['userId'].value;
    Campaigns.voteCampaign(campaignId, userId)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};
