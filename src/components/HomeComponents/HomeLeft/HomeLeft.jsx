import React, { useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { CiLogin } from "react-icons/ci";
import { IoIosHome } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { MdChat } from "react-icons/md";

import { useStories } from "../../hooks/useStories";
import StoryViewer from "../../story/StoryViewer";
import AddStory from "../../story/AddStory";

const HomeLeft = () => {
  const auth = getAuth();
  const navigate = useNavigate();

  const stories = useStories();
  const [openStory, setOpenStory] = useState(null);
  const [user, setUser] = useState(null);

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsub();
  }, []);

  /* ================= MY STORY ================= */
  const myStory = stories.find(
    (s) => s.uid === auth.currentUser?.uid
  );

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
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
      {/* ================= PROFILE + STORY ================= */}
      <div className="hidden lg:flex flex-col items-center gap-2 mb-10">
        <div
          onClick={() => myStory && setOpenStory(myStory)}
          className={`p-[3px] rounded-full cursor-pointer ${
            myStory
              ? "bg-gradient-to-tr from-pink-500 to-yellow-400"
              : "bg-white"
          }`}
        >
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white">
            <img
              src={user?.photoURL}
              className="w-full h-full object-cover"
              alt="profile"
            />
          </div>
        </div>

        <AddStory />

        <p className="text-white text-sm font-semibold">
          {user?.displayName}
        </p>
      </div>

      {/* ================= NAV ================= */}
      <Link to="/home" className="text-3xl lg:text-4xl text-white">
        <IoIosHome />
      </Link>

      <Link to="/chat" className="text-3xl lg:text-4xl text-white">
        <MdChat />
      </Link>

      <Link to="/settings" className="text-3xl lg:text-4xl text-white">
        <IoSettings />
      </Link>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="text-3xl lg:text-4xl text-white"
      >
        <CiLogin />
      </button>

      {/* ================= STORY MODAL ================= */}
      {openStory && (
        <StoryViewer
          story={openStory}
          close={() => setOpenStory(null)}
        />
      )}
    </div>
  );
};

export default HomeLeft;
