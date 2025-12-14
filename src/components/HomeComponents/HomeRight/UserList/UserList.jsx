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

  /* ================= LOAD REGISTERED USERS ONLY ================= */
  useEffect(() => {
    const userRef = ref(db, "users");
    onValue(userRef, (snapshot) => {
      let arr = [];

      snapshot.forEach((item) => {
        const user = item.val();

        // ✅ STRICT FILTER
        if (
          user.isRegistered === true &&
          user.userUid &&
          user.userEmail &&
          user.userName &&
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

  /* ================= FRIEND REQUEST ================= */
  useEffect(() => {
    const reqRef = ref(db, "FriendRequest");
    onValue(reqRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => arr.push(item.val()));
      setFriendRequests(arr);
    });
  }, []);

  /* ================= FRIENDS ================= */
  useEffect(() => {
    const friendRef = ref(db, "Friends");
    onValue(friendRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => arr.push(item.val()));
      setFriends(arr);
    });
  }, []);

  /* ================= SEND FRIEND REQUEST ================= */
  const handleFriendRequest = (user) => {
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

  /* ================= CHECK REQUESTED / FRIEND ================= */
  const checkDisabled = (user) => {
    const uid = auth.currentUser.uid;

    const isRequested = friendRequests.some(
      (req) =>
        (req.whoSendFriendRequestUid === uid &&
          req.whoRecivedFriendRequestUid === user.userUid) ||
        (req.whoSendFriendRequestUid === user.userUid &&
          req.whoRecivedFriendRequestUid === uid)
    );

    const isFriend = friends.some(
      (fr) =>
        (fr.whoSendFriendRequestUid === uid &&
          fr.whoRecivedFriendRequestUid === user.userUid) ||
        (fr.whoSendFriendRequestUid === user.userUid &&
          fr.whoRecivedFriendRequestUid === uid)
    );

    return isRequested || isFriend || sentRequests[user.userKey];
  };

  return (
    <div className="w-full sm:w-[320px] bg-blue-200 rounded-xl shadow-md p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h1 className="font-semibold text-lg">User List</h1>
        <span className="text-sm bg-blue-600 text-white px-3 py-1 rounded-full">
          {users.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto">
        {users.map((user) => {
          const disabled = checkDisabled(user);

          return (
            <div
              key={user.userKey}
              className="flex items-center gap-3 bg-white p-3 rounded-lg shadow"
            >
              <div className="h-12 w-12 rounded-full overflow-hidden">
                <img
                  src={user.userPhotoUrl || avatar}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <h2 className="font-semibold text-sm">{user.userName}</h2>
                <p className="text-xs text-gray-500">
                  {moment(user.createdAt).calendar()}
                </p>
              </div>

              {disabled ? (
                <button className="h-9 w-9 bg-green-500 text-white rounded">
                  ✓
                </button>
              ) : (
                <button
                  onClick={() => handleFriendRequest(user)}
                  className="h-9 w-9 bg-violet-600 text-white rounded"
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
