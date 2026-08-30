
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiZap,
  FiCheck,
  FiLock,
  FiArrowLeft,
} from "react-icons/fi";

const ServerUrl = import.meta.env.VITE_SERVER_URL;

const plans = [
  {
    name: "Free",
    amount: null,
    aiCredits: 150,
    tag: "Current Plan",
    description: "Get started with AI-powered component generation.",
    features: [
      "150 AI Credits included",
      "Save components",
      "Preview & export code",
      "Community support",
    ],
    cta: "Active",
    disabled: true,
    highlight: false,
  },
  {
    name: "Pro",
    amount: 99,
    aiCredits: 200,
    tag: "Most Popular",
    description: "More credits to build faster with no interruptions.",
    features: [
      "200 AI Credits added",
      "Save components",
      "Preview & export code",
      "Priority support",
    ],
    cta: "Buy for ₹99",
    disabled: false,
    highlight: true,
  },
];

function Pricing() {
  const navigate = useNavigate();

  const handlePayment = async (plan) => {
    try {
      if (!plan.amount) return;

      if (!ServerUrl) {
        console.error("VITE_SERVER_URL is missing. Please check your client/.env file and restart the Vite dev server.");
        toast.error("Configuration Error: Missing API URL. Check console for details.");
        return;
      }

      // Create Razorpay order
      const result = await axios.post(
        `${ServerUrl}/api/payment/create`,
        {
          amount: plan.amount,
          aiCredits: plan.aiCredits,
        },
        {
          withCredentials: true,
        }
      );

      if (!result.data.success) {
        toast.error(result.data.message || "Unable to create payment order");
        return;
      }

      const { order } = result.data;

      // Check Razorpay
      if (!window.Razorpay) {
        toast.error("Razorpay is not loaded. Please refresh the page.");
        return;
      }

      const rzp = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,
        currency: order.currency,

        name: "Zyven",
        description: `${plan.name} Plan`,

        order_id: order.id,

        handler: async function (response) {
          try {
            // Verify payment
            const verifyResult = await axios.post(
              `${ServerUrl}/api/payment/verify`,
              {
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,
              },
              {
                withCredentials: true,
              }
            );

            if (verifyResult.data.success) {
              toast.success("Payment successful! AI Credits added.");

              // Optional: go back to generate page
              navigate("/generate");
            } else {
              toast.error(verifyResult.data.message || "Payment verification failed");
            }
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            toast.error(error.response?.data?.message || "Payment verification failed");
          }
        },

        prefill: {
          name: "",
          email: "",
        },

        theme: {
          color: "#6366f1",
        },

        modal: {
          ondismiss: function () {
            console.log("Payment popup closed");
          },
        },
      });

      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);

      toast.error(error.response?.data?.message || "Unable to create payment order");
    }
  };

  return (
    <div
      className="h-screen text-white relative overflow-hidden flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, #0a0a1a 0%, #0d0d28 60%, #0a1628 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Syne:wght@400..800&display=swap');
        `}
      </style>

      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Top glow */}
      <div
        className="absolute top-[-8%] left-[10%] w-80 h-80 rounded-full pointer-events-none opacity-20"
        style={{
          background:
            "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          filter: "blur(70px)",
        }}
      />

      {/* Bottom glow */}
      <div
        className="absolute bottom-[-6%] right-[5%] w-72 h-72 rounded-full pointer-events-none opacity-15"
        style={{
          background:
            "radial-gradient(circle, #06b6d4 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Main */}
      <div className="relative z-10 max-w-3xl mx-auto px-5 py-7 w-full flex-1 flex flex-col">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/generate")}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-all mb-6 cursor-pointer bg-transparent border-none w-fit"
        >
          <FiArrowLeft size={15} />
          Back
        </motion.button>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
            style={{
              background: "rgba(99,102,241,0.12)",
              border:
                "1px solid rgba(99,102,241,0.25)",
            }}
          >
            <FiZap
              size={13}
              className="text-indigo-400"
            />

            <span className="text-xs font-semibold tracking-widest text-indigo-300 uppercase">
              AI Credits
            </span>
          </div>

          <h1
            className="text-4xl sm:text-5xl font-extrabold mb-2"
            style={{
              fontFamily: "'Syne', sans-serif",
              letterSpacing: "-0.03em",
            }}
          >
            <span
              style={{
                background:
                  "linear-gradient(135deg, #818cf8 0%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:
                  "transparent",
              }}
            >
              Pricing
            </span>
          </h1>

          <p className="text-white/35 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
            Choose a plan that fits your workflow.
            Credits are used each time you generate
            a component.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.4,
                delay: i * 0.1,
              }}
              className="relative rounded-2xl p-5 flex flex-col"
              style={{
                background: plan.highlight
                  ? "linear-gradient(145deg, rgba(99,102,241,0.12) 0%, rgba(6,182,212,0.06) 100%)"
                  : "rgba(255,255,255,0.03)",

                border: plan.highlight
                  ? "1px solid rgba(99,102,241,0.35)"
                  : "1px solid rgba(255,255,255,0.07)",

                boxShadow: plan.highlight
                  ? "0 0 40px rgba(99,102,241,0.12)"
                  : "none",
              }}
            >
              {/* Plan top */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: plan.highlight
                      ? "rgba(99,102,241,0.2)"
                      : "rgba(255,255,255,0.06)",

                    color: plan.highlight
                      ? "#818cf8"
                      : "rgba(255,255,255,0.4)",

                    border: plan.highlight
                      ? "1px solid rgba(99,102,241,0.3)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {plan.tag}
                </span>

                {plan.disabled && (
                  <FiLock
                    size={13}
                    className="text-white/20"
                  />
                )}
              </div>

              {/* Name */}
              <h2
                className="text-xl font-bold mb-1"
                style={{
                  fontFamily:
                    "'Syne', sans-serif",
                }}
              >
                {plan.name}
              </h2>

              {/* Description */}
              <p className="text-white/35 text-xs mb-4 leading-relaxed">
                {plan.description}
              </p>

              {/* Price */}
              <div className="flex items-end gap-1">
                <span
                  className="text-4xl font-extrabold"
                  style={{
                    fontFamily:
                      "'Syne', sans-serif",
                  }}
                >
                  {plan.amount
                    ? `₹${plan.amount}`
                    : "Free"}
                </span>
              </div>

              {/* Credits */}
              <div
                className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg w-fit"
                style={{
                  background: plan.highlight
                    ? "rgba(6,182,212,0.1)"
                    : "rgba(255,255,255,0.06)",

                  border: plan.highlight
                    ? "1px solid rgba(6,182,212,0.2)"
                    : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <FiZap
                  size={11}
                  style={{
                    color: plan.highlight
                      ? "#06b6d4"
                      : "rgba(255,255,255,0.4)",
                  }}
                />

                <span
                  className="text-xs font-semibold"
                  style={{
                    color: plan.highlight
                      ? "#06b6d4"
                      : "rgba(255,255,255,0.4)",
                  }}
                >
                  {plan.aiCredits} AI Credits
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-2 my-5 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-xs text-white/60"
                  >
                    <FiCheck
                      size={15}
                      className="shrink-0"
                      style={{
                        color: plan.highlight
                          ? "#818cf8"
                          : "rgba(255,255,255,0.3)",
                      }}
                    />

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                onClick={() => handlePayment(plan)}
                disabled={plan.disabled}
                className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  cursor: plan.disabled
                    ? "not-allowed"
                    : "pointer",

                  background: plan.disabled
                    ? "rgba(255,255,255,0.04)"
                    : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",

                  color: plan.disabled
                    ? "rgba(255,255,255,0.25)"
                    : "#fff",

                  border: plan.disabled
                    ? "1px solid rgba(255,255,255,0.07)"
                    : "none",

                  boxShadow: plan.disabled
                    ? "none"
                    : "0 0 24px rgba(99,102,241,0.35)",
                }}
              >
                {plan.disabled ? (
                  <div className="flex items-center justify-center gap-2">
                    <FiCheck size={14} />
                    {plan.cta}
                  </div>
                ) : (
                  plan.cta
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Footer text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-white/20 text-xs mt-5"
        >
          Credits are added to your account instantly
          after payment.
        </motion.p>
      </div>
    </div>
  );
}

export default Pricing;
