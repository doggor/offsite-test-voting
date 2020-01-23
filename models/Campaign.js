const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema(
    {
        name: String,
        start: Date,
        end: Date,
        options: [
            {
                name: String,
                votes: Number, //cache of total votes of this option
            }
        ],
        votes: 0, //cache of total votes of this campaign
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

CampaignSchema.index({ end: -1, votes: -1 });

module.exports = mongoose.model("Campaign", CampaignSchema);
