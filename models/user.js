const mongoose = require("mongoose");
const userRoles = ["user", "courseModerator", "siteManager"];
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, required: false },
    surname: { type: String, required: false },
    middlename: { type: String, required: false },
    role: { type: String, enum: userRoles, default: "user" },
    subscribedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }]
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
