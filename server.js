// server.js
const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 5000;

// ---------- CORS: Allow all origins ----------
app.use(cors({ origin: true }));
app.use(express.json());

// ---------- Razorpay Config ----------
const RAZORPAY_KEY_ID = "rzp_test_RbihyfCiwLJ5Q3";
const RAZORPAY_KEY_SECRET = "Vt3mR827KwL3wf38ycLRWwK6";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// ---------- Helper: Short Receipt ----------
const generateReceipt = () => {
  const shortId = uuidv4().split("-")[0]; // 8 chars
  return `rec_${shortId}`; // → rec_a1b2c3d4 (12 chars)
};

// ---------- POST /create-order ----------
app.post("/create-order", async (req, res) => {
  console.log("Incoming:", req.body);

  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency,
      receipt: generateReceipt(),
      payment_capture: 1,
    });

    // Return order + key_id
    res.json({
      key_id: RAZORPAY_KEY_ID, // ← Now from BE
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({
      error: "Failed to create order",
      details: error?.error?.description || error.message,
    });
  }
});

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.send(`
    <h1>Razorpay Backend (Port ${PORT})</h1>
    <p><strong>POST /create-order</strong> → { "amount": 300 }</p>
    <p>Returns: <code>key_id</code>, <code>order_id</code>, etc.</p>
    <p>CORS: All origins allowed</p>
  `);
});

// ---------- Start Server ----------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`CORS: ALL origins allowed`);
  console.log(`Key ID: ${RAZORPAY_KEY_ID}`);
});
