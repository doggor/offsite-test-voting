const mongoose = require("mongoose");

const CampaignSchema = new mongoose.Schema(
    {
        name: String,
        start: Date,
        end: Date,
        options: [
            {
                name: String,
                count: Number,
            }
        ],
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Campaign", CampaignSchema);
