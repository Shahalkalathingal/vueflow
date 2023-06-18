const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      default:
        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
    },
  },
  { collection: "users", timestamps: true, },
);

const model = mongoose.model("user", UserSchema);

module.exports = model;