import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { Link, useLocation } from "react-router-dom";
import { CiLogin } from "react-icons/ci";
import { IoIosHome } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { MdChat } from "react-icons/md";
import { SlCloudUpload } from "react-icons/sl";
import { getDatabase, ref, update } from "firebase/database";
import { Uploader } from "uploader";
import { UploadButton } from "react-uploader";

const HomeLeft = () => {
  const db = getDatabase();
  const auth = getAuth();
  const location = useLocation();

  const [user, setUser] = useState(null);

  const uploader = Uploader({
    apiKey: "free",
  });

  const options = { multi: false, mimeTypes: ["image/*"] };

  // Handle auth state and set user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Save user info to Realtime DB if not already
        const userRef = ref(db, `users/${currentUser.uid}`);
        update(userRef, {
          userName: currentUser.displayName || "Unknown",
          userPhotoUrl: currentUser.photoURL || null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle image upload
  const handleFileUpload = async (files) => {
    const uploadedImageUrl = files[0].fileUrl;

    if (user) {
      // 1. Update Firebase Auth Profile
      await updateProfile(user, { photoURL: uploadedImageUrl });

      // 2. Update Realtime Database
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        userName: user.displayName || "Unknown",
        userPhotoUrl: uploadedImageUrl,
      });

      // 3. Update local state
      setUser({ ...user, photoURL: uploadedImageUrl });
    }
  };

  return (
    <div className="w-[104px] bg-blue-500 h-screen flex justify-center">
      <div className="flex justify-center flex-col items-center gap-y-20">
        {/* Profile Picture + Upload */}
        <div className="flex flex-col justify-center items-center gap-y-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white group">
            {user && user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="flex justify-center items-center w-full h-full bg-gray-300">
                <SlCloudUpload className="text-5xl text-blue-600" />
              </div>
            )}

            {/* Overlay Upload Button */}
            <UploadButton
              uploader={uploader}
              options={options}
              onComplete={(files) => handleFileUpload(files)}
              update
            >
              {({ onClick }) => (
                <button
                  onClick={onClick}
                  className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <SlCloudUpload className="text-3xl" />
                </button>
              )}
            </UploadButton>
          </div>

          <h1 className="font-semibold text-2xl text-white">
            {user ? user.displayName : "Guest"}
          </h1>
        </div>

        {/* Navigation Icons */}
        <Link
          to="/home"
          className="text-6xl text-white cursor-pointer hover:text-black duration-500"
        >
          <IoIosHome />
        </Link>
        <Link
          to="/chat"
          className="text-6xl text-white cursor-pointer hover:text-black duration-500"
        >
          <MdChat />
        </Link>
        <Link
          to="/settings"
          className="text-6xl text-white cursor-pointer hover:text-black duration-500"
        >
          <IoSettings />
        </Link>
        <Link
          to="/login"
          className="text-6xl font-bold text-white cursor-pointer hover:text-black duration-500"
        >
          <CiLogin />
        </Link>
      </div>
    </div>
  );
};

export default HomeLeft;
