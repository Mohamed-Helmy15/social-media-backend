const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "first name is required"],
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: [true, "last name is required"],
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      max: 50,
      unique: [true, "email is unique"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      min: 5,
    },
    confirmPassword: {
      type: String,
      required: [true, "the password field is required"],
      validate: {
        validator: function (el) {
          return this.password === el;
        },
        message: "the password is not the same",
      },
    },
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
    picturePath: {
      type: String,
      default: "",
    },
    friends: {
      type: Array,
      default: [],
    },
    location: String,
    occupation: String,
    viewedProfile: Number,
    impressions: Number,
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) next();

  this.changePasswordAt = Date.now();
  next();
});

userSchema.methods.checkPassword = async function (reqPassword, userPassword) {
  return await bcrypt.compare(reqPassword, userPassword);
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
