const express = require("express");

const coursesController = require("../controllers/courses-controller.js");
const {validationSchema} = require("../middlewares/validationSchema.js");
const verifyToken = require("../middlewares/verifyToken.js");
const allowedTo = require("../middlewares/allowedTo.js");

const userRoles = require("../utils/userRoles.js");

const router = express.Router();

// CRUD => (Create / Read / Update / Delete)

router
  .route("/")
  //Get all courses
  .get(coursesController.getAllCourses)
  //Add course to courses
  .post(verifyToken, validationSchema(), coursesController.addCourse);

router
  .route("/:id")
  //Get course by id
  .get(coursesController.getCourseById)
  //Update course by id
  .patch(coursesController.updateCourse)
  //Delete course by id
  .delete(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.MANAGER),
    coursesController.deleteCourse
  );

module.exports = router;
