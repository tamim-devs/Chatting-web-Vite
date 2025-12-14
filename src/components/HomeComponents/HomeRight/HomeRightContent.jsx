import React from "react";
import Friends from "./Friends/Friends.jsx";
import UserList from "./UserList/UserList.jsx";
import FrinendRequest from "../HomeRight/FriendRequest/FriendRequest.jsx";
import BlockUser from "../HomeRight/BlockUser/BlockUser.jsx";
import Search from "../HomeRight/Search/Search.jsx";
const HomeRightContent = () => {
  return (
    <div className="w-full p-4 flex flex-col gap-6">
      
      {/* SEARCH */}
      <Search classname="w-full py-3 rounded-full pl-14" />

      {/* CONTENT GRID */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-6
        "
      >
        <Friends />
        <UserList />
        <FrinendRequest />
        <BlockUser />
      </div>
    </div>
  );
};

export default HomeRightContent;
