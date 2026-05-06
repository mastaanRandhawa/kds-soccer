import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#0a0a0a" }}
    >
      {/* Pitch lines decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5"
          style={{ width: 500, height: 500, border: "2px solid #fff" }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5"
          style={{ width: 300, height: 300, border: "2px solid #fff" }}
        />
        <div
          className="absolute left-1/2 top-0 bottom-0 opacity-5"
          style={{ width: 2, background: "#fff", transform: "translateX(-50%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Big 404 */}
        <div className="relative mb-6">
          <span
            className="block font-black leading-none select-none"
            style={{
              fontSize: "clamp(120px, 25vw, 220px)",
              color: "transparent",
              WebkitTextStroke: "2px rgba(255,255,255,0.12)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            404
          </span>
          {/* Soccer ball emoji centered over the 0 */}
          <motion.span
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl sm:text-7xl select-none"
          >
            ⚽
          </motion.span>
        </div>

        <h1
          className="text-white font-bold mb-3"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(22px, 4vw, 36px)" }}
        >
          Out of Bounds
        </h1>
        <p
          className="text-gray-400 mb-10 max-w-sm"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", lineHeight: 1.6 }}
        >
          This page doesn't exist. The ball went out — let's get you back on the pitch.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-7 py-3 rounded-full text-sm font-semibold text-black transition-all hover:scale-105 hover:brightness-90"
            style={{ background: "#FFFFFF", fontFamily: "Inter, sans-serif" }}
          >
            Back to Home
          </button>
          <button
            onClick={() => navigate("/schedule")}
            className="px-7 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            View Schedule
          </button>
        </div>
      </motion.div>
    </div>
  );
}
