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

/* ================= HELPER: DETECT JITSI LINK ================= */
const getMeetRoomFromText = (text) => {
  if (!text) return null;
  const match = text.match(
    /(https:\/\/meet\.jit\.si\/([a-zA-Z0-9-_]+))/
  );
  return match ? match[2] : null;
};

const ChatRight = () => {
  const dispatch = useDispatch();
  const bottomRef = useRef(null);
  const { friendsItem } = useSelector((state) => state.friendStore);

  const [inputValue, setInputValue] = useState("");
  const [allMsg, setAllMsg] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);

  const [meetRoom, setMeetRoom] = useState(null);   // video
  const [audioRoom, setAudioRoom] = useState(null); // audio

  const roomId = friendsItem
    ? `${auth.currentUser.uid}-${friendsItem.id}`
    : null;

  /* ================= FETCH CHAT ================= */
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

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if (!inputValue && !image) return;

    let imageURL = "";
    if (image) imageURL = await uploadToCloudinary(image);

    await push(ref(db, "singleMsg"), {
      whoSendMsgUId: auth.currentUser.uid,
      whoRecivedMsgUid: friendsItem.id,
      msg: inputValue,
      image: imageURL,
      createdAt: Date.now(),
    });

    setInputValue("");
    setImage(null);
    setShowEmoji(false);
  };

  if (!friendsItem?.id) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        👈 Select a friend
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-[100dvh] bg-white">

      {/* ================= VIDEO CALL ================= */}
      {meetRoom && (
        <div className="fixed inset-0 z-[999] bg-black">
          <button
            onClick={() => setMeetRoom(null)}
            className="absolute top-3 right-3 z-50 bg-red-600 text-white px-3 py-1 rounded"
          >
            End Call ✖
          </button>
          <iframe
            src={`https://meet.jit.si/${meetRoom}`}
            allow="camera; microphone; fullscreen; display-capture"
            className="w-full h-full border-0"
          />
        </div>
      )}

      {/* ================= AUDIO CALL ================= */}
      <AudioCall room={audioRoom} onEnd={() => setAudioRoom(null)} />

      {/* ================= HEADER ================= */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-white border-b">
        <div className="flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-3">
          <button
            onClick={() => dispatch(clearFriend())}
            className="md:hidden text-xl flex-shrink-0"
          >
            <IoArrowBack />
          </button>

          <img
            src={friendsItem.profile_picture || avatar}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full"
          />

          <h3 className="font-semibold text-sm sm:text-base truncate flex-1">
            {friendsItem.name}
          </h3>

          <div className="flex gap-4 text-xl">
            <FaVideo
              className="cursor-pointer"
              onClick={() => setMeetRoom(roomId)}
            />
            <FaPhoneAlt
              className="cursor-pointer"
              onClick={() => setAudioRoom(roomId)}
            />
          </div>
        </div>
      </div>

      {/* ================= MESSAGE ================= */}
      <div className="flex-1 overflow-y-auto px-3 py-4 pt-[72px] pb-[96px] space-y-2">
        {allMsg.map((m) => {
          const room = getMeetRoomFromText(m.msg);

          return (
            <div
              key={m.key}
              className={`max-w-[80%] ${
                m.whoSendMsgUId === auth.currentUser.uid
                  ? "ml-auto text-right"
                  : ""
              }`}
            >
              {m.image && (
                <img
                  src={m.image}
                  className="max-w-[220px] rounded-xl mb-1"
                />
              )}

              {m.msg && room ? (
                <button
                  onClick={() => setMeetRoom(room)}
                  className="bg-green-600 text-white px-4 py-2 rounded-2xl text-sm"
                >
                  📞 Join Call
                </button>
              ) : (
                m.msg && (
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm break-words">
                    {m.msg}
                  </div>
                )
              )}

              <p className="text-[10px] text-gray-400 mt-1">
                {moment(m.createdAt).fromNow()}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ================= INPUT ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t p-2">
        <div className="flex items-center gap-2 relative">
          <button onClick={() => setShowEmoji(!showEmoji)}>
            <CiFaceSmile />
          </button>

          <label className="cursor-pointer">
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
            className="flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm"
            placeholder="Type message..."
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white p-3 rounded-full"
          >
            <IoIosSend />
          </button>

          {showEmoji && (
            <div className="absolute bottom-[60px] left-0 z-50">
              <EmojiPicker
                height={300}
                width={280}
                onEmojiClick={(e) =>
                  setInputValue((prev) => prev + e.emoji)
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRight;
