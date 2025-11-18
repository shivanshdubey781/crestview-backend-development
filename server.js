require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(express.json());
app.use(cors());

// INITIALIZE DB
(async () => {
  try {
    await db.connectDB();
    console.log("🚀 Server initialized");
  } catch (err) {
    console.error("❌ Startup Failed:", err);
    process.exit(1);
  }
})();

/**************** AUTH ****************/

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.createUser({ username, email, passwordHash });

    res.status(201).json({
      message: "User registered successfully",
      userId: result.userId,
      success: true
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      message: "Sign in successful",
      username: user.username,
      userId: user._id.toString(),
      success: true
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**************** TRADING ACCOUNTS ****************/

app.post("/trading-accounts", async (req, res) => {
  try {
    const result = await db.addTradingAccount(req.body.userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/trading-accounts", async (req, res) => {
  try {
    res.json(await db.getAllTradingAccounts());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/trading-accounts/:id", async (req, res) => {
  try {
    const data = await db.getTradingAccount(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.patch("/trading-accounts/:id/trade-status", async (req, res) => {
  try {
    const { tradeEnabled } = req.body;

    await db.updateTradingAccountStatus(req.params.id, tradeEnabled);

    res.json({ success: true, tradeEnabled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/trading-accounts/:id", async (req, res) => {
  try {
    await db.deleteTradingAccount(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**************** MASTER CONTROL ****************/

app.get("/master-control", async (req, res) => {
  try {
    res.json(await db.getMasterControl());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/master-control", async (req, res) => {
  try {
    await db.setMasterControl(req.body.enabled);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**************** TRADE LOGS ****************/

app.get("/all-trade-logs", async (req, res) => {
  try {
    res.json(await db.getAllTradeLogs());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**************** START ****************/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} (Render ready)`)
);
