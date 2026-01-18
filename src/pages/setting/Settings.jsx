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
import { NavLink } from 'react-router-dom';

const Settings = () => {
  const auth = getAuth();
  const db = getDatabase();

  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [storyUploading, setStoryUploading] = useState(false);
  const [blockedList, setBlockedList] = useState([]);
  const [myStories, setMyStories] = useState([]);

  /* ================= AUTH ================= */
  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  /* ================= FETCH MY STORIES ================= */
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

  /* ================= BLOCKED USERS ================= */
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

      {/* ================= MAIN GRID ================= */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ================= LEFT (SETTINGS) ================= */}
        <div className="space-y-6 lg:col-span-1">

          {/* PROFILE */}
          <div className="bg-white  b rounded-2xl shadow p-5 flex flex-col items-center gap-3">
            <div style={{backgroundSize:"60px"}} className="relative bg-[url('src/assets/chat/avatar.png')] bg-center bg-no-repeat  w-24 h-24 rounded-full overflow-hidden group">
              <img
                src={user?.photoURL}
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                {uploading ? "Uploading..." : <SlCloudUpload className="text-white text-2xl" />}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfileUpload}
                />
              </label>
            </div>
            <h2 className="font-semibold text-lg text-center">
              {user?.displayName}
            </h2>
          </div>

          {/* STORY UPLOAD */}
          <div className="bg-white rounded-2xl shadow p-4">
            <label className="flex items-center gap-2 cursor-pointer text-blue-600 font-medium">
              <SlCloudUpload />
              {storyUploading ? "Uploading..." : "Upload Story"}
              <input
                type="file"
                hidden
                accept="image/*,video/*"
                onChange={handleStoryUpload}
              />
            </label>

            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {myStories.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {s.type === "image" ? (
                      <img src={s.media} className="w-12 h-12 rounded object-cover" />
                    ) : (
                      <video src={s.media} className="w-12 h-12 rounded object-cover" />
                    )}
                    <p className="text-xs text-gray-500">
                      {moment(s.createdAt).fromNow()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteStory(s.id)}
                    className="text-red-600 text-xl"
                  >
                    <MdDelete />
                  </button>
                </div>
              ))}

              {myStories.length === 0 && (
                <p className="text-xs text-gray-400">No active stories</p>
              )}
            </div>
          </div>
              {/* My Post  */}

          <button className="p-2 text-lg rounded-md bg-black text-white">
            <NavLink to="/mypost">All My post</NavLink>
            </button>

          {/* BLOCKED USERS */}
          <div className="bg-white rounded-2xl shadow p-4 max-h-56 overflow-y-auto">
            <h2 className="font-semibold mb-3">Blocked Users</h2>

            {blockedList.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between bg-gray-50 p-2 rounded-lg mb-2"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={item.blockedUserPhoto}
                    className="w-10 h-10 rounded-full"
                  />
                  <p className="text-sm">{item.blockedUserName}</p>
                </div>

                <button
                  onClick={() => handleUnblock(item)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT (SOCIAL) ================= */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl shadow p-3 max-h-[70vh] overflow-y-auto">
            <Friends />
          </div>

          <div className="bg-white rounded-2xl shadow p-3 max-h-[70vh] overflow-y-auto">
            <UserList />
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl shadow p-3 max-h-[60vh] overflow-y-auto">
            <FriendRequest />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
