const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // const errors = Object.keys(err.erros).map((el) => el.message);

  const message = `Invalid input data`;
  return new AppError(message, 400);
};

const handleInvalidToken = () => {
  return new AppError("unauthorized please log in again", 401);
};
const handleExpiredToken = () => {
  return new AppError("Token expired please log in again", 401);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
    });
  } else {
    res.status(err.statusCode).render("error", {
      title: "something went wrong",
      msg: err.message,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // 2) Send generic message
      res.status(500).json({
        status: "error",
        message: "Something went very wrong!",
      });
    }
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render("error", {
        title: "something went wrong",
        msg: err.message,
      });
    } else {
      // 2) Send generic message
      res.status(err.statusCode).render("error", {
        title: "something went wrong",
        msg: "please try again later",
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  sendErrorDev(err, req, res);
  if (process.env.NODE_ENV === "development") {
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (error.path === "_id") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error._message) {
      if (error._message.includes("validation failed")) {
        error = handleValidationErrorDB(error);
      }
    }
    if (error.name === "JsonWebTokenError") {
      error = handleInvalidToken(error);
    }
    if (error.name === "TokenExpiredError") {
      error = handleExpiredToken();
    }

    sendErrorProd(error, req, res);
  }
};
