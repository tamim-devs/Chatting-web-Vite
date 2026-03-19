import React, { useEffect, useState } from "react";
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

  // ================= INPUT HANDLER =================
  const handleInput = (e) => {
    const { id, value } = e.target;
    setLoginInput({ ...loginInput, [id]: value });
  };

  // ================= EMAIL/PASSWORD LOGIN =================
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

      // ✅ FAST LOGIN
      SucessToast("Login Successful");
      navigate("/home");

      // 🔥 FCM TOKEN (BACKGROUND)
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
    if (resetMode) {
      handleResetPassword();
    } else {
      handleSignin();
    }
  };

  // ================= RESET PASSWORD =================
  const handleResetPassword = async () => {
    const { email } = loginInput;

    if (!email || !EmailValidator(email)) {
      setLoginError({
        emailError: "Please enter a valid email to reset password",
        passwordError: "",
      });
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      SucessToast("Reset link sent to your email");
      setResetMode(false);
      setLoginInput({ email: "", password: "" });
    } catch (error) {
      ErrorToast("Failed to send reset link: " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleLoginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const { uid, email, displayName, photoURL } = result.user;

      // ✅ FAST LOGIN
      SucessToast("Google Login Successful");
      navigate("/home");

      // 🔥 FCM TOKEN (BACKGROUND)
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
const [deferredPrompt, setDeferredPrompt] = useState(null);
useEffect(() => {
  const handler = (e) => {
    e.preventDefault(); // 🔥 auto popup বন্ধ করে
    setDeferredPrompt(e); // save করো
  };

  window.addEventListener("beforeinstallprompt", handler);

  return () => window.removeEventListener("beforeinstallprompt", handler);
}, []);
const handleInstall = async () => {
  if (!deferredPrompt) {
    alert("App already installed or not supported");
    return;
  }

  deferredPrompt.prompt(); // 🔥 install popup show

  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    console.log("User installed");
  }

  setDeferredPrompt(null);
};
  // ================= JSX =================
  return (
    <>

    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-700 overflow-hidden">
        <div  onClick={handleInstall} className="w-28 cursor-pointer flex flex-col items-center justify-center h-28 top-10 absolute rounded-full bg-blue-500">
        <MdFileDownload color="white" size={32} />
        <h2 className="text-white text-sm  font-semibold">Download App</h2>
        </div>
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
      <ToastContainer position="top-right" />
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-7 sm:p-10"
      >
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            {resetMode ? "Reset Password" : "Meher Ali family"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {resetMode
              ? "Enter your email to receive a password reset link."
              : "Sign in to continue to your social account."}
          </p>
        </div>

        {!resetMode && (
          <div className="hidden">

          <button
            type="button"
            onClick={handleLoginWithGoogle}
            className="mt-8 w-full flex items-center justify-center gap-3 border border-slate-300 bg-white py-3 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <FcGoogle size={24} />
            Continue with Google
          </button>
          </div>
        )}

        <div className="mt-6 border-t border-slate-200 pt-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              value={loginInput.email}
              onChange={handleInput}
              className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
              type="email"
            />
            <p className="mt-1 text-xs text-red-500">
              {loginError.emailError}
            </p>
          </div>

          {!resetMode && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(true);
                    setLoginError({ emailError: "", passwordError: "" });
                  }}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={eye ? "text" : "password"}
                  id="password"
                  value={loginInput.password}
                  onChange={handleInput}
                  className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setEye(!eye)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {eye ? <FaRegEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="mt-1 text-xs text-red-500">
                {loginError.passwordError}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <ClipLoader color="#fff" size={22} />
            ) : resetMode ? (
              "Send reset link"
            ) : (
              "Sign in"
            )}
          </button>

          <div className="text-center text-sm text-slate-600">
            {resetMode ? (
              <>
                Remembered your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(false);
                    setLoginError({ emailError: "", passwordError: "" });
                  }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don’t have an account?{" "}
                <NavLink
                  to="/regestration"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
        </>
  );
};

export default LoginLeft;
