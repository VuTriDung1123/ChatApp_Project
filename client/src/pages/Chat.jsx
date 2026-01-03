import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import ChatContainer from "../components/ChatContainer";
import Logout from "../components/Logout"; // Import nút Logout

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);

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
  }, [navigate]);

  // 2. Kết nối Socket
  useEffect(() => {
    if (currentUser) {
      socket.current = io("http://localhost:5000");
      socket.current.emit("add-user", currentUser._id);
      
      // Lắng nghe sự kiện ai đó Online/Offline
      socket.current.on("user-status-change", (data) => {
        setContacts((prevContacts) => 
          prevContacts.map((contact) => 
            contact._id === data.userId 
              ? { ...contact, isOnline: data.isOnline, lastSeen: data.lastSeen } 
              : contact
          )
        );
      });
    }
  }, [currentUser]);

  // 3. Lấy danh sách bạn bè (Kèm trạng thái Online/Offline)
  useEffect(() => {
    async function fetchContacts() {
      if (currentUser) {
        // Cần sửa lại API bên server một chút để trả về isOnline và lastSeen (thường là mặc định đã có nếu select all)
        const data = await axios.get(`http://localhost:5000/api/auth/allusers/${currentUser._id}`);
        setContacts(data.data);
      }
    }
    fetchContacts();
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  // Hàm tính thời gian offline
  const formatLastSeen = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // Giây

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
  };

  return (
    <div className="chat-container">
      <div className="container">
        
        {/* CỘT TRÁI */}
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
                  <div className="username-container" style={{display:"flex", flexDirection:"column", gap:"5px"}}>
                    <div style={{display:"flex", justifyContent:"space-between", width:"100%", alignItems:"center"}}>
                       <h3>{contact.username}</h3>
                       {/* Dấu chấm xanh nếu Online */}
                       {contact.isOnline ? (
                         <div style={{width:"10px", height:"10px", borderRadius:"50%", backgroundColor:"#00ff00", boxShadow:"0 0 10px #00ff00"}}></div>
                       ) : (
                         <span style={{fontSize:"0.7rem", color:"gray"}}>{formatLastSeen(contact.lastSeen)}</span>
                       )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* KHU VỰC TÊN MÌNH + NÚT LOGOUT */}
          {currentUser && (
            <div className="current-user">
              <div style={{display:"flex", alignItems:"center", gap:"1rem"}}>
                <h2>{currentUser.username}</h2>
                <Logout /> 
              </div>
            </div>
          )}
          
        </div>

        {/* CỘT PHẢI */}
        {currentChat === undefined ? (
          <div className="chat-box-temp" style={{color: "white", display: "flex", justifyContent: "center", alignItems: "center"}}>
             <h2>Chào {currentUser?.username}, hãy chọn người để chat! 👋</h2>
          </div>
        ) : (
          <ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket} />
        )}
      </div>
    </div>
  );
}