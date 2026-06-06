const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  gender: {
    type: String,
  },
  dateofbirth: {
    type: String,
  },
  about: {
    type: String,
    trim: true,
  },
  contactNumber: {
    type: Number,
    trim: true,
  },
});

// ✅ use profileSchema here
module.exports =
  mongoose.models.profile || mongoose.model("profile", profileSchema);
