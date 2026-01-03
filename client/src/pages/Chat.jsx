import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined); // Người đang chat cùng

  // 1. Kiểm tra đăng nhập
  useEffect(() => {
    async function checkLogin() {
      if (!localStorage.getItem("chat-app-user")) {
        navigate("/login");
      } else {
        setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
      }
    }
    checkLogin();
  }, []);

  // 2. Lấy danh sách bạn bè từ Server
  useEffect(() => {
    async function fetchContacts() {
      if (currentUser) {
        const data = await axios.get(`http://localhost:5000/api/auth/allusers/${currentUser._id}`);
        setContacts(data.data);
      }
    }
    fetchContacts();
  }, [currentUser]);

  // 3. Xử lý khi chọn một người để chat
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <div className="chat-container">
      <div className="container">
        {/* CỘT TRÁI: DANH SÁCH BẠN BÈ */}
        <div className="contacts">
          <div className="brand">
            <h3>Snappy Chat</h3>
          </div>
          <div className="contacts-list">
            {contacts.map((contact, index) => {
              return (
                <div
                  key={index}
                  className={`contact ${currentChat === contact ? "selected" : ""}`}
                  onClick={() => handleChatChange(contact)}
                >
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CỘT PHẢI: KHUNG CHAT (TẠM THỜI) */}
        <div className="chat-box-temp">
           {currentChat === undefined ? (
             <span>Chào {currentUser?.username}, hãy chọn một người để chat! 👋</span>
           ) : (
             <span>Đang chat với: {currentChat.username}</span>
           )}
        </div>
      </div>
    </div>
  );
}