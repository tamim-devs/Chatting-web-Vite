import React, { useState } from "react";
import { EmailValidator, fullNameValidator } from "../utils/validation";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { ClipLoader } from "react-spinners";
import { getDatabase, ref, set } from "firebase/database";
import { ToastContainer } from "react-toastify";
import { ErrorToast, SucessToast } from "../utils/Toast";
import { NavLink, useNavigate } from "react-router-dom";

const RegestrationLeft = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getDatabase();

  const [eye, setEye] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
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

      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(user, { displayName: fullName });
      await sendEmailVerification(user);

      await set(ref(db, `users/${user.uid}`), {
        userUid: user.uid,
        userEmail: user.email,
        userName: fullName,
        photoUrl: "",
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6">
      <ToastContainer />

      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">
          Get started with easy registration
        </h1>
        <p className="text-center text-gray-600 mt-1">
          Free registration and enjoy our services
        </p>

        <div className="mt-6 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
            <p className="text-red-500 text-sm">{emailError}</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-4 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
            <p className="text-red-500 text-sm">{fullNameError}</p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <div className="flex gap-2">
              <input
                type={eye ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-4 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setEye(!eye)}
                className="text-sm font-semibold text-blue-600"
              >
                {eye ? "Hide" : "Show"}
              </button>
            </div>
            <p className="text-red-500 text-sm">{passwordError}</p>
          </div>

          <button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full h-12 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
          >
            {loading ? <ClipLoader color="#fff" size={24} /> : "Sign Up"}
          </button>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <NavLink to="/" className="text-yellow-600 font-semibold">
              Sign In
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegestrationLeft;
