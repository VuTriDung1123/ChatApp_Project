const User = require("../models/User");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 1. Kiểm tra username đã tồn tại chưa
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username đã được sử dụng", status: false });

    // 2. Kiểm tra email đã tồn tại chưa
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email đã được sử dụng", status: false });

    // 3. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Tạo user mới trong DB
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    // 5. Trả về kết quả (xóa mật khẩu trước khi gửi về client cho an toàn)
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};