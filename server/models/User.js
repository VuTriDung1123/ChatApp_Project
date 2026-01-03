const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, min: 3, max: 20, unique: true },
  email: { type: String, required: true, max: 50, unique: true },
  password: { type: String, required: true, min: 6 },
  avatarImage: { type: String, default: "" },
  isAvatarImageSet: { type: Boolean, default: false },
  
  // 👇 THÊM 2 DÒNG NÀY 👇
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);