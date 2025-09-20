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
  const [loginInput, setLoginInput] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState({
    emailError: "",
    passwordError: "",
  });

  const handleInput = (e) => {
    const { id, value } = e.target;
    setLoginInput({
      ...loginInput,
      [id]: value,
    });
  };

  const handleSignin = (e) => {
    e.preventDefault();
    setLoading(true);

    const { email, password } = loginInput;

    if (!email || !EmailValidator(email)) {
      setLoginError({
        emailError: "Email Missing or invalid Email",
        passwordError: "",
      });
      setLoading(false);
      return;
    } else if (!password) {
      setLoginError({
        emailError: "",
        passwordError: "Password is Invalid & missing",
      });
      setLoading(false);
      return;
    }

    setLoginError({
      emailError: "",
      passwordError: "",
    });

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        SucessToast("Login Successful");
      })
      .then(() => {
        navigate('/home');
      })
      .catch((error) => {
        console.error(error.code);
        ErrorToast("Login Failed");
      })
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
          setLoginInput({ email: "", password: "" });
        }, 3000);
      });
  };

  const handleLoginWithGoogle = async (e) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const { photoURL, displayName, email, uid } = user;

        // Check if displayName exists, else set 'No Name'
        const userName = displayName || "No Name";

        const userRef = ref(db, `users/${uid}`);
        await set(userRef, {
          userUid: uid,
          userEmail: email,
          userName: userName,  // Use displayName or 'No Name'
          userPhotoUrl: photoURL || "",
        }).then(() => {
          navigate('/home');  // Navigate after saving user data
        });

        SucessToast("Google Login Successful & Data Saved!");
      }
    } catch (error) {
      console.error("Firebase Error:", error);
      ErrorToast(`Error: ${error.message}`);
    }
  };

  return (
    <div className="h-screen w-[60%]">
      <ToastContainer
        position="top-right"
        autoClose={3000}
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
      <form action="#" method="post">
        <div className="flex flex-col gap-20 justify-center items-center h-screen">
          <div className="flex flex-col gap-8 w-[340px]">
            <h1 className="flex justify-center text-3xl font-bold w-[350px] text-center">
              Login to your Account !
            </h1>
            <div
              onClick={handleLoginWithGoogle}
              className="flex gap-x-4 cursor-pointer items-center justify-center border-gray-500 border-2 rounded-lg w-72 h-20"
            >
              <span className="text-2xl">
                <FcGoogle />
              </span>
              <button className="text-2xl font-semibold">
                Login With Google
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div>
              <fieldset className="rounded-lg border-2 w-[502px] px-3 py-2 relative bg-white shadow-lg">
                <legend className="text-lg font-semibold text-gray-700">
                  Email
                </legend>
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={loginInput.email}
                  onChange={handleInput}
                  className="outline-none w-full h-12 text-2xl border-2 border-gray-300 rounded-md px-4 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your Email"
                />
              </fieldset>
              <span className="text-red-600 mt-1">{loginError.emailError}</span>
            </div>
            <div>
              <fieldset className="rounded-lg border-2 w-[502px] px-3 py-2 relative bg-white shadow-lg">
                <legend className="text-lg font-semibold text-gray-700">
                  Password
                </legend>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginInput.password}
                  onChange={handleInput}
                  className="outline-none w-full h-12 text-2xl border-2 border-gray-300 rounded-md px-4 focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your Password"
                />
              </fieldset>
              <span className="text-red-600 mt-1">
                {loginError.passwordError}
              </span>
            </div>

            <button
              onClick={handleSignin}
              className="cursor-pointer w-[402px] mt-7 h-[80px] text-2xl font-semibold rounded-md bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition duration-300"
              disabled={loading}
            >
              {loading ? (
                <ClipLoader color="#fff" size={40} className="cursor-none" />
              ) : (
                "Sign In"
              )}
            </button>

            <p className="mt-5 flex gap-x-2 items-start justify-start text-xl font-normal text-black">
              Don't have an account?
              <NavLink to={'/regestration'}  className="cursor-pointer text-xl text-yellow-600 font-semibold hover:underline">
                Sign up
              </NavLink>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginLeft;
