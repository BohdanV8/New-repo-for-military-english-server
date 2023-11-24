const express = require("express");
const router = express.Router();
const multer = require("multer");
const Material = require("../models/material");
const path = require('path');
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

router.get('/getMaterialFile/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    const filePath = path.join(__dirname, "../uploads/materials", material.url_of_file);

    res.sendFile(filePath)
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/byTopic/:id', async (req, res) => {
  try {
    const materials = await Material.find({id_of_topic: req.params.id});

    if (!materials) {
      return res.status(404).json({ error: 'Materials not found' });
    }
    res.json(materials);
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

module.exports = router;
