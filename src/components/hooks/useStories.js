// src/hooks/useStories.js
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../configuration/firebaseConfig";

export const useStories = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const storyRef = ref(db, "stories");

    onValue(storyRef, (snapshot) => {
      let arr = [];
      const now = Date.now();

      snapshot.forEach((item) => {
        const d = item.val();

        // ⏱️ only valid stories
        if (d.expireAt > now) {
          arr.push({ ...d, id: item.key });
        }
      });

      setStories(arr);
    });
  }, []);

  return stories;
};
