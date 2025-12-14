import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { Link } from "react-router-dom";
import { CiLogin } from "react-icons/ci";
import { IoIosHome } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { MdChat } from "react-icons/md";
import { SlCloudUpload } from "react-icons/sl";
import { getDatabase, ref, update } from "firebase/database";
import { uploadToCloudinary } from "../../../utility/cloudinaryUpload";

const HomeLeft = () => {
  const auth = getAuth();
  const db = getDatabase();

  const [user, setUser] = useState(null);
  const [uploading, setUploading] = useState(false);

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        update(ref(db, `users/${currentUser.uid}`), {
          userName: currentUser.displayName || "Unknown",
          userPhotoUrl: currentUser.photoURL || "",
        });
      } else {
        setUser(null);
      }
    });

    return () => unsub();
  }, []);

  /* ================= IMAGE UPLOAD ================= */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    try {
      setUploading(true);

      const imageURL = await uploadToCloudinary(file);

      await updateProfile(user, { photoURL: imageURL });

      await update(ref(db, `users/${user.uid}`), {
        userPhotoUrl: imageURL,
      });

      setUser({ ...user, photoURL: imageURL });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="
        fixed bottom-0 left-0 w-full h-20
        lg:static lg:w-[104px] lg:h-screen
        bg-blue-500
        flex lg:flex-col
        justify-around lg:justify-start
        items-center
        lg:py-8
        z-50
      "
    >
      {/* ================= PROFILE ================= */}
      <div className="flex lg:flex-col items-center gap-2 lg:mb-10">
        <div className="relative w-14 h-14 lg:w-20 lg:h-20 rounded-full overflow-hidden bg-white group">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <SlCloudUpload className="text-xl lg:text-3xl text-blue-600" />
            </div>
          )}

          {/* UPLOAD OVERLAY (desktop hover) */}
          {user && (
            <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
              {uploading ? (
                <span className="text-white text-xs">Uploading...</span>
              ) : (
                <SlCloudUpload className="text-white text-xl" />
              )}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>

        <p className="hidden lg:block text-white text-sm font-semibold text-center">
          {user?.displayName || "Guest"}
        </p>
      </div>

      {/* ================= NAV ================= */}
      <Link
        to="/home"
        className="text-3xl lg:text-4xl text-white hover:text-black transition"
      >
        <IoIosHome />
      </Link>

      <Link
        to="/chat"
        className="text-3xl lg:text-4xl text-white hover:text-black transition"
      >
        <MdChat />
      </Link>

      <Link
        to="/settings"
        className="text-3xl lg:text-4xl text-white hover:text-black transition"
      >
        <IoSettings />
      </Link>

      <Link
        to="/login"
        className="text-3xl lg:text-4xl text-white hover:text-black transition"
      >
        <CiLogin />
      </Link>
    </div>
  );
};

export default HomeLeft;
