import { useState, useRef } from "react";

import { AnimatePresence, motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import {
    TbLogin2,
    TbSparkles,
    TbSettings,
    TbCopy,
    TbDownload,
} from "react-icons/tb";
import { signInWithRedirect } from "firebase/auth";
import { auth, googleProvider } from "../utils/firebase";




const steps = [
    {
        icon: TbLogin2,
        title: "Login with Google",
        desc: "Secure OAuth to unlock all Zyven AI tools instantly.",
    },
    {
        icon: TbSparkles,
        title: "Get 150 AI Credits",
        desc: "Start generating premium UI components for free.",
    },
    {
        icon: TbSettings,
        title: "Customize Props",
        desc: "Fine-tune colors, sizes and behavior in real time.",
    },
    {
        icon: TbCopy,
        title: "Generate Components",
        desc: "Zyven AI creates production-ready React components.",
    },
    {
        icon: TbDownload,
        title: "Copy or Save",
        desc: "Export clean code directly into your project.",
    },
];

function Auth({ onClose }) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const authInProgress = useRef(false);


    const handleGoogleLogin = async () => {
        // Prevent duplicate clicks
        if (authInProgress.current) return;

        try {
            authInProgress.current = true;
            setLoading(true);
            setError("");

            await signInWithRedirect(auth, googleProvider);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.message ||
                "Google authentication failed"
            );
        } finally {
            setLoading(false);
            authInProgress.current = false;
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-4xl bg-[#0f0f11] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Left side: Value proposition */}
                    <div className="w-full p-8 md:w-1/2 bg-gradient-to-br from-white/5 to-transparent border-r border-white/5">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-3">
                                <img src="/img.png" alt="Zyven" className="w-8 h-8 object-contain" />
                                <h2 className="text-2xl font-bold text-white">
                                    Welcome to Zyven AI
                                </h2>
                            </div>
                            <p className="text-gray-400">
                                Join thousands of developers building better UIs faster.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                return (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#35ebff]/10 flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-[#35ebff]" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-white mb-1">
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right side: Login action */}
                    <div className="w-full p-8 md:w-1/2 flex flex-col justify-center items-center bg-[#0a0a0a]">
                        <div className="w-full max-w-sm space-y-8">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-6">
                                    <TbLogin2 className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    Sign In Required
                                </h3>
                                <p className="text-sm text-gray-400 mb-8">
                                    Please authenticate with Google to access Zyven AI features.
                                </p>
                            </div>

                            {error && (
                                <div className="p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className={`
                  w-full group relative flex items-center justify-center gap-3 
                  px-6 py-4 rounded-xl font-medium transition-all duration-200
                  ${loading
                                        ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                                        : "bg-white text-black hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98]"
                                    }
                `}
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <FcGoogle className="w-6 h-6" />
                                        <span className="text-base">Continue with Google</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-gray-500 mt-6">
                                By continuing, you agree to our Terms of Service and Privacy
                                Policy.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default Auth;