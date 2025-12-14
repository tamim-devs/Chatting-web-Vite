import React from "react";
import Friends from "../../components/HomeComponents/HomeRight/Friends/Friends";
import UserList from "../../components/HomeComponents/HomeRight/UserList/UserList";
import FriendRequest from "../../components/HomeComponents/HomeRight/FriendRequest/FriendRequest";

const Home = () => {
  return (
    <div
      className="
        w-full
        min-h-screen
        px-3 sm:px-6 py-4
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-3
        gap-4
      "
    >
      {/* FRIENDS */}
      <div className="w-full">
        <Friends />
      </div>

      {/* USER LIST */}
      <div className="w-full">
        <UserList />
      </div>

      {/* FRIEND REQUEST */}
      <div className="w-full md:col-span-2 xl:col-span-1">
        <FriendRequest />
      </div>
    </div>
  );
};

export default Home;
