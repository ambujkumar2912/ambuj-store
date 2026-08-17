const express = require("express");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});
app.post("/create-order", async function(req, res) {

    try {

        let amount = req.body.amount;

        let order = await razorpay.orders.create({
            amount: amount,
            currency: "INR",
            receipt: "receipt_" + Date.now()
        });

        res.json(order);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Order creation failed"
        });

    }

});
app.get("/", function(req, res) {
    res.send("Payment server is working");
});

app.listen(3000, function() {
    console.log("Server running on port 3000");
});