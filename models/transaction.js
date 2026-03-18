const mongoose = require("mongoose");

const transactionsSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        default: "transfer",
    },
    date: {
        type: Date,
    }
})

const Transaction =  mongoose.model('Transaction', transactionsSchema);

module.exports = Transaction;