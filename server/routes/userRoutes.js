const router = require("express").Router();

// 👇 SỬA DÒNG NÀY (Thêm getAllUsers vào trong dấu ngoặc)
const { register, login, getAllUsers } = require("../controllers/userController"); 

router.post("/register", register);
router.post("/login", login);
router.get("/allusers/:id", getAllUsers); // Dòng này lỗi vì nãy chưa import ở trên

module.exports = router;