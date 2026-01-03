const router = require("express").Router();
// Đảm bảo tên file messageController.js viết đúng chính tả
const messageController = require("../controllers/messageController");

// 👇 Dòng này để debug: In ra xem nó lấy được gì từ controller
console.log("Nội dung import từ Controller:", messageController);

// Nếu import thành công thì mới gán hàm vào route
if (messageController.addMessage && messageController.getMessages) {
    router.post("/addmsg/", messageController.addMessage);
    router.post("/getmsg/", messageController.getMessages);
} else {
    console.error("❌ LỖI: Không tìm thấy hàm addMessage hoặc getMessages!");
}

module.exports = router;