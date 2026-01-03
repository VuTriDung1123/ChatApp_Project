import React, { useState, useEffect, useRef } from "react"; // Thêm useRef
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"; // NEW: Import socket
import ChatContainer from "../components/ChatContainer";

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef(); // NEW: Tạo biến socket
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);

  // 1. Kiểm tra login
  useEffect(() => {
    async function checkLogin() {
      if (!localStorage.getItem("chat-app-user")) {
        navigate("/login");
      } else {
        setCurrentUser(await JSON.parse(localStorage.getItem("chat-app-user")));
      }
    }
    checkLogin();
  }, [navigate]);

  // 2. NEW: Kết nối Socket khi có currentUser
  useEffect(() => {
    if (currentUser) {
      socket.current = io("http://localhost:5000"); // Kết nối tới server
      socket.current.emit("add-user", currentUser._id); // Báo danh với server
    }
  }, [currentUser]);

  // 3. Lấy danh sách bạn bè (giữ nguyên)
  useEffect(() => {
    async function fetchContacts() {
      if (currentUser) {
        const data = await axios.get(`http://localhost:5000/api/auth/allusers/${currentUser._id}`);
        setContacts(data.data);
      }
    }
    fetchContacts();
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <div className="chat-container">
      <div className="container">
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

        {currentChat === undefined ? (
          <div className="chat-box-temp" style={{color: "white", display: "flex", justifyContent: "center", alignItems: "center"}}>
             <h2>Chào {currentUser?.username}, hãy chọn người để chat! 👋</h2>
          </div>
        ) : (
          /* NEW: Truyền socket xuống ChatContainer */
          <ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket} />
        )}
      </div>
    </div>
  );
}