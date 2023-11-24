const mongoose = require("mongoose");
const materialSchema = new mongoose.Schema({
  id_of_topic: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: false },
  url_of_file: { type: String, required: false },
  date: { type: Date, default: new Date() },
});

const Material = mongoose.model("Material", materialSchema);

module.exports = Material;
