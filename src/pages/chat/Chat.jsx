import React from "react";
import ChatLeft from "./ChatLeft";
import ChatRight from "./ChatRight";
import { useSelector } from "react-redux";
import { setChatOpen } from "../../utility/chatState";


  const Chat = () => {
  const { friendsItem } = useSelector((state) => state.friendStore);

   useEffect(() => {
    setChatOpen(true);           // 🔕 mute
    return () => setChatOpen(false); // 🔔 unmute
  }, []);

  return (
    <div className="flex h-screen w-full">

      {/* LEFT */}
      <div
        className={`
          w-full md:w-[30%] border-r
          ${friendsItem?.id ? "hidden md:block" : "block"}
        `}
      >
        <ChatLeft />
      </div>

      {/* RIGHT */}
      <div
        className={`
          w-full md:w-[70%] flex flex-col
          ${!friendsItem?.id ? "hidden md:flex" : "flex"}
        `}
      >
        <ChatRight />
      </div>

    </div>
  );
};
;

export default Chat;
