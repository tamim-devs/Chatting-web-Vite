import { useEffect, useState, useMemo } from "react";
import { getDatabase, ref, onValue, push } from "firebase/database";
import { getAuth } from "firebase/auth";
import avatar from "../../../../assets/chat/avatar.png";
import moment from "moment";

const UserList = () => {
  const db = getDatabase();
  const auth = getAuth();

  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  /* ===== LOAD ALL USERS ===== */
  useEffect(() => {
    const userRef = ref(db, "users");
    onValue(userRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        const user = item.val();
        if (
          user?.userUid &&
          user.userUid !== auth.currentUser.uid
        ) {
          arr.push({ ...user, userKey: item.key });
        }
      });
      setUsers(arr);
    });
  }, []);

  /* ===== LOAD FRIEND REQUEST ===== */
  useEffect(() => {
    const reqRef = ref(db, "FriendRequest");
    onValue(reqRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push(item.val());
      });
      setFriendRequests(arr);
    });
  }, []);

  /* ===== LOAD FRIENDS ===== */
  useEffect(() => {
    const friendRef = ref(db, "Friends");
    onValue(friendRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        arr.push(item.val());
      });
      setFriends(arr);
    });
  }, []);

  /* ===== UID LIST (Friend + Request) ===== */
  const hiddenUids = useMemo(() => {
    let arr = [];

    // Friends
    friends.forEach((f) => {
      if (f.whoSendFriendRequestUid === auth.currentUser.uid) {
        arr.push(f.whoRecivedFriendRequestUid);
      } else if (f.whoRecivedFriendRequestUid === auth.currentUser.uid) {
        arr.push(f.whoSendFriendRequestUid);
      }
    });

    // Friend Requests
    friendRequests.forEach((r) => {
      if (r.whoSendFriendRequestUid === auth.currentUser.uid) {
        arr.push(r.whoRecivedFriendRequestUid);
      } else if (r.whoRecivedFriendRequestUid === auth.currentUser.uid) {
        arr.push(r.whoSendFriendRequestUid);
      }
    });

    return arr;
  }, [friends, friendRequests]);

  /* ===== SEND FRIEND REQUEST ===== */
  const handleFriendRequest = (user) => {
    push(ref(db, "FriendRequest"), {
      whoSendFriendRequestUid: auth.currentUser.uid,
      whoSendFriendRequestName: auth.currentUser.displayName,
      whoSendFriendRequestEmail: auth.currentUser.email,
      whoSendFriendRequestProfilePicture: auth.currentUser.photoURL || "",

      whoRecivedFriendRequestUid: user.userUid,
      whoRecivedFriendRequestName: user.userName,
      whoRecivedFriendRequestEmail: user.userEmail,
      whoRecivedFriendRequestProfile_picture: user.userPhotoUrl || "",

      createdAt: Date.now(),
    });
  };

  return (
    <div className="w-[320px] bg-blue-200 rounded-xl shadow-md p-4">
      <div className="flex justify-between items-center mb-3">
        <h1 className="font-semibold">User List</h1>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
          {
            users.filter(
              (user) => !hiddenUids.includes(user.userUid)
            ).length
          }
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[400px]">
        {users
          .filter((user) => !hiddenUids.includes(user.userUid))
          .map((user) => (
            <div
              key={user.userKey}
              className="flex items-center gap-3 bg-white p-3 rounded-lg shadow"
            >
              <img
                src={user.userPhotoUrl || avatar}
                className="h-12 w-12 rounded-full object-cover"
              />

              <div className="flex-1">
                <h2 className="font-semibold text-sm">
                  {user.userName}
                </h2>
                <p className="text-xs text-gray-500">
                  {moment(user.createdAt || Date.now()).fromNow()}
                </p>
              </div>

              <button
                onClick={() => handleFriendRequest(user)}
                className="bg-violet-600 text-white h-8 w-8 rounded"
              >
                +
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default UserList;
