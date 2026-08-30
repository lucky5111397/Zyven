import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  TbCode,
  TbEye,
  TbBox,
  TbCopy,
  TbCheck,
  TbPackage,
  TbChevronRight,
  TbSearch,
  TbX,
  TbMenu2,
} from "react-icons/tb";
import { HiSparkles } from "react-icons/hi2";
import LiveComponentPreview from "../components/LiveComponentPreview";

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 3500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer px-2 py-1 rounded-lg"
      >
        {copied ? (
          <TbCheck size={13} className="text-[#3be8ff]" />
        ) : (
          <TbCopy size={13} />
        )}

        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function CodeBlock({ code, lang = "jsx" }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "#060f11",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.05]">
        <span className="text-[10px] text-white/25 font-mono uppercase tracking-widest">
          {lang}
        </span>

        <CopyBtn text={code} />
      </div>

      <pre className="px-4 py-3.5 text-[12px] font-mono text-green-300 leading-relaxed overflow-x-auto whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function GuidePanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 sm:px-8 text-center py-10 sm:py-16 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#3be8ff]/[0.07] border border-[#3be8ff]/15 flex items-center justify-center mx-auto mb-5 sm:mb-6">
          <TbPackage size={24} className="text-[#3be8ff]/60" />
        </div>

        <h2 className="text-base sm:text-lg font-bold mb-2 text-white/80">
          Select a component
        </h2>

        <p className="text-white/35 text-xs sm:text-sm mb-8 sm:mb-10 max-w-sm mx-auto leading-relaxed">
          Click any component from the sidebar to see its preview,
          code, and usage guide.
        </p>

        <p className="text-white/20 text-xs">
          Select a component from the sidebar to get started
        </p>
      </motion.div>
    </div>
  );
}

function DetailPanel({ component, onBack }) {
  const [activeTab, setActiveTab] = useState("preview");

  const importCode = `import ${component.name} from "./${component.name}";`;

  const usageCode = `import ${component.name} from "./${component.name}";

export default function App() {
  return (
    <div>
      <${component.name}${component.props?.length
      ? `\n        ${component.props
        .map((p) => `${p}={/* value */}`)
        .join("\n        ")}`
      : ""
    } />
    </div>
  );
};`;

  return (
    <motion.div
      key={component._id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col h-full"
    >
      <div className="flex items-start sm:items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-white/[0.06] gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="sm:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/50 hover:text-white/80 transition-colors cursor-pointer shrink-0"
            >
              <TbX size={14} className="rotate-180" />
            </button>
          )}

          <div className="min-w-0">
            <h2 className="text-base sm:text-base font-bold text-white truncate">
              {component.name}
            </h2>

            <p className="text-white/35 text-[11px] sm:text-xs mt-0.5 truncate">
              {component.props?.length > 0
                ? `Props: ${component.props.join(", ")}`
                : "No props"}
            </p>
          </div>
        </div>

        <div
          className="flex gap-1 rounded-xl p-1 overflow-x-auto shrink-0"
          style={{
            background: "rgba(0,0,0,0.3)",
          }}
        >
          {[
            {
              id: "preview",
              icon: TbEye,
              label: "Preview",
            },
            {
              id: "code",
              icon: TbCode,
              label: "Code",
            },
            {
              id: "guide",
              icon: TbBox,
              label: "Guide",
            },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-all capitalize cursor-pointer border-none whitespace-nowrap"
              style={{
                background:
                  activeTab === id
                    ? "rgba(59,232,255,0.15)"
                    : "transparent",

                color:
                  activeTab === id
                    ? "#3be8ff"
                    : "rgba(255,255,255,0.35)",
              }}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {activeTab === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="h-full min-h-[400px]"
            >
              <div
                className="w-full min-h-[400px] h-full rounded-2xl overflow-hidden flex items-center justify-center p-4 sm:p-8"
                style={{
                  background: "rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="w-full">
                  <LiveComponentPreview code={component.code} fallbackMessage="Saved component code is unavailable." />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <p className="text-xs font-semibold text-white/50 mb-2 flex items-center gap-2">
                  <TbCode
                    size={14}
                    className="text-[#3be8ff]/60"
                  />
                  Import
                </p>

                <CodeBlock
                  code={importCode}
                  lang="jsx"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-white/50 mb-2 flex items-center gap-2">
                  <TbCode
                    size={14}
                    className="text-[#3be8ff]/60"
                  />
                  Component Code
                </p>

                <CodeBlock
                  code={
                    component.code ||
                    "// No component code available"
                  }
                  lang="jsx"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-white/50 mb-2 flex items-center gap-2">
                  <HiSparkles
                    size={14}
                    className="text-[#3be8ff]/60"
                  />
                  Usage
                </p>

                <CodeBlock
                  code={usageCode}
                  lang="jsx"
                />
              </div>
            </motion.div>
          )}

          {activeTab === "guide" && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <p className="text-[10px] font-bold tracking-[3px] uppercase text-[#3be8ff]/50">
                Usage Guide
              </p>

              <div>
                <p className="text-xs font-semibold text-white/50 mb-3 flex items-center gap-2">
                  <TbCode size={13} />

                  <span className="text-[#3be8ff]/70 font-bold">
                    01
                  </span>

                  Copy the component code
                </p>

                <CodeBlock
                  code={
                    component.code ||
                    "// No component code available"
                  }
                  lang="jsx"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-white/50 mb-3 flex items-center gap-2">
                  <TbCode size={13} />

                  <span className="text-[#3be8ff]/70 font-bold">
                    02
                  </span>

                  Create a new file
                </p>

                <CodeBlock
                  code={`${component.name}.jsx`}
                  lang="file"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-white/50 mb-3 flex items-center gap-2">
                  <HiSparkles size={13} />

                  <span className="text-[#3be8ff]/70 font-bold">
                    03
                  </span>

                  Import and use the component
                </p>

                <CodeBlock
                  code={usageCode}
                  lang="jsx"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function SidebarComponent({
  myComponents,
  selected,
  onSelect,
  search,
  setSearch,
}) {
  return (
    <>
      <div className="px-3 py-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <TbSearch
            size={13}
            className="text-white/25 shrink-0"
          />

          <input
            placeholder="Search..."
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            className="bg-transparent text-xs text-white/70 placeholder-white/20 outline-none w-full"
          />
        </div>
      </div>

      <div className="px-4 pt-3 pb-1.5">
        <p className="text-[9px] font-bold tracking-[2.5px] uppercase text-white/20">
          My Components · {myComponents.length}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-1 px-2">
        {myComponents.length === 0 ? (
          <p className="text-white/20 text-xs text-center py-8 px-3">
            No components found
          </p>
        ) : (
          myComponents.map((c) => (
            <button
              key={c._id}
              onClick={() => onSelect(c)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer border text-left mb-0.5"
              style={{
                background:
                  selected?._id === c._id
                    ? "rgba(59,232,255,0.07)"
                    : "transparent",

                borderColor:
                  selected?._id === c._id
                    ? "rgba(59,232,255,0.18)"
                    : "transparent",

                color:
                  selected?._id === c._id
                    ? "#3be8ff"
                    : "rgba(255,255,255,0.5)",
              }}
            >
              <span className="truncate">
                {c.name}
              </span>

              <TbChevronRight
                size={13}
                className="shrink-0 ml-2 opacity-40"
              />
            </button>
          ))
        )}
      </div>
    </>
  );
}

function MyComponents() {
  const navigate = useNavigate();
  const { userData } = useSelector((s) => s.user);

  const [myComponentsList, setMyComponentsList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const serverURL = import.meta.env.VITE_SERVER_URL;

  useEffect(() => {
    const fetchMyComponents = async () => {
      if (!userData) return;
      try {
        const response = await axios.get(`${serverURL}/api/component/my-components`, {
          withCredentials: true,
        });
        if (response.data?.success) {
          setMyComponentsList(response.data.components);
        }
      } catch (error) {
        console.error("Failed to fetch my components:", error);
      }
    };
    fetchMyComponents();
  }, [userData, serverURL]);

  const myComponents = myComponentsList
    .filter((c) =>
      c.name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      a.name?.localeCompare(b.name)
    );

  const handleSelect = (c) => {
    setSelected(c);
    setSidebarOpen(false);
  };

  return (
    <div
      className="min-h-screen bg-[#030b0d] text-white flex flex-col overflow-hidden"
      style={{
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 border-b border-white/[0.05] bg-black/20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="sm:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <TbMenu2 size={18} />
          </button>

          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#3be8ff] to-[#bd61ff] p-[1px] flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#030b0d] rounded-xl flex items-center justify-center">
                <img src="/img.png" alt="Zyven" className="w-4 h-4 object-contain" />
              </div>
            </div>
            <span className="text-base sm:text-xl font-bold tracking-tight text-white group-hover:text-[#3be8ff] transition-colors">
              Zyven
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/generate")}
          className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all hover:scale-105 cursor-pointer border-none"
          style={{
            background: "linear-gradient(135deg, #3be8ff 0%, #bd61ff 100%)",
            color: "#000",
            boxShadow: "0 4px 15px rgba(59,232,255,0.3)",
          }}
        >
          <HiSparkles size={16} />
          <span className="hidden sm:inline">Generate New</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SIDEBAR - DESKTOP */}
        <div className="hidden sm:flex w-72 flex-col border-r border-white/[0.05] bg-black/20 shrink-0">
          <SidebarComponent
            myComponents={myComponents}
            selected={selected}
            onSelect={handleSelect}
            search={search}
            setSearch={setSearch}
          />
        </div>

        {/* SIDEBAR - MOBILE (DRAWER) */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="sm:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="sm:hidden fixed inset-y-0 left-0 z-50 w-3/4 max-w-[280px] bg-[#060f11] border-r border-white/[0.05] flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.05]">
                  <h3 className="font-bold text-white/90">Components</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-pointer border-none"
                  >
                    <TbX size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col">
                  <SidebarComponent
                    myComponents={myComponents}
                    selected={selected}
                    onSelect={handleSelect}
                    search={search}
                    setSearch={setSearch}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MAIN CONTENT */}
        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(59,232,255,0.03),transparent_50%)]">
          {selected ? (
            <DetailPanel
              component={selected}
              onBack={() => setSelected(null)}
            />
          ) : (
            <GuidePanel />
          )}
        </div>
      </div>
    </div>
  );
}


export default MyComponents;