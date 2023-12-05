const express = require("express");
const router = express.Router();
const multer = require("multer");
const Material = require("../models/material");
const path = require("path");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/materials");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/create", upload.single("file"), async (req, res) => {
  try {
    const { id_of_topic, title, description } = req.body;
    const file = req.file;

    const url_of_file = file ? file.filename : "";

    const newMaterial = new Material({
      id_of_topic,
      title,
      description,
      url_of_file,
    });

    const savedMaterial = await newMaterial.save();

    res.status(201).json({ success: true, material: savedMaterial });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/getMaterialFile/:id", async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ error: "Material not found" });
    }
    const filePath = path.join(
      __dirname,
      "../uploads/materials",
      material.url_of_file
    );

    res.sendFile(filePath);
  } catch (error) {
    console.error("Error fetching material:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/updateMaterial/:id", upload.single("file"), async (req, res) => {
  const materialId = req.params.id;
  const file = req.file;
  try {
    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({ error: "material не знайдений" });
    }
    if (req.body.title) {
      material.title = req.body.title;
    }
    if (file) {
      const filePath = path.join(
        __dirname,
        "../uploads/materials",
        material.url_of_file
      );
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Помилка видалення файлу:", err);
        }
      });
      material.url_of_file = file.filename;
    }
    if (req.body.description) {
      material.description = req.body.description;
    }

    await material.save();

    res.json({
      success: true,
      message: "Інформація про навчальний матеріал оновлена",
    });
  } catch (error) {
    console.error("Помилка оновлення навчального матеріалу:", error);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
});

router.get("/byTopic/:id", async (req, res) => {
  try {
    const materials = await Material.find({ id_of_topic: req.params.id });

    if (!materials) {
      return res.status(404).json({ error: "Materials not found" });
    }
    res.json(materials);
  } catch (error) {
    console.error("Error fetching material:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/delete/:materialId", async (req, res) => {
  const materialId = req.params.materialId;

  try {
    const material = await Material.findById(materialId);
    const filePath = path.join(
      __dirname,
      "../uploads/materials",
      material.url_of_file
    );
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Помилка видалення файлу:", err);
      }
    });
    await material.deleteOne();
    res.json({
      success: true,
      message: "Навчальний матеріал успішно видалено",
    });
  } catch (error) {
    console.error("Помилка видалення матеріалу:", error);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
});

module.exports = router;
