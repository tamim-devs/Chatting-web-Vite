import React from "react";
import Search from "../../components/HomeComponents/HomeRight/Search/Search";
import Friends from "../../components/HomeComponents/HomeRight/Friends/Friends";

const ChatLeft = () => {
  return (
    <aside
      className="
        w-full                     /* Mobile: full width */
        sm:w-full
        md:w-[320px]               /* Tablet */
        lg:w-[360px]               /* Desktop sidebar width */
        h-screen                   /* Full height */
        bg-gray-100
        p-3
        sm:p-4
        border-r                   /* Sidebar look */
        overflow-y-auto
      "
    >
      {/* Search */}
      {/* <div className="mb-3">
        <Search />
      </div> */}

      {/* Friends list */}
      <Friends isChatC={true} />
    </aside>
  );
};

export default ChatLeft;
