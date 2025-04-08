import { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import GroupImg from "../../../../assets/HomeAssets/HomeRightAssets/GroupListAssets/g1.gif";
import { GetTimeNow } from "../../../utils/Moment.js";
import { getAuth } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  remove,
} from "firebase/database";
import moment from "moment";

const FriendRequest = () => {
  const db = getDatabase();
  const auth = getAuth();
  const [FriendRequestList, setFriendRequestList] = useState([]);

  useEffect(() => {
    const FriendRequestDbRef = ref(db, "FriendRequest/");
    onValue(FriendRequestDbRef, (snapshot) => {
      let FriendRequestBlankArr = [];
      snapshot.forEach((item) => {
        if (auth.currentUser.uid === item.val().whoRecivedFriendRequestUid) {
          FriendRequestBlankArr.push({
            ...item.val(),
            FriendRequestKey: item.key,
          });
        }
      });
      setFriendRequestList(FriendRequestBlankArr);
    });
  }, []);

  const rejectFriendRequest = (item = {}) => {
    const friendRequestRef = ref(db, "FriendRequest/" + item?.FriendRequestKey);
    remove(friendRequestRef)
      .then(() => {
        console.log("Friend request rejected");
      })
      .catch((error) => {
        console.error("Error rejecting request:", error);
      });
  };

  const acceptFriendRequest = (item = {}) => {
    const FriendRef = ref(db, "Friends/");
    set(push(FriendRef), {
      ...item,
      createdAt: GetTimeNow(),
      whoRecivedFriendRequestUserKey: null,
    })
      .then(() => {
        const friendRequestRef = ref(db, "FriendRequest/" + item?.FriendRequestKey);
        remove(friendRequestRef);
      })
      .catch((error) => {
        console.error("Error accepting request:", error);
      });
  };

  return (
    <div className="w-[320px] bg-blue-200 rounded-xl shadow-md p-4 max-h-[500px] overflow-hidden flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-lg">Friend Request</h1>
        <span className="text-sm bg-sky-600 text-white px-3 py-1 rounded-full">
          {FriendRequestList?.length}
        </span>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide max-h-[400px]">
        {FriendRequestList?.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-white p-3 rounded-lg shadow hover:bg-gray-100"
          >
            <div className="w-[50px] h-[50px] rounded-full bg-gray-200 flex items-center justify-center">
              <img
                src={item.whoSendFriendRequestProfilePicture || GroupImg}
                alt="Friend"
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            <div className="flex-1 px-3">
              <h1 className="font-semibold text-base">
                {item.whoSendFriendRequestUid === auth.currentUser.uid
                  ? item.whoRecivedFriendRequestName
                  : item.whoSendFriendRequestName}
              </h1>
              <p className="text-sm text-gray-600">
                {moment(item.createdAt).fromNow()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="h-9 w-16 bg-violet-600 text-white text-sm font-semibold rounded-md"
                onClick={() => acceptFriendRequest(item)}
              >
                Accept
              </button>
              <button
                className="h-9 w-16 bg-red-500 text-white text-sm font-semibold rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  rejectFriendRequest(item);
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendRequest;
