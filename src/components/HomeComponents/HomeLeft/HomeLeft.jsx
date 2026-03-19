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
  <div className="hidden">
      <div
      className="
        fixed bottom-0 left-0 w-full h-20
        lg:static lg:w-[112px] lg:h-screen
        bg-white shadow-lg lg:shadow-none
        flex lg:flex-col
        justify-around lg:justify-start
        items-center
        lg:py-8
        border-t lg:border-t-0 lg:border-r border-slate-200
        z-50
      "
    >
      {/* ================= LOGO ================= */}
      <div className="hidden lg:flex flex-col items-center gap-4 mb-10">
        <div className="text-xl font-bold text-slate-900">Insta</div>
      </div>

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
      <Link
        to="/home"
        className="text-2xl lg:text-3xl text-slate-700 hover:text-blue-600 transition"
        aria-label="Home"
      >
        <IoIosHome />
      </Link>

      <Link
        to="/chat"
        className="text-2xl lg:text-3xl text-slate-700 hover:text-blue-600 transition"
        aria-label="Chat"
      >
        <MdChat />
      </Link>

      <Link
        to="/settings"
        className="text-2xl lg:text-3xl text-slate-700 hover:text-blue-600 transition"
        aria-label="Settings"
      >
        <IoSettings />
      </Link>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="text-2xl lg:text-3xl text-slate-700 hover:text-red-500 transition"
        aria-label="Logout"
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
  </div>
  );
};

export default HomeLeft;
