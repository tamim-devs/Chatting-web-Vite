import React, { useState } from "react";
import { EmailValidator, fullNameValidator } from "../utils/validation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { ClipLoader } from "react-spinners";
import { getDatabase, ref, set } from "firebase/database";
import { ToastContainer } from "react-toastify";
import { ErrorToast, SucessToast } from "../utils/Toast";
import { NavLink, useNavigate } from "react-router-dom";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { uploadToCloudinary } from "../../utility/cloudinaryUpload";

const RegestrationLeft = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();

  const [eye, setEye] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);

  const [emailError, setEmailError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= IMAGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  /* ================= SIGN UP ================= */
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!image) {
      ErrorToast("প্রোফাইল ছবি আপলোড করুন");
      return;
    }

    if (!email || !EmailValidator(email)) {
      setEmailError("Email is missing or invalid");
      return;
    }

    if (!fullName || !fullNameValidator(fullName)) {
      setFullNameError("Full name must be 5–20 characters");
      return;
    }

    if (!password) {
      setPasswordError("Password is required");
      return;
    }

    try {
      setLoading(true);
      setEmailError("");
      setFullNameError("");
      setPasswordError("");

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // ✅ Upload Image
      const imageURL = await uploadToCloudinary(image);

      // ✅ Update Profile
      await updateProfile(user, {
        displayName: fullName,
        photoURL: imageURL,
      });

      await sendEmailVerification(user);

      // ✅ Save DB
      await set(ref(db, `users/${user.uid}`), {
        userUid: user.uid,
        userEmail: user.email,
        userName: fullName,
        userPhotoUrl: imageURL,
      });

      SucessToast(`${fullName}, please verify your email`);
      navigate("/");
    } catch (err) {
      ErrorToast(err.message);
    } finally {
      setLoading(false);
      setEmail("");
      setFullName("");
      setPassword("");
      setImage(null);
    }
  };

  /* ================= GOOGLE ================= */
  const handleSignUpWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const { uid, email: userEmail, displayName, photoURL } = result.user;

      SucessToast("Google login successful");
      navigate("/home");

      await set(ref(db, `users/${uid}`), {
        userUid: uid,
        userEmail,
        userName: displayName || "No Name",
        userPhotoUrl: photoURL || "",
      });
    } catch (error) {
      ErrorToast(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-700">
      <ToastContainer position="top-right" />

      <form
        onSubmit={handleSignUp}
        className="w-full max-w-md bg-white/90 rounded-3xl shadow-2xl p-7 sm:p-10"
      >
        <div className="text-center flex flex-col items-center ">
          <div className="w-40">
            <img src="/public/pwa-192x192.png" alt="logo" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Create your account
          </h1>
        </div>

        <div className="mt-6 space-y-4">
          {/* IMAGE */}
          <div className="text-center">
            <label className="cursor-pointer">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {image ? (
                  <img
                    src={URL.createObjectURL(image)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src="/src/assets/HomeAssets/HomeLeftAssets/avatar.gif"
                    alt=""
                  />
                )}
              </div>

              <span className="text-xs text-gray-500 block mt-1">
                Upload Photo
              </span>

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            {/* 🔥 Bangla Message */}
            {image ? (
              <p className="text-xs text-green-600 mt-2">
                ✅ ছবি আপলোড হয়েছে
              </p>
            ) : (
              <p className="text-xs text-red-500 mt-2">
                ⚠️ প্রোফাইল ছবি আপলোড করুন
              </p>
            )}
          </div>

          {/* EMAIL */}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full h-12 px-4 border rounded-xl"
          />
          <p className="text-xs text-red-500">{emailError}</p>

          {/* NAME */}
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="w-full h-12 px-4 border rounded-xl"
          />
          <p className="text-xs text-red-500">{fullNameError}</p>

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={eye ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full h-12 px-4 border rounded-xl"
            />
            <button
              type="button"
              onClick={() => setEye(!eye)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {eye ? <FaRegEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p className="text-xs text-red-500">{passwordError}</p>

          {/* 🔥 BUTTON */}
          <button
            disabled={!image || loading}
            className={`w-full h-12 rounded-xl text-white ${
              !image || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <ClipLoader color="#fff" size={20} />
            ) : (
              "Create Account"
            )}
          </button>

          <p className="text-center text-sm">
            Already have account?{" "}
            <NavLink to="/" className="text-indigo-600">
              Login
            </NavLink>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegestrationLeft;