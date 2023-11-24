const express = require("express");
const router = express.Router();
const Category = require("../models/category");
router.get("/all", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/byId/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const { title } = req.body;
    const category = new Category({
      title,
    });
    await category.save();
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Error create category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete('/delete/:categoryId', async (req, res) => {
  const categoryId = req.params.categoryId;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ error: 'Категорію не знайдено' });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Категорію успішно видалено' });
  } catch (error) {
    console.error('Помилка видалення категорії:', error);
    res.status(500).json({ error: 'Внутрішня помилка сервера' });
  }
});

module.exports = router;
