const Campaign = require("../models/Campaign");
const User = require("../models/User");
const ForbiddenError = require("../errors/ForbiddenError");
const InvalidDataError = require("../errors/InvalidDataError");
const NotFoundError = require("../errors/NotFoundError");
const redis = require("../utils/redis");
const { sha256 } = require("../utils/crypt");

/**
 * Add a new campaign
 *
 * body Campaign Campaign to add
 * returns Campaign
 **/
exports.addCampaign = async function (body) {
    const campaign = await Campaign.create({
        name: body.name,
        start: new Date(body.start),
        end: new Date(body.end),
        options: body.options.map(option => ({
            name: option.name,
            votes: 0,
        })),
        votes: 0,
    });

    //prepare result
    const result = {
        id: campaign._id.toString(),
        name: campaign.name,
        start: campaign.start.toISOString(),
        end: campaign.end.toISOString(),
        options: campaign.options.map(option => ({
            id: option._id,
            name: option.name,
            votes: option.votes,
        })),
        votes: campaign.votes,
    };

    return result;
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
 * returns CampaignWithVoted
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

    //find user if presented
    let user;
    if (userId) {
        user = await User.findOne({
            _id: userId,
            deletedAt: {
                $exists: false,
            },
        }).lean().exec();

        if (!user) {
            throw new InvalidDataError("User Not Found");
        }
    }

    //prepare result
    const options = [];
    for (let option of campaign.options) {
        //fillup 'votes' and 'voted' fields for each option
        options.push({
            id: option._id,
            name: option.name,
            votes: option.votes,
            voted: user ? (await redis.isVoted(campaign._id.toString(), option._id.toString(), user.offset)) : false,
        });
    }
    const result = {
        id: campaign._id.toString(),
        name: campaign.name,
        start: campaign.start.toISOString(),
        end: campaign.end.toISOString(),
        options,
        votes: campaign.votes,
    };

    return result;
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
    })
        .sort({ end: -1, votes: -1 })
        .lean().exec();

    //find user if presented
    let user;
    if (userId) {
        user = await User.findOne({
            _id: userId,
            deletedAt: {
                $exists: false,
            },
        }).lean().exec();

        if (!user) {
            throw new InvalidDataError("User Not Found");
        }
    }

    //prepare result
    let result = [];
    for (let campaign of campaigns) {
        //fillup 'votes' and 'voted' fields for each option
        const options = [];
        for (let option of campaign.options) {
            options.push({
                id: option._id,
                name: option.name,
                votes: option.votes,
                voted: user ? (await redis.isVoted(campaign._id.toString(), option._id.toString(), user.offset)) : false,
            });
        }
        //compose campaign item
        result.push({
            id: campaign._id.toString(),
            name: campaign.name,
            start: campaign.start.toISOString(),
            end: campaign.end.toISOString(),
            options,
            votes: campaign.votes,
        });
    }

    return result;
};


/**
 * Update an existing campaign
 *
 * campaignId Long ID of campaign
 * body Campaign
 * returns Campaign
 **/
exports.updateCampaign = async function (campaignId, body) {
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

    //update data
    campaign.name = body.name;
    campaign.start = start;
    campaign.end = end;

    IN_OPTIONS:
    for (let newOption of body.options) {
        if (newOption.id) {
            for (let option of campaign.options) {
                if (option._id.toString() === newOption.id) {
                    option.name = newOption.name;
                    continue IN_OPTIONS;
                }
            }
            throw new InvalidDataError(`Option (ID: ${newOption.id}) Not Found`);
        }
        else {
            campaign.options.push({
                name: newOption.name,
                votes: 0,
            });
        }
    }

    //save record
    await campaign.save();

    //prepare result
    const options = []; for (let option of campaign.options) {
        //fillup 'votes' field for each option
        options.push({
            id: option._id,
            name: option.name,
            votes: option.votes,
        });
    }
    const result = {
        id: campaign._id.toString(),
        name: campaign.name,
        start: campaign.start.toISOString(),
        end: campaign.end.toISOString(),
        options,
        votes: campaign.votes,
    };

    return result;
};


/**
 * Vote to the campaign
 *
 * campaignId Long ID of campaign
 * body VoteCreationRequest
 * no response value expected for this operation
 **/
exports.voteCampaign = async function (campaignId, body) {
    //find campaign that has given option
    const campaign = await Campaign.findOne({
        _id: campaignId,
        options: {
            $elemMatch: {
                _id: body.optionId,
            },
        },
        deletedAt: {
            $exists: false,
        },
    }).exec();

    if (!campaign) {
        throw new NotFoundError("Campaign Not Found");
    }

    //check if campaign not yet started or already ended
    const now = new Date();
    if (now <= campaign.start) {
        throw new ForbiddenError("Campaign Not Ready");
    }
    if (now >= campaign.end) {
        throw new ForbiddenError("Campaign Ended");
    }

    //find user
    const user = await User.findOne({
        _id: body.userId,
        hkidHash: sha256(body.hkid),
        deletedAt: {
            $exists: false,
        },
    }).lean().exec();

    if (!user) {
        throw new InvalidDataError("User Not Found");
    }

    //record user vote of the campaign option
    const success = await redis.setVote(campaignId, body.optionId, user.offset, campaign.options.map(op => op._id.toString()));

    //success === false if already voted
    if (!success) {
        throw new ForbiddenError("Already Voted");
    }

    //increase vote count in mongodb and notify this update
    (async function () {
        try {
            //increase vote count
            await Campaign.updateOne({
                _id: campaignId,
                options: {
                    $elemMatch: {
                        _id: body.optionId,
                    },
                },
                deletedAt: {
                    $exists: false,
                },
            }, {
                $inc: {
                    votes: 1,
                    "options.$.votes": 1,
                }
            }).exec();

            //notify deamons for broadcasting this message to clients
            await redis.notifyVoteUpdate(campaignId, body.optionId);
        }
        catch (err) {
            console.error(err);
        }
    })();
};
