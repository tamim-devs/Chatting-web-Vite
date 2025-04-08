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
  const [sentRequests, setSentRequests] = useState({}); // Track sent requests

  // Load all users except current user
  useEffect(() => {
    const userRef = ref(db, "users/");
    onValue(userRef, (snapshot) => {
      let userArr = [];
      snapshot.forEach((item) => {
        const user = item.val();
        if (user.userUid !== auth.currentUser?.uid) {  // Use user.userUid here
          userArr.push({
            ...user,
            userKey: item.key,
          });
        }
      });
      setUsers(userArr);
    });
  }, []);

  // Load friend requests to check if request is already sent/received
  useEffect(() => {
    const reqRef = ref(db, "FriendRequest/");
    onValue(reqRef, (snapshot) => {
      let reqArr = [];
      snapshot.forEach((item) => {
        reqArr.push(item.val());
      });
      setFriendRequests(reqArr);
    });
  }, []);

  // Load friends to avoid showing request button if already friends
  useEffect(() => {
    const friendRef = ref(db, "Friends/");
    onValue(friendRef, (snapshot) => {
      let friendArr = [];
      snapshot.forEach((item) => {
        friendArr.push(item.val());
      });
      setFriends(friendArr);
    });
  }, []);

  const handleFriendRequest = (user) => {
    // Debugging log to inspect the user object
    console.log("User object:", user);

    // Check if the user object has UID
    if (!user.userUid) {  // Check for user.userUid here
      console.error("User UID is missing! User object:", user);
      return;
    }

    const FriendRequestRef = ref(db, "FriendRequest/");
    const newRequest = {
      whoSendFriendRequestName: auth.currentUser.displayName,
      whoSendFriendRequestEmail: auth.currentUser.email,
      whoSendFriendRequestUid: auth.currentUser.uid,
      whoSendFriendRequestProfilePicture: auth.currentUser.photoURL || null,
      whoRecivedFriendRequestUid: user.userUid, // Use user.userUid here
      whoRecivedFriendRequestName: user.userName,
      whoRecivedFriendRequestEmail: user.userEmail,
      whoRecivedFriendRequestUserKey: user.userKey,
      whoRecivedFriendRequestProfile_picture: user.userPhotoUrl,
      createdAt: Date.now(),
    };

    // Debugging log to inspect newRequest
    console.log("New friend request:", newRequest);

    // Send friend request to Firebase
    push(FriendRequestRef, newRequest)
      .then(() => {
        console.log("Friend request sent!");
        setSentRequests((prevState) => ({
          ...prevState,
          [user.userKey]: true, // Update state to reflect that request was sent
        }));
      })
      .catch((err) => console.error("Request failed", err));
  };

  // Check if user is already requested or already friends
  const checkIsRequestedOrFriend = (user) => {
    const currentUid = auth.currentUser.uid;

    // Check if the current user has already sent a request to the user or vice versa
    const isRequested = friendRequests.some(
      (req) =>
        (req.whoSendFriendRequestUid === currentUid &&
          req.whoRecivedFriendRequestUid === user.userUid) ||  // Use user.userUid here
        (req.whoSendFriendRequestUid === user.userUid &&
          req.whoRecivedFriendRequestUid === currentUid)  // Use user.userUid here
    );

    // Check if the user is already a friend
    const isFriend = friends.some(
      (fr) =>
        (fr.whoSendFriendRequestUid === currentUid &&
          fr.whoRecivedFriendRequestUid === user.userUid) ||  // Use user.userUid here
        (fr.whoSendFriendRequestUid === user.userUid &&
          fr.whoRecivedFriendRequestUid === currentUid)  // Use user.userUid here
    );

    // Return true if already requested or already friends or request already sent
    return isRequested || isFriend || sentRequests[user.userKey];
  };

  return (
    <div className="w-full sm:w-[320px] bg-blue-200 rounded-xl shadow-md p-4 max-h-[500px] overflow-hidden flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg">User List</h1>
        <span className="text-sm bg-sky-600 text-white px-3 py-1 rounded-full">
          {users.length}
        </span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide max-h-[400px]">
        {users.map((user) => {
          const alreadySentOrFriend = checkIsRequestedOrFriend(user);

          return (
            <div
              key={user.userKey}
              className="flex items-center justify-between bg-white p-3 rounded-lg shadow hover:bg-blue-50 transition duration-300"
            >
              <div className="h-[50px] w-[50px] rounded-full overflow-hidden bg-gray-200">
                <img
                  src={user.userPhotoUrl || avatar}
                  alt="User"
                  className="h-full w-full object-cover rounded-full"
                />
              </div>

              <div className="flex-1 px-3 overflow-hidden">
                <h1 className="font-semibold text-base truncate">
                  {user.userName || "Unknown User"}
                </h1>
                <p className="text-sm text-gray-600 truncate">
                  {moment(user.createdAt).calendar()}
                </p>
              </div>

              {alreadySentOrFriend ? (
                <button
                  disabled
                  className="h-9 w-9 bg-green-500 text-white text-xl font-bold rounded-md flex items-center justify-center"
                >
                  ✓
                </button>
              ) : (
                <button
                  onClick={() => handleFriendRequest(user)}
                  className="h-9 w-9 bg-violet-600 text-white text-xl font-bold rounded-md flex items-center justify-center hover:bg-violet-700 transition"
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
