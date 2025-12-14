import { useEffect, useState } from "react";
import { ref, update, push } from "firebase/database";
import { db, auth } from "../../configuration/firebaseConfig";

const StoryViewer = ({ story, close }) => {
  const [reply, setReply] = useState("");

  // 👀 mark seen
  useEffect(() => {
    if (!story?.id || !auth.currentUser) return;

    update(ref(db, `stories/${story.id}/views`), {
      [auth.currentUser.uid]: true,
    });
  }, [story]);

  // 📩 SEND STORY REPLY
  const sendStoryReply = async () => {
    if (!reply.trim()) return;

    await push(ref(db, "singleMsg"), {
      whoSendMsgUId: auth.currentUser.uid,
      whoRecivedMsgUid: story.uid, // 👈 story owner
      msg: reply,
      storyReply: {
        storyId: story.id,
        storyImage: story.image,
      },
      createdAt: Date.now(),
    });

    setReply("");
    close();
  };

  return (
    <div className="fixed inset-0 bg-black z-[999] flex flex-col justify-center items-center">

      {/* CLOSE */}
      <button
        onClick={close}
        className="absolute top-5 right-5 text-white text-2xl"
      >
        ✕
      </button>

      {/* STORY IMAGE */}
      <img
        src={story.image}
        className="max-h-[80vh] max-w-full object-contain mb-4"
      />

      {/* REPLY INPUT */}
      <div className="flex w-full max-w-md px-4 gap-2">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Reply to story..."
          className="flex-1 px-4 py-2 rounded-full outline-none"
        />
        <button
          onClick={sendStoryReply}
          className="bg-blue-600 text-white px-4 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default StoryViewer;
