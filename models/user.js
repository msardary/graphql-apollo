const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    address: { type: String, required: true },
    admin: { type: Boolean, default: 0 },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  let user = this;

  if (!user.isModified("password")) return next();

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) return next(err);

    user.password = hash;
    next();
  });
});

userSchema.plugin(mongoosePaginate);

userSchema.virtual("articles", {
  ref: "Article",
  localField: "_id",
  foreignField: "user",
});

module.exports = mongoose.model("User", userSchema);
