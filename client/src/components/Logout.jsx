import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { BiPowerOff } from "react-icons/bi";

export default function Logout() {
  const navigate = useNavigate();
  
  const handleClick = async () => {
    // 1. Xóa thông tin user trong bộ nhớ trình duyệt
    localStorage.clear();
    // 2. Chuyển hướng về trang đăng nhập
    navigate("/login");
    // 3. Tải lại trang để ngắt kết nối Socket hoàn toàn
    window.location.reload(); 
  };

  return (
    <Button onClick={handleClick}>
      <BiPowerOff />
    </Button>
  );
}

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a86f3;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
  }
  &:hover {
    background-color: #4f04ff;
  }
`;