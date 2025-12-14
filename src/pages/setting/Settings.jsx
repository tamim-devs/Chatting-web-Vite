import React, { useEffect, useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { getDatabase, ref, update, onValue, remove, push } from "firebase/database";
import { SlCloudUpload } from "react-icons/sl";
import { uploadToCloudinary } from "../../utility/cloudinaryUpload";

const Settings = () => {
  const auth = getAuth();
  const db = getDatabase();

  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [blockedList, setBlockedList] = useState([]);

  /* ================= AUTH ================= */
  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  /* ================= BLOCKED USERS ================= */
  useEffect(() => {
    const blockRef = ref(db, "BlockedUsers");
    onValue(blockRef, (snapshot) => {
      let arr = [];
      snapshot.forEach((item) => {
        const data = item.val();
        if (data.blockedByUid === auth.currentUser.uid) {
          arr.push({ ...data, key: item.key });
        }
      });
      setBlockedList(arr);
    });
  }, []);

  /* ================= PROFILE UPLOAD ================= */
  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      const imageURL = await uploadToCloudinary(file);

      // auth update
      await updateProfile(user, { photoURL: imageURL });

      // db update
      await update(ref(db, `users/${user.uid}`), {
        userPhotoUrl: imageURL,
      });

      setUser({ ...user, photoURL: imageURL });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  /* ================= UNBLOCK ================= */
  const handleUnblock = async (item) => {
    await remove(ref(db, `BlockedUsers/${item.key}`));

    await push(ref(db, "Friends"), {
      whoSendFriendRequestUid: auth.currentUser.uid,
      whoSendFriendRequestName: auth.currentUser.displayName,
      whoSendFriendRequestProfilePicture: auth.currentUser.photoURL,

      whoRecivedFriendRequestUid: item.blockedUserUid,
      whoRecivedFriendRequestName: item.blockedUserName,
      whoRecivedFriendRequestProfile_picture: item.blockedUserPhoto,

      createdAt: Date.now(),
    });
  };

  return (
    <div className="p-4 space-y-6">

      {/* PROFILE SECTION */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-24 h-24 rounded-full overflow-hidden group">
          <img
            src={user?.photoURL || ""}
            className="w-full h-full object-cover"
          />

          <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
            {uploading ? (
              <span className="text-white text-sm">Uploading...</span>
            ) : (
              <SlCloudUpload className="text-white text-2xl" />
            )}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleProfileUpload}
            />
          </label>
        </div>

        <h2 className="font-semibold">{user?.displayName}</h2>
      </div>

      {/* BLOCKED USERS */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Blocked Users</h2>

        {blockedList.length === 0 && (
          <p className="text-gray-500">No blocked users</p>
        )}

        {blockedList.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between bg-white p-3 rounded shadow mb-3"
          >
            <div className="flex items-center gap-3">
              <img
                src={item.blockedUserPhoto}
                className="w-12 h-12 rounded-full object-cover"
              />
              <p>{item.blockedUserName}</p>
            </div>

            <button
              onClick={() => handleUnblock(item)}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Unblock
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
