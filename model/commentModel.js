const mongoose = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, "you must write something in a comment"],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      required: [true, "required field"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "required field"],
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

commentSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "firstName lastName picturePath" });
  next();
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
