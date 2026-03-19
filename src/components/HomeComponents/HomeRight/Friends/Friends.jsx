import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useDispatch } from "react-redux";
import moment from "moment";
import { toast } from "react-toastify";
import { Friensinfo } from "../../../../Features/FriendSlice/FriendSlice";
import Search from "../Search/Search";

const Friends = () => {
  const db = getDatabase();
  const auth = getAuth();
  const dispatch = useDispatch();

  const [friends, setFriends] = useState([]);
  const [onlineMap, setOnlineMap] = useState({});

  /* ===== ONLINE STATUS ===== */
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snap) => {
      setOnlineMap(snap.val() || {});
    });
  }, []);

  /* ===== FRIEND LIST ===== */
  useEffect(() => {
    const friendsRef = ref(db, "Friends");

    onValue(friendsRef, (snapshot) => {
      let arr = [];

      snapshot.forEach((item) => {
        const d = item.val();
        const isSender =
          d.whoSendFriendRequestUid === auth.currentUser.uid;

        if (
          d.whoSendFriendRequestUid === auth.currentUser.uid ||
          d.whoRecivedFriendRequestUid === auth.currentUser.uid
        ) {
          arr.push({
            dbKey: item.key,
            id: isSender
              ? d.whoRecivedFriendRequestUid
              : d.whoSendFriendRequestUid,
            name: isSender
              ? d.whoRecivedFriendRequestName
              : d.whoSendFriendRequestName,
            profile_picture: isSender
              ? d.whoRecivedFriendRequestProfile_picture
              : d.whoSendFriendRequestProfilePicture,
            createdAt: d.createdAt,
          });
        }
      });

      setFriends(arr);
    });
  }, []);

  /* ===== SELECT FRIEND ===== */
  const handleSelectFriend = (friend) => {
    dispatch(
      Friensinfo({
        id: friend.id,
        name: friend.name,
        profile_picture: friend.profile_picture,
      })
    );
  };

  /* ===== UNFRIEND (UPDATED) ===== */
  const handleUnfriend = (friend) => {
    remove(ref(db, `Friends/${friend.dbKey}`))
      .then(() => {
        toast.success(`${friend.name} unfriended ✅`);
      })
      .catch(() => {
        toast.error("Failed to unfriend ❌");
      });
  };

  return (
    <div className="p-3 bg-white rounded-xl shadow flex flex-col gap-3">

      {/* 🔍 SEARCH */}
      <Search friends={friends} onSelect={handleSelectFriend} />

      {/* 👥 FRIEND LIST */}
      {friends.map((f) => {
        const isOnline = onlineMap?.[f.id]?.online;

        return (
          <div
            key={f.id}
            className="flex items-center justify-between p-2 rounded hover:bg-gray-100"
          >

            {/* LEFT */}
            <div
              onClick={() => handleSelectFriend(f)}
              className="flex items-center gap-3 cursor-pointer flex-1"
            >
              <div className="relative">
                <img
                  src={f.profile_picture}
                  className="w-12 h-12 rounded-full object-cover"
                />

                {/* STATUS */}
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>

              <div>
                <p className="font-medium text-sm">{f.name}</p>
                <p className="text-xs text-gray-500">
                  {isOnline ? "Online" : "Offline"} •{" "}
                  {moment(f.createdAt).fromNow()}
                </p>
              </div>
            </div>

            {/* 🔥 UNFRIEND */}
            <button
              onClick={() => handleUnfriend(f)}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              Unfriend
            </button>
          </div>
        );
      })}

      {/* EMPTY */}
      {friends.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-4">
          No friends yet 😢
        </p>
      )}
    </div>
  );
};

export default Friends;