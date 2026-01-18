import React, { useEffect, useState, useRef } from "react";
import avatar from "../../../src/assets/chat/avatar.png";
import { IoIosSend } from "react-icons/io";
import { CiFaceSmile } from "react-icons/ci";
import { FaCameraRetro, FaPhoneAlt, FaVideo } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useSelector, useDispatch } from "react-redux";
import { push, ref, onValue } from "firebase/database";
import { db, auth } from "../../configuration/firebaseConfig";
import moment from "moment";
import { clearFriend } from "../../Features/FriendSlice/FriendSlice";
import { uploadToCloudinary } from "../../utility/cloudinaryUpload";
import AudioCall from "../../meet/AudioCall";

const ChatRight = () => {
  const dispatch = useDispatch();
  const bottomRef = useRef(null);
  const { friendsItem } = useSelector((state) => state.friendStore);

  const [inputValue, setInputValue] = useState("");
  const [allMsg, setAllMsg] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);

  const [meetRoom, setMeetRoom] = useState(null);
  const [audioRoom, setAudioRoom] = useState(null);

  const roomId = `${auth.currentUser.uid}-${friendsItem?.id}`;

  useEffect(() => {
    if (!friendsItem?.id) return;

    const msgRef = ref(db, "singleMsg");
    onValue(msgRef, (snap) => {
      let arr = [];
      snap.forEach((item) => {
        const d = item.val();
        if (
          (d.whoSendMsgUId === auth.currentUser.uid &&
            d.whoRecivedMsgUid === friendsItem.id) ||
          (d.whoSendMsgUId === friendsItem.id &&
            d.whoRecivedMsgUid === auth.currentUser.uid)
        ) {
          arr.push({ ...d, key: item.key });
        }
      });
      setAllMsg(arr);
    });
  }, [friendsItem?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMsg]);

  if (!friendsItem?.id) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        👈 Select a friend
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen w-full bg-white">

      {/* HEADER */}
 <div className="fixed top-0 z-20
    flex items-center
    px-2 sm:px-4
    py-2 sm:py-3
    gap-2 sm:gap-3
     bg-white w-full">
     <div
  className="
      sticky top-0 z-20
    flex items-center
    px-2 sm:px-4
    py-2 sm:py-3
    gap-2 sm:gap-3
     bg-white
  "
>
  {/* Back button (mobile only) */}
  <button
    onClick={() => dispatch(clearFriend())}
    className="md:hidden text-lg sm:text-xl flex-shrink-0"
  >
    <IoArrowBack />
  </button>

  {/* Avatar */}
  <img
    src={friendsItem.profile_picture || avatar}
    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
  />

  {/* Name */}
  <span
    className="
      font-semibold
      text-sm sm:text-base
      truncate
      flex-1
      min-w-0
    "
  >
    {friendsItem.name}
  </span>

  {/* Actions */}
  <div className="flex gap-3 sm:gap-4 text-lg sm:text-xl flex-shrink-0">
    <FaVideo className="cursor-pointer" />
    <FaPhoneAlt className="cursor-pointer" />
  </div>
</div>
 </div>


      {/* MESSAGE */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 pt-[70px] pb-[110px] space-y-2">
        {allMsg.map((m) => (
          <div
            key={m.key}
            className={`max-w-[85%] sm:max-w-[75%] ${
              m.whoSendMsgUId === auth.currentUser.uid
                ? "ml-auto text-right"
                : ""
            }`}
          >
            {m.msg && (
              <div className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-2xl text-sm break-words">
                {m.msg}
              </div>
            )}

            <p className="text-[10px] text-gray-400 mt-1">
              {moment(m.createdAt).fromNow()}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-2 sm:p-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setShowEmoji(!showEmoji)}>
            <CiFaceSmile />
          </button>

          <label>
            <FaCameraRetro />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </label>

          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-gray-100 px-3 sm:px-4 py-2 rounded-full text-sm"
            placeholder="Type message..."
          />

          <button
            className="bg-blue-600 text-white p-2 sm:p-3 rounded-full"
          >
            <IoIosSend />
          </button>
        </div>
      </div>

      {showEmoji && (
        <div className="absolute bottom-[80px] left-2 sm:left-4 z-50">
          <EmojiPicker height={300} width={280} />
        </div>
      )}
    </div>
  );
};

export default ChatRight;
