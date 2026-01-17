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
   

      {/* Friends list */}
      <Friends isChatC={true} />
    </div>
  );
};

export default ChatLeft;
