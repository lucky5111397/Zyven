import { useState, useEffect } from "react";
import {
  TbUsers,
  TbCode,
  TbLogout,
  TbPlus,
  TbLayoutDashboard,
  TbPackage,
  TbMenu2,
  TbChevronLeft,
  TbWorld,
  TbSearch,
  TbBoxOff,
  TbX,
  TbCodeDots,
  TbEye,
  TbDeviceFloppy,
  TbLoader,
} from "react-icons/tb";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { serverURL } from "./Home";
import axios from "axios";
import { setUserData, setAllUsers } from "../redux/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from "recharts";
import LiveComponentPreview from "../components/LiveComponentPreview";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#0a1f24] border border-white/10 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-white/50 mb-1">{label}</p>
      <p className="text-[#a78bfa] font-bold">
        {payload[0]?.value} components
      </p>
    </div>
  );
}

function PropsInput({ props, setProps }) {
  const [input, setInput] = useState("");

  const addProps = () => {
    const trimmed = input.trim();

    if (trimmed && !props.includes(trimmed)) {
      setProps([...props, trimmed]);
    }

    setInput("");
  };

  const removeProps = (p) => {
    setProps(props.filter((item) => item !== p));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
        {props.map((p) => (
          <span
            key={p}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
              background: "rgba(167,139,250,0.15)",
              color: "#a78bfa",
              border: "1px solid rgba(167,139,250,0.25)",
            }}
          >
            {p}
            <button
              type="button"
              className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer p-0 leading-none"
              style={{ color: "#a78bfa" }}
              onClick={() => removeProps(p)}
            >
              <TbX size={11} />
            </button>
          </span>
        ))}

        {props.length === 0 && (
          <span className="text-xs text-white/20 self-center">
            No props yet
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          placeholder='e.g. "title", "onClick", "children"'
          onKeyDown={(e) => e.key === "Enter" && addProps()}
          className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-[#a78bfa]/50 transition-colors"
        />

        <button
          type="button"
          onClick={addProps}
          className="px-3 sm:px-4 py-2 rounded-xl text-sm font-semibold border-none cursor-pointer transition-all whitespace-nowrap"
          style={{
            background: "rgba(167,139,250,0.15)",
            color: "#a78bfa",
            border: "1px solid rgba(167,139,250,0.25)",
          }}
        >
          Add
        </button>
      </div>

      <p className="text-[10px] text-white/20 mt-1.5">
        Press{" "}
        <span className="px-1 py-0.5 rounded bg-white/5 text-white/40 text-[9px]">
          Enter
        </span>{" "}
        or comma to add a prop
      </p>
    </div>
  );
}

const Toast = ({ message, type, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
      style={{
        background:
          type === "success"
            ? "#0d9f6e"
            : type === "error"
              ? "#e02424"
              : "#1c1c2e",
        color: "#fff",
        minWidth: "220px",
      }}
    >
      {type === "success" ? (
        <FiCheckCircle size={18} />
      ) : (
        <FiAlertCircle size={18} />
      )}

      <p className="text-sm font-medium">{message}</p>

      <button
        onClick={onClose}
        className="ml-auto text-white/60 hover:text-white text-xs"
      >
        <TbX size={18} />
      </button>
    </motion.div>
  );
};

function AddComponentForm() {
  const [name, setName] = useState("");
  const [props, setProps] = useState([]);
  const [code, setCode] = useState("");
  const [codeTab, setCodeTab] = useState("code");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [isPublished, setIsPublished] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };


  const handleSave = async () => {
    if (!name.trim() || !code.trim()) {
      showToast("Component name and code are required.", "error");
      return;
    }
    setSaving(true);

    try {
      const res = await axios.post(
        serverURL + "/api/component/save",
        {
          name,
          code,
          props,
        },
        { withCredentials: true }
      );

      setSavedId(res.data.component?._id || res.data._id);
      showToast("Component saved successfully!", "success");
      setSaving(false);
    } catch (error) {
      console.error(error);
      showToast("Component saved Failed", "error");
      setSaving(false);
    }
  };

  const handlePublished = async () => {
    if (!savedId) return;

    setPublishing(true);

    try {
      await axios.post(
        serverURL + "/api/component/publish",
        { componentId: savedId },
        { withCredentials: true }
      );

      setIsPublished(true);
      showToast("Published to npm successfully!", "success");
      setPublishing(false);
    } catch (error) {
      console.log(error);
      showToast("Published Failed", "error");
      setPublishing(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-3xl w-full mx-auto">
      <h2 className="text-base sm:text-lg font-bold mb-1">
        Add Component
      </h2>

      <p className="text-white/35 text-xs mb-5 sm:mb-6">
        Manually add a component - give it a name, define props, paste the code and preview it.
      </p>

      <div className="space-y-4 sm:space-y-5">
        <div className="p-3.5 sm:p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] space-y-2">
          <label
            htmlFor="name"
            className="text-xs font-semibold text-white/50 uppercase tracking-wide block"
          >
            Component Name
          </label>

          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. "PricingCard", "HeroSection"'
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#3be8ff]/40 transition-colors"
          />
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] space-y-2">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wide block">
            Props
          </label>

          <PropsInput props={props} setProps={setProps} />
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center justify-between px-3.5 sm:px-4 py-3 border-b border-white/[0.06]">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wide">
              Component Code
            </label>

            <div
              className="flex gap-1 rounded-xl p-1"
              style={{ background: "rgba(0,0,0,0.3)" }}
            >
              {["code", "preview"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCodeTab(tab)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize border-none cursor-pointer"
                  style={{
                    background:
                      codeTab === tab
                        ? "rgba(59,232,255,0.2)"
                        : "transparent",
                    color:
                      codeTab === tab
                        ? "#3be8ff"
                        : "rgba(255,255,255,0.4)",
                  }}
                >
                  {tab === "code" ? (
                    <TbCodeDots size={12} />
                  ) : (
                    <TbEye size={12} />
                  )}
                  <span className="hidden xs:inline">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {codeTab === "code" ? (
              <motion.div
                key="code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <textarea
                  onChange={(e) => setCode(e.target.value)}
                  value={code}
                  rows={12}
                  placeholder={`export default function MyComponent({ title }) {\n  return (\n    <div>\n      <h1>{title}</h1>\n    </div>\n  );\n}`}
                  className="w-full bg-[#0d1117] px-4 sm:px-5 py-4 text-xs leading-relaxed text-green-300 font-mono resize-none outline-none placeholder-white/10"
                  style={{ minHeight: 220 }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-3.5 sm:p-4"
              >
                {code.trim() ? (
                  <LiveComponentPreview code={code} />
                ) : (
                  <div
                    className="h-36 sm:h-40 flex items-center justify-center text-white/20 text-sm rounded-xl"
                    style={{
                      border: "1px dashed rgba(255,255,255,0.08)",
                    }}
                  >
                    Paste some code first to see the preview
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving || savedId || !name.trim() || !code.trim()}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all border-none cursor-pointer"
            style={{
              background: savedId
                ? "rgba(16,185,129,0.12)"
                : "rgba(59,232,255,0.12)",
              color: savedId ? "#34d399" : "#3be8ff",
              border: `1px solid ${savedId
                ? "rgba(16,185,129,0.3)"
                : "rgba(59,232,255,0.25)"
                }`,
            }}
          >
            {saving ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: 1,
                  ease: "linear",
                }}
              >
                <TbDeviceFloppy size={15} />
              </motion.span>
            ) : (
              <TbDeviceFloppy size={15} />
            )}

            {saving
              ? "Saving..."
              : savedId
                ? "Saved ✓"
                : "Save Component"}
          </motion.button>

          <AnimatePresence>
            {savedId && !isPublished && (
              <motion.button
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePublished}
                disabled={publishing}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 transition-all border-none cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                  boxShadow: publishing
                    ? "none"
                    : "0 0 20px rgba(6,182,212,0.25)",
                  color: "#fff",
                }}
              >
                {publishing ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <TbLoader size={15} />
                  </motion.span>
                ) : (
                  <TbLoader size={15} />
                )}

                {publishing ? "Publishing..." : "Publish to npm"}
              </motion.button>
            )}

            {isPublished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#34d399",
                }}
              >
                ✓ Published
              </motion.div>
            )}
          </AnimatePresence>

          {(savedId || name || code) && (
            <button
              onClick={() => {
                setName("");
                setProps([]);
                setCode("");
                setSavedId(null);
                setIsPublished(false);
                setCodeTab("code");
              }}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/30 hover:text-white/60 transition-all bg-transparent border-none hover:bg-white/5 cursor-pointer"
            >
              <TbX size={13} /> Reset
            </button>
          )}
        </div>

        <AnimatePresence>
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SidebarContent({ activeView, setActiveView, setSidebarOpen, navItems, handleLogout }) {
  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.05]">
        <div className="w-8 h-8 rounded-xl border border-[#3be8ff]/20 bg-[#031116] flex items-center justify-center shadow-[0_0_14px_rgba(59,232,255,0.2)] flex-shrink-0">
          <img
            src="/img.png"
            alt="Zyven"
            className="w-6 h-6 object-contain"
          />
        </div>

        <div>
          <span className="text-base font-bold block">Zyven</span>
          <span className="text-[10px] text-[#3be8ff]/60 font-semibold tracking-[2px] uppercase">
            Admin
          </span>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto md:hidden bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-white/40 hover:text-white/70 transition-colors"
        >
          <TbChevronLeft size={18} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, Icon }) => {
          const isActive = activeView === id;

          return (
            <button
              key={id}
              onClick={() => {
                setActiveView(id);
                setSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all bg-transparent border-none cursor-pointer text-left"
              style={{
                background: isActive
                  ? "rgba(59,232,255,0.08)"
                  : "transparent",
                color: isActive
                  ? "#3be8ff"
                  : "rgba(255,255,255,0.45)",
                borderLeft: isActive
                  ? "2px solid #3be8ff"
                  : "2px solid transparent",
              }}
            >
              <Icon
                size={16}
                style={{ opacity: isActive ? 1 : 0.7 }}
              />
              {label}
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/[0.05]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/[0.06] transition-all cursor-pointer bg-transparent border-none text-left"
        >
          <TbLogout size={16} />
          LogOut
        </button>
      </div>
    </>
  );
}

function AdminDashboard() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [componentSearch, setComponentSearch] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userData, allComponents, allUsers } = useSelector(
    (state) => state.user || {}
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${serverURL}/api/user/all-users`, {
          withCredentials: true,
        });
        dispatch(setAllUsers(res.data));
      } catch (error) {
        console.error("Fetch Users Error:", error);
      }
    };

    fetchUsers();
  }, [dispatch]);

  const components = Array.isArray(allComponents) ? allComponents : [];

  const publicComponents = components.filter(
    (c) => c?.visibility === "public"
  );

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      Icon: TbLayoutDashboard,
    },
    {
      id: "add",
      label: "Add Component",
      Icon: TbPackage,
    },
  ];

  const stats = [
    {
      label: "Total Users",
      value: Array.isArray(allUsers) ? allUsers.length : 0,
      icon: TbUsers,
      color: "#3be8ff",
    },
    {
      label: "Components Made",
      value: publicComponents.length,
      icon: TbCode,
      color: "#a78bfa",
    },
  ];

  const searchValue = componentSearch.trim().toLowerCase();

  const filteredPublicComponents = searchValue
    ? publicComponents.filter((c) => {
      const nameMatch = String(c?.name || "")
        .toLowerCase()
        .includes(searchValue);

      const propsMatch = Array.isArray(c?.props)
        ? c.props.some((p) =>
          String(p || "").toLowerCase().includes(searchValue)
        )
        : false;

      return nameMatch || propsMatch;
    })
    : publicComponents;

  const handleLogout = async () => {
    try {
      await axios.get(`${serverURL}/api/auth/logout`, {
        withCredentials: true,
      });

      dispatch(setUserData(null));
      setSidebarOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const chartData = (() => {
    if (!publicComponents.length) return [];

    const map = {};

    publicComponents.forEach((c) => {
      if (!c?.createdAt) return;

      const date = new Date(c.createdAt);

      if (Number.isNaN(date.getTime())) return;

      const label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      map[label] = (map[label] || 0) + 1;
    });

    return Object.entries(map)
      .map(([date, count]) => ({
        date,
        components: count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-12);
  })();

  return (
    <div
      className="min-h-screen bg-[#030b0d] text-white flex overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-[#040e11] border-r border-white/[0.06] fixed top-0 left-0 z-20">
        <SidebarContent
          activeView={activeView}
          setActiveView={setActiveView}
          setSidebarOpen={setSidebarOpen}
          navItems={navItems}
          handleLogout={handleLogout}
        />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px] md:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 300,
              }}
              className="fixed top-0 left-0 z-40 flex flex-col w-64 min-h-screen bg-[#040e11] border-r border-white/[0.06] md:hidden"
            >
              <SidebarContent
                activeView={activeView}
                setActiveView={setActiveView}
                setSidebarOpen={setSidebarOpen}
                navItems={navItems}
                handleLogout={handleLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 md:ml-60 min-h-screen overflow-y-auto">
        <div className="sticky top-0 z-10 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 bg-[#030b0d]/90 backdrop-blur-md border-b border-white/[0.05] flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all flex-shrink-0"
            >
              <TbMenu2 size={20} />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold truncate">
                {activeView === "dashboard"
                  ? "Dashboard"
                  : "Add Components"}
              </h1>

              <p className="text-white/35 text-xs truncate">
                Welcome back, {userData?.name || "Admin"}
              </p>
            </div>
          </div>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate("/generate")}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#030b0d] bg-gradient-to-r from-[#3be8ff] to-[#0ab5d4] hover:opacity-90 transition-all shadow-[0_0_20px_rgba(59,232,255,0.2)] cursor-pointer border-none flex-shrink-0"
          >
            <TbPlus size={14} />
            <span className="hidden sm:inline">AI Component</span>
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {activeView === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4 sm:space-y-6"
            >
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {stats.map(
                  ({ label, value, icon: Icon, color }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.05,
                        duration: 0.3,
                      }}
                      className="p-3.5 sm:p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] transition-all"
                    >
                      <div className="mb-2.5 sm:mb-3">
                        <div
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center"
                          style={{
                            background: `${color}15`,
                            border: `1px solid ${color}25`,
                          }}
                        >
                          <Icon size={15} style={{ color }} />
                        </div>
                      </div>

                      <p className="text-xl sm:text-2xl font-bold">
                        {Number(value || 0).toLocaleString()}
                      </p>

                      <p className="text-white/40 text-xs mt-0.5">
                        {label}
                      </p>
                    </motion.div>
                  )
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="p-4 sm:p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02]"
              >
                <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-5 gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      Public Components Published
                    </p>

                    <p className="text-white/35 text-xs mt-0.5">
                      Date-wise breakdown
                    </p>
                  </div>

                  <span className="text-[10px] font-semibold px-2 sm:px-2.5 py-1 rounded-full bg-[#a78bfa]/10 text-[#a78bfa] border border-[#a78bfa]/20 flex-shrink-0">
                    Last 12 days
                  </span>
                </div>

                {chartData.length === 0 ? (
                  <div className="h-[180px] sm:h-[220px] flex items-center justify-center text-white/20 text-sm">
                    No public components yet
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 5,
                        bottom: 0,
                        left: -25,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="componentGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#a78bfa"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="100%"
                            stopColor="#a78bfa"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.04)"
                      />

                      <XAxis
                        dataKey="date"
                        tick={{
                          fill: "rgba(255,255,255,0.3)",
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />

                      <YAxis
                        tick={{
                          fill: "rgba(255,255,255,0.3)",
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={30}
                      />

                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{
                          stroke: "rgba(255,255,255,0.06)",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="components"
                        stroke="#a78bfa"
                        strokeWidth={2}
                        fill="url(#componentGradient)"
                        dot={false}
                        activeDot={{
                          r: 4,
                          fill: "#a78bfa",
                          strokeWidth: 0,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{
                        background: "rgba(59,232,255,0.1)",
                        border: "1px solid rgba(59,232,255,0.2)",
                      }}
                    >
                      <TbWorld
                        size={14}
                        style={{ color: "#3be8ff" }}
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-sm">
                        Public Components
                      </p>

                      <p className="text-white/35 text-[11px]">
                        {publicComponents.length} components visible to all users
                      </p>
                    </div>
                  </div>

                  <div className="relative w-full sm:w-48">
                    <TbSearch
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                    />

                    <input
                      value={componentSearch}
                      onChange={(e) =>
                        setComponentSearch(e.target.value)
                      }
                      placeholder="Search components..."
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-[#3be8ff]/40 transition-colors"
                    />
                  </div>
                </div>

                {filteredPublicComponents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-3 text-white/20">
                    <TbBoxOff size={32} />

                    <p className="text-sm">
                      {searchValue
                        ? "No components match your search"
                        : "No public components yet"}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {filteredPublicComponents.map((c, i) => (
                      <motion.div
                        key={i}
                        className="flex items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0"
                            style={{
                              background: "rgba(167,139,250,0.1)",
                              border: "1px solid rgba(167,139,250,0.2)",
                            }}
                          >
                            <TbCode
                              size={14}
                              style={{ color: "#a78bfa" }}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">
                              {c.name}
                            </p>

                            {c.props?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {c.props.slice(0, 4).map((p) => (
                                  <div
                                    key={p}
                                    className="px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                                    style={{
                                      background:
                                        "rgba(167,139,250,0.1)",
                                      color:
                                        "rgba(167,139,250,0.7)",
                                    }}
                                  >
                                    {p}
                                  </div>
                                ))}

                                {c.props?.length > 4 && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[10px] text-white/25">
                                    +{c.props.length - 4} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] text-white/25 whitespace-nowrap">
                            {new Date(c.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>

                          <span
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              background:
                                "rgba(59,232,255,0.08)",
                              color: "#3be8ff",
                              border:
                                "1px solid rgba(59,232,255,0.2)",
                            }}
                          >
                            <TbWorld size={9} />
                            Public
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeView === "add" && (
            <motion.div
              key="add"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AddComponentForm />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default AdminDashboard;