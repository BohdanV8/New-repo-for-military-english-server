const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./routes/categories");
const coursesRoutes = require("./routes/courses");
const topicsRoutes = require("./routes/topics");
const materialsRoutes = require("./routes/materials");
const userRoutes = require("./routes/user");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// const uri = process.env.ATLAS_URI;
mongoose.connect(
  "mongodb+srv://thorykbv:qqRkdDL13ZH5JWcb@cluster0.euoihmw.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Помилка підключення до MongoDB:"));
db.once("open", async () => {
  console.log("Підключено до MongoDB!");
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/topics", topicsRoutes);
app.use("/api/materials", materialsRoutes);
app.use("/api/user", userRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
