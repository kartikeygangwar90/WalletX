const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    credits: {
        type: Number,
        default: 500,
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;