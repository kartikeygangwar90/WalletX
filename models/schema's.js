const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    from: {
        type: String,
        require: true,
    },
    to: {
        type: String,
        require: true,
    },
    amount: {
        type: Number,
        require: true,
        default: 0,
    },
    credits: {
        type: Number,
        require: true,
        default: 4000,
    },
    msg: {
        type: String,
        require: true,
    },
    created_at: {
        type: Date,
    }
});

const Payment = mongoose.model("newPayment", paymentSchema);

module.exports = Payment;