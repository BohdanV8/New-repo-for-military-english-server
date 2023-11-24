const mongoose = require("mongoose");
const topicSchema = new mongoose.Schema({
  id_of_course: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  url_of_photo: { type: String, required: false },
  date: { type: Date, default: new Date() },
});

const Topic = mongoose.model("Topic", topicSchema);

module.exports = Topic;
