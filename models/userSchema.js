const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    rollNo: {
        type: Number,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
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