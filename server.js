// api/server.js
const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const shortid = require("shortid"); // ← CommonJS safe

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

// Short receipt: max 40 chars
const generateReceipt = () => `rec_${shortid.generate().substring(0, 8)}`;

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
    res.status(500).json({
      error: "Failed to create order",
      details: error?.error?.description || error.message,
    });
  }
});

// Health
app.get("/", (req, res) => {
  res.json({ status: "Razorpay API Live", endpoint: "/create-order" });
});

// module.exports = app;

app.listen(5000, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${5000}`);
  console.log(`CORS: ALL origins allowed`);
  console.log(`Key ID: ${RAZORPAY_KEY_ID}`);
});
