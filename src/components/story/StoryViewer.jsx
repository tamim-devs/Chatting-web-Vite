import { useEffect, useState, useRef } from "react";
import { ref, update, push, onValue, get } from "firebase/database";
import { db, auth } from "../../configuration/firebaseConfig";

const StoryViewer = ({ storyGroups, startUserIndex, close }) => {
  const [userIndex, setUserIndex] = useState(startUserIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [reply, setReply] = useState("");
  const [seenUsers, setSeenUsers] = useState([]);
  const [showSeenBox, setShowSeenBox] = useState(false);

  const videoRef = useRef(null);

  const currentUser = storyGroups[userIndex];
  const story = currentUser?.stories[storyIndex];

  if (!story) return null;

  const isMyStory = story.uid === auth.currentUser.uid;

  /* ================= MARK SEEN ================= */
  useEffect(() => {
    if (!auth.currentUser || isMyStory) return;

    update(ref(db, `stories/${story.id}/views`), {
      [auth.currentUser.uid]: true,
    });
  }, [story]);

  /* ================= FETCH SEEN USERS ================= */
  useEffect(() => {
    if (!isMyStory) return;

    const viewRef = ref(db, `stories/${story.id}/views`);

    onValue(viewRef, async (snap) => {
      let arr = [];
      const views = snap.val() || {};

      for (let uid of Object.keys(views)) {
        const userSnap = await get(ref(db, `users/${uid}`));
        if (userSnap.exists()) {
          arr.push({
            uid,
            ...userSnap.val(),
          });
        }
      }

      setSeenUsers(arr);
    });
  }, [story]);

  /* ================= AUTO NEXT ================= */
  useEffect(() => {
    let timer;
    if (story.type === "image") {
      timer = setTimeout(nextStory, 7000);
    }
    return () => clearTimeout(timer);
  }, [storyIndex, userIndex]);

  /* ================= NEXT ================= */
  const nextStory = () => {
    if (storyIndex < currentUser.stories.length - 1) {
      setStoryIndex((p) => p + 1);
    } else if (userIndex < storyGroups.length - 1) {
      setUserIndex((p) => p + 1);
      setStoryIndex(0);
    } else {
      close();
    }
  };

  /* ================= PREV ================= */
  const prevStory = () => {
    if (storyIndex > 0) {
      setStoryIndex((p) => p - 1);
    } else if (userIndex > 0) {
      const prevUser = storyGroups[userIndex - 1];
      setUserIndex((p) => p - 1);
      setStoryIndex(prevUser.stories.length - 1);
    }
  };

  /* ================= SEND REPLY ================= */
  const sendReply = async () => {
    if (!reply.trim()) return;

    await push(ref(db, "singleMsg"), {
      whoSendMsgUId: auth.currentUser.uid,
      whoRecivedMsgUid: story.uid,
      msg: reply,
      storyReply: {
        storyId: story.id,
        storyImage: story.media,
        type: story.type,
      },
      createdAt: Date.now(),
    });

    setReply("");
    close();
  };

  return (
    <div className="fixed inset-0 bg-black z-[999] flex flex-col">

      {/* CLOSE */}
      <button
        onClick={close}
        className="absolute top-4 right-4 text-white text-2xl z-50"
      >
        ✕
      </button>

      {/* STORY */}
      <div className="flex-1 flex items-center justify-center relative">
        <div onClick={prevStory} className="absolute left-0 w-1/3 h-full z-10" />
        <div onClick={nextStory} className="absolute right-0 w-1/3 h-full z-10" />

        {story.type === "image" ? (
          <img
            src={story.media}
            className="max-h-[85vh] max-w-full object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            src={story.media}
            autoPlay
            playsInline
            controls
            onEnded={nextStory}
            className="max-h-[85vh] max-w-full"
          />
        )}
      </div>

      {/* ================= BOTTOM ================= */}
      <div className="p-4 bg-black/60 relative">

        {/* 🔥 MY STORY → SEEN LIST */}
        {isMyStory && (
          <>
            {/* TOGGLE BUTTON */}
            <button
              onClick={() => setShowSeenBox((p) => !p)}
              className="text-white text-sm flex items-center gap-2"
            >
              👁 Seen by {seenUsers.length}
              <span className="text-xs">{showSeenBox ? "▲" : "▼"}</span>
            </button>

            {/* SEEN BOX */}
            {showSeenBox && (
              <div
                className="
                  absolute bottom-14 left-1/2 -translate-x-1/2
                  w-[90%] sm:w-[360px]
                  max-h-[260px]
                  bg-white rounded-xl
                  shadow-xl
                  p-3
                  overflow-y-auto
                  z-50
                "
              >
                <p className="font-semibold text-sm mb-2">
                  Seen by {seenUsers.length}
                </p>

                {seenUsers.length === 0 && (
                  <p className="text-gray-400 text-sm">No views yet</p>
                )}

                <div className="space-y-2">
                  {seenUsers.map((u) => (
                    <div
                      key={u.uid}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <img
                        src={u.userPhotoUrl || u.userPhoto}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <p className="text-sm font-medium">
                        {u.userName || u.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 💬 OTHER STORY → REPLY */}
        {!isMyStory && (
          <div className="flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply to story..."
              className="flex-1 px-4 py-2 rounded-full outline-none"
            />
            <button
              onClick={sendReply}
              className="bg-blue-600 text-white px-4 rounded-full"
            >
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
