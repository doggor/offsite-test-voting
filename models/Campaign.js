const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema(
    {
        name: String,
        start: Date,
        end: Date,
        votes: [
            {
                name: String,
            }
        ],
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

const CampaignModel = mongoose.model("Campaign", CampaignSchema);

module.exports = CampaignModel;
