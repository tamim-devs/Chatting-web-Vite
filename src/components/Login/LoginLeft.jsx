import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { EmailValidator } from "../utils/validation";
import { ClipLoader } from "react-spinners";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  GoogleAuthProvider,
} from "firebase/auth";
import { ErrorToast, SucessToast } from "../utils/Toast";
import { ToastContainer } from "react-toastify";
import { getDatabase, ref, set } from "firebase/database";
import { NavLink, useNavigate } from "react-router-dom";
import { requestPermissionAndToken } from "../../utility/firebaseMessaging";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";

const LoginLeft = () => {
  const db = getDatabase();
  const auth = getAuth();
  const navigate = useNavigate();

  // 🔥 PWA STATE
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const [loginInput, setLoginInput] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [eye, setEye] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const [loginError, setLoginError] = useState({
    emailError: "",
    passwordError: "",
  });

  // ================= PWA INSTALL =================
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("App already installed or not supported");
      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User installed");
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // ================= INPUT =================
  const handleInput = (e) => {
    const { id, value } = e.target;
    setLoginInput({ ...loginInput, [id]: value });
  };

  // ================= LOGIN =================
  const handleSignin = async () => {
    const { email, password } = loginInput;

    if (!email || !EmailValidator(email)) {
      setLoginError({
        emailError: "Email is missing or invalid",
        passwordError: "",
      });
      return;
    }

    if (!password) {
      setLoginError({
        emailError: "",
        passwordError: "Password is missing",
      });
      return;
    }

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(auth, email, password);

      SucessToast("Login Successful");
      navigate("/home");

      requestPermissionAndToken().then((token) => {
        if (token) {
          set(ref(db, `users/${result.user.uid}/fcmToken`), token);
        }
      });
    } catch (error) {
      ErrorToast("Login Failed: " + (error.message || ""));
    } finally {
      setLoading(false);
      setLoginInput({ email: "", password: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    resetMode ? handleResetPassword() : handleSignin();
  };

  // ================= RESET =================
  const handleResetPassword = async () => {
    const { email } = loginInput;

    if (!email || !EmailValidator(email)) {
      setLoginError({
        emailError: "Please enter a valid email",
        passwordError: "",
      });
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      SucessToast("Reset link sent");
      setResetMode(false);
      setLoginInput({ email: "", password: "" });
    } catch (error) {
      ErrorToast(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE =================
  const handleLoginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const { uid, email, displayName, photoURL } = result.user;

      SucessToast("Google Login Successful");
      navigate("/home");

      requestPermissionAndToken().then((token) => {
        set(ref(db, `users/${uid}`), {
          userUid: uid,
          userEmail: email,
          userName: displayName || "No Name",
          userPhotoUrl: photoURL || "",
          fcmToken: token || "",
        });
      });
    } catch (error) {
      ErrorToast(error.message);
    }
  };

  return (
    <>
      <div className="relative min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-700">

        {/* 🔥 PWA DOWNLOAD BUTTON */}
        {isInstallable && (
          <div
            onClick={handleInstall}
            className="w-28 flex flex-col items-center justify-center h-28 top-10 absolute rounded-full bg-blue-500 cursor-pointer"
          >
            <MdFileDownload color="white" size={32} />
            <h2 className="text-white text-sm font-semibold">
              Download App
            </h2>
          </div>
        )}

        <ToastContainer position="top-right" />

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-7 sm:p-10"
        >
          <h1 className="text-3xl font-bold text-center mb-6">
            {resetMode ? "Reset Password" : "Welcome Back"}
          </h1>

          <input
            id="email"
            value={loginInput.email}
            onChange={handleInput}
            placeholder="Email"
            className="w-full h-12 px-4 border rounded-xl mb-2"
          />
          <p className="text-xs text-red-500">{loginError.emailError}</p>

          {!resetMode && (
            <>
              <input
                type={eye ? "text" : "password"}
                id="password"
                value={loginInput.password}
                onChange={handleInput}
                placeholder="Password"
                className="w-full h-12 px-4 border rounded-xl mb-2"
              />
              <p className="text-xs text-red-500">{loginError.passwordError}</p>
            </>
          )}

          <button className="w-full h-12 bg-indigo-600 text-white rounded-xl mt-4">
            {loading ? <ClipLoader color="#fff" size={20} /> : "Sign In"}
          </button>

          <p className="text-center mt-4">
            <NavLink to="/regestration">Create account</NavLink>
          </p>
        </form>
      </div>
    </>
  );
};

export default LoginLeft;