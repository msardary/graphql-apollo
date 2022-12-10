const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    approved: { type: Boolean, default: false },
    article: {
      type: Schema.Types.ObjectId,
      ref: "Article",
      default: undefined,
    },
    comment: { type: String, required: true },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

module.exports = mongoose.model("Comment", commentSchema);
