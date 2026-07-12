import { useState } from "react";
import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from "react-icons/fa";

import API from "../services/api";
import { useToast } from "../context/ToastContext";

const Login = () => {

  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await API.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          res.data.user
        )
      );

      toast.success("Login Successful");

      navigate("/dashboard");

    } catch (error) {

      console.log(error);

      toast.error("Login Failed");
    }
  };

  return (
    <div
      className="
      min-h-screen
      bg-[#050816]
      flex
      flex-col
      lg:flex-row
      justify-center
      items-center
      gap-20
      px-8
      overflow-hidden
      relative
      "
    >
      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-28 left-8 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-gray-300 hover:text-white text-xs font-semibold hover:bg-white/[0.07] active:scale-95 transition-all cursor-pointer z-30 animate-fadeIn"
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      {/* LEFT IMAGE SECTION */}

      <div className="hidden lg:flex">

        <img
  src="/Aii.png"
  alt="AI Career"
  className="
  w-[520px]
  rounded-3xl
  object-cover
  opacity-90
  shadow-[0_0_50px_rgba(168,85,247,0.18)]
  hover:scale-105
  transition-all
  duration-500
  "
/>

      </div>

      {/* LOGIN CARD */}

      <div
        className="
        w-full
        max-w-md
        p-10
        rounded-3xl
        bg-white/5
        backdrop-blur-lg
        border
        border-white/10
        shadow-[0_0_40px_rgba(255,255,255,0.05)]
        "
      >

        <h1
          className="
          text-5xl
          font-extrabold
          text-center
          text-white
          mb-10
          "
        >
          Welcome Back
        </h1>

        <form
          onSubmit={handleLogin}
          className="
          flex
          flex-col
          gap-6
          "
        >

          <input
            type="email"
            placeholder="Enter your email"
            className="
            input
            input-bordered
            rounded-2xl
            w-full
            bg-white/5
            border-white/10
            text-white
            placeholder:text-gray-400
            focus:outline-none
            focus:border-gray-400
            focus:shadow-[0_0_15px_rgba(255,255,255,0.08)]
            transition-all
            duration-300
            "
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          <div className="relative">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter your password"
              className="
              input
              input-bordered
              rounded-2xl
              w-full
              bg-white/5
              border-white/10
              text-white
              placeholder:text-gray-400
              focus:outline-none
              focus:border-gray-400
              focus:shadow-[0_0_15px_rgba(255,255,255,0.08)]
              transition-all
              duration-300
              pr-14
              "
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
              className="
              absolute
              right-5
              top-1/2
              -translate-y-1/2
              text-gray-400
              hover:text-white
              transition-all
              duration-300
              "
            >

              {showPassword ? (
                <FaEyeSlash size={20} />
              ) : (
                <FaEye size={20} />
              )}

            </button>

          </div>

          <button
            type="submit"
            className="
            mt-4
            bg-gray-200
            hover:bg-white
            text-black
            hover:scale-105
            transition-all
            duration-300
            py-4
            rounded-2xl
            text-lg
            font-bold
            shadow-[0_0_20px_rgba(255,255,255,0.15)]
            "
          >
            Login
          </button>

        </form>

        {/* SIGNUP OPTION */}

        <p
          className="
          text-center
          text-gray-400
          mt-8
          "
        >
          Don’t have an account?{" "}

          <Link
            to="/signup"
            className="
            text-white
            font-semibold
            hover:text-gray-300
            transition-all
            duration-300
            "
          >
            Signup
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Login;