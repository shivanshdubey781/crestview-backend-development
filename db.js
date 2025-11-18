// db.js - MongoDB Connection + All DB Functions
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
require("dotenv").config();

let client;
let db;

async function connectDB() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI is missing in .env file");
    }

    client = new MongoClient(process.env.MONGO_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
      },
    });

    await client.connect();
    db = client.db("AstroTradingPortal");

    console.log("✅ MongoDB Connected Successfully (Cloud Atlas)");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    throw err;
  }
}

/************** USERS **************/
async function createUser(userData) {
  const result = await db.collection("users").insertOne(userData);
  return { userId: result.insertedId };
}

async function findUserByEmail(email) {
  return await db.collection("users").findOne({ email });
}

/************** TRADING ACCOUNTS **************/
async function addTradingAccount(userId, data) {
  if (!userId) throw new Error("User ID is required");

  data.userId = userId;
  data.createdAt = new Date();

  const result = await db.collection("tradingAccounts").insertOne(data);
  return { success: true, id: result.insertedId };
}

async function getAllTradingAccounts() {
  return await db.collection("tradingAccounts").find().toArray();
}

async function getTradingAccount(id) {
  return await db.collection("tradingAccounts").findOne({ _id: new ObjectId(id) });
}

async function updateTradingAccountStatus(id, status) {
  return await db.collection("tradingAccounts").updateOne(
    { _id: new ObjectId(id) },
    { $set: { tradeEnabled: status, updatedAt: new Date() } }
  );
}

async function deleteTradingAccount(id) {
  return await db.collection("tradingAccounts").deleteOne({ _id: new ObjectId(id) });
}

/************** MASTER CONTROL **************/
async function getMasterControl() {
  const data = await db.collection("masterControl").findOne({});
  return data || { enabled: false };
}

async function setMasterControl(enabled) {
  return await db.collection("masterControl").updateOne(
    {},
    { $set: { enabled } },
    { upsert: true }
  );
}

/************** TRADE LOGS **************/
async function addTradeLog(userId, log) {
  log.userId = userId;
  log.createdAt = new Date();
  return await db.collection("tradeLogs").insertOne(log);
}

async function getAllTradeLogs() {
  return await db.collection("tradeLogs").find().sort({ createdAt: -1 }).toArray();
}

module.exports = {
  connectDB,
  createUser,
  findUserByEmail,
  addTradingAccount,
  getAllTradingAccounts,
  getTradingAccount,
  updateTradingAccountStatus,
  deleteTradingAccount,
  getMasterControl,
  setMasterControl,
  addTradeLog,
  getAllTradeLogs
};
