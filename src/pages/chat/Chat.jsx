import React from "react";
import ChatLeft from "../../pages/chat/ChatLeft";
import ChatRight from "../../pages/chat/ChatRight.jsx";

const Chat = () => {
  return (
    <>
      <div className="flex  w-full gap-x-10 ">
        <div className="w-[30%] ">
          <ChatLeft />
        </div>
        <div className="w-[70%] border-2 border-gray-300 rounded-lg p-8">
          <ChatRight />
        </div>
      </div>
    </>
  );
};

export default Chat;
