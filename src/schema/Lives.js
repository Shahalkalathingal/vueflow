const mongoose = require("mongoose");

const LiveSchema = new mongoose.Schema(
  {
    live: {
      type: String,
      required: true,
      unique:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
        unique:true

    }

  },
  { collection: "lives", timestamps: true, },
);

const model = mongoose.model("live", LiveSchema);

module.exports = model;