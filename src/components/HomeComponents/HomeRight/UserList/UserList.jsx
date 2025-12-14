import { getDatabase, ref, onValue, push } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import avatar from "../../../../assets/chat/avatar.png";
import moment from "moment";

const UserList = () => {
  const db = getDatabase();
  const auth = getAuth();

  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState({});

  /* ================= LOAD REGISTERED USERS ================= */
  useEffect(() => {
    const userRef = ref(db, "users");

    onValue(userRef, (snapshot) => {
      const arr = [];

      snapshot.forEach((item) => {
        const user = item.val();

        // ✅ only valid registered users
        if (
          user?.userUid &&
          user?.userEmail &&
          user?.userName &&
          user.userUid !== auth.currentUser?.uid
        ) {
          arr.push({
            ...user,
            userKey: item.key,
          });
        }
      });

      setUsers(arr);
    });
  }, []);

  /* ================= FRIEND REQUESTS ================= */
  useEffect(() => {
    const reqRef = ref(db, "FriendRequest");

    onValue(reqRef, (snapshot) => {
      const arr = [];
      snapshot.forEach((item) => arr.push(item.val()));
      setFriendRequests(arr);
    });
  }, []);

  /* ================= FRIEND LIST ================= */
  useEffect(() => {
    const friendRef = ref(db, "Friends");

    onValue(friendRef, (snapshot) => {
      const arr = [];
      snapshot.forEach((item) => arr.push(item.val()));
      setFriends(arr);
    });
  }, []);

  /* ================= SEND REQUEST ================= */
  const handleFriendRequest = (user) => {
    if (!auth.currentUser || !user.userUid) return;

    const FriendRequestRef = ref(db, "FriendRequest");

    push(FriendRequestRef, {
      whoSendFriendRequestUid: auth.currentUser.uid,
      whoSendFriendRequestName: auth.currentUser.displayName,
      whoSendFriendRequestEmail: auth.currentUser.email,
      whoSendFriendRequestProfilePicture: auth.currentUser.photoURL || "",
      whoRecivedFriendRequestUid: user.userUid,
      whoRecivedFriendRequestName: user.userName,
      whoRecivedFriendRequestEmail: user.userEmail,
      whoRecivedFriendRequestProfile_picture: user.userPhotoUrl || "",
      createdAt: Date.now(),
    }).then(() => {
      setSentRequests((prev) => ({
        ...prev,
        [user.userKey]: true,
      }));
    });
  };

  /* ================= CHECK STATUS ================= */
  const isRequestedOrFriend = (user) => {
    const uid = auth.currentUser?.uid;

    const requested = friendRequests.some(
      (r) =>
        (r.whoSendFriendRequestUid === uid &&
          r.whoRecivedFriendRequestUid === user.userUid) ||
        (r.whoSendFriendRequestUid === user.userUid &&
          r.whoRecivedFriendRequestUid === uid)
    );

    const friend = friends.some(
      (f) =>
        (f.whoSendFriendRequestUid === uid &&
          f.whoRecivedFriendRequestUid === user.userUid) ||
        (f.whoSendFriendRequestUid === user.userUid &&
          f.whoRecivedFriendRequestUid === uid)
    );

    return requested || friend || sentRequests[user.userKey];
  };

  return (
    <div className="w-full sm:w-[320px] bg-blue-200 rounded-xl shadow-md p-4 h-full">

      <div className="flex justify-between items-center mb-3">
        <h1 className="font-semibold">User List</h1>
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
          {users.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto">
        {users.map((user) => {
          const disabled = isRequestedOrFriend(user);

          return (
            <div
              key={user.userKey}
              className="flex items-center gap-3 bg-white p-3 rounded-lg shadow"
            >
              <img
                src={user.userPhotoUrl || avatar}
                className="h-12 w-12 rounded-full object-cover"
              />

              <div className="flex-1">
                <h2 className="font-semibold text-sm">{user.userName}</h2>
                <p className="text-xs text-gray-500">
                  {moment(user.createdAt || Date.now()).calendar()}
                </p>
              </div>

              {disabled ? (
                <button className="bg-green-500 text-white h-8 w-8 rounded">
                  ✓
                </button>
              ) : (
                <button
                  onClick={() => handleFriendRequest(user)}
                  className="bg-violet-600 text-white h-8 w-8 rounded"
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserList;
