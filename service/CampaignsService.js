const Campaign = require("../models/Campaign");
const InvalidDataError = require("../errors/InvalidDataError");
const ForbiddenError = require("../errors/ForbiddenError");
const NotFoundError = require("../errors/NotFoundError");

/**
 * Add a new campaign
 *
 * body Campaign Campaign to add
 * returns Campaign
 **/
exports.addCampaign = async function (body) {
    const campaign = await Campaign.create({
        name: body.name,
        start: body.start,
        end: body.end,
        votes: body.votes.map(option => ({
            name: option.name,
        })),
    });

    return campaign;
};


/**
 * Delete an existing campaign
 *
 * campaignId Long ID of campaign
 * no response value expected for this operation
 **/
exports.deleteCampaign = async function (campaignId) {
    const campaign = await Campaign.findOne({
        _id: campaignId,
        deletedAt: {
            $exists: false,
        },
    }).exec();

    if (!campaign) {
        throw new NotFoundError("Campaign Not Found");
    }

    //soft delete
    campaign.deletedAt = new Date();
    await campaign.save();
};


/**
 * Find the existed campaign
 *
 * campaignId Long ID of campaign
 * userId String Voter"s user ID (optional)
 * returns Campaign
 **/
exports.findCampaign = async function (campaignId, userId) {
    const campaign = await Campaign.findOne({
        _id: campaignId,
        deletedAt: {
            $exists: false,
        },
    }).lean().exec();

    if (!campaign) {
        throw new NotFoundError("Campaign Not Found");
    }

    if (userId) {
        const user = await user.findOne({
            _id: userId,
            deletedAt: {
                $exists: false,
            },
        }).lean().exec();

        if (!user) {
            throw new InvalidDataError("User Not Found");
        }

        //TODO: find user vote and merge to result

    }

    return campaign;
};


/**
 * List all campaigns
 *
 * userId String Voter"s user ID (optional)
 * returns List
 **/
exports.listCampaigns = async function (userId) {
    const campaigns = await Campaign.find({
        deletedAt: {
            $exists: false
        },
    }).lean().exec();

    if (userId) {
        const user = await User.findOne({
            _id: userId,
            deletedAt: {
                $exists: false,
            },
        }).lean().exec();

        if (!user) {
            throw new InvalidDataError("User Not Found");
        }

        //TODO: find user vote and merge to result

    }

    return campaigns;
};


/**
 * Update an existing campaign
 *
 * campaignId Long ID of campaign
 * body Campaign
 * returns Campaign
 **/
exports.updateCampaign = function (campaignId, body) {
    const campaign = await Campaign.findOne({
        _id: campaignId,
        deletedAt: {
            $exists: false
        },
    }).exec();

    if (!campaign) {
        throw new NotFoundError("Campaign Not Found");
    }

    //convert date string to js object
    const start = new Date(body.start);
    const end = new Date(body.end);

    //validate time range
    if (isNaN(start) || isNaN(end) || start >= end) {
        throw new InvalidDataError("Invalid Time Range");
    }

    //save records
    campaign.name = body.name;
    campaign.start = start;
    campaign.end = end;

    await campaign.save();

    return campaign;
};


/**
 * Vote to the campaign
 *
 * campaignId Long ID of campaign
 * userId String Voter"s user ID
 * returns Campaign
 **/
exports.voteCampaign = function (campaignId, userId) {
    const campaign = await Campaign.findOne({
        _id: campaignId,
        deletedAt: {
            $exists: false,
        },
    }).lean().exec();

    if (!campaign) {
        throw new NotFoundError("Campaign Not Found");
    }

    const user = await user.findOne({
        _id: userId,
        deletedAt: {
            $exists: false,
        },
    }).lean().exec();

    if (!user) {
        throw new InvalidDataError("User Not Found");
    }

    //TODO record user vote of the the campaign

    return campaign;
};

