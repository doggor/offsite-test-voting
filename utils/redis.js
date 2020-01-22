const redis = require("redis");

/** hold the redis connection
 * @type redis.RedisClient
 */
let client;

/**
 * Function to return redis client.
 */
function getClient() {
    if (client) {
        return client;
    }

    const connectionString = process.env.REDIS_CONN;

    if (!connectionString) {
        throw new Error("Env variable REDIS_CONN not found!");
    }

    client = redis.createClient(connectionString);

    return client;
}

/**
 * Return a new user offset number for bitmap.
 */
exports.getNewUserOffset = async function () {
    const client = getClient();

    return await new Promise((resolve, reject) => {
        client.incr("user", (err, newOffset) => {
            err ? reject(err) : resolve(newOffset);
        });
    });
};

/**
 * Store the user vote of the campaign option.
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

    const client = getClient();

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

    return await new Promise((resolve, reject) => {
        client.eval(voteScript, 2, campaignOptionId, userOffset, ...optionIdList, (err, result) => {
            err ? reject(err) : resolve(!!result);
        });
    });
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
