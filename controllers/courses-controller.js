const {validationResult} = require("express-validator");

const Course = require("../models/courses.model");

const asyncWrapper = require("../middlewares/asyncWrapper.js");

const httpStatus = require("../utils/httpStatus.js");
const appError = require("../utils/appError.js");

const getAllCourses = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;

  const courses = await Course.find({}, {__v: false}).limit(limit).skip(skip);
  res.json({status: httpStatus.SUCCESS, data: {courses}});
});

const getCourseById = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.id, {__v: false});
  if (course) {
    res.json({status: httpStatus.SUCCESS, data: {course}});
  } else {
    const error = appError.create("Course not found", 404, httpStatus.FAIL);
    return next(error);
  }
});

const addCourse = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatus.FAIL);
    return next(error);
  }

  const newCourse = new Course(req.body);

  await newCourse.save();

  res.status(201).json({status: httpStatus.SUCCESS, data: {newCourse}});
});

const updateCourse = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  await Course.findByIdAndUpdate(id, {
    $set: {...req.body},
  });
  const course = await Course.findById(id);
  return res.status(200).json({status: httpStatus.SUCCESS, data: {course}});
});

const deleteCourse = asyncWrapper(async (req, res, next) => {
  const id = req.params.id;
  const deleted = await Course.findByIdAndDelete(id);
  if (!deleted) {
    const error = appError.create("Course not found", 404, httpStatus.FAIL);
    return next(error);
  }
  res.status(200).json({status: httpStatus.SUCCESS, data: null});
});

module.exports = {
  getAllCourses,
  getCourseById,
  addCourse,
  updateCourse,
  deleteCourse,
};
