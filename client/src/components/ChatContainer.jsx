import React, { useState, useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import axios from "axios";

export default function ChatContainer({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  // 1. Lấy tin nhắn cũ từ API
  useEffect(() => {
    async function fetchMessages() {
      // Thêm kiểm tra currentUser để tránh lỗi missing dependency
      if (currentChat && currentUser) {
        const response = await axios.post("http://localhost:5000/api/messages/getmsg", {
          from: currentUser._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      }
    }
    fetchMessages();
  }, [currentChat, currentUser]); // Đã thêm currentUser vào dependency

  // 2. Xử lý gửi tin nhắn
  const handleSendMsg = async (msg) => {
    await axios.post("http://localhost:5000/api/messages/addmsg", {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });

    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  // 3. Lắng nghe Socket (SỬA LỖI CHÍNH TẠI ĐÂY)
  // Thay vì dùng biến trung gian, ta cập nhật trực tiếp vào messages
  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setMessages((prev) => [...prev, { fromSelf: false, message: msg }]);
      });
    }
  }, [socket]); // Đã thêm socket vào dependency

  // 4. Cuộn xuống cuối
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container-main">
      <div className="chat-header">
        <div className="user-details">
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => {
          return (
            <div ref={scrollRef} key={index}>
              <div className={`message ${message.fromSelf ? "sended" : "recieved"}`}>
                <div className="content">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ChatInput handleSendMsg={handleSendMsg} />
    </div>
  );
}