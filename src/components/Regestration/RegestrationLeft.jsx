import React, { useState } from "react";
import { EmailValidator, fullNameValidator, PasswordValidator } from "../utils/validation";
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { ClipLoader } from "react-spinners";
import { getDatabase, ref, set } from "firebase/database";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  // Error State
  const [emailError, setEmailError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [PasswordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);  // Fixed loading state

  // Password show/hide toggle
  const handleEye = () => {
    setEye((prev) => !prev);
  };

  // Email input change handler
  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  // Full name input handler
  const handleFullName = (e) => {
    setFullName(e.target.value);
  };

  // Password input handler
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSignUp = () => {
    // Input validation
    if (!email || !EmailValidator(email)) {
      setEmailError("Email is Missing or Invalid Email");
    } else if (!fullName || !fullNameValidator(fullName)) {
      setFullNameError("Full name is missing or must be 5-20 characters");
      setEmailError("");
    } else if (!password) {
      setPasswordError("Password is missing");
      setFullNameError("");
    } else {
      // Reset errors and set loading state
      setEmailError("");
      setFullNameError("");
      setPasswordError("");
      setLoading(true); 

      // Firebase registration
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;
          
          // Update profile with full name
          await updateProfile(user, { displayName: fullName });

          // Send email verification
          await sendEmailVerification(user);

          // Add user to Firebase Realtime Database
          const userRef = ref(db, `users/${user.uid}`);
          await set(userRef, {
            userUid: user.uid,
            userEmail: user.email,
            photoUrl: "",
            userName: fullName,
          });

          // Success message and navigation
          SucessToast(`${fullName}, Please check your email for verification`);
          navigate("/");

        })
        .catch((err) => {
          console.error(err);
          ErrorToast(`Error: ${err.message}`);
        })
        .finally(() => {
          setEmail("");
          setFullName("");
          setPassword("");
          setEmailError("");
          setFullNameError("");
          setPasswordError("");
          setLoading(false); // Reset loading state
        });
    }
  };

  return (
    <div className="h-screen w-[60%] flex justify-center items-center">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition="bounce"
      />
      <div className="basis-2 flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold w-[900px] text-center">
            Get started with easy registration
          </h1>
          <p className="text-2xl text-center">Free registration and you can enjoy it</p>
        </div>

        <div className="flex flex-col gap-5 mt-5">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <fieldset className="rounded-lg border-2 w-[502px] px-3 py-2 relative bg-white shadow-lg">
              <legend className="text-lg font-semibold text-gray-700">Email</legend>
              <input
                type="text"
                id="email"
                name="email"
                className="outline-none w-full h-12 text-2xl border-2 border-gray-300 rounded-md px-4 focus:ring-2 focus:ring-blue-500"
                onChange={handleEmail}
                value={email}
                placeholder="Enter your Email"
              />
            </fieldset>
            <span className="text-red-600 mt-1">{emailError}</span>
          </div>

          {/* Fullname Field */}
          <div className="flex flex-col gap-2">
            <fieldset className="rounded-lg border-2 w-[502px] px-3 py-2 relative bg-white shadow-lg">
              <legend className="text-lg font-semibold text-gray-700">Full Name</legend>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="outline-none w-full h-12 text-2xl border-2 border-gray-300 rounded-md px-4 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Full Name"
                onChange={handleFullName}
                value={fullName}
              />
            </fieldset>
            <span className="text-red-600 mt-1">{fullNameError}</span>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <fieldset className="rounded-lg border-2 w-[502px] px-4 py-2 relative bg-white shadow-lg">
              <legend className="px-2 text-lg font-semibold text-gray-700">Password</legend>
              <div className="flex items-center">
                <input
                  type={eye ? "text" : "password"}
                  id="password"
                  name="password"
                  className="outline-none w-full h-12 text-2xl border-2 border-gray-300 rounded-md px-4 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your Password"
                  onChange={handlePassword}
                  value={password}
                />
                <button
                  type="button"
                  onClick={handleEye}
                  className="ml-2 text-lg font-semibold text-blue-500"
                >
                  {eye ? "Hide" : "Show"}
                </button>
              </div>
            </fieldset>
            <span className="text-red-600 mt-1">{PasswordError}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleSignUp}
          className="cursor-pointer w-[402px] mt-7 h-[80px] text-2xl font-semibold rounded-md bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition duration-300"
        >
          {loading ? (
            <ClipLoader color="#fff" size={40} className="cursor-none" />
          ) : (
            "Sign Up"
          )}
        </button>

        <p className="mt-5 flex gap-x-2 items-start justify-start text-xl font-normal text-black">
          Already have an account?
          <NavLink to={'/'} className="cursor-pointer text-xl text-yellow-600 font-semibold hover:underline">
            Sign In
          </NavLink>
        </p>
      </div>
    </div>
  );
};

export default RegestrationLeft;
