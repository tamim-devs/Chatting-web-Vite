import React from "react";
import LoginRight from "../components/Login/LoginRight";
import LoginLeft from "../components/Login/LoginLeft";

const Login = () => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Left: Login Form */}
      <LoginLeft />

      {/* Right: Image / Animation */}
      <div className="hidden lg:flex lg:flex-1">
        <LoginRight />
      </div>
    </div>
  );
};

export default Login;
