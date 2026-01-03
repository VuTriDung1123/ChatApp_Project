const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, min: 3, max: 20, unique: true },
  email: { type: String, required: true, max: 50, unique: true },
  password: { type: String, required: true, min: 6 },
  avatarImage: { type: String, default: "" }, // Link ảnh đại diện
  isAvatarImageSet: { type: Boolean, default: false }, // Đã đặt ảnh chưa
}, { timestamps: true }); // Tự động lưu thời gian tạo/sửa

module.exports = mongoose.model("User", userSchema);