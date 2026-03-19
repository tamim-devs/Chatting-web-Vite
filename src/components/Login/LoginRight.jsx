import React from "react";
import Lock from "../../assets/lock.png";

const LoginRight = () => {
  return (
    <div
      className="
        w-full
        h-[40vh]          /* 📱 Mobile height */
        sm:h-[50vh]       /* Tablet */
        lg:h-screen       /* Desktop */
        bg-blue-400 
        flex 
        justify-center 
        items-center
      "
    >
      <img
        src={Lock}
        alt="Lock"
        className="
          w-40 
          sm:w-56 
          lg:w-72 
          object-contain
        "
      />
    </div>
  );
};

export default LoginRight;
