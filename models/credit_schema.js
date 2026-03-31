const mongoose = require("mongoose");

const creditSchema = new mongoose.Schema({
    sender: {
        type: String,
        default : "Mess Account",
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    creditedAmount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        default: "transfer",
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

const Credit =  mongoose.model('credits', creditSchema);

module.exports = Credit;