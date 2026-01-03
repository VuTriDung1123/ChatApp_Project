const User = require("../models/User");
const bcrypt = require("bcrypt");

// Hàm Đăng Ký (Cũ)
module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username đã được sử dụng", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email đã được sử dụng", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

// Hàm Đăng Nhập (Mới thêm)
module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // 1. Tìm user theo tên
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Sai tài khoản hoặc mật khẩu", status: false });

    // 2. Kiểm tra mật khẩu (So sánh password nhập vào với password mã hóa trong DB)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Sai tài khoản hoặc mật khẩu", status: false });

    // 3. Xóa mật khẩu và trả về user
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    // Lấy tất cả user trong DB, TRỪ user đang gọi API này (dùng $ne: Not Equal)
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (ex) {
    next(ex);
  }
};