const mongoose = require("mongoose");
const Payment= require("./models/schema's");

main()
.then(res => {
    console.log("Connection Successfull !!");
})
.catch(err => {
    console.log(err);
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/WalletX'); 
}

let transaction = new Payment( {
    from: "Vishesh",
    to: "Kanak",
    amount: 30,
    msg: "Hello lets do Fun together",
    created_at: new Date(),
});

// transaction.save()
// .then(res => {
//     console.log(res);
// }) 
// .catch(err => {
//     console.log(err);
// })


const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const Transaction = require("./models/transaction");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const port = 8080;

// This contaions the dashboard section of the website (Home page)
app.get("/dashboard/:id", async (req, res) => {
    let {id} = req.params;
    let userData = await Payment.findById(id);
    res.render("index.ejs", { userData });
})

app.listen(port, () => {
    console.log(`The server is listening to the port ${port}`);
})


//  this is the wallet and its balance section 
app.get("/wallet/:id/balance", async (req, res) => {
    let {id} = req.params;
    let userData = await Payment.findById(id);
    let transaction_history = await Transaction.find({});
    res.render("balance.ejs", { userData , transaction_history});
})

app.get("/wallet/:id/transfer", async (req, res) => {
    let { id } = req.params;
    let userData = await Payment.findById(id);
    res.render("transfer.ejs", { userData });
})

app.post("/wallet/:id/transfer", async (req, res) => {
    let {id} = req.params;
    let amount  = parseFloat(req.body.amount);

    if(isNaN(amount)) {
        return res.send("Enter amount please");
    }

    let sender = await Payment.findById(id);

    // Validation 
    if(!sender) return res.send("User not found");

    if(amount <= 0) return res.send("Enter Valid Amount");

    if(sender.amount < amount) return res.send("Insufficient amount ");

    // Deduct balance 
    sender.amount -= amount;

    await sender.save();

    await Transaction.create({
        sender: id,
        reciever: id,
        amount: amount,
        type: "transfer",
        date: new Date(),
    });


    // let userData = await Payment.findById(id);
    // res.render("transfer.ejs", { userData });
    res.redirect(`/dashboard/${id}`);
})

app.get("/wallet/:id/addCredit", async (req, res) => {
    let {id} = req.params;
    let userData = await Payment.findById(id);
    res.render("addCredit.ejs", { userData });
})

app.post("/wallet/:id/addCredit", async (req, res) => {
    let { id } = req.params;
    let credit_amount = parseFloat(req.body.credit);

    if(isNaN(credit_amount)) {
        return res.send("Enter amount please");
    }

    let reciever = await Payment.findById(id);

    // Validation
    if(!reciever) return res.send("User not Found");

    if(credit_amount <= 0) return res.send("Enter Valid amount first");

    reciever.credits -= credit_amount;
    reciever.amount += credit_amount;
    await reciever.save();
    
    res.redirect(`/dashboard/${id}`);
})

app.get("/wallet/:id/transaction", async (req, res) => {
    let { id } = req.params;
    let userData = await Payment.findById(id);
    res.render("transaction.ejs", { userData });
})

app.post("/wallet/:id/transaction", async (req, res) => {
    let { id } = req.params;
    let spent = parseFloat(req.body.spent);

    if(isNaN(spent)) return res.send("Enter amount please");

    let user = await Payment.findById(id);

    if(!user) return res.send("User not found");

    if(spent <= 0) return res.send("Enter valid amount please !");

    if(user.amount < spent) return res.send("Insufficient money");

    user.amount -= spent;

    await user.save();

    res.redirect(`/dashboard/${id}`);
}) 