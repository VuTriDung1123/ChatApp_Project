const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const socketIo = require("socket.io");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messages");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "*", // Cho phép tất cả (Sau này có link Vercel thì thay link Vercel vào đây cho bảo mật)
}));
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
// Cấu hình Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*", // Cho phép tất cả
  },
});

io.on("connection", (socket) => {
  console.log("⚡ Có người vừa kết nối: " + socket.id);
  
  socket.on("disconnect", () => {
    console.log("👋 Người dùng đã ngắt kết nối");
  });
});

// Tạo một Map để lưu user nào đang dùng socket nào
const User = require("./models/User"); // Nhớ thêm dòng này ở đầu file để gọi DB

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;

  // 1. Khi User Online (Đăng nhập vào)
  socket.on("add-user", async (userId) => {
    onlineUsers.set(userId, socket.id);
    // Cập nhật DB là đang Online
    await User.findByIdAndUpdate(userId, { isOnline: true });
    // Báo cho mọi người biết user này vừa Online
    socket.broadcast.emit("user-status-change", { userId, isOnline: true });
  });

  // 2. Gửi tin nhắn (Giữ nguyên)
  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });

  // 3. Khi User ngắt kết nối (Tắt tab hoặc Logout)
  socket.on("disconnect", async () => {
    // Tìm xem user nào vừa ngắt kết nối dựa trên socket.id
    let disconnectedUserId = null;
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        break;
      }
    }

    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      // Cập nhật DB là Offline và lưu giờ LastSeen
      await User.findByIdAndUpdate(disconnectedUserId, { 
        isOnline: false, 
        lastSeen: new Date() 
      });
      // Báo cho mọi người biết
      socket.broadcast.emit("user-status-change", { 
        userId: disconnectedUserId, 
        isOnline: false,
        lastSeen: new Date()
      });
    }
  });
});