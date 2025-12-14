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
import StoryViewer from "../../components/story/StoryViewer";

const ChatRight = () => {
  const dispatch = useDispatch();
  const bottomRef = useRef(null);
  const { friendsItem } = useSelector((state) => state.friendStore);

  const [inputValue, setInputValue] = useState("");
  const [allMsg, setAllMsg] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editMsgId, setEditMsgId] = useState(null);

  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);

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

  /* ================= FETCH STORIES ================= */
  useEffect(() => {
    const storyRef = ref(db, "stories");
    onValue(storyRef, (snap) => {
      let arr = [];
      snap.forEach((item) => {
        const d = item.val();
        if (Date.now() < d.expireAt) {
          arr.push({ ...d, id: item.key });
        }
      });
      setStories(arr);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMsg]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if ((!inputValue && !image) || !friendsItem?.id) return;

    if (isEditing && editMsgId) {
      await update(ref(db, `singleMsg/${editMsgId}`), {
        msg: inputValue,
        edited: true,
      });
      setIsEditing(false);
      setEditMsgId(null);
      setInputValue("");
      return;
    }

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

  const friendStory = stories.find((s) => s.uid === friendsItem.id);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3 p-4 border-b">
        <button onClick={() => dispatch(clearFriend())} className="md:hidden">
          <IoArrowBack />
        </button>

        <div
          onClick={() => friendStory && setActiveStory(friendStory)}
          className={`p-[2px] rounded-full ${
            friendStory ? "bg-gradient-to-tr from-pink-500 to-yellow-400" : ""
          }`}
        >
          <img
            src={friendsItem.profile_picture || avatar}
            className="w-10 h-10 rounded-full object-cover bg-white"
          />
        </div>

        <h3 className="font-semibold">{friendsItem.name}</h3>
      </div>

      {/* ================= MESSAGE ================= */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
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
              <img src={m.image} className="max-w-[240px] rounded-xl mb-2" />
            )}

           {m.storyReply && (
  <div className="mb-2 p-2 border-l-4 border-pink-500 bg-pink-50 rounded">
    <p className="text-xs text-gray-500 mb-1">
      Replied to a story
    </p>
    <img
      src={m.storyReply.storyImage}
      className="w-32 rounded-lg"
    />
  </div>
)}


            {m.msg && (
              <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl">
                {m.msg}
                {m.edited && (
                  <span className="block text-[10px] opacity-70">edited</span>
                )}
              </div>
            )}

            <p className="text-xs text-gray-400 mt-1">
              {moment(m.createdAt).fromNow()}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ================= INPUT ================= */}
      <div className="border-t p-2">
        <div className="flex items-center gap-2 relative">
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
            onClick={sendMessage}
            className="bg-blue-600 text-white p-3 rounded-full"
          >
            <IoIosSend />
          </button>

          {showEmoji && (
            <div className="absolute bottom-full left-0 z-50">
              <EmojiPicker
                height={320}
                onEmojiClick={(e) =>
                  setInputValue((p) => p + e.emoji)
                }
              />
            </div>
          )}
        </div>
      </div>

      {activeStory && (
        <StoryViewer
          story={activeStory}
          close={() => setActiveStory(null)}
        />
      )}
    </div>
  );
};

export default ChatRight;
