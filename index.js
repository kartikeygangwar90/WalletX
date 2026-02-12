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
})

transaction.save()
.then(res => {
    console.log(res);
}) 
.catch(err => {
    console.log(err);
})


const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

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
app.get("/wallet/balance", (req, res) => {
    res.render("balance.ejs");
})

app.post("/wallet/transfer", (req, res) => {
    res.render("transfer.ejs");
})

app.post("/wallet/addCredit", (req, res) => {
    res.render("addCredit.ejs");
})

app.get("/transactions", (req, res) => {
    res.render("transaction.ejs");
})