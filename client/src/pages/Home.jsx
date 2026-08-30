import { useState } from "react";
import axios from "axios";
import Auth from "../components/Auth";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { HiSparkles } from "react-icons/hi2";
import {
  TbArrowRight,
  TbCopy,
  TbCheck,
  TbMenu2,
  TbX,
  TbLogout,
  TbComponents,
  TbLayout,
  TbAdjustments,
  TbCode,
  TbBrandNpm,
  TbPlayerPlay,
  TbCreditCard,
  TbHome,
} from "react-icons/tb";
import { setallComponents, setAllUsers, setUserData } from "../redux/userSlice";

export const serverURL = "http://localhost:8000";

const features = [
  {
    icon: TbLayout,
    title: "Prebuilt UI Components",
    text: "Install Zyven and use ready-made components instantly.",
  },
  {
    icon: HiSparkles,
    title: "AI Component Generator",
    text: "Describe your UI and generate React components in seconds.",
  },
  {
    icon: TbAdjustments,
    title: "Customizable Props",
    text: "Modify component props and preview changes easily.",
  },
  {
    icon: TbCode,
    title: "Clean JSX Code",
    text: "Copy production-ready JSX directly into your project.",
  },
  {
    icon: TbBrandNpm,
    title: "NPM Library",
    text: "Import Zyven components with a simple npm install command.",
  },
  {
    icon: TbPlayerPlay,
    title: "Live Preview",
    text: "Preview your generated components before using the code.",
  },
];

const steps = [
  {
    number: "01",
    title: "Install Library",
    text: "npm install zyven-ui to access all prebuilt UI components.",
  },
  {
    number: "02",
    title: "Use Components",
    text: "Import and customize with props for any design requirement.",
  },
  {
    number: "03",
    title: "Generate with AI",
    text: "Describe your UI and let AI build the component for you.",
  },
  {
    number: "04",
    title: "Copy & Use",
    text: "Paste the clean JSX code straight into your project.",
  },
];

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showAuth, setShowAuth] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const userData = useSelector((state) => state.user.userData);

  // =========================
  // GET USER INITIALS
  // =========================
  const getLetters = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // =========================
  // CLOSE MENUS
  // =========================
  const closeMenus = () => {
    setProfileOpen(false);
    setMobileMenu(false);
  };

  // =========================
  // HOME
  // =========================
  const handleHome = () => {
    closeMenus();
    navigate("/");
  };

  // =========================
  // COMPONENTS
  // =========================
  const handleComponents = () => {
    closeMenus();
    navigate("/component");
  };

  // =========================
  // MY COMPONENTS
  // =========================
  const handleMyComponents = () => {
    closeMenus();

    if (!userData) {
      setShowAuth(true);
      return;
    }

    navigate("/mycomponents");
  };

  // =========================
  // PRICING
  // =========================
  const handlePricing = () => {
    closeMenus();
    navigate("/pricing");
  };

  // =========================
  // GENERATE
  // =========================
  const handleGenerate = () => {
    if (!userData) {
      setShowAuth(true);
      return;
    }

    closeMenus();
    navigate("/generate");
  };

  // =========================
  // GET STARTED
  // =========================
  const handleGetStarted = () => {
    if (!userData) {
      setShowAuth(true);
      return;
    }

    navigate("/generate");
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = async () => {
    try {
      await axios.get(`${serverURL}/api/auth/logout`, {
        withCredentials: true,
      });

      dispatch(setUserData(null));
      dispatch(setAllUsers([]))
      dispatch(setallComponents([]))

      setProfileOpen(false);
      setMobileMenu(false);

      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  // =========================
  // COPY NPM COMMAND
  // =========================
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("npm install zyven-ui");

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.log("Copy Error:", error);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#02090b] text-white overflow-x-hidden"
      style={{ fontFamily: "DM Sans, sans-serif" }}
    >
      {/* =========================
          BACKGROUND
      ========================= */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(59,232,255,0.13) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[430px] bg-[radial-gradient(ellipse,rgba(59,232,255,0.07)_0%,transparent_65%)]" />
      </div>

      {/* =========================
          NAVBAR
      ========================= */}
      <nav className="relative z-50 h-[68px] flex items-center justify-between px-5 sm:px-8 lg:px-10 border-b border-white/[0.05] bg-[#02090b]/80 backdrop-blur-xl">
        {/* LOGO */}
        <button
          onClick={handleHome}
          className="flex items-center gap-3"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#3be8ff]/20 bg-[#031116] shadow-[0_0_20px_rgba(59,232,255,0.2)]">
            <img
              src="/img.png"
              alt="Zyven"
              className="h-7 w-7 object-contain"
            />
          </div>

          <span className="text-xl font-bold tracking-tight">
            Zyven
          </span>
        </button>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-3">
          {/* HOME */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleHome}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.015] text-sm text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
          >
            <TbHome className="text-lg" />
            Home
          </motion.button>

          {/* COMPONENTS */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleComponents}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.015] text-sm text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
          >
            <TbComponents className="text-lg" />
            Components
          </motion.button>

          {/* PRICING */}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={handlePricing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/[0.015] text-sm text-white/60 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all"
          >
            <TbCreditCard className="text-lg" />
            Pricing
          </motion.button>

          {/* USER */}
          {userData ? (
            <div className="relative ml-1">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.05] hover:border-[#3be8ff]/30 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3be8ff] to-[#0ab5d4] flex items-center justify-center text-[#021014] text-xs font-bold">
                  {getLetters(userData.name)}
                </div>

                <span className="max-w-[110px] truncate text-sm font-medium text-white/80">
                  {userData.name}
                </span>
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 8,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: 8,
                      scale: 0.96,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                    className="absolute right-0 top-14 w-56 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#09171b] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                  >
                    <div className="px-4 py-4 border-b border-white/[0.06]">
                      <p className="text-sm font-semibold text-white truncate">
                        {userData.name}
                      </p>

                      <p className="mt-1 text-xs text-white/35 truncate">
                        {userData.email}
                      </p>
                    </div>

                    <div className="p-1.5">
                      {/* MY COMPONENTS */}
                      <button
                        onClick={handleMyComponents}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/55 hover:text-white hover:bg-white/[0.05] transition-all text-left"
                      >
                        <TbComponents className="text-lg" />
                        <span>My Components</span>
                      </button>

                      {/* PRICING */}
                      <button
                        onClick={handlePricing}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/55 hover:text-white hover:bg-white/[0.05] transition-all text-left"
                      >
                        <TbCreditCard className="text-lg" />
                        <span>Pricing</span>
                      </button>

                      {/* LOGOUT */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/55 hover:text-white hover:bg-white/[0.05] transition-all text-left"
                      >
                        <TbLogout className="text-lg" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{
                y: -2,
                scale: 1.02,
              }}
              whileTap={{
                scale: 0.97,
              }}
              onClick={handleGetStarted}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#3be8ff] to-[#0ab5d4] text-[#021014] text-sm font-semibold hover:opacity-90 transition-all"
            >
              Get Started
            </motion.button>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-white/10 text-white/70 hover:text-white"
        >
          {mobileMenu ? (
            <TbX className="text-xl" />
          ) : (
            <TbMenu2 className="text-xl" />
          )}
        </button>
      </nav>

      {/* =========================
          MOBILE MENU
      ========================= */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="relative z-40 md:hidden border-b border-white/[0.05] bg-[#02090b]/95 backdrop-blur-xl"
          >
            <div className="p-4 space-y-2">
              {/* HOME */}
              <button
                onClick={handleHome}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05] text-left"
              >
                <TbHome className="text-xl" />
                Home
              </button>

              {/* COMPONENTS */}
              <button
                onClick={handleComponents}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05] text-left"
              >
                <TbComponents className="text-xl" />
                Components
              </button>

              {/* GENERATE */}
              <button
                onClick={handleGenerate}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#3be8ff] hover:bg-[#3be8ff]/[0.05] text-left"
              >
                <HiSparkles className="text-xl" />
                Generate AI Component
              </button>

              {/* PRICING */}
              <button
                onClick={handlePricing}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05] text-left"
              >
                <TbCreditCard className="text-xl" />
                Pricing
              </button>

              {userData ? (
                <>
                  {/* MY COMPONENTS */}
                  <button
                    onClick={handleMyComponents}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05] text-left"
                  >
                    <TbComponents className="text-xl" />
                    My Components
                  </button>

                  {/* LOGOUT */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.05] text-left"
                  >
                    <TbLogout className="text-xl" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowAuth(true);
                    setMobileMenu(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#3be8ff] to-[#0ab5d4] text-[#021014] font-semibold"
                >
                  Get Started
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================
          MAIN
      ========================= */}
      <div className="relative z-10">
        {/* =========================
            HERO
        ========================= */}
        <section className="min-h-[calc(100vh-68px)] flex flex-col items-center justify-center px-5 text-center pb-10">
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#3be8ff]/20 bg-[#3be8ff]/[0.04] text-[#3be8ff] text-[10px] font-semibold uppercase tracking-[2px]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3be8ff] shadow-[0_0_8px_#3be8ff]" />
            AI-Powered React UI Library
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.55,
              delay: 0.04,
            }}
            className="max-w-3xl text-[40px] sm:text-[50px] lg:text-[56px] leading-[1.05] font-bold tracking-[-1px]"
          >
            Build React UI
            <span className="block text-[#3be8ff]">
              Faster with AI
            </span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
            className="mt-4 max-w-2xl text-sm sm:text-base leading-6 text-white/45"
          >
            Use prebuilt Zyven components or generate custom ones with AI.
            <br className="hidden sm:block" />
            Copy clean JSX directly into your project in seconds.
          </motion.p>

          {/* NPM */}
          <motion.button
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.15,
            }}
            onClick={handleCopy}
            className="group mt-5 flex items-center gap-4 px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.055] hover:border-[#3be8ff]/20 transition-all"
          >
            <span className="text-[#3be8ff] font-mono text-sm">
              $
            </span>

            <span className="font-mono text-sm text-white/65">
              npm install zyven-ui
            </span>

            {copied ? (
              <TbCheck className="text-lg text-[#3be8ff]" />
            ) : (
              <TbCopy className="text-lg text-white/25 group-hover:text-white/60 transition-colors" />
            )}
          </motion.button>

          {/* HERO BUTTONS */}
          <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
            <motion.button
              whileHover={{
                y: -2,
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={handleGetStarted}
              className="group flex items-center justify-center gap-2 min-w-[145px] px-6 py-3 rounded-xl bg-white text-[#071116] font-semibold text-sm hover:bg-white/90 transition-all"
            >
              {userData ? "Start Building" : "Get Started"}

              <TbArrowRight className="text-lg group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              whileHover={{
                y: -2,
                scale: 1.03,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={handleGenerate}
              className="flex items-center justify-center gap-2 min-w-[205px] px-6 py-3 rounded-xl border border-white/10 bg-white/[0.015] text-white/60 hover:text-white hover:border-[#3be8ff]/30 hover:bg-[#3be8ff]/[0.04] transition-all text-sm"
            >
              <HiSparkles className="text-[#3be8ff]" />
              Generate AI Component
            </motion.button>
          </div>

          {/* CODE PREVIEW */}
          <motion.div
            initial={{
              opacity: 0,
              y: 18,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
              duration: 0.6,
            }}
            className="mt-7 w-full max-w-2xl bg-[#0a1a1e]/80 border border-white/[0.07] rounded-2xl p-4 text-left shadow-[0_25px_50px_rgba(0,0,0,0.45)] backdrop-blur-sm"
          >
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />

              <span className="ml-3 text-[11px] text-white/25 font-mono">
                App.jsx
              </span>
            </div>

            <div className="rounded-xl bg-[#061114] border border-white/[0.05] px-4 py-3 font-mono text-[10px] sm:text-xs leading-5 overflow-hidden">
              <div>
                <span className="text-[#c084fc]">
                  import
                </span>{" "}
                <span className="text-white/70">
                  React
                </span>{" "}
                <span className="text-[#c084fc]">
                  from
                </span>{" "}
                <span className="text-[#86efac]">
                  'react'
                </span>
                ;
              </div>

              <div className="mt-1">
                <span className="text-[#c084fc]">
                  export default function
                </span>{" "}
                <span className="text-[#67e8f9]">
                  App
                </span>
                () {"{"}
              </div>

              <div className="pl-4 text-white/55">
                <span className="text-[#c084fc]">
                  return
                </span>{" "}
                (
              </div>

              <div className="pl-8 text-white/65">
                &lt;
                <span className="text-[#67e8f9]">
                  div
                </span>{" "}
                <span className="text-[#f9a8d4]">
                  className
                </span>
                =
                <span className="text-[#86efac]">
                  "p-6"
                </span>
                &gt;
              </div>

              <div className="pl-12 text-white/75">
                Build with{" "}
                <span className="text-[#3be8ff]">
                  Zyven AI
                </span>
              </div>

              <div className="pl-8 text-white/65">
                &lt;/
                <span className="text-[#67e8f9]">
                  div
                </span>
                &gt;
              </div>

              <div className="pl-4 text-white/55">
                );
              </div>

              <div>
                {"}"}
              </div>
            </div>
          </motion.div>
        </section>

        {/* =========================
            FEATURES
        ========================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <motion.div
            initial={{
              opacity: 0,
              y: 16,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.55,
            }}
            className="text-center mb-10 sm:mb-14"
          >
            <p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#3be8ff]/60 mb-3">
              What's inside
            </p>

            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{
                fontFamily: "Syne, sans-serif",
              }}
            >
              Everything you need
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{
                    opacity: 0,
                    y: 16,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.05,
                  }}
                  whileHover={{
                    y: -6,
                    scale: 1.02,
                  }}
                  className="rounded-2xl border border-white/[0.07] bg-[#0a1a1e]/70 p-5 hover:border-[#3be8ff]/20 hover:bg-[#0a1a1e] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#3be8ff]/[0.08] border border-[#3be8ff]/10 flex items-center justify-center mb-4">
                    <Icon className="text-[#3be8ff] text-xl" />
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs leading-5 text-white/35">
                    {item.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* =========================
            HOW IT WORKS
        ========================= */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <motion.div
            initial={{
              opacity: 0,
              y: 16,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.55,
            }}
            className="text-center mb-12"
          >
            <p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#3be8ff]/60 mb-3">
              Simple process
            </p>

            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight"
              style={{
                fontFamily: "Syne, sans-serif",
              }}
            >
              How it works
            </h2>
          </motion.div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            <div className="hidden lg:block absolute top-10 left-[12%] right-[12%] h-px bg-[#3be8ff]/15" />

            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -7,
                }}
                className="relative z-10 text-center"
              >
                <motion.div
                  whileHover={{
                    scale: 1.08,
                  }}
                  className="mx-auto w-20 h-20 rounded-2xl border border-[#3be8ff]/20 bg-[#0a1a1e] flex items-center justify-center text-[#3be8ff] text-xs font-bold shadow-[0_0_25px_rgba(59,232,255,0.08)]"
                >
                  {step.number}
                </motion.div>

                <h3 className="mt-6 text-base font-semibold">
                  {step.title}
                </h3>

                <p className="mt-3 max-w-[230px] mx-auto text-xs leading-5 text-white/35">
                  {step.text}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* =========================
            CTA
        ========================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.55,
            }}
            className="relative overflow-hidden rounded-3xl border border-[#3be8ff]/15 bg-gradient-to-br from-[#071518] to-[#040f12] p-8 sm:p-14 text-center"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(59,232,255,0.08)_0%,transparent_60%)] pointer-events-none" />

            <div className="relative z-10">
              <p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#3be8ff]/60 mb-4">
                Start building
              </p>

              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight mb-5"
                style={{
                  fontFamily: "Syne, sans-serif",
                }}
              >
                Ready to generate
                <br />
                your new component?
              </h2>

              {userData ? (
                <p className="text-white/40 mb-7 sm:mb-8 text-sm max-w-md mx-auto leading-relaxed">
                  Welcome back,{" "}
                  <span className="text-[#3be8ff]">
                    {userData.name}
                  </span>
                  ! Continue building amazing components.
                </p>
              ) : (
                <p className="text-white/40 mb-7 sm:mb-8 text-sm max-w-md mx-auto leading-relaxed">
                  Sign in with Google, get 150 free AI Credits, and start
                  generating production-ready UI components instantly.
                </p>
              )}

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {userData ? (
                  <>
                    <motion.button
                      whileHover={{
                        y: -2,
                        scale: 1.05,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      onClick={handleGenerate}
                      className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#3be8ff] text-[#030b0d] font-semibold text-sm shadow-[0_0_30px_rgba(59,232,255,0.25)] hover:shadow-[0_0_40px_rgba(59,232,255,0.4)] transition-shadow"
                    >
                      <HiSparkles className="text-lg" />
                      Generate AI Component
                    </motion.button>

                    <motion.button
                      whileHover={{
                        y: -2,
                        scale: 1.03,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      onClick={handleMyComponents}
                      className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-[#3be8ff]/30 transition-all text-sm"
                    >
                      <TbComponents className="text-[#3be8ff] text-lg" />
                      My Components
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{
                        y: -2,
                        scale: 1.05,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      onClick={handleGetStarted}
                      className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#3be8ff] text-[#030b0d] font-semibold text-sm shadow-[0_0_30px_rgba(59,232,255,0.25)] hover:shadow-[0_0_40px_rgba(59,232,255,0.4)] transition-shadow"
                    >
                      <HiSparkles className="text-lg" />
                      Get Started Free
                    </motion.button>

                    <motion.button
                      whileHover={{
                        y: -2,
                        scale: 1.03,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      onClick={handleComponents}
                      className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-[#3be8ff]/30 transition-all text-sm"
                    >
                      <TbComponents className="text-[#3be8ff] text-lg" />
                      Components
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* =========================
            FOOTER
        ========================= */}
        <footer className="relative border-t border-[#3be8ff]/20 bg-[#061114] overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-[radial-gradient(ellipse,rgba(59,232,255,0.08)_0%,transparent_70%)] pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-5 sm:px-6 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {/* BRAND */}
              <div className="lg:col-span-2">
                <button
                  onClick={handleHome}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#3be8ff]/20 bg-[#031116] shadow-[0_0_20px_rgba(59,232,255,0.2)]">
                    <img
                      src="/img.png"
                      alt="Zyven"
                      className="h-8 w-8 object-contain"
                    />
                  </div>

                  <span className="text-xl font-bold text-white">
                    Zyven
                  </span>
                </button>

                <p className="mt-4 max-w-sm text-sm leading-6 text-white/45">
                  Build beautiful React interfaces faster with
                  prebuilt components and AI-powered generation.
                </p>
              </div>

              {/* PRODUCT */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">
                  Product
                </h3>

                <div className="flex flex-col gap-3 text-sm text-white/45">
                  <button
                    onClick={handleComponents}
                    className="w-fit hover:text-[#3be8ff] transition-colors"
                  >
                    Components
                  </button>

                  <button
                    onClick={handleGenerate}
                    className="w-fit hover:text-[#3be8ff] transition-colors"
                  >
                    AI Generator
                  </button>

                  <button
                    onClick={handlePricing}
                    className="w-fit hover:text-[#3be8ff] transition-colors"
                  >
                    Pricing
                  </button>

                  <button
                    onClick={handleMyComponents}
                    className="w-fit hover:text-[#3be8ff] transition-colors"
                  >
                    My Components
                  </button>
                </div>
              </div>

              {/* RESOURCES */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-4">
                  Resources
                </h3>

                <div className="flex flex-col gap-3 text-sm text-white/45">
                  <button
                    onClick={handleComponents}
                    className="w-fit hover:text-[#3be8ff] transition-colors"
                  >
                    Documentation
                  </button>

                  <button
                    onClick={handleComponents}
                    className="w-fit hover:text-[#3be8ff] transition-colors"
                  >
                    GitHub
                  </button>

                  <button
                    onClick={() => {
                      window.location.href =
                        "mailto:support@zyven.com";
                    }}
                    className="w-fit hover:text-[#3be8ff] transition-colors"
                  >
                    Support
                  </button>
                </div>
              </div>
            </div>

            {/* FOOTER BOTTOM */}
            <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-white/35">
                © 2026 Zyven. All rights reserved.
              </p>

              <div className="flex items-center gap-2 text-xs text-white/35">
                <span>Built with</span>

                <span className="text-[#3be8ff]">
                  React
                </span>

                <span>+</span>

                <span className="text-[#3be8ff]">
                  AI
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* =========================
          AUTH MODAL
      ========================= */}
      {showAuth && (
        <Auth
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}

export default Home;