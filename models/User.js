const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        hkidHash: String,
        offset: Number, //unique number represents the user position on a bitmap
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

UserSchema.index({ hkidHash: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
