import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue, remove, push } from "firebase/database";
import { getAuth } from "firebase/auth";

const Settings = () => {
  const db = getDatabase();
  const auth = getAuth();
  const [blockedList, setBlockedList] = useState([]);

  useEffect(() => {
    const blockRef = ref(db, "BlockedUsers");
    onValue(blockRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        const data = item.val();
        if (data.blockedByUid === auth.currentUser.uid) {
          arr.push({ ...data, key: item.key });
        }
      });
      setBlockedList(arr);
    });
  }, []);

  const handleUnblock = async (item) => {
    // 1️⃣ remove from blocked
    await remove(ref(db, `BlockedUsers/${item.key}`));

    // 2️⃣ add back to friends
    await push(ref(db, "Friends"), {
      whoSendFriendRequestUid: auth.currentUser.uid,
      whoSendFriendRequestName: auth.currentUser.displayName,
      whoSendFriendRequestProfilePicture: auth.currentUser.photoURL,

      whoRecivedFriendRequestUid: item.blockedUserUid,
      whoRecivedFriendRequestName: item.blockedUserName,
      whoRecivedFriendRequestProfile_picture: item.blockedUserPhoto,

      createdAt: Date.now(),
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Blocked Users</h2>

      {blockedList.length === 0 && (
        <p className="text-gray-500">No blocked users</p>
      )}

      {blockedList.map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between bg-white p-3 rounded shadow mb-3"
        >
          <div className="flex items-center gap-3">
            <img
              src={item.blockedUserPhoto}
              className="w-12 h-12 rounded-full object-cover"
            />
            <p className="font-medium">{item.blockedUserName}</p>
          </div>

          <button
            onClick={() => handleUnblock(item)}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Unblock
          </button>
        </div>
      ))}
    </div>
  );
};

export default Settings;
