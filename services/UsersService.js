const validid = require("validid");
const User = require("../models/User");
const redis = require("../utils/redis");
const { sha256 } = require("../utils/crypt");
const ForbiddenError = require("../errors/ForbiddenError");
const InvalidDataError = require("../errors/InvalidDataError");

/**
 * Add new user
 *
 * body User
 * returns User
 **/
exports.addUser = async function (body) {
    const hkid = body.hkid;

    //validate HKID
    if (!validid.hkid(hkid)) {
        throw new InvalidDataError("Invalid HKID");
    }

    //convert HKID to hash for security
    const hkidHash = sha256(hkid);

    //check if HKID already registered
    if (await User.exists({ hkidHash })) {
        throw new ForbiddenError("Already Registered");
    }

    const user = await User.create({
        hkidHash: hkidHash,
        offset: await redis.getNewUserOffset(),
    });

    const result = {
        id: user._id.toString(),
    };

    return result;
};


/**
 * List all users
 *
 * returns List
 **/
exports.listUser = async function () {
    const users = await User.find({
        deletedAt: {
            $exists: false
        }
    }).lean().exec();

    const result = users.map(user => (
        {
            id: user._id.toString(),
        }
    ));

    return result;
};
