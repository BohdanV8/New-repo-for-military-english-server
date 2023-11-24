const express = require("express");
const router = express.Router();
const multer = require("multer");
const Course = require("../models/course");
const jwt = require("jsonwebtoken");
const path = require("path");
const User = require("../models/user");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/courses"); // Шлях до папки для збереження файлів на сервері
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/create", upload.single("file"), async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "viva");
    const userId = decodedToken.userId;
    const { title, description, category } = req.body;
    const file = req.file; // Об'єкт файлу, який надсилається через форму

    const url_of_photo = file ? file.filename : "";
    // Створення нового курсу в базі даних
    const newCourse = new Course({
      id_of_courseModerator: userId,
      title,
      description,
      id_of_category: category,
      url_of_photo,
    });

    const savedCourse = await newCourse.save();

    res.status(201).json({ success: true, course: savedCourse });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/allCoursesOfModerator", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "viva");
    const userId = decodedToken.userId;
    const courses = await Course.find({ id_of_courseModerator: userId }).sort({
      date: -1,
    });
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/wantedModeratorCourses", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "viva");
    const userId = decodedToken.userId;
    const { category, searchString } = req.query;
    if (category && !searchString) {
      var courses = await Course.find({
        id_of_courseModerator: userId,
        id_of_category: category,
      }).sort({
        date: -1,
      });
    } else if (searchString && !category) {
      var courses = await Course.find({
        id_of_courseModerator: userId,
        title: searchString,
      }).sort({
        date: -1,
      });
    } else if (category && searchString) {
      var courses = await Course.find({
        id_of_courseModerator: userId,
        title: searchString,
        id_of_category: category,
      }).sort({
        date: -1,
      });
    } else {
      var courses = await Course.find({ id_of_courseModerator: userId }).sort({
        date: -1,
      });
    }
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/allSortedCourses", async (req, res) => {
  try {
    const { category, searchString } = req.query;
    if (searchString) {
      try {
        var courseModerator = await User.findOne({ username: searchString });
        var courseModeratorId = courseModerator._id;
      } catch (e) {
        var courseModeratorId = "";
      }
    }
    if (category && !searchString) {
      var courses = await Course.find({
        id_of_category: category,
      }).sort({
        date: -1,
      });
    } else if (searchString && !category) {
      var courses = await Course.find({
        id_of_courseModerator: courseModeratorId,
      }).sort({
        date: -1,
      });
    } else if (category && searchString) {
      var courses = await Course.find({
        id_of_courseModerator: courseModeratorId,
        id_of_category: category,
      }).sort({
        date: -1,
      });
    } else {
      var courses = await Course.find().sort({
        date: -1,
      });
    }
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/sortedUnsubscribedCourses", async (req, res) => {
  try {
    const { category, searchString } = req.query;
    if (searchString) {
      try {
        var courseModerator = await User.findOne({ username: searchString });
        var courseModeratorId = courseModerator._id;
      } catch (e) {
        var courseModeratorId = "";
      }
    }
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "viva");
    const userId = decodedToken.userId;

    const user = await User.findById(userId).populate("subscribedCourses");
    const subscribedCourseIds = user.subscribedCourses.map(
      (course) => course._id
    );

    if (category && !searchString) {
      var unsubscribedSortedCourses = await Course.find({
        _id: { $nin: subscribedCourseIds },
        id_of_category: category,
      }).sort({
        date: -1,
      });
    } else if (searchString && !category) {
      var unsubscribedSortedCourses = await Course.find({
        _id: { $nin: subscribedCourseIds },
        id_of_courseModerator: courseModeratorId,
      }).sort({
        date: -1,
      });
    } else if (searchString && category) {
      var unsubscribedSortedCourses = await Course.find({
        _id: { $nin: subscribedCourseIds },
        id_of_courseModerator: courseModeratorId,
        id_of_category: category,
      }).sort({
        date: -1,
      });
    } else {
      var unsubscribedSortedCourses = await Course.find({
        _id: { $nin: subscribedCourseIds },
      }).sort({
        date: -1,
      });
    }

    res.json(unsubscribedSortedCourses);
  } catch (error) {
    console.error("Error fetching sorted unsubscribed courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/unsubscribedCourses", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "viva");
    const userId = decodedToken.userId;

    // Знаходження підписаних курсів користувача
    const user = await User.findById(userId).populate("subscribedCourses");
    const subscribedCourseIds = user.subscribedCourses.map(
      (course) => course._id
    );

    // Знаходження курсів, на які користувач не підписаний
    const unsubscribedCourses = await Course.find({
      _id: { $nin: subscribedCourseIds },
    }).sort({
      date: -1,
    });

    res.json(unsubscribedCourses);
  } catch (error) {
    console.error("Error fetching unsubscribed courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/subscribedCourses", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "viva");
    const userId = decodedToken.userId;

    const user = await User.findById(userId).populate("subscribedCourses");
    const subscribedCourses = user.subscribedCourses;

    res.json(subscribedCourses);
  } catch (error) {
    console.error("Error fetching subscribed courses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/allCourses", async (req, res) => {
  const courses = await Course.find().sort({ date: -1 });
  res.json(courses);
});

router.post("/subscribe/:courseId", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "viva");
  const userId = decodedToken.userId;
  const courseId = req.params.courseId;

  try {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { subscribedCourses: courseId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to the course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/unsubscribe/:courseId", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "viva");
  const userId = decodedToken.userId;
  const courseId = req.params.courseId;

  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { subscribedCourses: courseId },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to the course:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/updateCourse/:id", upload.single("file"), async (req, res) => {
  const courseId = req.params.id;
  const file = req.file;
  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Курс не знайдений" });
    }
    if (req.body.title) {
      course.title = req.body.title;
    }
    if (file) {
      course.url_of_photo = file.filename;
    }
    if (req.body.id_of_category) {
      course.id_of_category = req.body.id_of_category;
    }
    if (req.body.description) {
      course.description = req.body.description;
    }

    await course.save();

    res.json({ success: true, message: "Інформація про курс оновлена" });
  } catch (error) {
    console.error("Помилка оновлення курсу:", error);
    res.status(500).json({ error: "Внутрішня помилка сервера" });
  }
});

router.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../uploads/courses", filename);
  res.sendFile(filePath);
});

module.exports = router;
