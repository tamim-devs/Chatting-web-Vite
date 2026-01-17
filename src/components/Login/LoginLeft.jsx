import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { EmailValidator } from "../utils/validation";
import { ClipLoader } from "react-spinners";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { ErrorToast, SucessToast } from "../utils/Toast";
import { ToastContainer } from "react-toastify";
import { getDatabase, ref, set } from "firebase/database";
import { NavLink, useNavigate } from "react-router-dom";
import { requestPermissionAndToken } from "../../utility/firebaseMessaging";
import { FaEye, FaRegEyeSlash } from "react-icons/fa";

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
  const handleSignin = async (e) => {
    e.preventDefault();

    const { email, password } = loginInput;

    if (!email || !EmailValidator(email)) {
      setLoginError({
        emailError: "Email Missing or Invalid",
        passwordError: "",
      });
      return;
    }

    if (!password) {
      setLoginError({
        emailError: "",
        passwordError: "Password is Missing",
      });
      return;
    }

    try {
      setLoading(true);

      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

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
      ErrorToast("Login Failed");
    } finally {
      setLoading(false);
      setLoginInput({ email: "", password: "" });
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

  // ================= JSX =================
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <ToastContainer />

      <form className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          Login to your Account
        </h1>

        {/* GOOGLE LOGIN */}
        <button
          type="button"
          onClick={handleLoginWithGoogle}
          className="w-full flex items-center justify-center gap-3 border-2 rounded-lg py-3 text-lg font-semibold hover:bg-gray-100"
        >
          <FcGoogle size={26} />
          Login with Google
        </button>

        <div className="mt-6 space-y-5">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Email
            </label>
            <input
              id="email"
              value={loginInput.email}
              onChange={handleInput}
              className="w-full h-11 px-4 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
            <p className="text-red-500 text-sm">
              {loginError.emailError}
            </p>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Password
            </label>
          <div className="flex">
              <input
              type={eye ? "text" : "password"}
              id="password"
              value={loginInput.password}
              onChange={handleInput}
              className="w-full h-11 px-4 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
              <button
            type="button"
                onClick={() => setEye(!eye)}
            > {eye ? <FaRegEyeSlash /> : <FaEye />
}</button>
          </div>
            <p className="text-red-500 text-sm">
              {loginError.passwordError}
            </p>
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSignin}
            disabled={loading}
            className="w-full h-12 text-lg font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {loading ? <ClipLoader color="#fff" size={26} /> : "Sign In"}
          </button>

          <p className="text-center">
            Don’t have an account?{" "}
            <NavLink
              to="/regestration"
              className="text-yellow-600 font-semibold hover:underline"
            >
              Sign up
            </NavLink>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginLeft;
