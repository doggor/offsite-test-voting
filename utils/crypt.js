const crypto = require('crypto');

/**
 * Return sha256 hash of the input value.
 * @param {string} input
 * @return {string}
 */
exports.sha256 = function (input) {
    const hash = crypto.createHash('sha256');
    hash.update(input);
    return hash.digest('hex');
};
