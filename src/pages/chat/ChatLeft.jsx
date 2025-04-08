import React from "react";
import Search from "../../components/HomeComponents/HomeRight/Search/Search";
import Friends from "../../components/HomeComponents/HomeRight/Friends/Friends";
const ChatLeft = () => {
  return (
    <div>
      <Search classname="w-full bg-white rounded-xl py-3 px-10" />
      <Friends isChatC={true} />
    </div>
  );
};

export default ChatLeft;
