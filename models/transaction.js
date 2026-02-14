const mongoose = require("mongoose");

const transactionsSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true,
    },
    reciever: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        require: true,
    },
    type: {
        type: String,
    },
    date: {
        type: Date,
    }
})

const Transaction =  mongoose.model('Transaction', transactionsSchema);

module.exports = Transaction;