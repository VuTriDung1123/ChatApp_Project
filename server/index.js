const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messages");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoutes);

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB thành công"))
  .catch((err) => console.log("❌ Lỗi kết nối DB:", err));

// Chạy Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Có người vừa kết nối: " + socket.id);
  
  socket.on("disconnect", () => {
    console.log("👋 Người dùng đã ngắt kết nối");
  });
});

// Tạo một Map để lưu user nào đang dùng socket nào
global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  // 1. Khi user đăng nhập, lưu socket id của họ lại
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  // 2. Khi user gửi tin nhắn
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to); // Tìm socket của người nhận
    if (sendUserSocket) {
      // Nếu người nhận đang online, bắn tin nhắn sang cho họ ngay
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});