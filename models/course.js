const mongoose = require("mongoose");
const courseSchema = new mongoose.Schema(
  {
    id_of_courseModerator: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: false },
    url_of_photo: { type: String, required: false },
    id_of_category: { type: String, required: true },
    date: {type: Date, default: new Date()}
  }
);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
