const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const httpStatus = require("./utils/httpStatus.js");

const coursesRouter = require("./routers/courses-route.js");
const usersRouter = require("./routers/users-route.js");

require("dotenv").config();

const app = express();

const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
  console.log("Connected to the database successfully!");
});

//use middleware for serving static files (images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//use middleware for CORS
app.use(cors());

//use middleware for BodyParser
app.use(express.json());

// Routes
app.use("/api/courses", coursesRouter);
app.use("/api/users", usersRouter);

// Not found handler
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: httpStatus.ERROR,
    message: "The requested URL was not found on this server",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    status: err.statusText || httpStatus.ERROR,
    message: err.message,
    code: err.statusCode || 500,
    data: null,
  });
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Example app listening on port ${process.env.PORT}!`);
});
