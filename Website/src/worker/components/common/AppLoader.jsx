import React from "react";
import logo1 from "../../../assets/images/logo-1.png";
import { motion, AnimatePresence } from "framer-motion";
import { colors } from "../../../styles/colors";

const AppLoader = ({
  title = "Loading…",
  subtitle = "Preparing your service experience",
}) => {
  const backdrop = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
  };

  const card = {
    hidden: { opacity: 0, y: 14, scale: 0.98, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 420, damping: 32 },
    },
    exit: { opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.18 } },
  };

  const floaty = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.12, duration: 0.25, ease: "easeOut" },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className="
          fixed inset-0 z-50
          flex items-center justify-center
          px-4 sm:px-6
          bg-black/30 backdrop-blur-[6px]
          select-none
        "
        variants={backdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <motion.div
          className="
            relative w-full max-w-[22rem] sm:max-w-sm
            mx-auto
          "
          variants={card}
        >
          {/* Card */}
          <div
            className="
              relative overflow-hidden
              rounded-[28px]
              ring-1
              shadow-[0_18px_50px_rgba(2,6,23,0.12)]
              transition-transform duration-300
            "
            style={{
              background: colors.background.primary,
              boxShadow: "0 18px 50px rgba(2,6,23,0.12)",
              borderColor: colors.border.light,
            }}
          >
            {/* Top gradient accent */}
            <div
              className="absolute inset-x-0 top-0 h-1.5"
              style={{ background: colors.primary.gradient }}
            />

            {/* Ambient gradient glow */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full blur-3xl opacity-40"
              style={{ background: colors.primary.gradient }}
            />
            <div
              className="pointer-events-none absolute -bottom-24 right-10 h-56 w-56 rounded-full blur-3xl opacity-30"
              style={{ background: colors.success.bg }}
            />

            {/* Shimmer */}
            <motion.div
              className="
                pointer-events-none absolute inset-y-0 left-[-35%]
                w-1/2 opacity-60
              "
              animate={{ x: ["0%", "220%"] }}
              transition={{
                duration: 1.55,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
              }}
            />

            <div className="relative px-5 sm:px-8 py-7 sm:py-10">
              <div className="flex flex-col items-center gap-6">
                {/* Animated loader */}
                <div className="relative flex items-center justify-center">
                  {/* Soft halo */}
                  <motion.div
                    className="absolute h-28 w-28 rounded-full blur-[2px]"
                    style={{ background: colors.primary.light }}
                    animate={{
                      scale: [1, 1.28, 1],
                      opacity: [0.22, 0.08, 0.22],
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Outer pulse ring */}
                  <motion.div
                    className="absolute h-24 w-24 rounded-full"
                    style={{ background: colors.primary.light }}
                    animate={{
                      scale: [1, 1.25, 1],
                      opacity: [0.55, 0.18, 0.55],
                    }}
                    transition={{
                      duration: 1.7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Second subtle ring */}
                  <motion.div
                    className="absolute h-20 w-20 rounded-full"
                    style={{ background: colors.success.bg, opacity: 0.7 }}
                    animate={{
                      scale: [1, 1.18, 1],
                      opacity: [0.35, 0.12, 0.35],
                    }}
                    transition={{
                      duration: 1.95,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.15,
                    }}
                  />

                  {/* Rotating logo tile (covers ring) */}
                  <motion.div
                    className="
                      relative h-16 w-16
                      rounded-2xl
                      ring-1
                      shadow-[0_14px_28px_rgba(2,6,23,0.18)]
                      cursor-pointer
                      active:scale-[0.98]
                      transition-transform
                      overflow-hidden
                      flex items-center justify-center
                    "
                    style={{
                      boxShadow: "0 14px 28px rgba(2,6,23,0.18)",
                      borderColor: colors.border.light,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.25,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Loading"
                  >
                    <img
                      src={logo1}
                      alt="Logo"
                      className="h-full w-full object-cover select-none pointer-events-none"
                      draggable="false"
                    />
                  </motion.div>

                  {/* Floating spark dot */}
                  <motion.div
                    className="
                      absolute -right-1 -top-1
                      h-3 w-3 rounded-full
                      shadow-md ring-1
                      cursor-pointer
                    "
                    style={{
                      background: colors.text.inverse,
                      borderColor: colors.border.light,
                    }}
                    animate={{ y: [0, -6, 0], opacity: [1, 0.7, 1] }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    aria-hidden="true"
                  />

                  {/* Micro sparkles */}
                  <motion.div
                    className="pointer-events-none absolute -left-2 bottom-0 h-2 w-2 rounded-full"
                    style={{ background: colors.success.bg, opacity: 0.9 }}
                    animate={{ y: [0, 7, 0], opacity: [0.35, 0.9, 0.35] }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.12,
                    }}
                  />
                  <motion.div
                    className="pointer-events-none absolute right-1 -bottom-2 h-2 w-2 rounded-full"
                    style={{ background: colors.primary.light, opacity: 0.9 }}
                    animate={{ y: [0, -7, 0], opacity: [0.3, 0.85, 0.3] }}
                    transition={{
                      duration: 1.75,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.28,
                    }}
                  />
                </div>

                {/* Text */}
                <motion.div
                  className="w-full text-center"
                  variants={floaty}
                  initial="hidden"
                  animate="visible"
                >
                  <p
                    className="
                      text-[15px] sm:text-base
                      font-semibold tracking-tight
                      leading-snug
                    "
                    style={{ color: colors.text.primary }}
                  >
                    {title}
                  </p>
                  <p
                    className="
                      mt-1
                      text-sm
                      leading-relaxed
                      px-2 sm:px-0
                    "
                    style={{ color: colors.text.secondary }}
                  >
                    {subtitle}
                  </p>
                </motion.div>

                {/* Progress bar (purely visual) */}
                <div className="w-full">
                  <div
                    className="
                      h-2.5 w-full
                      rounded-full
                      ring-1 overflow-hidden
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]
                    "
                    style={{
                      background: colors.neutral[50],
                      borderColor: colors.border.light,
                    }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: colors.primary.gradient,
                        width: "45%",
                      }}
                      animate={{ x: ["-40%", "120%"] }}
                      transition={{
                        duration: 1.35,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>

                  <motion.p
                    className="
                      mt-3
                      text-xs text-center
                      cursor-default
                      tracking-wide
                    "
                    style={{ color: colors.text.tertiary }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                      duration: 1.35,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    Please wait a moment
                  </motion.p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-safe bottom spacing */}
          <div className="h-6 sm:h-0" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppLoader;
