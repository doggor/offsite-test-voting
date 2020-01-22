const User = require("../models/User");

/**
 * Add new user
 *
 * body User
 * returns User
 **/
exports.addUser = async function (body) {
    const user = await User.create({
        hkid_hash: body.hkid_hash,
    });

    return user;
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

    return users;
};
