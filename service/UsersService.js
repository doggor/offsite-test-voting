/**
 * Add new user
 *
 * body User
 * returns User
 **/
exports.addUser = function (body) {
    return new Promise(function (resolve, reject) {
        const examples = {};
        examples["application/json"] = {
            "hkid_hash": "hkid_hash",
            "id": "id"
        };
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]]);
        } else {
            resolve();
        }
    });
}


/**
 * List all users
 *
 * returns List
 **/
exports.listUser = function () {
    return new Promise(function (resolve, reject) {
        const examples = {};
        examples["application/json"] = [{
            "hkid_hash": "hkid_hash",
            "id": "id"
        }, {
            "hkid_hash": "hkid_hash",
            "id": "id"
        }];
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]]);
        } else {
            resolve();
        }
    });
}

