import React, { useEffect, useState } from "react";
import ChatLeft from "./ChatLeft";
import ChatRight from "./ChatRight";
import { useSelector } from "react-redux";

const Chat = () => {
  const { friendsItem } = useSelector((state) => state.friendStore);
  const [view, setView] = useState("list");

  useEffect(() => {
    if (friendsItem?.id) {
      setView("chat");
    } else {
      setView("list");
    }
  }, [friendsItem]);

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[calc(100vh-56px)] bg-[#fafafa]">

      {/* LEFT (friend list) */}
      <div
        className={
          `
            w-full
            md:w-[35%]
            lg:w-[30%]
            border-r
            ${view === "chat" ? "hidden md:block" : "block"}
          `
        }
      >
        <ChatLeft />
      </div>

      {/* RIGHT (chat) */}
      <div
        className={
          `
            w-full
            md:w-[65%]
            lg:w-[70%]
            flex flex-col
            ${view === "list" ? "hidden md:flex" : "flex"}
          `
        }
      >
        <ChatRight onBack={() => setView("list")} />
      </div>

    </div>
  );
};

export default Chat;
