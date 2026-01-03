import React, { useState, useEffect, useRef } from "react";
import ChatInput from "./ChatInput";
import axios from "axios";

export default function ChatContainer({ currentChat, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();

  // 1. Lấy tin nhắn cũ từ API (Kèm thời gian)
  useEffect(() => {
    async function fetchMessages() {
      if (currentChat && currentUser) {
        const response = await axios.post("http://localhost:5000/api/messages/getmsg", {
          from: currentUser._id,
          to: currentChat._id,
        });
        setMessages(response.data);
      }
    }
    fetchMessages();
  }, [currentChat, currentUser]);

  // 2. Xử lý gửi tin nhắn
  const handleSendMsg = async (msg) => {
    // Gửi lên server lưu DB
    await axios.post("http://localhost:5000/api/messages/addmsg", {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });

    // Bắn Socket sang bên kia
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      msg,
    });

    // Cập nhật giao diện của mình ngay lập tức
    const msgs = [...messages];
    msgs.push({ 
      fromSelf: true, 
      message: msg, 
      time: new Date().toISOString() // Lấy giờ hiện tại
    });
    setMessages(msgs);
  };

  // 3. NHẬN TIN NHẮN REAL-TIME (Không cần F5)
  useEffect(() => {
    if (socket.current) {
      // Hủy sự kiện cũ trước khi gán sự kiện mới để tránh nhận đúp tin nhắn
      socket.current.off("msg-recieve"); 
      
      socket.current.on("msg-recieve", (msg) => {
        // Khi nhận tin nhắn từ người khác
        setMessages((prev) => [
          ...prev, 
          { 
            fromSelf: false, 
            message: msg, 
            time: new Date().toISOString() // Lấy giờ hiện tại khi nhận được
          }
        ]);
      });
    }
  }, [socket]); // Chạy lại khi socket thay đổi

  // 4. Tự động cuộn xuống cuối
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Hàm format giờ (Ví dụ: 10:30 PM)
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container-main">
      <div className="chat-header">
        <div className="user-details">
          <div className="username">
            <h3>Đang chat với: {currentChat.username}</h3>
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
                  {/* Hiển thị giờ nhỏ xíu bên dưới */}
                  <span className="time">
                    {message.time ? formatTime(message.time) : "Vừa xong"}
                  </span>
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