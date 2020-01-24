exports.getNewUserOffset = jest.fn().mockResolvedValue(0);

exports.setVote = jest.fn()
    .mockResolvedValue(false)
    .mockResolvedValueOnce(true);

exports.getVoteCount = jest.fn().mockResolvedValue(100);

exports.isVoted = jest.fn((campaignOptionId, userOffset) => {
    if (campaignOptionId.match(/_option_2$/)) {
        return true;
    }
    return false;
});

exports.setDaemonUp = jest.fn()
    .mockResolvedValue(false)
    .mockResolvedValueOnce(true);
