import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../../../styles/colors";
import { iconMap } from "../maps/iconMap";
import { useAnimations } from "../../animations/animations";
import { fetchPopularServices } from "../../../../utils/api";

const PopularServicesSection = ({ categories = [] }) => {
  const navigate = useNavigate();
  const { ref, animate, staggerContainer, staggerItem } = useAnimations({
    scroll: true,
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");
        const curated = await fetchPopularServices();
        setServices(curated);
      } catch (e) {
        setError(e.message || "Unable to load services. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Keep exact existing color logic
  const fallbackItems = useMemo(() => categories.slice(0, 5), [categories]);

  const itemsToRender = useMemo(() => {
    return services.length > 0 ? services : fallbackItems;
  }, [services, fallbackItems]);

  const skeletonCount = 6;

  // (Animations only) local variants – does not change business logic
  const cardVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 320, damping: 24 },
    },
  };

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden py-10 sm:py-12 lg:py-16"
      style={{ backgroundColor: colors.background.primary }}
    >
      {/* Decorative background orbs (keep existing color codes exactly) */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 h-[360px] w-[360px] rounded-full blur-3xl"
        style={{ backgroundColor: colors.primary.light, opacity: 0.14 }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 h-[360px] w-[360px] rounded-full blur-3xl"
        style={{ backgroundColor: colors.secondary.light, opacity: 0.14 }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 sm:mb-10 lg:mb-12">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold sm:text-sm"
              style={{
                backgroundColor: colors.primary.light,
                color: colors.primary.DEFAULT,
              }}
            >
              <span
                className="inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: colors.primary.DEFAULT }}
              />
              Handpicked for you
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
              className="mt-4 font-display text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl"
              style={{ color: colors.text.primary }}
            >
              Popular Services
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
              className="mt-2 text-sm sm:text-base"
              style={{ color: colors.text.secondary }}
            >
              Find the right professional
            </motion.p>
          </div>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {!!error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mb-6 rounded-2xl p-4 shadow-sm ring-1 ring-black/5"
              style={{ backgroundColor: colors.error.bg }}
              role="status"
              aria-live="polite"
            >
              <p
                className="text-sm font-semibold"
                style={{ color: colors.error.DEFAULT }}
              >
                {error}
              </p>
              <p
                className="mt-1 text-xs"
                style={{ color: colors.text.secondary }}
              >
                You can still browse services below.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {/* Loading skeletons */}
          <AnimatePresence>
            {loading &&
              Array.from({ length: skeletonCount }).map((_, idx) => (
                <motion.div
                  key={`sk-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.35, delay: idx * 0.04 }}
                  className="relative overflow-hidden rounded-2xl p-5 shadow-sm ring-1 ring-black/5"
                  style={{ backgroundColor: colors.background.secondary }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="h-14 w-14 rounded-2xl"
                      style={{ backgroundColor: colors.border.light }}
                    />
                    <div className="flex-1">
                      <div
                        className="h-4 w-2/3 rounded"
                        style={{ backgroundColor: colors.border.light }}
                      />
                      <div
                        className="mt-3 h-3 w-full rounded"
                        style={{ backgroundColor: colors.border.light }}
                      />
                      <div
                        className="mt-2 h-3 w-5/6 rounded"
                        style={{ backgroundColor: colors.border.light }}
                      />
                    </div>
                  </div>

                  {/* Skeleton shimmer */}
                  <motion.div
                    className="pointer-events-none absolute inset-0"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 1.15,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                    }}
                  />
                </motion.div>
              ))}
          </AnimatePresence>

          {/* Cards (real data or fallback) */}
          {!loading &&
            itemsToRender.map((item, i) => {
              const isBackend = !!item._id;

              // BUG FIX: iconMap access can be undefined — keep safe fallback
              const Icon = isBackend
                ? iconMap?.[item.iconName]
                : iconMap?.[item.icon];

              const colorKeyCycle = [
                "blue",
                "purple",
                "green",
                "cyan",
                "emerald",
              ];

              // BUG FIX: missing colorKey in fallback items
              const colorKey = isBackend
                ? colorKeyCycle[i % colorKeyCycle.length]
                : item.colorKey || colorKeyCycle[i % colorKeyCycle.length];

              const categoryColor =
                colors.category[colorKey] || colors.category.blue;

              const serviceName = isBackend ? item.service : item.label;

              // BUG FIX: prevent crashes if serviceName is not string
              const initialLetter =
                typeof serviceName === "string" && serviceName.length
                  ? serviceName[0]
                  : "";

              return (
                <motion.div
                  key={(isBackend ? item._id : item.id) || i}
                  variants={staggerItem}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className="group relative cursor-pointer"
                  onClick={() => navigate("/app/services")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate("/app/services");
                    }
                  }}
                >
                  {/* Glow ring */}
                  <div
                    className="pointer-events-none absolute -inset-0.5 rounded-[18px] opacity-0 blur transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(135deg, ${categoryColor.bg}, transparent)`,
                    }}
                  />

                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative flex h-full flex-col rounded-2xl p-5 shadow-sm ring-1 ring-black/5 transition-all duration-300 group-hover:shadow-lg"
                    style={{ backgroundColor: colors.background.secondary }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <motion.div
                        whileHover={{ rotate: 2, scale: 1.05 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 18,
                        }}
                        className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: categoryColor.bg,
                          color: categoryColor.text,
                        }}
                      >
                        {Icon ? (
                          <Icon className="h-7 w-7" />
                        ) : (
                          <span className="text-base font-bold">
                            {initialLetter}
                          </span>
                        )}
                      </motion.div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3
                            className="truncate text-base font-semibold sm:text-lg"
                            style={{ color: colors.text.primary }}
                            title={serviceName || ""}
                          >
                            {serviceName}
                          </h3>
                        </div>

                        {/* BUG FIX: invalid escaped strings + keep tailwind-only layout;
                            use line-clamp + break-words + consistent height */}
                        <p
                          className="mt-2 line-clamp-2 text-sm leading-relaxed"
                          style={{ color: colors.text.secondary }}
                        >
                          {item.description ||
                            item.desc ||
                            "Expert support for this service."}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex items-center justify-between">
                      <div
                        className="h-px flex-1"
                        style={{ backgroundColor: colors.border.light }}
                      />
                      <motion.div
                        className="ml-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: categoryColor.bg,
                          color: categoryColor.text,
                        }}
                        initial={{ opacity: 0.9 }}
                        whileHover={{ opacity: 1 }}
                      >
                        Explore
                        <motion.span
                          className="inline-block"
                          animate={{ x: [0, 3, 0] }}
                          transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          →
                        </motion.span>
                      </motion.div>
                    </div>

                    {/* Shine effect */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                      <motion.div
                        className="absolute -left-24 top-0 h-full w-24 rotate-12 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.0), rgba(255,255,255,0.18), rgba(255,255,255,0.0))",
                        }}
                        animate={{ x: ["0%", "520%"] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          repeatDelay: 1.4,
                          ease: "easeInOut",
                        }}
                      />
                    </div>

                    {/* Subtle hover lift accent */}
                    <motion.div
                      className="pointer-events-none absolute inset-x-5 bottom-4 h-1 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ backgroundColor: categoryColor.text }}
                      initial={false}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
        </motion.div>

        {/* View All Button */}
        <div className="mt-10 flex justify-center">
          <motion.button
            onClick={() => navigate("/app/services")}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className="relative group inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-xl cursor-pointer focus:outline-none focus:ring-4"
            style={{
              background: colors.primary.gradient,
              boxShadow: "0 18px 40px -22px rgba(37,99,235,0.75)",
            }}
          >
            <span>View All Services</span>

            <motion.span
              className="inline-flex"
              animate={{ x: [0, 4, 0] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              →
            </motion.span>

            {/* Subtle sheen */}
            <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <span className="absolute -left-24 top-0 h-full w-24 rotate-12 bg-white/20 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </span>
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default PopularServicesSection;
