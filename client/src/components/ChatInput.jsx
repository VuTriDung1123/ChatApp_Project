import React, { useState } from "react";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.length > 0) {
      handleSendMsg(msg);
      setMsg(""); // Xóa ô nhập sau khi gửi
    }
  };

  return (
    <div className="input-container">
      <form className="input-container" onSubmit={(event) => sendChat(event)}>
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          onChange={(e) => setMsg(e.target.value)}
          value={msg}
        />
        <button type="submit" className="submit-btn">
          Gửi
        </button>
      </form>
    </div>
  );
}