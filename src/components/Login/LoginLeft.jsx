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

const LoginLeft = () => {
  const db = getDatabase();
  const auth = getAuth();
  const navigate = useNavigate();

  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState({ emailError: "", passwordError: "" });

  const handleInput = (e) => {
    const { id, value } = e.target;
    setLoginInput({ ...loginInput, [id]: value });
  };

  const handleSignin = (e) => {
    e.preventDefault();
    setLoading(true);

    const { email, password } = loginInput;

    if (!email || !EmailValidator(email)) {
      setLoginError({ emailError: "Email Missing or invalid Email", passwordError: "" });
      setLoading(false);
      return;
    }

    if (!password) {
      setLoginError({ emailError: "", passwordError: "Password is missing" });
      setLoading(false);
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        SucessToast("Login Successful");
        navigate("/home");
      })
      .catch(() => ErrorToast("Login Failed"))
      .finally(() => {
        setLoading(false);
        setLoginInput({ email: "", password: "" });
      });
  };

  const handleLoginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const { uid, email, displayName, photoURL } = result.user;

      await set(ref(db, `users/${uid}`), {
        userUid: uid,
        userEmail: email,
        userName: displayName || "No Name",
        userPhotoUrl: photoURL || "",
      });

      SucessToast("Google Login Successful");
      navigate("/home");
    } catch (error) {
      ErrorToast(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <ToastContainer />

      <form className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8">
          Login to your Account
        </h1>

        <button
          type="button"
          onClick={handleLoginWithGoogle}
          className="w-full flex items-center justify-center gap-3 border-2 rounded-lg py-3 text-lg font-semibold hover:bg-gray-100 transition"
        >
          <FcGoogle size={26} /> Login with Google
        </button>

        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              id="email"
              value={loginInput.email}
              onChange={handleInput}
              className="w-full h-11 px-4 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
            <p className="text-red-500 text-sm">{loginError.emailError}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={loginInput.password}
              onChange={handleInput}
              className="w-full h-11 px-4 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
            <p className="text-red-500 text-sm">{loginError.passwordError}</p>
          </div>

          <button
            onClick={handleSignin}
            disabled={loading}
            className="w-full h-12 text-lg font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {loading ? <ClipLoader color="#fff" size={26} /> : "Sign In"}
          </button>

          <p className="text-center text-base">
            Don’t have an account?{" "}
            <NavLink to="/regestration" className="text-yellow-600 font-semibold hover:underline">
              Sign up
            </NavLink>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginLeft;
