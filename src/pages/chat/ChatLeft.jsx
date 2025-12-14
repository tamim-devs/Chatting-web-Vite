import React from "react";
import Search from "../../components/HomeComponents/HomeRight/Search/Search";
import Friends from "../../components/HomeComponents/HomeRight/Friends/Friends";

const ChatLeft = () => {
  return (
    <div
      className="
        w-full
        lg:w-[360px]           /* Desktop fixed sidebar */
        h-full
        lg:h-screen
        bg-gray-100
        p-3
        sm:p-4
        overflow-y-auto
      "
    >
      {/* Search */}
      <div className="mb-4">
        <Search className="w-full bg-white rounded-xl py-3 px-4 sm:px-6" />
      </div>

      {/* Friends list */}
      <Friends isChatC={true} />
    </div>
  );
};

export default ChatLeft;
