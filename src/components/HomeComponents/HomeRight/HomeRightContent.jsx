import React from "react";
import Friends from "./Friends/Friends.jsx";
import UserList from "./UserList/UserList.jsx";
import FrinendRequest from "../HomeRight/FriendRequest/FriendRequest.jsx";
import BlockUser from "../HomeRight/BlockUser/BlockUser.jsx";
import Search from "../HomeRight/Search/Search.jsx";
const HomeRightContent = () => {
  return (
    <div>
      <Search classname={"w-full py-3 rounded-full pl-14"} />
      <div className="flex justify-between flex-wrap">
        <Friends/>
        <UserList />
        <FrinendRequest />
        <BlockUser />
      </div>
    </div>
  );
};

export default HomeRightContent;