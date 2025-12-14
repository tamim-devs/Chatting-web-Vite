import { useEffect, useState } from "react";
import { getDatabase, ref, onValue, remove, push } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useDispatch } from "react-redux";
import moment from "moment";
import { Friensinfo } from "../../../../Features/FriendSlice/FriendSlice";
import { BsThreeDotsVertical } from "react-icons/bs";

const Friends = () => {
  const db = getDatabase();
  const auth = getAuth();
  const dispatch = useDispatch();

  const [friendList, setFriendList] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  /* ===== FETCH FRIENDS ===== */
  useEffect(() => {
    const friendsRef = ref(db, "Friends");
    onValue(friendsRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        const data = item.val();
        if (
          data.whoSendFriendRequestUid === auth.currentUser.uid ||
          data.whoRecivedFriendRequestUid === auth.currentUser.uid
        ) {
          arr.push({ ...data, friendKey: item.key });
        }
      });
      setFriendList(arr);
    });
  }, []);

  /* ===== CHAT CLICK ===== */
  const handleFriendClick = (item) => {
    const isSender = item.whoSendFriendRequestUid === auth.currentUser.uid;

    dispatch(
      Friensinfo({
        id: isSender
          ? item.whoRecivedFriendRequestUid
          : item.whoSendFriendRequestUid,
        name: isSender
          ? item.whoRecivedFriendRequestName
          : item.whoSendFriendRequestName,
        profile_picture: isSender
          ? item.whoRecivedFriendRequestProfile_picture
          : item.whoSendFriendRequestProfilePicture,
      })
    );
  };

  /* ===== UNFRIEND ===== */
  const handleUnfriend = async (item) => {
    await remove(ref(db, `Friends/${item.friendKey}`));
    setOpenMenu(null);
  };

  /* ===== BLOCK ===== */
  const handleBlock = async (item) => {
    const isSender = item.whoSendFriendRequestUid === auth.currentUser.uid;

    await push(ref(db, "BlockedUsers"), {
      blockedByUid: auth.currentUser.uid,
      blockedByName: auth.currentUser.displayName,
      blockedByPhoto: auth.currentUser.photoURL,

      blockedUserUid: isSender
        ? item.whoRecivedFriendRequestUid
        : item.whoSendFriendRequestUid,
      blockedUserName: isSender
        ? item.whoRecivedFriendRequestName
        : item.whoSendFriendRequestName,
      blockedUserPhoto: isSender
        ? item.whoRecivedFriendRequestProfile_picture
        : item.whoSendFriendRequestProfilePicture,

      createdAt: Date.now(),
    });

    await remove(ref(db, `Friends/${item.friendKey}`));
    setOpenMenu(null);
  };

  return (
    <div className="p-4 flex flex-col gap-3 bg-blue-200 rounded-md">
      <div className="flex  items-center justify-between mb-3">
  <h1 className="font-semibold text-lg">Friend List</h1>
  <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full">
    {friendList.length}
  </span>
</div>
      {friendList.map((item) => {
        const isSender =
          item.whoSendFriendRequestUid === auth.currentUser.uid;

        return (
          <div
            key={item.friendKey}
            className="flex items-center justify-between bg-white p-3 rounded shadow"
          >
            {/* LEFT */}
            <div
              onClick={() => handleFriendClick(item)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img
                src={
                  isSender
                    ? item.whoRecivedFriendRequestProfile_picture
                    : item.whoSendFriendRequestProfilePicture
                }
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>
                <h3 className="font-medium">
                  {isSender
                    ? item.whoRecivedFriendRequestName
                    : item.whoSendFriendRequestName}
                </h3>
                <p className="text-xs text-gray-500">
                  {moment(item.createdAt).fromNow()}
                </p>
              </div>
            </div>

            {/* MENU */}
            <div className="relative">
              <button
                onClick={() =>
                  setOpenMenu(
                    openMenu === item.friendKey ? null : item.friendKey
                  )
                }
              >
                <BsThreeDotsVertical />
              </button>

              {openMenu === item.friendKey && (
                <div className="absolute right-0 top-6 bg-white shadow rounded text-sm z-50">
                  <button
                    onClick={() => handleUnfriend(item)}
                    className="block w-full px-4 py-2 hover:bg-gray-100"
                  >
                    Unfriend
                  </button>
                  <button
                    onClick={() => handleBlock(item)}
                    className="block w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Block
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Friends;
