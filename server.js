// api/server.js
const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const { v4: uuidv4 } = require("uuid");

const app = express();

// CORS
app.use(cors({ origin: true }));
app.use(express.json());

// Razorpay
const RAZORPAY_KEY_ID = "rzp_test_RbihyfCiwLJ5Q3";
const RAZORPAY_KEY_SECRET = "Vt3mR827KwL3wf38ycLRWwK6";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Short receipt
const generateReceipt = () => `rec_${uuidv4().split("-")[0]}`;

// POST /api/create-order
app.post("/create-order", async (req, res) => {
  console.log("Request:", req.body);

  try {
    const { amount, currency = "INR" } = req.body;
    if (!amount || amount < 1) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: generateReceipt(),
      payment_capture: 1,
    });

    res.json({
      key_id: RAZORPAY_KEY_ID,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Health
app.get("/", (req, res) => {
  res.send("Razorpay API Running");
});

module.exports = app;
