const mongoose = require("mongoose");

const MessageSchema = mongoose.Schema(
  {
    message: { text: { type: String, required: true } },
    users: Array, // Chứa ID của 2 người (người gửi, người nhận)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // Tự động lưu thời gian gửi
  }
);

module.exports = mongoose.model("Messages", MessageSchema);