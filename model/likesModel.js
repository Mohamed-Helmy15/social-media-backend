const mongoose = require("mongoose");

const likesSchema = mongoose.Schema(
  {
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

likesSchema.index({ post: 1, user: 1 }, { unique: true });

likesSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "firstName lastName picturePath" });
  next();
});

const Like = mongoose.model("Like", likesSchema);
module.exports = Like;
