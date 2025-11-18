const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to your MongoDB (update URI if needed)
mongoose.connect('mongodb://localhost:27017/userauth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user/email exists
    if(await User.findOne({ $or: [{username}, {email}] })){
      return res.status(400).json({ message: 'Username or Email already exists' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Save new user
    await new User({ username, email, passwordHash }).save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error in registration", error: err.message });
  }
});

// Signin route
app.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if(!user){
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Validate password
    const validPass = await bcrypt.compare(password, user.passwordHash);
    if(!validPass){
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // *** IMPORTANT FIX ***
    res.json({
      message: "Sign in successful",
      username: user.username,
      userId: user._id
    });

  } catch (err) {
    res.status(500).json({ message: "Error during sign in", error: err.message });
  }
});
