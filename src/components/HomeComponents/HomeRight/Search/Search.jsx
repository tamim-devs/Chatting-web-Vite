import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FcSearch } from "react-icons/fc";

const Search = ({ classname = "" }) => {
  return (
    <div className="relative w-full">
      
      {/* Search Icon */}
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
        <FcSearch />
      </span>

      {/* Input */}
      <input
        type="text"
        id="search"
        name="search"
        placeholder="Search"
        className={`w-full py-3 pl-12 pr-10 rounded-xl border outline-none 
          focus:ring-2 focus:ring-blue-500 ${classname}`}
      />

      {/* More Icon */}
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-700 text-xl cursor-pointer">
        <BsThreeDotsVertical />
      </span>

    </div>
  );
};

export default Search;
