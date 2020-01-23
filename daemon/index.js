const uuid = require("uuid/v1");
const once = require("lodash.once");
const redis = require("../utils/redis");
const Campaign = require("../models/Campaign");

//represent this process
const DAEMON_ID = uuid();

//true if the daemon hold the global daemon flag
let flag = false;

/**
 * The main function of the daemon.
 * Should not call twice.
 */
async function main() {
    //continuously try setting the flag
    //and start tasks once it got.
    for (; ;) {
        //try set the daemon flag, 30s timeout
        const newFlag = await redis.setDaemonUp(DAEMON_ID, 30);

        //start running tasks if just got the flag
        if (flag === false && newFlag === true) {
            flag = true;
            startTasks();
        }

        //wait 15s before next try/update
        await new Promise(resolve => setTimeout(resolve, 15000));
    }
}

/**
 * Daemon tasks - update votes information from redis to mongodb
 */
async function startTasks() {
    //flush the data peridically
    for (; ;) {
        //return when it no longer holds the flag
        if (!flag) {
            return;
        }

        //update votes information
        try {
            const campaigns = await Campaign.find({
                deletedAt: {
                    $exists: false
                },
            }).exec();

            for (let campaign of campaigns) {
                let campaignVotes = 0;
                for (let option of campaign.options) {
                    let optionVotes = await redis.getVoteCount(option._id.toString());
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

//export main function that is restricted to be invoked once only
module.exports = once(main);
