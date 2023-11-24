const express = require("express");
const router = express.Router();
const multer = require("multer");
const Topic = require("../models/topic");
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/topics");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/create", upload.single("file"), async (req, res) => {
  try {
    const { id_of_course, title, description } = req.body;
    const file = req.file;

    const url_of_photo = file ? file.filename : "";

    const newTopic = new Topic({
      id_of_course,
      title,
      description,
      url_of_photo,
    });

    const savedTopic = await newTopic.save();

    res.status(201).json({ success: true, topic: savedTopic });
  } catch (error) {
    console.error("Error creating topic:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/allTopicsOfCourse/:id", async (req, res) => {
  try {
    const topics = await Topic.find({ id_of_course: req.params.id }).sort({
      date: -1,
    });
    res.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/sortedTopicsOfCourse/:id", async (req, res) => {
  try {
    const { selectedSort } = req.query;
    if (selectedSort == -1) {
      var topics = await Topic.find({ id_of_course: req.params.id }).sort({
        date: -1,
      });
    } else {
      var topics = await Topic.find({ id_of_course: req.params.id }).sort({
        date: 1,
      });
    }
    res.json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../uploads/topics", filename);
  res.sendFile(filePath);
});

module.exports = router;
