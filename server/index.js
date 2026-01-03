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