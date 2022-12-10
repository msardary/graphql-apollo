const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate");

const articleSchema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

articleSchema.plugin(mongoosePaginate);

articleSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "article",
});

module.exports = mongoose.model("Article", articleSchema);
