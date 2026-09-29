const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/usersdb";

// Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 0 },
  city: { type: String, required: true, trim: true },
});

const User = mongoose.model("User", userSchema);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);


// POST -> add users
app.post("/users", async (req, res) => {
  try {
    const body = Array.isArray(req.body) ? req.body : [req.body];
    const users = await User.insertMany(body);
    res.status(201).json({ message: "Users created successfully", count: users.length, users });
  } catch (err) {
    res.status(400).json({ message: "Failed to create users", error: err.message });
  }
});

// GET -> get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET by ID -> get user by id
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid user id" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PATCH -> update user fields
app.patch("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid user id" });

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true, // return the updated document
      runValidators: true,
    });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(400).json({ message: "Failed to update user", error: err.message });
  }
});

// DELETE -> delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: "Invalid user id" });

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
