import { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useDispatch } from "react-redux";
import moment from "moment";
import { Friensinfo } from "../../../../Features/FriendSlice/FriendSlice";
import Search from "../Search/Search";

const Friends = () => {
  const db = getDatabase();
  const auth = getAuth();
  const dispatch = useDispatch();

  const [friends, setFriends] = useState([]);
  const [onlineMap, setOnlineMap] = useState({});

  /* ===== FETCH ONLINE STATUS ===== */
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snap) => {
      setOnlineMap(snap.val() || {});
    });
  }, []);

  /* ===== FETCH FRIENDS ===== */
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

  const handleSelectFriend = (friend) => {
    dispatch(
      Friensinfo({
        id: friend.id,
        name: friend.name,
        profile_picture: friend.profile_picture,
      })
    );
  };

  return (
    <div className="p-3 bg-white rounded-xl shadow flex flex-col gap-3">

      <Search friends={friends} onSelect={handleSelectFriend} />

      {friends.map((f) => {
        const isOnline = onlineMap?.[f.id]?.online;

        return (
          <div
            key={f.id}
            onClick={() => handleSelectFriend(f)}
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
          >
            <div className="relative">
              <img
                src={f.profile_picture}
                className="w-12 h-12 rounded-full object-cover"
              />

              {/* STATUS DOT */}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  isOnline ? "bg-green-500" : "bg-red-500"
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
        );
      })}
    </div>
  );
};

export default Friends;
