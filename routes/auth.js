const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
router.post("/register", async (req, res) => {
  try {
    const { username, password, name, surname, middlename } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Користувач з таким ім'ям вже існує" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      surname,
      middlename,
    });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, userRole: newUser.role },
      "viva",
      {
        expiresIn: "5h",
      }
    );
    res.json({ token, userId: newUser._id, userRole: newUser.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Користувача не знайдено" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Невірний пароль" });
    }

    const token = jwt.sign({ userId: user._id, userRole: user.role }, "viva", {
      expiresIn: "5h",
    });
    res.json({ token, userId: user._id, userRole: user.role, name: user.name });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Помилка сервера" });
  }
});

module.exports = router;
