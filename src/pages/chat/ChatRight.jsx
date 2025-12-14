import React, { useEffect, useState, useRef } from "react";
import avatar from "../../../src/assets/chat/avatar.png";
import { IoIosSend } from "react-icons/io";
import { CiFaceSmile } from "react-icons/ci";
import { FaCameraRetro } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { MdEdit } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import { useSelector, useDispatch } from "react-redux";
import { push, ref, onValue, update } from "firebase/database";
import { db, auth } from "../../configuration/firebaseConfig";
import moment from "moment";
import { clearFriend } from "../../Features/FriendSlice/FriendSlice";
import { uploadToCloudinary } from "../../utility/cloudinaryUpload";

const ChatRight = () => {
  const dispatch = useDispatch();
  const bottomRef = useRef(null);

  const { friendsItem } = useSelector((state) => state.friendStore);

  const [inputValue, setInputValue] = useState("");
  const [allMsg, setAllMsg] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);

  const [editMsgId, setEditMsgId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  /* ===== FETCH MESSAGES ===== */
  useEffect(() => {
    if (!friendsItem?.id) return;

    const msgRef = ref(db, "singleMsg");
    onValue(msgRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
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

  /* ===== AUTO SCROLL ===== */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMsg]);

  /* ===== SEND / EDIT MESSAGE ===== */
  const sendMessage = async () => {
    if ((!inputValue && !image) || !friendsItem?.id) return;

    // ✏️ EDIT MODE
    if (isEditing && editMsgId) {
      await update(ref(db, `singleMsg/${editMsgId}`), {
        msg: inputValue,
        edited: true,
      });
      setInputValue("");
      setIsEditing(false);
      setEditMsgId(null);
      return;
    }

    // 🖼 IMAGE UPLOAD
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

  /* ===== EMPTY STATE ===== */
  if (!friendsItem?.id) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        👈 Select a friend to start chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">

      {/* ===== HEADER ===== */}
      <div className="flex items-center gap-3 p-4 border-b sticky top-0 bg-white z-30">
        <button
          onClick={() => dispatch(clearFriend())}
          className="md:hidden text-xl"
        >
          <IoArrowBack />
        </button>

        <img
          src={friendsItem.profile_picture || avatar}
          className="w-10 h-10 rounded-full object-cover"
        />
        <h3 className="font-semibold">{friendsItem.name}</h3>
      </div>

      {/* ===== MESSAGE LIST ===== */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-[120px]">
        {allMsg.map((m) => (
          <div
            key={m.key}
            className={`mb-4 max-w-[75%] ${
              m.whoSendMsgUId === auth.currentUser.uid
                ? "ml-auto text-right"
                : ""
            }`}
          >
            {m.image && (
              <img
                src={m.image}
                className="max-w-[220px] sm:max-w-[300px] rounded-xl mb-2"
              />
            )}

            {m.msg && (
              <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl break-words">
                {m.msg}
                {m.edited && (
                  <span className="block text-[10px] opacity-70 mt-1">
                    edited
                  </span>
                )}
              </div>
            )}

            {m.whoSendMsgUId === auth.currentUser.uid && (
              <button
                onClick={() => {
                  setInputValue(m.msg);
                  setEditMsgId(m.key);
                  setIsEditing(true);
                }}
                className="text-xs text-gray-400 mt-1 flex items-center gap-1"
              >
                <MdEdit /> Edit
              </button>
            )}

            <p className="text-xs text-gray-400 mt-1">
              {moment(m.createdAt).fromNow()}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ===== INPUT ===== */}
      <div className="sticky bottom-0 bg-white border-t px-2 py-2 z-40">
        <div className="relative flex items-center gap-2">

          <button
            onClick={() => setShowEmoji((p) => !p)}
            className="text-2xl px-2"
          >
            <CiFaceSmile />
          </button>

          <label className="text-2xl px-2 cursor-pointer">
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
            onFocus={() => setShowEmoji(false)}
            className="flex-1 bg-gray-100 px-4 py-3 rounded-full outline-none"
            placeholder={isEditing ? "Edit message..." : "Type message..."}
          />

          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white p-3 rounded-full"
          >
            <IoIosSend />
          </button>

          {showEmoji && (
            <div className="absolute bottom-full left-0 mb-2 z-50">
              <EmojiPicker
                height={320}
                onEmojiClick={(e) =>
                  setInputValue((prev) => prev + e.emoji)
                }
              />
            </div>
          )}
        </div>

        {image && (
          <div className="mt-2 flex items-center gap-2">
            <img
              src={URL.createObjectURL(image)}
              className="w-14 h-14 object-cover rounded-lg"
            />
            <button
              onClick={() => setImage(null)}
              className="text-sm text-red-500"
            >
              remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRight;
