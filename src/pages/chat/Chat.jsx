import React from "react";
import ChatLeft from "./ChatLeft";
import ChatRight from "./ChatRight";
import { useSelector } from "react-redux";

const Chat = () => {
  const { friendsItem } = useSelector((state) => state.friendStore);

  return (
    <div className="flex w-full h-screen overflow-hidden">

      {/* LEFT */}
      <div
        className={`
          w-full
          sm:w-full
          md:w-[35%]
          lg:w-[30%]
          border-r
          ${friendsItem?.id ? "hidden md:block" : "block"}
        `}
      >
        <ChatLeft />
      </div>

      {/* RIGHT */}
      <div
        className={`
          w-full
          sm:w-full
          md:w-[65%]
          lg:w-[70%]
          flex flex-col
          ${!friendsItem?.id ? "hidden md:flex" : "flex"}
        `}
      >
        <ChatRight />
      </div>

    </div>
  );
};

export default Chat;
