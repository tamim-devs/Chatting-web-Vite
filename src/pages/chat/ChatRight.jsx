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

/* ================= HELPER ================= */
const getMeetRoomFromText = (text) => {
  if (!text) return null;
  const match = text.match(/(https:\/\/meet\.jit\.si\/([a-zA-Z0-9-_]+))/);
  return match ? match[2] : null;
};

const ChatRight = ({ onBack }) => {

  const dispatch = useDispatch();
  const bottomRef = useRef(null);

  const { friendsItem } = useSelector((state) => state.friendStore);

  const [inputValue, setInputValue] = useState("");
  const [allMsg, setAllMsg] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);

  const [meetRoom, setMeetRoom] = useState(null);
  const [audioRoom, setAudioRoom] = useState(null);

  const roomId = friendsItem
    ? `${auth.currentUser.uid}-${friendsItem.id}`
    : null;

  /* ================= FETCH MESSAGE ================= */

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

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [allMsg]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async () => {

    if (!inputValue && !image) return;

    let imageURL = "";

    if (image) {
      imageURL = await uploadToCloudinary(image);
    }

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

    <div className="relative flex flex-col min-h-[calc(100vh-56px)] bg-gradient-to-b from-slate-50 to-white">

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
            allow="camera; microphone; fullscreen"
            className="w-full h-full border-0"
          />

        </div>
      )}

      {/* ================= AUDIO CALL ================= */}

      <AudioCall room={audioRoom} onEnd={() => setAudioRoom(null)} />

      {/* ================= HEADER ================= */}

      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">

        <div className="flex items-center gap-3 px-3 py-3">

          <button
            onClick={() => {
              dispatch(clearFriend());
              if (onBack) onBack();
            }}
            className="md:hidden text-xl p-2 rounded-full hover:bg-gray-100"
            aria-label="Back to chats"
          >
            <IoArrowBack />
          </button>

          <img
            src={friendsItem.profile_picture || avatar}
            className="w-10 h-10 rounded-full"
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{friendsItem.name}</h3>
            <p className="text-xs text-gray-500">Active now</p>
          </div>

          <div className="flex gap-4 text-xl text-slate-600">

            <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={() => setMeetRoom(roomId)}
            >
              <FaVideo />
            </button>

           
          </div>

        </div>

      </div>

      {/* ================= MESSAGE AREA ================= */}

      <div className="flex-1 overflow-y-auto px-3 pt-[70px] pb-28 space-y-3">

        {allMsg.map((m) => {

          const room = getMeetRoomFromText(m.msg);
          const isMe = m.whoSendMsgUId === auth.currentUser.uid;

          return (

            <div
              key={m.key}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >

              <div className="max-w-[80%] flex flex-col gap-1">

                {!isMe && (
                  <img
                    src={friendsItem.profile_picture || avatar}
                    className="w-7 h-7 rounded-full"
                  />
                )}

                <div
                  className={`rounded-2xl p-3 text-sm shadow ${
                    isMe
                      ? "bg-blue-600 text-white"
                      : "bg-white border text-slate-800"
                  }`}
                >

                  {m.image && (
                    <img
                      src={m.image}
                      className="rounded-xl mb-2 max-w-[220px]"
                    />
                  )}

                  {m.msg && room ? (
                    <button
                      onClick={() => setMeetRoom(room)}
                      className="bg-green-600 text-white px-3 py-2 rounded"
                    >
                      📞 Join Call
                    </button>
                  ) : (
                    m.msg
                  )}

                </div>

                <span className="text-[10px] text-gray-400">
                  {moment(m.createdAt).fromNow()}
                </span>

              </div>

            </div>

          );
        })}

        <div ref={bottomRef}></div>

      </div>

      {/* ================= INPUT ================= */}

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t px-3 py-2">

        {showEmoji && (
          <div className="absolute bottom-16 left-2">
            <EmojiPicker
              onEmojiClick={(e) =>
                setInputValue((prev) => prev + e.emoji)
              }
            />
          </div>
        )}

        <div className="flex items-center gap-2">

          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="text-2xl text-gray-500"
          >
            <CiFaceSmile />
          </button>

          <label className="cursor-pointer text-xl text-gray-500">
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
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type message..."
            className="flex-1 rounded-full border px-4 py-2 text-sm outline-none"
          />

          <button
            onClick={sendMessage}
            className="text-blue-600 text-2xl"
          >
            <IoIosSend />
          </button>

        </div>

      </div>

    </div>

  );
};

export default ChatRight;