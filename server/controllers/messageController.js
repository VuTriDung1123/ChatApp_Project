const Messages = require("../models/messageModel");

// 1. Hàm thêm tin nhắn
const addMessage = async (req, res, next) => {
  try {
    const { from, to, message } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Gửi tin nhắn thành công." });
    else return res.json({ msg: "Gửi tin nhắn thất bại." });
  } catch (ex) {
    next(ex);
  }
};

// 2. Hàm lấy tin nhắn (Kèm thời gian)
const getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        time: msg.createdAt, // Đã thêm lấy giờ
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

// 3. Xuất ra để dùng
module.exports = { addMessage, getMessages };