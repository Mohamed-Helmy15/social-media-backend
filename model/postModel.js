const mongoose = require("mongoose");

const postSchema = mongoose.Schema(
  {
    description: {
      type: String,
      default: "",
    },
    photo: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "the user is required"],
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Like",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

postSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "firstName lastName picturePath" });
  next();
});
postSchema.pre(/^find/, function (next) {
  this.populate({ path: "comments" });
  next();
});
postSchema.pre(/^find/, function (next) {
  this.populate({ path: "likes" });
  next();
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
