import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../configuration/firebaseConfig";
import StoryViewer from "./StoryViewer";
import { groupStoriesByUser } from "../utils/groupStories";

const StoriesRow = () => {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

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
      setGroups(groupStoriesByUser(arr));
    });
  }, []);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto px-4 py-3 bg-white rounded-xl shadow">
        {groups.map((user, i) => (
          <div
            key={user.uid}
            onClick={() => {
              setStartIndex(i);
              setOpen(true);
            }}
            className="flex flex-col items-center cursor-pointer min-w-[70px]"
          >
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400">
              <img
                src={user.userPhoto}
                className="w-16 h-16 rounded-full object-cover border-2 border-white"
              />
            </div>
            <p className="text-xs mt-1 truncate w-16 text-center">
              {user.userName}
            </p>
          </div>
        ))}
      </div>

      {open && (
        <StoryViewer
          storyGroups={groups}
          startUserIndex={startIndex}
          close={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default StoriesRow;
