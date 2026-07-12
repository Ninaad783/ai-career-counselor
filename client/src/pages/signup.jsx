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

const Signup = () => {

  const navigate = useNavigate();
  const toast = useToast();

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
    });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSignup = async () => {

    try {

      const res = await API.post(
        "/auth/register",
        formData
      );

      console.log(res.data);

      toast.success("Signup Successful");

      navigate("/login");

    } catch (error) {

      console.log(error);

      toast.error("Signup Failed");
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

      {/* LEFT IMAGE */}

      <div className="hidden lg:flex">

        <img
          src="/sig.png"
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

      {/* SIGNUP CARD */}

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
          Create Account
        </h1>

        <div className="flex flex-col gap-5">

          <input
            type="text"
            placeholder="Name"
            name="name"
            onChange={handleChange}
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
          />

          <input
            type="email"
            placeholder="Email"
            name="email"
            onChange={handleChange}
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
          />

          {/* PASSWORD */}

          <div className="relative">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              name="password"
              onChange={handleChange}
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
            onClick={handleSignup}
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
            Create Account
          </button>

          {/* LOGIN OPTION */}

          <p
            className="
            text-center
            text-gray-400
            mt-4
            "
          >
            Already have an account?{" "}

            <Link
              to="/login"
              className="
              text-white
              font-semibold
              hover:text-gray-300
              transition-all
              duration-300
              "
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
};

export default Signup;