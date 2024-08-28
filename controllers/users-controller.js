const bcrypt = require("bcryptjs");

const User = require("../models/user.model.js");
const asyncWrapper = require("../middlewares/asyncWrapper");

const httpStatus = require("../utils/httpStatus.js");
const appError = require("../utils/appError");
const generateJWT = require("../utils/generateJWT.js");

const getAllUsers = asyncWrapper(async (req, res, next) => {
  const query = req.query;
  const limit = parseInt(query.limit) || 10;
  const page = parseInt(query.page) || 1;
  const skip = (page - 1) * limit;

  const Users = await User.find({}, {__v: false, password: false})
    .limit(limit)
    .skip(skip);
  res.json({status: httpStatus.SUCCESS, data: {Users}});
});

const register = asyncWrapper(async (req, res, next) => {
  const {firstName, lastName, email, password, role} = req.body;

  // Check if the user already exists
  const oldUser = await User.findOne({email: email});
  if (oldUser) {
    const error = appError.create("User already exists", 400, httpStatus.FAIL);
    return next(error);
  }

  // Hash the password
  const HashedPassword = await bcrypt.hash(password, 10);

  // function getAvatarLocal(file) {
  //   if (process.env.LOCAL_HOST && file && file.filename) {
  //     return `${process.env.LOCAL_HOST}/uploads/${file.filename}`;
  //   }

  //   return `${process.env.LOCAL_HOST}/uploads/profile.jpg`;
  // }

  function getAvatarUrl(file) {
    if (file && file.filename) {
      return `uploads/${file.filename}`;
    }

    return `uploads/profile.jpg`;
  }

  // Create a new user
  const newUser = new User({
    firstName,
    lastName,
    email,
    password: HashedPassword,
    role,
    avatar: getAvatarUrl(req.file), // Add the avatar to the user in Localhost
  });

  // Generate a token
  const token = await generateJWT({
    id: newUser._id,
    email: newUser.email,
    role: newUser.role,
  });

  newUser.token = token;

  // Save the user in the database
  await newUser.save();

  res.status(201).json({status: httpStatus.SUCCESS, data: {newUser}});
});

const login = asyncWrapper(async (req, res, next) => {
  const {email, password} = req.body;

  // Check if the email and password are provided
  if (!email && !password) {
    const error = appError.create(
      "Email and password are required",
      400,
      httpStatus.FAIL
    );
    return next(error);
  }

  // Find the user by email
  const user = await User.findOne({email: email});

  // Check if the user exists
  if (!user) {
    const error = appError.create("User not found", 404, httpStatus.FAIL);
    return next(error);
  }

  // Check if the password is correct
  const matchedPassword = await bcrypt.compare(password, user.password);

  // If the user and password are correct, return the user
  if (user && matchedPassword) {
    const token = await generateJWT({
      id: user._id,
      email: user.email,
      role: user.role,
    });
    res.json({status: httpStatus.SUCCESS, data: {token}});
  } else {
    const error = appError.create("Something wrong", 500, httpStatus.ERROR);
    return next(error);
  }
});

module.exports = {
  getAllUsers,
  register,
  login,
};
