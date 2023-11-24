const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
router.post("/register", async (req, res) => {
  try {
    const { username, password, name, surname, middlename } = req.body;

    // Перевірка, чи користувач з таким ім'ям користувача вже існує
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Користувач з таким ім'ям вже існує" });
    }

    // Хешування пароля перед збереженням в базу даних
    const hashedPassword = await bcrypt.hash(password, 10);

    // Створення нового користувача
    const newUser = new User({
      username,
      password: hashedPassword,
      name,
      surname,
      middlename,
    });
    await newUser.save();

    // Генерація JWT токена
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

    // Пошук користувача в базі даних
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Користувача не знайдено" });
    }

    // Порівняння хешованого пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Невірний пароль" });
    }

    // Генерація JWT токена
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
