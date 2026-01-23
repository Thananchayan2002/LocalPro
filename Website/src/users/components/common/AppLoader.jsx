import React from "react";
import logo1 from "../../../assets/images/logo-1.png";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { colors } from "../../../styles/colors";

const AppLoader = ({
  title = "Finding the right help for you",
  subtitle = "Connecting you with trusted local professionals",
}) => {
  const reduceMotion = useReducedMotion();

  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const cardIn = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { y: 16, opacity: 0, scale: 0.98 },
        animate: { y: 0, opacity: 1, scale: 1 },
        exit: { y: 10, opacity: 0, scale: 0.98 },
      };

  return (
    <AnimatePresence>
      <motion.div
        className="
          fixed inset-0 z-50
          flex items-center justify-center
          px-4 sm:px-6
          bg-white/35 backdrop-blur-lg
          select-none
        "
        {...fade}
        transition={{ duration: 0.22, ease: "easeOut" }}
        role="status"
        aria-live="polite"
      >
        {/* Subtle animated background wash */}
        <motion.div className="pointer-events-none absolute inset-0" {...fade}>
          {!reduceMotion && (
            <>
              <motion.div
                className="
                  absolute -top-28 left-1/2
                  h-[24rem] w-[24rem] sm:h-[26rem] sm:w-[26rem]
                  -translate-x-1/2 rounded-full blur-3xl
                "
                style={{ background: colors.primary.gradient }}
                animate={{
                  scale: [1, 1.06, 1],
                  y: [0, 12, 0],
                  opacity: [0.18, 0.28, 0.18],
                }}
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="
                  absolute -bottom-28 left-1/2
                  h-[22rem] w-[22rem] sm:h-[24rem] sm:w-[24rem]
                  -translate-x-1/2 rounded-full blur-3xl
                "
                style={{ background: colors.primary.gradient }}
                animate={{
                  scale: [1, 1.04, 1],
                  y: [0, -10, 0],
                  opacity: [0.14, 0.22, 0.14],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </>
          )}
        </motion.div>

        <motion.div
          className="relative w-full max-w-[22rem] sm:max-w-md"
          {...cardIn}
          transition={
            reduceMotion
              ? { duration: 0.25, ease: "easeOut" }
              : { type: "spring", stiffness: 280, damping: 26 }
          }
        >
          <div
            className="
              relative overflow-hidden
              rounded-[26px] sm:rounded-[32px]
              border border-white/40
              bg-white/55
              backdrop-blur-xl
            "
          >
            {/* Glass highlight (keep overlay layer white, no tint changes) */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-b from-white/18 via-white/10 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_-20%,rgba(255,255,255,0.22),transparent_55%)]" />
            </div>

            <div className="relative px-5 py-7 sm:px-7 sm:py-10">
              <div className="flex flex-col items-center">
                {/* Logo cluster */}
                <div className="relative mb-6 sm:mb-7 flex items-center justify-center">
                  {/* Outer breathing ring (subtle, no glow/shadow/ring on logo card itself) */}
                  {!reduceMotion && (
                    <motion.div
                      className="
                        absolute
                        h-[112px] w-[112px] sm:h-[124px] sm:w-[124px]
                        rounded-full
                        border border-white/45
                      "
                      animate={{
                        scale: [1, 1.08, 1],
                        opacity: [0.28, 0.12, 0.28],
                      }}
                      transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {/* Logo card (NOW perfect circle, no shadow/glow/ring/background styling) */}
                  <motion.div
                    className="
                      relative
                      h-[80px] w-[80px] sm:h-[88px] sm:w-[88px]
                      rounded-full
                      overflow-hidden
                      cursor-pointer
                      touch-manipulation
                      will-change-transform
                    "
                    style={{
                      background: "transparent",
                      boxShadow: "none",
                      border: "none",
                      outline: "none",
                    }}
                    animate={
                      reduceMotion ? undefined : { rotate: [0, 360] } // smooth, modern
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : {
                            duration: 5.6,
                            repeat: Infinity,
                            ease: "linear",
                          }
                    }
                    whileHover={reduceMotion ? undefined : { scale: 1.03 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    aria-label="Loading"
                  >
                    <img
                      src={logo1}
                      alt="App logo"
                      className="h-full w-full object-cover pointer-events-none"
                      draggable={false}
                    />

                    {/* White overlay layer (no tint changes) */}
                    <div className="pointer-events-none absolute inset-0 bg-white/0" />
                  </motion.div>

                  {/* Inner shimmer (white only) */}
                  {!reduceMotion && (
                    <motion.div
                      className="
                        pointer-events-none absolute
                        h-[80px] w-[80px] sm:h-[88px] sm:w-[88px]
                        rounded-full
                        overflow-hidden
                      "
                      animate={{ opacity: [0.28, 0.14, 0.28] }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <motion.div
                        className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-white/30 blur-[1px]"
                        animate={{ x: ["-30%", "260%"] }}
                        transition={{
                          duration: 2.1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>
                  )}
                </div>

                {/* Copy */}
                <div className="w-full text-center px-1 sm:px-0">
                  <motion.p
                    className="text-[15px] sm:text-base font-semibold tracking-tight"
                    style={{ color: colors.text.primary }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    {title}
                  </motion.p>

                  <motion.p
                    className="
                      mt-1.5
                      text-sm sm:text-[15px]
                      leading-relaxed
                      px-3 sm:px-6
                    "
                    style={{ color: colors.text.secondary }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      ease: "easeOut",
                      delay: 0.05,
                    }}
                  >
                    {subtitle}
                  </motion.p>
                </div>

                {/* Progress + status */}
                <div className="mt-7 sm:mt-8 w-full px-1 sm:px-0">
                  <div
                    className="
                      relative
                      h-2.5 sm:h-3
                      w-full
                      rounded-full
                      overflow-hidden
                      ring-1 ring-white/45
                    "
                    style={{
                      background: colors.neutral[100],
                    }}
                  >
                    {/* Moving gradient sweep */}
                    <motion.div
                      className="absolute inset-y-0 -left-1/2 w-1/2 rounded-full"
                      style={{ background: colors.primary.gradient }}
                      animate={
                        reduceMotion ? undefined : { x: ["-10%", "260%"] }
                      }
                      transition={
                        reduceMotion
                          ? undefined
                          : {
                              duration: 1.9,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                      }
                    />

                    {/* Soft white sheen layer */}
                    <motion.div
                      className="absolute inset-y-0 left-0 w-full"
                      animate={
                        reduceMotion
                          ? undefined
                          : { opacity: [0.14, 0.22, 0.14] }
                      }
                      transition={
                        reduceMotion
                          ? undefined
                          : {
                              duration: 2.4,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                      }
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent)",
                      }}
                    />
                  </div>

                  <motion.p
                    className="
                      mt-3.5
                      text-xs sm:text-[13px]
                      text-center
                      cursor-default
                      select-none
                      px-2
                    "
                    style={{ color: colors.text.tertiary }}
                    animate={
                      reduceMotion ? undefined : { opacity: [0.7, 1, 0.7] }
                    }
                    transition={
                      reduceMotion
                        ? undefined
                        : {
                            duration: 1.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                    }
                  >
                    Please wait, this won’t take long
                  </motion.p>
                </div>

                {/* Mobile spacing */}
                <div className="mt-6 sm:mt-7 h-4 w-full" />
              </div>
            </div>
          </div>

          {/* Mobile safe-area breathing space */}
          <div className="h-6 sm:h-0" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppLoader;
