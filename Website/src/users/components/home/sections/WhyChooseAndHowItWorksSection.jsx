import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { iconMap } from "../maps/iconMap";
import { useAnimations } from "../../animations/animations";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { colors } from "../../../../styles/colors";
import AppLoader from "../../common/AppLoader";

const WhyChooseAndHowItWorksSection = ({
  steps,
  features,
  heroRef,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState("how");
  const [hoveredTab, setHoveredTab] = useState(null);
  const { ref, animate, staggerContainer, staggerItem } = useAnimations({
    scroll: true,
  });

  // Safe arrays (prevents UI bugs if undefined/null)
  const safeSteps = useMemo(() => (Array.isArray(steps) ? steps : []), [steps]);
  const safeFeatures = useMemo(
    () => (Array.isArray(features) ? features : []),
    [features]
  );

  // Variants (visual only, no logic changes)
  const tabButtonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.03, transition: { duration: 0.18 } },
    tap: { scale: 0.98 },
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.45, ease: "easeOut", when: "beforeChildren" },
    },
    exit: {
      opacity: 0,
      y: -10,
      filter: "blur(6px)",
      transition: { duration: 0.25 },
    },
  };

  const cardBase =
    "relative h-full rounded-2xl border p-6 sm:p-7 shadow-sm transition-all duration-300";
  const cardHover = "hover:-translate-y-1 hover:shadow-lg";

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-10 sm:py-12 lg:py-16"
      style={{ backgroundColor: colors.background.primary }}
    >
      {isLoading && (
        <AppLoader
          title="Loading highlights"
          subtitle="Preparing feature details"
        />
      )}
      {/* Background (keep existing color codes exactly; no new palettes) */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-24 top-1/3 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: colors.primary.light, opacity: 0.18 }}
        />
        <div
          className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: colors.secondary.light, opacity: 0.18 }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-10 max-w-3xl text-center sm:mb-12 lg:mb-14"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold sm:text-sm"
            style={{
              backgroundColor: colors.primary.light,
              color: colors.primary.DEFAULT,
            }}
          >
            <Sparkles className="h-4 w-4" />
            Why Choose Us
          </motion.div>

          <h2
            className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: colors.text.primary }}
          >
            Experience the{" "}
            <span style={{ color: colors.primary.DEFAULT }}>Difference</span>
          </h2>

          <p
            className="mx-auto mt-3 max-w-2xl text-base leading-relaxed sm:text-lg"
            style={{ color: colors.text.secondary }}
          >
            Streamlined solutions designed for modern businesses and individuals
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-10 sm:mb-12">
          <div className="flex justify-center">
            <div
              className="relative inline-flex items-center gap-2 rounded-2xl p-1.5 shadow-sm"
              style={{
                backgroundColor: colors.background.secondary,
                border: `1px solid ${colors.border.light}`,
              }}
            >
              {/* Active indicator - BUG FIX: use stable numeric translate instead of calc(100% + 8px) */}
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute top-1.5 bottom-1.5 rounded-xl shadow-md"
                initial={false}
                animate={{
                  x: activeTab === "how" ? 0 : "100%",
                }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                style={{
                  width: "50%",
                  background: `linear-gradient(90deg, ${colors.primary.DEFAULT})`,
                }}
              />

              {["how", "why"].map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <motion.button
                    key={tab}
                    variants={tabButtonVariants}
                    initial="rest"
                    animate="rest"
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    onMouseEnter={() => setHoveredTab(tab)}
                    onMouseLeave={() => setHoveredTab(null)}
                    onClick={() => setActiveTab(tab)}
                    className={[
                      "relative z-10 inline-flex w-[140px] sm:w-[180px] items-center justify-center",
                      "rounded-xl px-4 py-3 text-sm sm:text-base font-semibold",
                      "transition-colors duration-300 cursor-pointer select-none",
                      "focus:outline-none focus-visible:ring-4",
                    ].join(" ")}
                    style={{
                      color: isActive
                        ? colors.text.inverse
                        : colors.text.secondary,
                      // focus ring uses existing color code
                      boxShadow: "none",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 0 4px ${colors.secondary.light}`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      {tab === "how" ? "How It Works" : "Why Choose Us"}
                      <AnimatePresence>
                        {hoveredTab === tab && !isActive && (
                          <motion.span
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -6 }}
                            transition={{ duration: 0.18 }}
                            className="inline-flex"
                            style={{
                              color: isActive
                                ? colors.text.inverse
                                : colors.text.primary,
                            }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "how" && (
            <motion.div
              key="how-panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative"
            >
              {/* Desktop progress line */}
              <div
                className="pointer-events-none absolute left-1/2 top-20 hidden h-1.5 w-4/5 -translate-x-1/2 rounded-full lg:block"
                style={{
                  background: `linear-gradient(90deg, transparent, ${colors.primary.DEFAULT}, transparent)`,
                  opacity: 0.4,
                }}
              />

              {/* Mobile/Tablet list */}
              <div className="space-y-3 lg:hidden">
                {safeSteps.map((step, index) => {
                  const Icon = iconMap?.[step.icon];
                  return (
                    <motion.div
                      key={(step?.title || "step") + index}
                      initial={{ opacity: 0, x: -14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.45, delay: index * 0.06 }}
                      whileHover={{ x: 6 }}
                      className="relative"
                    >
                      <div
                        className={[cardBase, cardHover, "pl-14 sm:pl-16 border-l-4"].join(
                          " "
                        )}
                        style={{
                          backgroundColor: colors.background.secondary,
                          borderColor: colors.primary.light,
                          borderLeftColor: colors.primary.DEFAULT,
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <motion.div
                            whileHover={{ rotate: 10, scale: 1.06 }}
                            transition={{
                              type: "spring",
                              stiffness: 280,
                              damping: 18,
                            }}
                            className="absolute left-4 top-6 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br"
                            style={{
                              background: `linear-gradient(135deg, ${colors.primary.light}, ${colors.primary.DEFAULT})`,
                              boxShadow: `0 4px 12px ${colors.primary.light}40`,
                            }}
                          >
                            {Icon ? (
                              <Icon
                                className="h-5 w-5"
                                style={{ color: colors.text.inverse }}
                              />
                            ) : null}
                          </motion.div>

                          <div className="min-w-0 flex-1">
                            <p
                              className="text-xs font-bold uppercase tracking-widest"
                              style={{ color: colors.primary.DEFAULT }}
                            >
                              Step {index + 1}
                            </p>
                            <h3
                              className="mt-1.5 text-base font-bold sm:text-lg"
                              style={{ color: colors.text.primary }}
                            >
                              {step.title}
                            </h3>
                            <p
                              className="mt-2.5 text-sm leading-relaxed"
                              style={{ color: colors.text.secondary }}
                            >
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Desktop grid */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate={animate}
                className="hidden grid-cols-3 gap-8 lg:grid"
              >
                {safeSteps.map((step, index) => {
                  const Icon = iconMap?.[step.icon];

                  return (
                    <motion.div
                      key={(step?.title || "step") + index}
                      variants={staggerItem}
                      whileHover={{ y: -12, scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 20,
                      }}
                      className="group relative border-gray-100 border-1 rounded-2xl"
                    >
                      {/* Connector */}
                      {index < safeSteps.length - 1 && (
                        <div
                          className="pointer-events-none absolute right-[-32px] top-12 h-1 w-16 hidden lg:block"
                          style={{
                            background: `linear-gradient(90deg, ${colors.primary.DEFAULT}80, transparent)`,
                          }}
                        />
                      )}

                      <div
                        className={[cardBase, cardHover, "pt-12 overflow-hidden"].join(" ")}
                        style={{
                          backgroundColor: colors.background.secondary,
                          borderColor: colors.border.light,
                          boxShadow: `0 0 1px ${colors.border.light}`,
                        }}
                      >
                        {/* Gradient overlay on hover */}
                        <div
                          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary.DEFAULT}, transparent)`,
                          }}
                        />

                        {/* Icon container */}
                        <motion.div
                          whileHover={{ rotate: 14, scale: 1.1 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 18,
                          }}
                          className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl mx-auto bg-gradient-to-br shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary.light}, ${colors.primary.DEFAULT})`,
                            boxShadow: `0 8px 24px ${colors.primary.DEFAULT}20`,
                          }}
                        >
                          {Icon ? (
                            <Icon
                              className="relative h-7 w-7"
                              style={{ color: colors.text.inverse }}
                            />
                          ) : null}
                        </motion.div>

                        <h3
                          className="text-lg font-bold text-center"
                          style={{ color: colors.text.primary }}
                        >
                          {step.title}
                        </h3>

                        <p
                          className="mt-1 text-sm leading-relaxed text-center"
                          style={{ color: colors.text.secondary }}
                        >
                          {step.desc}
                        </p>

                        {/* Progress dots */}
                        <div className="mt-6 flex justify-center gap-2">
                          {[0, 1, 2].map((dot) => (
                            <motion.div
                              key={dot}
                              animate={{
                                scale: dot === index % 3 ? [1, 1.3, 1] : 1,
                                opacity: dot === index % 3 ? 1 : 0.3,
                              }}
                              transition={{
                                repeat: Infinity,
                                duration: 1.8,
                                delay: dot * 0.12,
                                ease: "easeInOut",
                              }}
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor:
                                  dot === index % 3
                                    ? colors.primary.DEFAULT
                                    : colors.border.light,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}

          {activeTab === "why" && (
            <motion.div
              key="why-panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative"
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate={animate}
                className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
              >
                {safeFeatures.map((feat, i) => {
                  const Icon = iconMap?.[feat.icon];

                  return (
                    <motion.div
                      key={(feat?.title || "feat") + i}
                      variants={staggerItem}
                      whileHover={{ y: -10, scale: 1.02 }}
                      transition={{
                        type: "spring",
                        stiffness: 280,
                        damping: 20,
                      }}
                      className="group relative"
                    >
                      {/* Soft glow */}
                      <div
                        className="pointer-events-none absolute inset-0 rounded-2xl blur-xl opacity-0 transition-opacity duration-500 group-hover:opacity-60"
                        style={{
                          background: `linear-gradient(135deg, ${colors.primary.light}, transparent, ${colors.secondary.light})`,
                        }}
                      />

                      <div
                        className={[cardBase, cardHover].join(" ")}
                        style={{
                          backgroundColor: colors.background.secondary,
                          borderColor: colors.border.light,
                        }}
                      >
                        {/* Icon */}
                        <motion.div
                          whileHover={{ rotate: 18, scale: 1.08 }}
                          transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 18,
                          }}
                          className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
                          style={{
                            backgroundColor: colors.primary.light,
                            border: `1px solid ${colors.border.light}`,
                          }}
                        >
                          {Icon ? (
                            <Icon
                              className="relative h-6 w-6"
                              style={{ color: colors.primary.DEFAULT }}
                            />
                          ) : null}
                        </motion.div>

                        {/* Check badge - BUG FIX: remove unknown classes text-success/fill-success */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.85 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, margin: "-80px" }}
                          transition={{ duration: 0.35, delay: 0.08 }}
                          className="absolute right-5 top-5"
                        >
                          <CheckCircle
                            className="h-5 w-5"
                            style={{ color: colors.success.DEFAULT }}
                          />
                        </motion.div>

                        <h3
                          className="text-lg font-bold sm:text-xl"
                          style={{ color: colors.text.primary }}
                        >
                          {feat.title}
                        </h3>

                        <p
                          className="mt-3 text-sm leading-relaxed"
                          style={{ color: colors.text.secondary }}
                        >
                          {feat.desc}
                        </p>

                        {/* Accent line */}
                        <motion.div
                          initial={{ width: "0%" }}
                          whileInView={{ width: "100%" }}
                          viewport={{ once: true, margin: "-80px" }}
                          transition={{
                            duration: 0.8,
                            delay: 0.15,
                            ease: "easeOut",
                          }}
                          className="mt-5 h-0.5 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${colors.primary.DEFAULT}, transparent)`,
                            opacity: 0.6,
                          }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>
    </section>
  );
};

export default WhyChooseAndHowItWorksSection;
