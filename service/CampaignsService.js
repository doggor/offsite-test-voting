/**
 * Add a new campaign
 *
 * body Campaign Campaign to add
 * returns Campaign
 **/
exports.addCampaign = function (body) {
    return new Promise(function (resolve, reject) {
        const examples = {};
        examples["application/json"] = {
            "end_at": "2000-01-23T04:56:07.000+00:00",
            "name": "name",
            "started_at": "2000-01-23T04:56:07.000+00:00",
            "votes": [{
                "name": "name",
                "votes": 0
            }, {
                "name": "name",
                "votes": 0
            }],
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
 * Delete an existing campaign
 *
 * campaignId Long ID of campaign
 * no response value expected for this operation
 **/
exports.deleteCampaign = function (campaignId) {
    return new Promise(function (resolve, reject) {
        resolve();
    });
}


/**
 * Find the existed campaign
 *
 * campaignId Long ID of campaign
 * userId String Voter"s user ID (optional)
 * returns Campaign
 **/
exports.findCampaign = function (campaignId, userId) {
    return new Promise(function (resolve, reject) {
        const examples = {};
        examples["application/json"] = {
            "end_at": "2000-01-23T04:56:07.000+00:00",
            "name": "name",
            "started_at": "2000-01-23T04:56:07.000+00:00",
            "votes": [{
                "name": "name",
                "votes": 0
            }, {
                "name": "name",
                "votes": 0
            }],
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
 * List all campaigns
 *
 * userId String Voter"s user ID (optional)
 * returns List
 **/
exports.listCampaigns = function (userId) {
    return new Promise(function (resolve, reject) {
        const examples = {};
        examples["application/json"] = [{
            "end_at": "2000-01-23T04:56:07.000+00:00",
            "name": "name",
            "started_at": "2000-01-23T04:56:07.000+00:00",
            "votes": [{
                "name": "name",
                "votes": 0
            }, {
                "name": "name",
                "votes": 0
            }],
            "id": "id"
        }, {
            "end_at": "2000-01-23T04:56:07.000+00:00",
            "name": "name",
            "started_at": "2000-01-23T04:56:07.000+00:00",
            "votes": [{
                "name": "name",
                "votes": 0
            }, {
                "name": "name",
                "votes": 0
            }],
            "id": "id"
        }];
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]]);
        } else {
            resolve();
        }
    });
}


/**
 * Update an existing campaign
 *
 * campaignId Long ID of campaign
 * body Campaign
 * returns Campaign
 **/
exports.updateCampaign = function (campaignId, body) {
    return new Promise(function (resolve, reject) {
        const examples = {};
        examples["application/json"] = {
            "end_at": "2000-01-23T04:56:07.000+00:00",
            "name": "name",
            "started_at": "2000-01-23T04:56:07.000+00:00",
            "votes": [{
                "name": "name",
                "votes": 0
            }, {
                "name": "name",
                "votes": 0
            }],
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
 * Vote to the campaign
 *
 * campaignId Long ID of campaign
 * userId String Voter"s user ID
 * returns Campaign
 **/
exports.voteCampaign = function (campaignId, userId) {
    return new Promise(function (resolve, reject) {
        const examples = {};
        examples["application/json"] = {
            "end_at": "2000-01-23T04:56:07.000+00:00",
            "name": "name",
            "started_at": "2000-01-23T04:56:07.000+00:00",
            "votes": [{
                "name": "name",
                "votes": 0
            }, {
                "name": "name",
                "votes": 0
            }],
            "id": "id"
        };
        if (Object.keys(examples).length > 0) {
            resolve(examples[Object.keys(examples)[0]]);
        } else {
            resolve();
        }
    });
}

