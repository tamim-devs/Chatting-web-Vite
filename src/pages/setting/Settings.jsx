import React, { useEffect, useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import {
  getDatabase,
  ref,
  update,
  onValue,
  remove,
  push,
} from "firebase/database";
import { SlCloudUpload } from "react-icons/sl";
import { MdDelete } from "react-icons/md";
import moment from "moment";
import { uploadToCloudinary } from "../../utility/cloudinaryUpload";

import Friends from "../../components/HomeComponents/HomeRight/Friends/Friends";
import UserList from "../../components/HomeComponents/HomeRight/UserList/UserList";
import FriendRequest from "../../components/HomeComponents/HomeRight/FriendRequest/FriendRequest";
import { NavLink } from "react-router-dom";

const Settings = () => {
  const auth = getAuth();
  const db = getDatabase();

  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [storyUploading, setStoryUploading] = useState(false);
  const [blockedList, setBlockedList] = useState([]);
  const [myStories, setMyStories] = useState([]);

  /* ================= AUTH ================= */
  useEffect(() => {
    setUser(auth.currentUser);
    setDisplayName(auth.currentUser?.displayName || "");
  }, []);

  const handleDisplayNameSave = async () => {
    if (!user || !displayName.trim()) return;

    setSavingName(true);
    await updateProfile(user, { displayName: displayName.trim() });
    await update(ref(db, `users/${user.uid}`), {
      displayName: displayName.trim(),
    });
    setUser({ ...user, displayName: displayName.trim() });
    setSavingName(false);
  };

  /* ================= STORIES ================= */
  useEffect(() => {
    onValue(ref(db, "stories"), (snap) => {
      let arr = [];
      snap.forEach((item) => {
        const d = item.val();
        if (d.uid === auth.currentUser.uid && Date.now() < d.expireAt) {
          arr.push({ ...d, id: item.key });
        }
      });
      setMyStories(arr);
    });
  }, []);

  /* ================= BLOCKED ================= */
  useEffect(() => {
    onValue(ref(db, "BlockedUsers"), (snap) => {
      let arr = [];
      snap.forEach((item) => {
        const d = item.val();
        if (d.blockedByUid === auth.currentUser.uid) {
          arr.push({ ...d, key: item.key });
        }
      });
      setBlockedList(arr);
    });
  }, []);

  /* ================= PROFILE PHOTO ================= */
  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    const imageURL = await uploadToCloudinary(file);

    await updateProfile(user, { photoURL: imageURL });
    await update(ref(db, `users/${user.uid}`), {
      userPhotoUrl: imageURL,
    });

    setUser({ ...user, photoURL: imageURL });
    setUploading(false);
  };

  /* ================= STORY UPLOAD ================= */
  const handleStoryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStoryUploading(true);

    const isVideo = file.type.startsWith("video/");
    const mediaURL = await uploadToCloudinary(file);
    const now = Date.now();

    await push(ref(db, "stories"), {
      uid: auth.currentUser.uid,
      userName: auth.currentUser.displayName,
      userPhoto: auth.currentUser.photoURL,
      media: mediaURL,
      type: isVideo ? "video" : "image",
      createdAt: now,
      expireAt: now + 24 * 60 * 60 * 1000,
    });

    setStoryUploading(false);
  };

  const handleDeleteStory = async (id) => {
    await remove(ref(db, `stories/${id}`));
  };

  const handleUnblock = async (item) => {
    await remove(ref(db, `BlockedUsers/${item.key}`));
  };

 return (
  <div className="min-h-screen bg-gray-100 px-3 sm:px-6 py-4">

    <div className="max-w-5xl mx-auto space-y-5">

      {/* 🔥 PROFILE CARD */}
      <div className="bg-white rounded-2xl shadow p-5 flex items-center gap-4">

        <div className="relative">
          <img
            src={user?.photoURL}
            className="w-20 h-20 rounded-full object-cover border"
          />

          <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer text-white text-xs">
            ✎
            <input type="file" hidden onChange={handleProfileUpload} />
          </label>
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-semibold">{user?.displayName}</h2>

          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
          />

          <button
            onClick={handleDisplayNameSave}
            className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm"
          >
            Save
          </button>
        </div>
      </div>

      {/* 🔥 QUICK ACTION */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

        <button className="bg-white p-3 rounded-xl shadow text-sm">
          My Posts
        </button>

        <label className="bg-white p-3 rounded-xl shadow text-sm cursor-pointer text-center">
          Upload Story
          <input type="file" hidden onChange={handleStoryUpload} />
        </label>

        <button className="bg-white p-3 rounded-xl shadow text-sm">
          Edit Profile
        </button>

      </div>

      {/* 🔥 STORIES */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="font-semibold mb-3">My Stories</h3>

        <div className="flex gap-3 overflow-x-auto">
          {myStories.map((s) => (
            <div key={s.id} className="relative">
              <img src={s.media} className="w-20 h-20 rounded object-cover" />
              <button
                onClick={() => handleDeleteStory(s.id)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 🔥 BLOCKED USERS */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h3 className="font-semibold mb-3">Blocked Users</h3>

        {blockedList.map((item) => (
          <div key={item.key} className="flex justify-between mb-2">
            <span>{item.blockedUserName}</span>
            <button
              onClick={() => handleUnblock(item)}
              className="text-blue-600 text-sm"
            >
              Unblock
            </button>
          </div>
        ))}
      </div>

      {/* 🔥 SOCIAL SECTION */}
      <div className="space-y-4">

        <div className="bg-white rounded-2xl shadow p-3">
          <h3 className="font-semibold mb-2">Friend Requests</h3>
          <FriendRequest />
        </div>

        <div className="bg-white rounded-2xl shadow p-3">
          <h3 className="font-semibold mb-2">User List</h3>
          <UserList />
        </div>

        <div className="bg-white rounded-2xl shadow p-3">
          <h3 className="font-semibold mb-2">Friends</h3>
          <Friends />
        </div>

      </div>

    </div>
  </div>
);;
};

export default Settings;