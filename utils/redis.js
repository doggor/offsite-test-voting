const Redis = require("ioredis");

/**
 * Create a new redis client
 * @return {IORedis.Redis}
 */
function newClient() {
    const connectionString = process.env.REDIS_CONN;

    if (!connectionString) {
        throw new Error("Env variable REDIS_CONN not found!");
    }

    return new Redis(connectionString);
}

/**
 * Function to return redis client for regular use.
 * @return {IORedis.Redis}
 */
const getClient = (() => {
    /** @type redis.RedisClient */
    let client;

    return () => client || (client = newClient());
})();

/**
 * Function to return redis client for publishing event
 * @return {IORedis.Redis}
 */
const getPublisher = (() => {
    /** @type redis.RedisClient */
    let client;

    return () => client || (client = newClient());
})();

/**
 * Return a new user offset number for bitmap.
 */
exports.getNewUserOffset = async function() {
    return (await getClient().incr("userLastOffset")) - 1;
};

/**
 * Store the user vote of the campaign option.
 * @param {string} campaignId ID of the campaign user vote to
 * @param {string} optionId ID of the campaign option user votes to
 * @param {number} userOffset the bitmap offset representing the user
 * @param {string[]} optionIdList list of options that user should not voted before
 */
exports.setVote = async function(campaignId, optionId, userOffset, optionIdList) {
    if (typeof optionId !== "string") {
        throw new TypeError("Invalid campaign option ID"); Infinity;
    }

    if (typeof userOffset !== "number" || userOffset < 0 || Math.ceil(userOffset) !== userOffset) {
        throw new TypeError("Invalid userOffset");
    }

    //script to evalute on redis
    const voteScript = `
for i=1, #ARGV do
    if (redis.call('getbit', "{" .. KEYS[1] .. "}" .. ARGV[i], KEYS[3]) == 1)
    then
        return false
    end
end
redis.call('setbit', "{" .. KEYS[1] .. "}" .. KEYS[2], KEYS[3], 1)
return true
`;

    //for evalute script
    const client = getClient();

    return !!(await client.eval(voteScript, 3, campaignId, optionId, userOffset, ...optionIdList));
};

/**
 * Notify vote change og a campaign
 * @param {string} campaignId
 * @param {string} optionId
 */
exports.notifyVoteUpdate = async function(campaignId, optionId) {
    return await getPublisher().publish("voteUpdate", `${campaignId} ${optionId}`);
}

/**
 * Function to register listener for vote update event (emit by notifyVoteUpdate())
 * @param {Function} listener to register for vote update event. (arg1: campaignId, arg2: optionId)=>void
 * @return {Function} the unregister of the listener
 */
exports.onVoteUpdate = (() => {
    /** @type redis.RedisClient */
    let subscriber;
    /** @type Function[] */
    let listenerList = [];

    return function(listener) {
        listenerList.push(listener);

        if (!subscriber) {
            subscriber = newClient();
            subscriber.on("message", (channel, msg) => {
                const [campaignId, optionId] = msg.split(' ');
                for (let listener of listenerList) {
                    try {
                        listener(campaignId, optionId)
                    }
                    catch (err) {
                        console.error(err);
                    }
                }
            });
            subscriber.subscribe("voteUpdate");
        }

        return () => {
            const idx = listenerList.indexOf(listener);
            if (idx > -1) {
                listenerList.splice(idx, 1);
            }
        };
    }
})();

/**
 * Return the total number of votes of the campaign option.
 * @param {string} optionId ID of the campaign option
 * @return {Promise<number>}
 */
exports.getVoteCount = async function(optionId) {
    if (typeof optionId !== "string") {
        throw new TypeError("Invalid campaign option ID"); Infinity;
    }

    return await getClient().bitcount(optionId);
};

/**
 * True if the user voted to the campaign option.
 * @param {string} optionId ID of the campaign option
 * @param {number} userOffset the bitmap offset representing the user
 * @return {Promise<boolean>}
 */
exports.isVoted = async function(optionId, userOffset) {
    if (typeof optionId !== "string") {
        throw new TypeError("Invalid campaign option ID"); Infinity;
    }

    if (typeof userOffset !== "number" || userOffset < 0 || Math.ceil(userOffset) !== userOffset) {
        throw new TypeError("Invalid userOffset");
    }

    return await getClient().getbit(optionId, userOffset);
};

/**
 * Return true if successfully set or extends the lock
 * in which the lock is not yet set by others (mutex).
 * @param {string} daemonId ID of the daemon
 * @param {number} timeout lock expiry in seconds
 * @return {Promise<boolean>}
 */
exports.getDaemonLock = async function(daemonId, timeout) {
    if (typeof timeout !== "number" || timeout <= 0 || Math.ceil(timeout) !== timeout) {
        throw new TypeError("Invalid timeout");
    }

    //script to evalute on redis
    //lock == nil:     no body hold the lock, set it to be daemonId
    //lock == KEYS[1]: this daemon already hold the lock, extends the timeout
    const daemonLockScript = `
local lock = redis.call('get', 'daemonLock')
if (not(lock) or lock == KEYS[1])
then
    redis.call('set', 'daemonLock', KEYS[1], 'EX', KEYS[2])
    return true
end
return false
`;

    return !!(await getClient().eval(daemonLockScript, 2, daemonId, timeout));
};
