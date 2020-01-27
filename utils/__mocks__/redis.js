exports.getNewUserOffset = jest.fn().mockResolvedValue(0);

exports.setVote = jest.fn()
    .mockResolvedValue(false)
    .mockResolvedValueOnce(true);

exports.notifyVoteUpdate = jest.fn();

exports.onVoteUpdate = jest.fn().mockReturnValue(jest.fn());

exports.getVoteCount = jest.fn().mockResolvedValue(100);

exports.isVoted = jest.fn((campaignId, optionId, userOffset) => {
    if (optionId.match(/_option_2$/)) {
        return true;
    }
    return false;
});

exports.setDaemonUp = jest.fn()
    .mockResolvedValue(false)
    .mockResolvedValueOnce(true);

exports.getDaemonLock = jest.fn()
    .mockResolvedValue(false)
    .mockResolvedValueOnce(true);
