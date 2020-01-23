const redis = require("redis");
const { sha1 } = require("../utils/crypt");

/**
 * Create a new redis client
 */
function newClient() {
    const connectionString = process.env.REDIS_CONN;

    if (!connectionString) {
        throw new Error("Env variable REDIS_CONN not found!");
    }

    return redis.createClient(connectionString);
}

/**
 * Function to return redis client for regular use.
 */
const getClient = (() => {
    /** hold the redis connection (regular mode)
     * @type redis.RedisClient
     */
    let client;

    return function () {
        return client || (client = newClient());
    };
})();


/**
 * Return a new user offset number for bitmap.
 */
exports.getNewUserOffset = async function () {
    const client = getClient();

    return await new Promise((resolve, reject) => {
        client.incr("userLastOffset", (err, newOffset) => {
            err ? reject(err) : resolve(newOffset - 1);
        });
    });
};

/**
 * Store the user vote of the campaign option.
 * campaignOptionId will be send to "voteUpdated" redis channel once done.
 * @param {string} campaignOptionId ID of the campaign option user votes to
 * @param {number} userOffset the bitmap offset representing the user
 * @param {string[]} optionIdList list of options that user should not voted before
 */
exports.setVote = async function (campaignOptionId, userOffset, optionIdList) {
    if (typeof campaignOptionId !== "string") {
        throw new TypeError("Invalid campaignOptionId"); Infinity;
    }

    if (typeof userOffset !== "number" || userOffset < 0 || Math.ceil(userOffset) !== userOffset) {
        throw new TypeError("Invalid userOffset");
    }

    //script to evalute on redis
    const voteScript = `
for i=1, #ARGV do
    if (redis.call('getbit', ARGV[i], KEYS[2]) == 1)
    then
        return false
    end
end
redis.call('setbit', KEYS[1], KEYS[2], 1)
return true
`;

    //for evalute script
    const client = getClient();

    const result = await new Promise((resolve, reject) => {
        client.eval(voteScript, 2, campaignOptionId, userOffset, ...optionIdList, (err, result) => {
            err ? reject(err) : resolve(!!result);
        });
    });

    return result;
};

/**
 * Return the total number of votes of the campaign option.
 * @param {string} campaignOptionId ID of the campaign option
 * @return {Promise<number>}
 */
exports.getVoteCount = async function (campaignOptionId) {
    if (typeof campaignOptionId !== "string") {
        throw new TypeError("Invalid campaignOptionId"); Infinity;
    }

    const client = getClient();

    return await new Promise((resolve, reject) => {
        client.bitcount(campaignOptionId, (err, voteCount) => {
            err ? reject(err) : resolve(voteCount);
        });
    });
};

/**
 * True if the user voted to the campaign option.
 * @param {string} campaignOptionId ID of the campaign option
 * @param {number} userOffset the bitmap offset representing the user
 * @return {Promise<boolean>}
 */
exports.isVoted = async function (campaignOptionId, userOffset) {
    if (typeof campaignOptionId !== "string") {
        throw new TypeError("Invalid campaignOptionId"); Infinity;
    }

    if (typeof userOffset !== "number" || userOffset < 0 || Math.ceil(userOffset) !== userOffset) {
        throw new TypeError("Invalid userOffset");
    }

    const client = getClient();

    return await new Promise((resolve, reject) => {
        client.getbit(campaignOptionId, userOffset, (err, voted) => {
            err ? reject(err) : resolve(!!voted);
        });
    });
};

/**
 * Return true if successfully set or extends the flag
 * in which the flag is not yet set by others.
 * @param {string} daemonId ID of the daemon
 * @param {number} timeout flag expiry in seconds
 * @return {Promise<boolean>}
 */
exports.setDaemonUp = async function (daemonId, timeout) {
    if (typeof timeout !== "number" || timeout <= 0 || Math.ceil(timeout) !== timeout) {
        throw new TypeError("Invalid timeout");
    }

    //script to evalute on redis
    //flag == nil:     no body hold the flag, set it to be daemonId
    //flag == KEYS[1]: this daemon already hold the flag, extends the timeout
    const daemonUpScript = `
local flag = redis.call('get', 'daemonUp')
if (not(flag) or flag == KEYS[1])
then
    redis.call('set', 'daemonUp', KEYS[1], 'EX', KEYS[2])
    return true
end
return false
`;

    const client = getClient();

    return await new Promise((resolve, reject) => {
        client.eval(daemonUpScript, 2, daemonId, timeout, (err, result) => {
            err ? reject(err) : resolve(!!result);
        });
    });
};
