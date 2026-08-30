import { useState } from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  FiZap,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiEye,
  FiCode,
  FiCopy,
  FiCheck,
  FiSave,
  FiUploadCloud,
  FiArrowLeft,
  FiRefreshCw,
  FiPackage,
} from "react-icons/fi";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import {
  setUserData,
} from "../redux/userSlice";

import { serverURL } from "../App";

import {
  LiveComponentPreview,
} from "../components/LiveComponentPreview";

const Toast = ({
  message,
  type,
  onClose,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -30,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: -30,
      }}
      className="fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-2 rounded-xl shadow-xl"
      style={{
        background:
          type === "success"
            ? "#0d9f6e"
            : type === "error"
              ? "#e02424"
              : "#1c1c2e",

        color: "#fff",

        minWidth: "220px",

        border:
          type === "success"
            ? "1px solid rgba(52,211,153,.25)"
            : type === "error"
              ? "1px solid rgba(248,113,113,.25)"
              : "1px solid rgba(255,255,255,.1)",
      }}
    >
      {type === "success" ? (
        <FiCheckCircle size={15} />
      ) : (
        <FiAlertCircle size={15} />
      )}

      <p className="text-xs font-medium flex-1">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        className="text-white/60 hover:text-white transition"
      >
        <FiX size={15} />
      </button>
    </motion.div>
  );
};

const CodeBlock = ({ code }) => {
  const [copied, setCopied] =
    useState(false);

  const handleCopy = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "COPY ERROR:",
        error
      );
    }
  };

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: "#020617",
        border:
          "1px solid #1e293b",
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background:
            "rgba(15,23,42,.9)",
          borderBottom:
            "1px solid #1e293b",
        }}
      >
        <div className="flex items-center gap-2">
          <FiCode
            size={14}
            className="text-indigo-400"
          />

          <span className="text-xs font-medium text-white/70">
            Component Code
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition"
          style={{
            background: copied
              ? "rgba(16,185,129,.12)"
              : "rgba(255,255,255,.05)",

            border: copied
              ? "1px solid rgba(16,185,129,.2)"
              : "1px solid rgba(255,255,255,.08)",

            color: copied
              ? "#34d399"
              : "#94a3b8",
          }}
        >
          {copied ? (
            <>
              <FiCheck size={12} />
              Copied
            </>
          ) : (
            <>
              <FiCopy size={12} />
              Copy
            </>
          )}
        </button>
      </div>

      <pre
        className="p-4 overflow-auto text-xs leading-6"
        style={{
          color: "#cbd5e1",
          minHeight: "300px",
          maxHeight: "600px",
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};

function Generate() {
  const {
    userData,
  } = useSelector(
    (state) => state.user
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const aiCredits =
    Number(userData?.aiCredits ?? 0);

  const lowCredits =
    aiCredits < 50;

  const [prompt, setPrompt] =
    useState("");

  const [generated, setGenerated] =
    useState(null);

  const [generating, setGenerating] =
    useState(false);

  const [toast, setToast] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState("preview");

  const [
    savedComponentId,
    setSavedComponentId,
  ] = useState(null);

  const [saving, setSaving] =
    useState(false);

  const [publishing, setPublishing] =
    useState(false);

  const [published, setPublished] =
    useState(false);

  const showToast = (
    message,
    type = "success"
  ) => {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const getGeneratedCode = () => {
    if (!generated) {
      return "";
    }

    if (typeof generated === "string") {
      const trimmed = generated.trim();
      if (
        trimmed.startsWith("{") &&
        (trimmed.includes('"code"') ||
          trimmed.includes('"component"') ||
          trimmed.includes('"parsed"') ||
          trimmed.includes('"jsx"'))
      ) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed) {
            const nested =
              (typeof parsed.code === "string" && parsed.code) ||
              (typeof parsed.code?.code === "string" && parsed.code.code) ||
              (typeof parsed.component?.code === "string" && parsed.component.code) ||
              (typeof parsed.component === "string" && parsed.component) ||
              (typeof parsed.parsed?.code === "string" && parsed.parsed.code) ||
              (typeof parsed.parsed === "string" && parsed.parsed) ||
              (typeof parsed.jsx === "string" && parsed.jsx) ||
              (typeof parsed.content === "string" && parsed.content) ||
              (typeof parsed.source === "string" && parsed.source) ||
              (typeof parsed.data?.component?.code === "string" && parsed.data.component.code) ||
              (typeof parsed.data?.code === "string" && parsed.data.code);

            if (nested) {
              return nested;
            }
          }
        } catch {
          // ignore
        }
      }
      return generated;
    }

    if (typeof generated === "object") {
      return (
        (typeof generated.code === "string" && generated.code) ||
        (typeof generated.code?.code === "string" && generated.code.code) ||
        (typeof generated.component?.code === "string" && generated.component.code) ||
        (typeof generated.component === "string" && generated.component) ||
        (typeof generated.parsed?.code === "string" && generated.parsed.code) ||
        (typeof generated.parsed === "string" && generated.parsed) ||
        (typeof generated.raw?.code === "string" && generated.raw.code) ||
        (typeof generated.result?.code === "string" && generated.result.code) ||
        (typeof generated.jsx === "string" && generated.jsx) ||
        (typeof generated.content === "string" && generated.content) ||
        (typeof generated.source === "string" && generated.source) ||
        (typeof generated.data?.component?.code === "string" && generated.data.component.code) ||
        (typeof generated.data?.code === "string" && generated.data.code) ||
        ""
      );
    }

    return "";
  };

  const generatedCode =
    getGeneratedCode();

  const getComponentName = () => {
    if (!generated) {
      return "Generated Component";
    }

    if (
      typeof generated.name ===
      "string" &&
      generated.name.trim()
    ) {
      return generated.name.trim();
    }

    if (
      typeof generated.component?.name ===
      "string" &&
      generated.component.name.trim()
    ) {
      return generated.component.name.trim();
    }

    if (
      typeof generated.parsed?.name ===
      "string" &&
      generated.parsed.name.trim()
    ) {
      return generated.parsed.name.trim();
    }

    const match =
      generatedCode.match(
        /(?:const|let|var|function)\s+([A-Z][A-Za-z0-9_]*)/
      );

    if (match?.[1]) {
      return match[1];
    }

    return "Generated Component";
  };

  const componentName =
    getComponentName();

  const getProps = () => {
    if (!generated) {
      return [];
    }

    const rawProps =
      generated.props ||
      generated.component?.props ||
      generated.parsed?.props ||
      [];

    if (
      Array.isArray(
        rawProps
      )
    ) {
      return rawProps;
    }

    if (
      rawProps &&
      typeof rawProps ===
      "object"
    ) {
      return Object.keys(
        rawProps
      );
    }

    return [];
  };

  const generatedProps =
    getProps();

  const handleGenerate = async () => {
    if (generating) return;
    if (!prompt.trim()) return;
    if (userData?.role === "user" && lowCredits) {
      showToast("Not enough AI credits to generate", "error");
      return;
    }

    setGenerated(null);
    setSavedComponentId(null);
    setPublished(false);
    setActiveTab("preview");
    setGenerating(true);

    try {
      const response = await axios.post(
        `${serverURL}/api/component/generate`,
        { prompt: prompt.trim() },
        { withCredentials: true, timeout: 120000 }
      );

      console.log("=== GENERATE API RESPONSE ===", response.data);
      console.log("GENERATED COMPONENT:", response.data?.component);
      console.log("GENERATED CODE:", response.data?.component?.code);

      const data = response.data;
      const componentPayload = data?.component || data?.parsed || data;

      if (!componentPayload) {
        throw new Error("Generated component was not received.");
      }

      setGenerated(componentPayload);

      const newComponentId = data?.component?._id || data?._id || componentPayload?._id;
      if (newComponentId) {
        setSavedComponentId(newComponentId);
      }

      if (data.remainingCredits !== null && data.remainingCredits !== undefined) {
        dispatch(
          setUserData({
            ...userData,
            aiCredits: Number(data.remainingCredits),
          })
        );
      }

      showToast(data.message || "AI Component Generated", "success");
    } catch (error) {
      console.error("GENERATE ERROR:", error);
      showToast(
        error?.response?.data?.message || error?.message || "Generate Error",
        "error"
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generated || !generatedCode || saving || savedComponentId) return;
    setSaving(true);
    try {
      const response = await axios.post(
        `${serverURL}/api/component/save`,
        {
          name:
            componentName,

          code:
            generatedCode,

          props:
            generatedProps,
        },
        {
          withCredentials: true,
        }
      );

      const data =
        response.data;

      const componentId =
        data?._id ||
        data?.id ||
        data?.component?._id ||
        data?.component?.id ||
        savedComponentId;

      if (componentId) {
        setSavedComponentId(
          componentId
        );
      }

      showToast(
        data?.message ||
        "Component saved successfully!",
        "success"
      );
    } catch (error) {
      console.error(
        "SAVE ERROR:",
        error
      );

      showToast(
        error?.response?.data
          ?.message ||
        error?.message ||
        "Component save failed",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePublish =
    async () => {
      if (
        publishing ||
        published
      ) {
        return;
      }

      const targetId =
        savedComponentId ||
        generated?._id ||
        generated?.component?._id;

      if (!targetId) {
        showToast(
          "Please save the component first.",
          "error"
        );
        return;
      }

      setPublishing(true);

      try {
        const response =
          await axios.post(
            `${serverURL}/api/component/publish`,
            {
              componentId:
                targetId,
            },
            {
              withCredentials: true,
            }
          );

        const data =
          response.data;

        setPublished(true);

        showToast(
          data?.message ||
          "Component published successfully!",
          "success"
        );
      } catch (error) {
        console.error(
          "PUBLISH ERROR:",
          error
        );

        showToast(
          error?.response?.data
            ?.message ||
          error?.message ||
          "Component publish failed",
          "error"
        );
      } finally {
        setPublishing(false);
      }
    };

  const handleGenerateNew =
    () => {
      setPrompt("");
      setGenerated(null);
      setSavedComponentId(null);
      setPublished(false);
      setActiveTab("preview");
      setToast(null);
    };

  const handleBack =
    () => {
      setGenerated(null);
      setSavedComponentId(null);
      setPublished(false);
      setActiveTab("preview");
    };

  const handleKeyDown =
    (event) => {
      if (
        event.key === "Enter" &&
        (event.ctrlKey ||
          event.metaKey)
      ) {
        event.preventDefault();

        handleGenerate();
      }
    };

  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg,#0a0a1a 0%,#0d0d28 60%,#0a1628 100%)",
      }}
    >

      {/* BACKGROUND GRID */}

      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.3) 1px,transparent 1px)",

          backgroundSize:
            "40px 40px",
        }}
      />

      {/* TOAST */}

      <AnimatePresence>
        {toast && (
          <Toast
            message={
              toast.message
            }
            type={
              toast.type
            }
            onClose={() =>
              setToast(null)
            }
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10 pb-20">

        <motion.div
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="text-center mb-8"
        >

          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{
              background:
                "rgba(99,102,241,.1)",
              border:
                "1px solid rgba(99,102,241,.25)",
              boxShadow:
                "0 10px 40px rgba(99,102,241,.12)",
            }}
          >
            <img src="/img.png" alt="Zyven" className="w-8 h-8 object-contain" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            AI Component Generator
          </h1>

          <p className="text-white/45 text-sm">
            Describe your UI component and let AI craft it for you.
          </p>

          {/* CREDITS */}

          <div
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl"
            style={{
              background:
                "rgba(255,255,255,.04)",
              border:
                "1px solid rgba(255,255,255,.09)",
            }}
          >
            <FiZap
              size={13}
              className={
                lowCredits
                  ? "text-red-400"
                  : "text-indigo-400"
              }
            />

            <span className="text-xs text-white/55">
              AI Credits:
            </span>

            <span
              className={
                lowCredits
                  ? "text-red-400 font-bold text-xs"
                  : "text-white font-bold text-xs"
              }
            >
              {aiCredits}
            </span>
          </div>

          {lowCredits && (
            <p className="mt-2 text-[11px] text-red-400">
              You need at least 50 AI credits to generate.
            </p>
          )}

        </motion.div>

        {!generated &&
          !generating && (
            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mb-8 rounded-2xl p-[1px]"
              style={{
                background:
                  "linear-gradient(135deg,rgba(99,102,241,.5),rgba(6,182,212,.25),rgba(255,255,255,.08))",
              }}
            >

              <div
                className="rounded-2xl p-1"
                style={{
                  background:
                    "rgba(10,10,26,.98)",
                }}
              >

                <div
                  className="rounded-xl overflow-hidden"
                  style={{
                    background:
                      "rgba(255,255,255,.035)",

                    border:
                      "1px solid rgba(255,255,255,.08)",

                    opacity:
                      lowCredits
                        ? 0.6
                        : 1,
                  }}
                >

                  <div className="flex items-start gap-3 p-4">

                    <FiZap
                      className="text-indigo-400 mt-1 shrink-0"
                      size={18}
                    />

                    <textarea
                      value={prompt}
                      onChange={(event) =>
                        setPrompt(
                          event.target.value
                        )
                      }
                      onKeyDown={
                        handleKeyDown
                      }
                      disabled={
                        lowCredits ||
                        generating
                      }
                      rows={5}
                      placeholder={
                        lowCredits
                          ? "Not enough credits to generate..."
                          : "Describe the component you want, for example: A premium ecommerce product card with image, title, rating, price and Add to Cart button..."
                      }
                      className="w-full bg-transparent text-white placeholder-white/20 text-sm resize-none outline-none leading-relaxed"
                    />

                  </div>

                  <div className="flex items-center justify-between px-4 pb-3">

                    <span className="text-[10px] text-white/20">
                      Ctrl + Enter to generate
                    </span>

                    <motion.button
                      type="button"
                      whileHover={{
                        scale:
                          generating ||
                            lowCredits ||
                            !prompt.trim()
                            ? 1
                            : 1.03,
                      }}
                      whileTap={{
                        scale: 0.97,
                      }}
                      disabled={
                        generating ||
                        lowCredits ||
                        !prompt.trim()
                      }
                      onClick={
                        handleGenerate
                      }
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background:
                          "linear-gradient(135deg,#6366f1,#06b6d4)",

                        boxShadow:
                          "0 8px 25px rgba(99,102,241,.22)",
                      }}
                    >

                      {generating ? (
                        <>
                          <motion.span
                            animate={{
                              rotate: 360,
                            }}
                            transition={{
                              repeat:
                                Infinity,
                              duration: 1,
                              ease:
                                "linear",
                            }}
                          >
                            <FiLoader
                              size={14}
                            />
                          </motion.span>

                          Generating...
                        </>
                      ) : (
                        <>
                          <FiZap
                            size={14}
                          />

                          Generate
                        </>
                      )}

                    </motion.button>

                  </div>

                </div>

              </div>

            </motion.div>
          )}

        {generating && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="py-20 text-center"
          >

            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                repeat:
                  Infinity,
                duration: 1,
                ease: "linear",
              }}
              className="w-12 h-12 rounded-full border-2 border-transparent mx-auto mb-5"
              style={{
                borderTopColor:
                  "#6366f1",
                borderRightColor:
                  "#06b6d4",
              }}
            />

            <p className="text-white/65 text-sm">
              AI is crafting your component...
            </p>

            <p className="text-white/25 text-xs mt-2">
              This may take a few seconds.
            </p>

          </motion.div>
        )}

        <AnimatePresence mode="wait">

          {generated &&
            !generating && (
              <motion.div
                key="generated"
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: 20,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background:
                    "rgba(255,255,255,.035)",

                  border:
                    "1px solid rgba(99,102,241,.25)",

                  boxShadow:
                    "0 25px 80px rgba(0,0,0,.35)",
                }}
              >

                {/* HEADER */}

                <div
                  className="px-5 py-5"
                  style={{
                    borderBottom:
                      "1px solid rgba(255,255,255,.06)",
                  }}
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-3">

                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            "rgba(16,185,129,.08)",
                          border:
                            "1px solid rgba(16,185,129,.25)",
                        }}
                      >
                        <FiCheckCircle
                          size={20}
                          className="text-emerald-400"
                        />
                      </div>

                      <div>

                        <h2 className="text-sm font-semibold">
                          {componentName}
                        </h2>

                        <p className="text-[11px] text-white/35 mt-1">
                          AI generated component
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleBack
                      }
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white/35 hover:text-white hover:bg-white/5 transition"
                    >
                      <FiX
                        size={16}
                      />
                    </button>

                  </div>

                  {/* PROPS */}

                  <div className="mt-4 flex flex-wrap items-center gap-2">

                    <span className="text-[10px] text-white/30">
                      Props:
                    </span>

                    {generatedProps.length >
                      0 ? (
                      generatedProps.map(
                        (
                          prop,
                          index
                        ) => (
                          <span
                            key={`${prop}-${index}`}
                            className="px-2.5 py-1 rounded-md text-[10px]"
                            style={{
                              background:
                                "rgba(99,102,241,.1)",
                              border:
                                "1px solid rgba(99,102,241,.18)",
                              color:
                                "#a5b4fc",
                            }}
                          >
                            {typeof prop ===
                              "string"
                              ? prop
                              : prop?.name ||
                              `prop${index +
                              1
                              }`}
                          </span>
                        )
                      )
                    ) : (
                      <span className="text-[10px] text-white/25">
                        No props
                      </span>
                    )}

                  </div>

                </div>

                {/* TABS */}

                <div className="px-5 pt-4">

                  <div
                    className="inline-flex items-center gap-1 rounded-xl p-1"
                    style={{
                      background:
                        "rgba(0,0,0,.3)",
                      border:
                        "1px solid rgba(255,255,255,.07)",
                    }}
                  >

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "preview"
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition"
                      style={{
                        background:
                          activeTab ===
                            "preview"
                            ? "rgba(99,102,241,.5)"
                            : "transparent",

                        color:
                          activeTab ===
                            "preview"
                            ? "#fff"
                            : "rgba(255,255,255,.4)",
                      }}
                    >
                      <FiEye
                        size={13}
                      />

                      Preview
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab(
                          "code"
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition"
                      style={{
                        background:
                          activeTab ===
                            "code"
                            ? "rgba(99,102,241,.5)"
                            : "transparent",

                        color:
                          activeTab ===
                            "code"
                            ? "#fff"
                            : "rgba(255,255,255,.4)",
                      }}
                    >
                      <FiCode
                        size={13}
                      />

                      Code
                    </button>

                  </div>

                </div>

                {/* CONTENT */}

                <div className="p-5">

                  <AnimatePresence
                    mode="wait"
                  >

                    {activeTab ===
                      "preview" && (
                        <motion.div
                          key="preview"
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                        >

                          {generatedCode ? (
                            <LiveComponentPreview
                              code={
                                generatedCode
                              }
                            />
                          ) : (
                            <div
                              className="rounded-xl p-10 text-center"
                              style={{
                                background:
                                  "#020617",
                                border:
                                  "1px solid #1e293b",
                              }}
                            >
                              <FiAlertCircle
                                size={25}
                                className="mx-auto mb-3 text-amber-400"
                              />

                              <p className="text-xs text-white/50">
                                Generated code was not found.
                              </p>
                            </div>
                          )}

                        </motion.div>
                      )}

                    {activeTab ===
                      "code" && (
                        <motion.div
                          key="code"
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                        >

                          <CodeBlock
                            code={
                              generatedCode
                            }
                          />

                        </motion.div>
                      )}

                  </AnimatePresence>

                </div>

                <div
                  className="px-5 py-4"
                  style={{
                    background:
                      "rgba(0,0,0,.18)",

                    borderTop:
                      "1px solid rgba(255,255,255,.06)",
                  }}
                >

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    {/* STATUS */}

                    <div className="flex items-center gap-2">

                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background:
                            "rgba(16,185,129,.08)",
                          border:
                            "1px solid rgba(16,185,129,.18)",
                        }}
                      >
                        <FiCheckCircle
                          size={13}
                          className="text-emerald-400"
                        />
                      </div>

                      <span className="text-[10px] text-white/40">
                        Component generated successfully
                      </span>

                    </div>

                    {/* ALL BUTTONS */}

                    <div className="flex items-center justify-end gap-2 flex-wrap">

                      {/* BACK */}

                      <motion.button
                        type="button"
                        whileTap={{
                          scale: 0.97,
                        }}
                        onClick={
                          handleBack
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium"
                        style={{
                          background:
                            "rgba(255,255,255,.05)",

                          border:
                            "1px solid rgba(255,255,255,.1)",

                          color:
                            "rgba(255,255,255,.65)",
                        }}
                      >
                        <FiArrowLeft
                          size={14}
                        />

                        Back
                      </motion.button>

                      {/* SAVE */}

                      <motion.button
                        type="button"
                        whileTap={{
                          scale: 0.97,
                        }}
                        onClick={
                          handleSave
                        }
                        disabled={
                          saving ||
                          !!savedComponentId
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background:
                            savedComponentId
                              ? "rgba(16,185,129,.1)"
                              : "linear-gradient(135deg,#10b981,#059669)",

                          border:
                            savedComponentId
                              ? "1px solid rgba(16,185,129,.25)"
                              : "1px solid transparent",

                          color:
                            savedComponentId
                              ? "#34d399"
                              : "#fff",

                          opacity:
                            saving
                              ? 0.7
                              : 1,
                        }}
                      >

                        {saving ? (
                          <>
                            <motion.span
                              animate={{
                                rotate: 360,
                              }}
                              transition={{
                                repeat:
                                  Infinity,
                                duration:
                                  1,
                                ease:
                                  "linear",
                              }}
                            >
                              <FiLoader
                                size={14}
                              />
                            </motion.span>

                            Saving...
                          </>
                        ) : savedComponentId ? (
                          <>
                            <FiCheckCircle
                              size={14}
                            />

                            Saved
                          </>
                        ) : (
                          <>
                            <FiSave
                              size={14}
                            />

                            Save
                          </>
                        )}

                      </motion.button>

                      {/* PUBLISH */}

                      <motion.button
                        type="button"
                        whileTap={{
                          scale: 0.97,
                        }}
                        onClick={
                          handlePublish
                        }
                        disabled={
                          !savedComponentId ||
                          publishing ||
                          published
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background:
                            published
                              ? "rgba(6,182,212,.1)"
                              : "linear-gradient(135deg,#06b6d4,#0891b2)",

                          border:
                            "1px solid rgba(6,182,212,.25)",

                          color:
                            published
                              ? "#22d3ee"
                              : "#fff",

                          opacity:
                            !savedComponentId
                              ? 0.4
                              : publishing
                                ? 0.7
                                : 1,
                        }}
                      >

                        {publishing ? (
                          <>
                            <motion.span
                              animate={{
                                rotate: 360,
                              }}
                              transition={{
                                repeat:
                                  Infinity,
                                duration:
                                  1,
                                ease:
                                  "linear",
                              }}
                            >
                              <FiLoader
                                size={14}
                              />
                            </motion.span>

                            Publishing...
                          </>
                        ) : published ? (
                          <>
                            <FiCheckCircle
                              size={14}
                            />

                            Published
                          </>
                        ) : (
                          <>
                            <FiUploadCloud
                              size={14}
                            />

                            Publish
                          </>
                        )}

                      </motion.button>

                      {/* GENERATE NEW */}

                      <motion.button
                        type="button"
                        whileTap={{
                          scale: 0.97,
                        }}
                        onClick={
                          handleGenerateNew
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
                        style={{
                          background:
                            "linear-gradient(135deg,#6366f1,#4f46e5)",

                          boxShadow:
                            "0 8px 20px rgba(99,102,241,.2)",

                          color: "#fff",
                        }}
                      >
                        <FiRefreshCw
                          size={14}
                        />

                        Generate New
                      </motion.button>

                      {/* MY COMPONENTS */}

                      <motion.button
                        type="button"
                        whileTap={{
                          scale: 0.97,
                        }}
                        onClick={() =>
                          navigate(
                            "/mycomponents"
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium"
                        style={{
                          background:
                            "rgba(99,102,241,.12)",

                          border:
                            "1px solid rgba(99,102,241,.3)",

                          color:
                            "#a5b4fc",
                        }}
                      >
                        <FiPackage
                          size={14}
                        />

                        My Components
                      </motion.button>

                    </div>

                  </div>

                </div>

              </motion.div>
            )}

        </AnimatePresence>

      </div>
    </div>
  );
}

export default Generate;