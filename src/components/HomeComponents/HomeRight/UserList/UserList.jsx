import { getDatabase, ref, onValue, push } from "firebase/database";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import avatar from "../../../../assets/chat/avatar.png";
import moment from "moment";

const UserList = () => {
  const db = getDatabase();
  const auth = getAuth();

  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState({});

  /* ================= Load Registered Users ================= */
  useEffect(() => {
    const userRef = ref(db, "users/");
    onValue(userRef, (snapshot) => {
      let userArr = [];

      snapshot.forEach((item) => {
        const user = item.val();

        // ✅ Only properly registered users
        if (
          user.userUid &&
          user.userEmail &&
          user.userName &&
          user.userUid !== auth.currentUser?.uid
        ) {
          userArr.push({
            ...user,
            userKey: item.key,
          });
        }
      });

      setUsers(userArr);
    });
  }, []);

  /* ================= Load Friend Requests ================= */
  useEffect(() => {
    const reqRef = ref(db, "FriendRequest/");
    onValue(reqRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => arr.push(item.val()));
      setFriendRequests(arr);
    });
  }, []);

  /* ================= Load Friends ================= */
  useEffect(() => {
    const friendRef = ref(db, "Friends/");
    onValue(friendRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => arr.push(item.val()));
      setFriends(arr);
    });
  }, []);

  /* ================= Send Friend Request ================= */
  const handleFriendRequest = (user) => {
    if (!user.userUid) return;

    const FriendRequestRef = ref(db, "FriendRequest/");
    const newRequest = {
      whoSendFriendRequestUid: auth.currentUser.uid,
      whoSendFriendRequestName: auth.currentUser.displayName,
      whoSendFriendRequestEmail: auth.currentUser.email,
      whoSendFriendRequestProfilePicture: auth.currentUser.photoURL || "",
      whoRecivedFriendRequestUid: user.userUid,
      whoRecivedFriendRequestName: user.userName,
      whoRecivedFriendRequestEmail: user.userEmail,
      whoRecivedFriendRequestProfile_picture: user.userPhotoUrl || "",
      createdAt: Date.now(),
    };

    push(FriendRequestRef, newRequest).then(() => {
      setSentRequests((prev) => ({
        ...prev,
        [user.userKey]: true,
      }));
    });
  };

  /* ================= Check Requested or Friend ================= */
  const checkIsRequestedOrFriend = (user) => {
    const currentUid = auth.currentUser.uid;

    const isRequested = friendRequests.some(
      (req) =>
        (req.whoSendFriendRequestUid === currentUid &&
          req.whoRecivedFriendRequestUid === user.userUid) ||
        (req.whoSendFriendRequestUid === user.userUid &&
          req.whoRecivedFriendRequestUid === currentUid)
    );

    const isFriend = friends.some(
      (fr) =>
        (fr.whoSendFriendRequestUid === currentUid &&
          fr.whoRecivedFriendRequestUid === user.userUid) ||
        (fr.whoSendFriendRequestUid === user.userUid &&
          fr.whoRecivedFriendRequestUid === currentUid)
    );

    return isRequested || isFriend || sentRequests[user.userKey];
  };

  return (
    <div className="w-full sm:w-[320px] bg-blue-200 rounded-xl shadow-md p-4 flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-semibold text-lg">User List</h1>
        <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full">
          {users.length}
        </span>
      </div>

      {/* User List */}
      <div className="flex flex-col gap-3 overflow-y-auto scrollbar-hide">
        {users.map((user) => {
          const disabled = checkIsRequestedOrFriend(user);

          return (
            <div
              key={user.userKey}
              className="flex items-center gap-3 bg-white p-3 rounded-lg shadow hover:bg-blue-50 transition"
            >
              {/* Avatar */}
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
                <img
                  src={user.userPhotoUrl || avatar}
                  alt="user"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 overflow-hidden">
                <h2 className="font-semibold text-sm truncate">
                  {user.userName}
                </h2>
                <p className="text-xs text-gray-600 truncate">
                  {moment(user.createdAt || Date.now()).calendar()}
                </p>
              </div>

              {/* Action */}
              {disabled ? (
                <button
                  disabled
                  className="h-9 w-9 rounded-md bg-green-500 text-white font-bold"
                >
                  ✓
                </button>
              ) : (
                <button
                  onClick={() => handleFriendRequest(user)}
                  className="h-9 w-9 rounded-md bg-violet-600 text-white font-bold hover:bg-violet-700 transition"
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
