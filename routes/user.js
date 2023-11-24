const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/byId/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const users = await User.find();

    res.json(users);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/changeUserRole", async (req, res) => {
  const { username, role } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "Користувача не знайдено" });
    }

    user.role = role;
    await user.save();

    res.json({ success: true, message: "Роль користувача успішно змінена" });
  } catch (error) {
    console.error("Помилка зміни ролі користувача:", error);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
});

module.exports = router;
