const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        hkid_hash: { type: String, index: true },
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
