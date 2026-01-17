import React, { useEffect, useState, useRef } from "react";
import avatar from "../../../src/assets/chat/avatar.png";
import { IoIosSend } from "react-icons/io";
import { CiFaceSmile } from "react-icons/ci";
import { FaCameraRetro } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useSelector, useDispatch } from "react-redux";
import { push, ref, onValue } from "firebase/database";
import { db, auth } from "../../configuration/firebaseConfig";
import moment from "moment";
import { clearFriend } from "../../Features/FriendSlice/FriendSlice";
import { uploadToCloudinary } from "../../utility/cloudinaryUpload";
import StoryViewer from "../../components/story/StoryViewer";

/* ================= GROUP STORIES ================= */
const groupStoriesByUser = (stories) => {
  const map = {};
  stories.forEach((s) => {
    if (!map[s.uid]) {
      map[s.uid] = {
        uid: s.uid,
        userName: s.userName,
        userPhoto: s.userPhoto,
        stories: [],
      };
    }
    map[s.uid].stories.push(s);
  });
  return Object.values(map);
};

const ChatRight = () => {
  const dispatch = useDispatch();
  const bottomRef = useRef(null);
  const { friendsItem } = useSelector((state) => state.friendStore);

  const [inputValue, setInputValue] = useState("");
  const [allMsg, setAllMsg] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [image, setImage] = useState(null);

  /* ===== STORY STATE ===== */
  const [storyGroups, setStoryGroups] = useState([]);
  const [openStory, setOpenStory] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

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
      setStoryGroups(groupStoriesByUser(arr));
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMsg]);

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async () => {
    if ((!inputValue && !image) || !friendsItem?.id) return;

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

  /* ================= FRIEND STORY INDEX ================= */
  const friendStoryIndex = storyGroups.findIndex(
    (g) => g.uid === friendsItem.id
  );

  return (
    <div className="flex flex-col h-full bg-white">

      {/* ================= HEADER ================= */}
      <div className="fixed top-0 left-0 w-full z-20 flex items-center gap-3 p-3 border-b bg-white">
        <button
          onClick={() => dispatch(clearFriend())}
          className="md:hidden text-xl"
        >
          <IoArrowBack />
        </button>

        <div
          onClick={() => {
            if (friendStoryIndex !== -1) {
              setStartIndex(friendStoryIndex);
              setOpenStory(true);
            }
          }}
          className={`p-[2px] rounded-full ${
            friendStoryIndex !== -1
              ? "bg-gradient-to-tr from-pink-500 to-yellow-400"
              : ""
          }`}
        >
          <img
            src={friendsItem.profile_picture || avatar}
            className="w-10 h-10 rounded-full object-cover bg-white"
          />
        </div>

        <h3 className="font-semibold text-sm truncate">
          {friendsItem.name}
        </h3>
      </div>

      {/* ================= MESSAGE ================= */}
      <div className="flex-1 overflow-y-auto px-3 py-4 pt-[70px] space-y-2">
        {allMsg.map((m) => (
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

            {m.msg && (
              <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm break-words">
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

      {/* ================= INPUT ================= */}
      <div className="border-t p-2 bg-white">
        <div className="flex items-center gap-2 relative">
          <button onClick={() => setShowEmoji(!showEmoji)} className="text-xl">
            <CiFaceSmile />
          </button>

          <label className="text-xl">
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
                  setInputValue((p) => p + e.emoji)
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* ================= STORY VIEWER ================= */}
      {openStory && (
        <StoryViewer
          storyGroups={storyGroups}
          startUserIndex={startIndex}
          close={() => setOpenStory(false)}
        />
      )}
    </div>
  );
};

export default ChatRight;
