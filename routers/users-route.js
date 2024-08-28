const express = require("express");
const multer = require("multer");

const usersController = require("../controllers/users-controller.js");
const verifyToken = require("../middlewares/verifyToken.js");
const appError = require("../utils/appError.js");

// Router
const router = express.Router();

// Multer configuration for disk storage
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const fileName = `user-${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    return cb(null, true);
  } else {
    return cb(appError.create("File must be an image", 400), false);
  }
};

// Multer middleware for uploads
const uploads = multer({
  storage: diskStorage,
  fileFilter,
});

router
  .route("/")
  //Get all Users
  .get(verifyToken, usersController.getAllUsers);

router
  .route("/register")
  //Register a new User + Upload an avatar
  .post(uploads.single("avatar"), usersController.register);

router
  .route("/login")
  //Login a User
  .post(usersController.login);

module.exports = router;
