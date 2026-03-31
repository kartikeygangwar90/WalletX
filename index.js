const mongoose = require("mongoose");
const User = require("./models/userSchema");

main()
.then(res => {
    console.log("Connection Successfull !!");
})
.catch(err => {
    console.log(err);
})

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/WalletX'); 
    // const count = await User.countDocuments();
    // if(count == 0) {
    //     await User.create([
    //     { name: "Vishesh", balance: 200 },
    //     { name: "Kanak" , credits: 2000},
    // ]);
    // }
}

const express = require("express");
const app = express();
const path = require("path");
// const methodOverride = require("method-override");
const Transaction = require("./models/transaction");
const Credit = require("./models/credit_schema");

const session = require("express-session");
app.use(session({
    secret: "wallet-secret",
    resave: false,
    saveUninitialized: false,
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const port = 8080;

// This contaions the dashboard section of the website (Home page)

app.get("/", (req, res) => {
      if(req.session.userId) {
        return res.redirect(`/dashboard`);
    }
    res.redirect("/login");
})

app.get("/dashboard", isLoggedIn, async (req, res) => {
    let userData = await User.findById(req.session.userId);

    if(!userData) return res.send("Invalid user ID");
    
    res.render("index.ejs", { userData });
})

app.listen(port, () => {
    console.log(`The server is listening to the port ${port}`);
})


// Signup setup -->
app.get("/signup", (req,res) => {
    res.render("signup.ejs");
})

const bcrypt = require("bcrypt");

app.post("/signup", async(req, res) => {
    let {name, rollNo, email, password} = req.body;

    const hashedPassword = await bcrypt.hash(password, 8);

    let existingUser = await User.findOne({
        $or: [{ email }, { rollNo }]
    })
    if(existingUser) {
        return res.send("User already exist");
    }

    let newUser = await User.create({
        name,
        rollNo,
        email,
        password: hashedPassword,
    });


    req.session.userId = newUser._id;

    res.redirect(`/dashboard`);
});

// login Setup 

app.get("/login", (req, res) => {
    res.render("login.ejs");
})

app.post("/login", async(req, res) => {
    let {email, password} = req.body;

    let user = await User.findOne({ email });
    if(!user) return res.send("User Not Found, Please Register");

    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.send("Wrong password Entered");

    req.session.userId = user._id;

    res.redirect(`/dashboard`);
})

// Protecting dashboard from unAuthorized access -->

function isLoggedIn(req, res, next) {
    if(!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}

// Logout setup -->

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    })
});

//  this is the wallet and its balance section 
app.get("/wallet/balance", isLoggedIn, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    
    let transaction_history = await Transaction.find({
        $or: [
            {sender: req.session.userId},
            {receiver: req.session.userId}
        ]
    })
        .populate("sender", "name")
        .populate("receiver", "name")
        .sort({date : -1});
    res.render("balance.ejs", { userData , transaction_history});
})

app.get("/wallet/transfer", isLoggedIn, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    let users = await User.find({_id: {$ne: req.session.userId} });
    res.render("transfer.ejs", { userData, users });
})

app.post("/wallet/transfer", isLoggedIn, async (req, res) => {
    let amount  = parseFloat(req.body.amount);
    let receiverId = req.body.receiverId;

    if(isNaN(amount)) {
        return res.send("Enter amount please");
    }

    let sender = await User.findById(req.session.userId);
    let receiver = await User.findById(receiverId);

    
    // Validation 
    if(!sender) return res.send("User not found");
    if(!receiver) return res.send("Receiver not found");
    if(amount <= 0) return res.send("Enter Valid Amount");

    if(sender._id.equals(receiver._id)) {
        return res.send("Cannot transfer to yourself");
    }

    if(sender.balance < amount) return res.send("Insufficient amount ");

    // Deduct balance 
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    await Transaction.create({
        sender: sender._id,
        receiver: receiver._id,
        amount: amount,
        type: "transfer",
        date: new Date(),
    });
    res.redirect(`/dashboard`);
})

app.get("/wallet/addCredit", isLoggedIn, async (req, res) => {
    let userData = await User.findById(req.session.userId);

    let credit_history = await Credit.find({
        receiver: req.session.userId
    })
    .populate("receiver", "name")
    .sort({date : -1});

    res.render("addCredit.ejs", { userData, credit_history});
})

app.post("/wallet/addCredit", isLoggedIn, async (req, res) => {
    let credit_amount = parseFloat(req.body.credit);

    if(isNaN(credit_amount)) {
        return res.send("Enter amount please");
    }

    let receiver = await User.findById(req.session.userId);

    // Validation
    if(!receiver) return res.send("User not Found");

    if(credit_amount <= 0) return res.send("Enter Valid amount first");

    if(receiver.credits < credit_amount) {
        return res.send("Not enough credits");
    }
    receiver.balance += credit_amount;
    receiver.credits -= credit_amount;
    await receiver.save();

    await Credit.create({
        receiver: receiver._id,
        creditedAmount: credit_amount,
        type: "credit",
        date: new Date(),
    });
    
    res.redirect(`/dashboard`);  
})

app.get("/wallet/transaction", isLoggedIn, async (req, res) => {
    let userData = await User.findById(req.session.userId);
    res.render("transaction.ejs", { userData });
})

app.post("/wallet/transaction", isLoggedIn, async (req, res) => {
    let spent = parseFloat(req.body.spent);

    if(isNaN(spent)) return res.send("Enter amount please");

    let user = await User.findById(req.session.userId);

    if(!user) return res.send("User not found");

    if(spent <= 0) return res.send("Enter valid amount please !");

    if(user.balance < spent) return res.send("Insufficient money");

    user.balance -= spent;

    await Transaction.create({
        sender: user._id,
        receiver: user._id,
        amount: spent,
        type: "expense",
        date: new Date(),
    });

    await user.save();

    res.redirect(`/dashboard`);
}) 