import React, { useState } from "react";
import { FcSearch } from "react-icons/fc";
import { BsThreeDotsVertical } from "react-icons/bs";

const Search = ({ friends = [], onSelect }) => {
  const [query, setQuery] = useState("");

  const filteredFriends = friends.filter((f) =>
    f?.name?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <span className="absolute left-4 top-4 text-xl">
        <FcSearch />
      </span>

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search friends..."
        className="w-full py-3 pl-12 pr-10 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* More Icon */}
      <span className="absolute right-4 top-4 text-xl text-blue-700">
        <BsThreeDotsVertical />
      </span>

      {/* Search Result */}
      {query && (
        <div className="absolute top-[60px] left-0 w-full bg-white rounded-xl shadow z-50 max-h-[300px] overflow-y-auto">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((f) => (
              <div
                key={f.id}
                onClick={() => {
                  onSelect(f);
                  setQuery("");
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
              >
                <img
                  src={f.profile_picture}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <p className="font-medium text-sm">{f.name}</p>
              </div>
            ))
          ) : (
            <p className="p-3 text-center text-sm text-gray-500">
              No friends found
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
