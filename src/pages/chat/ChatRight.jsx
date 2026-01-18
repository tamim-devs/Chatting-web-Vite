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
  const sendMessage = async (msgOverride = null) => {
    if (!msgOverride && !inputValue && !image) return;

    let imageURL = "";
    if (image) imageURL = await uploadToCloudinary(image);

    await push(ref(db, "singleMsg"), {
      whoSendMsgUId: auth.currentUser.uid,
      whoRecivedMsgUid: friendsItem.id,
      msg: msgOverride || inputValue,
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
            className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded z-50"
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
      <div className="fixed top-0 left-0 right-0 z-20 flex items-center gap-3 p-3 border-b bg-white">
        <button
          onClick={() => dispatch(clearFriend())}
          className="md:hidden text-xl"
        >
          <IoArrowBack />
        </button>

        <img
          src={friendsItem.profile_picture || avatar}
          className="w-10 h-10 rounded-full"
        />

        <h3 className="font-semibold text-sm truncate flex-1">
          {friendsItem.name}
        </h3>

        <div className="flex gap-4 text-xl">
          <FaVideo
            className="cursor-pointer"
            onClick={() => {
              setMeetRoom(roomId);
              sendMessage(`video://${roomId}`);
            }}
          />
          <FaPhoneAlt
            className="cursor-pointer"
            onClick={() => {
              setAudioRoom(roomId);
              sendMessage(`audio://${roomId}`);
            }}
          />
        </div>
      </div>

      {/* ================= MESSAGE ================= */}
      <div className="flex-1 overflow-y-auto px-3 py-4 pt-[70px] pb-[120px] space-y-2">
        {allMsg.map((m) => (
          <div
            key={m.key}
            className={`max-w-[80%] ${
              m.whoSendMsgUId === auth.currentUser.uid
                ? "ml-auto text-right"
                : ""
            }`}
          >
            {m.msg?.startsWith("video://") ? (
              <button
                onClick={() =>
                  setMeetRoom(m.msg.replace("video://", ""))
                }
                className="bg-green-600 text-white px-4 py-2 rounded-2xl text-sm"
              >
                📹 Join Video Call
              </button>
            ) : m.msg?.startsWith("audio://") ? (
              <button
                onClick={() =>
                  setAudioRoom(m.msg.replace("audio://", ""))
                }
                className="bg-purple-600 text-white px-4 py-2 rounded-2xl text-sm"
              >
                🎧 Join Audio Call
              </button>
            ) : (
              m.msg && (
                <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm">
                  {m.msg}
                </div>
              )
            )}

            <p className="text-[10px] text-gray-400 mt-1">
              {moment(m.createdAt).fromNow()}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ================= INPUT ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-2">
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
            className="flex-1 bg-gray-100 px-4 py-2 rounded-full"
            placeholder="Type message..."
          />

          <button
            onClick={() => sendMessage()}
            className="bg-blue-600 text-white p-3 rounded-full"
          >
            <IoIosSend />
          </button>
        </div>
      </div>

      {showEmoji && (
        <div className="absolute bottom-[70px] left-2 z-50">
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
  );
};

export default ChatRight;
