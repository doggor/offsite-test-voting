const uuid = require("uuid/v1");
const once = require("lodash.once");
const redis = require("../utils/redis");
const Campaign = require("../models/Campaign");

//represent this process
const DAEMON_ID = uuid();

//true if the daemon hold the global daemon lock
let lock = false;

/**
 * The main function of the daemon.
 * Should not call twice.
 * @param {SocketIO.Server} io
 */
async function main(io) {
    boardcastVoteUpdates(io);

    //keep getting/updating the global daemon lock
    for (; ;) {
        //try get the daemon lock, 30s timeout
        const newlock = await redis.getDaemonLock(DAEMON_ID, 30);

        //start flushDataPeriodically() if just got the lock
        if (lock === false && newlock === true) {
            lock = true;
            flushDataPeriodically();
        }
        else if (newlock === false) {
            lock = false; //that will stop flushDataPeriodically()
        }

        //wait 15s before next try/update
        await new Promise(resolve => setTimeout(resolve, 15000));
    }
}

/**
 * Continuously update votes information from redis to mongodb
 * to ensure that the data in mongodb is consistent with redis.
 */
async function flushDataPeriodically() {
    //flush the data peridically
    for (; ;) {
        //return when the lock no longer on hand
        if (!lock) {
            return;
        }

        //update votes information
        try {
            const campaigns = await Campaign.find({
                deletedAt: { $exists: false },
            }).exec();

            for (let campaign of campaigns) {
                let campaignVotes = 0;
                for (let option of campaign.options) {
                    let optionVotes = await redis.getVoteCount(campaign._id.toString(), option._id.toString());
                    option.votes = optionVotes;
                    campaignVotes += optionVotes;
                }
                campaign.votes = campaignVotes;

                await campaign.save();
            }
        }
        catch (err) {
            console.error(err);
        }

        //wait 5s before next epoch
        new Promise(resolve => setTimeout(resolve, 5000));
    }
}

/**
 * Register listner for boardcasting the latest campaign data
 * each time when a vote update event emit.
 * @param {SocketIO.Server} io
 * @return {Function} unregister
 */
function boardcastVoteUpdates(io) {
    return redis.onVoteUpdate(async (campaignId, optionId) => {
        //boardcast latest campaign data
        const campaign = await Campaign.findOne({
            _id: campaignId,
            deletedAt: { $exists: false },
        }).lean().exec();

        if (campaign) {
            io.sockets.emit("voteUpdate", {
                campaign: {
                    id: campaign._id,
                    name: campaign.name,
                    options: campaign.options.map(option => ({
                        id: option._id,
                        name: option.name,
                        votes: option.votes,
                    })),
                }
            });
        }
    });
}

//export main function that is restricted to be invoked once only
module.exports = once(main);
