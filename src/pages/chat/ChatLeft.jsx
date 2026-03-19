import React from "react";
import Search from "../../components/HomeComponents/HomeRight/Search/Search";
import Friends from "../../components/HomeComponents/HomeRight/Friends/Friends";

const ChatLeft = () => {
  return (
    <aside
      className="
        w-full
        sm:w-full
        md:w-[320px]
        lg:w-[360px]
        min-h-[calc(100vh-56px)]
        bg-gray-100
        p-0
        border-r
        flex
        flex-col
      "
    >
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <Friends isChatC={true} />
      </div>
    </aside>
  );
};

export default ChatLeft;
