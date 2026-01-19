import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Search,
  Sparkles,
  Star,
  ThumbsUp,
  UserCheck,
  Users,
  X,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useAnimations } from "../../animations/animations";
import { iconMap } from "../maps/iconMap";
import { colors } from "../../../../styles/colors";
import { useBookNow } from "../../../hooks/useBookNow";
import { getAllServices } from "../../../api/service/service";

const HeroSection = ({
  searchQuery,
  setSearchQuery,
  bannerImg,
  categories = [],
  onStartBooking,
  setShowProfessionalModal,
}) => {
  const { staggerContainer, staggerItem, fadeInRight, animate } =
    useAnimations();

  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const { startBooking } = useBookNow({ onStartBooking });

  // ---- UI/UX: avoid window.* in render + stable particle positions
  const [viewport, setViewport] = useState({ w: 1200, h: 800 });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () =>
      setViewport({
        w: window.innerWidth || 1200,
        h: window.innerHeight || 800,
      });

    update();
    window.addEventListener("resize", update, { passive: true });

    // stable particles once
    const next = Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: Math.random(),
      y: Math.random(),
      d: 3 + Math.random() * 2.5,
      delay: i * 0.25,
      size: Math.random() < 0.25 ? 2 : 1,
    }));
    setParticles(next);

    return () => window.removeEventListener("resize", update);
  }, []);

  // Fetch services for search suggestions
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        setServicesError("");

        const data = await getAllServices();
        setServices(data);
      } catch (error) {
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter services as user types
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      const filtered = services.filter((service) =>
        service?.service?.toLowerCase().startsWith(query),
      );
      setFilteredServices(filtered);
      setShowDropdown(true);
      setActiveIndex(filtered.length ? 0 : -1);
    } else {
      setFilteredServices([]);
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  }, [searchQuery, services]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Esc closes dropdown + clears
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowDropdown(false);
        setActiveIndex(-1);
        if (searchQuery) setSearchQuery("");
        inputRef.current?.blur?.();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchQuery, setSearchQuery]);

  const handleBookService = useCallback(
    (service) => {
      startBooking(service);
      setShowDropdown(false);
      setSearchQuery("");
      setActiveIndex(-1);
    },
    [startBooking, setSearchQuery],
  );

  // Keyboard nav inside input (↑ ↓ Enter)
  const onInputKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= filteredServices.length ? prev : next;
      });
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
    if (e.key === "Enter") {
      if (activeIndex >= 0 && filteredServices[activeIndex]) {
        e.preventDefault();
        handleBookService(filteredServices[activeIndex]);
      }
    }
  };

  // States for dropdown
  const hasQuery = !!searchQuery.trim();
  const shouldShowLoading = servicesLoading && showDropdown && hasQuery;
  const shouldShowResults =
    showDropdown && hasQuery && filteredServices.length > 0 && !servicesLoading;
  const shouldShowEmpty =
    showDropdown &&
    hasQuery &&
    filteredServices.length === 0 &&
    !servicesLoading;

  // Smooth scroll active item into view
  useEffect(() => {
    if (!shouldShowResults) return;
    if (activeIndex < 0) return;
    const el = document.getElementById(`service-opt-${activeIndex}`);
    el?.scrollIntoView?.({ block: "nearest" });
  }, [activeIndex, shouldShowResults]);

  // Small helper: show 3 quick chips if you want to use categories later
  const quickChips = useMemo(() => {
    // keep it safe if categories are not shaped
    const fromCategories =
      Array.isArray(categories) && categories.length
        ? categories
            .slice(0, 6)
            .map((c) => (typeof c === "string" ? c : c?.name))
            .filter(Boolean)
        : [];
    return fromCategories.slice(0, 4);
  }, [categories]);

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: colors.background.primary }}
    >
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-[520px] w-[520px] rounded-full blur-3xl"
        style={{
          background: colors.secondary.light,
          opacity: 0.12,
        }}
      />

      {/* Particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: colors.primary.light,
              opacity: 0.22,
            }}
            initial={{
              x: p.x * viewport.w,
              y: p.y * viewport.h,
              opacity: 0.35,
            }}
            animate={{
              y: [p.y * viewport.h, p.y * viewport.h - 30, p.y * viewport.h],
              opacity: [0.25, 0.6, 0.25],
            }}
            transition={{
              duration: p.d,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* LEFT */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={animate}
            className="w-full lg:w-1/2"
          >
            {/* Badge */}
            <motion.div
              variants={staggerItem}
              className="mx-auto mb-8 inline-flex max-w-fit items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-xl lg:mx-0"
              style={{
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.light,
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm ring-1"
                style={{
                  background: colors.primary.gradient,
                  color: colors.text.inverse,
                  borderColor: colors.border.light,
                }}
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>

              <div className="min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Trusted by 50+ Customers
                </p>
                <p className="text-xs" style={{ color: colors.text.secondary }}>
                  Excellence in every service
                </p>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.div
              variants={staggerContainer}
              className="text-center lg:text-left"
            >
              <motion.h1
                variants={staggerItem}
                className="mb-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
              >
                <span className="block" style={{ color: colors.text.primary }}>
                  Find{" "}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      background: colors.primary.gradient,
                      color: "#ffffff",
                    }}
                  >
                    Trusted
                  </span>
                </span>
                <span
                  className="block bg-clip-text text-transparent"
                  style={{
                    background: colors.secondary.gradient,
                    color: "#ffffff",
                  }}
                >
                  Local Professionals
                </span>
              </motion.h1>

              <motion.p
                variants={staggerItem}
                className="mx-auto mb-4 inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm lg:mx-0 lg:justify-start sm:text-base"
                style={{
                  color: colors.primary.DEFAULT,
                  backgroundColor: colors.primary.light,
                  border: `1px solid ${colors.border.light}`,
                }}
              >
                <Zap className="h-4 w-4" />
                Instantly connect with verified experts near you
              </motion.p>

              <motion.p
                variants={staggerItem}
                className="mx-auto mb-10 max-w-2xl text-base leading-relaxed sm:text-lg lg:mx-0"
                style={{ color: colors.text.secondary }}
              >
                Electricians, plumbers, cleaners & more. Vetted profiles, real
                ratings, transparent pricing. Book in minutes.
              </motion.p>
            </motion.div>

            {/* Search */}
            <motion.div
              variants={staggerItem}
              ref={searchRef}
              className="relative mb-8"
            >
              <div className="relative">
                {/* glow */}
                <div
                  className="pointer-events-none absolute -inset-0.5 rounded-2xl blur opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: colors.primary.gradient, opacity: 0.2 }}
                />

                <div
                  className="group relative rounded-2xl border p-2 shadow-lg backdrop-blur-xl transition hover:shadow-xl"
                  style={{
                    borderColor: colors.border.light,
                    backgroundColor: colors.background.secondary,
                  }}
                >
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
                      style={{ color: colors.text.tertiary }}
                    />

                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search services… (Plumbing, Electrical, Cleaning)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => hasQuery && setShowDropdown(true)}
                      onKeyDown={onInputKeyDown}
                      className="h-14 w-full rounded-xl bg-transparent pl-12 pr-12 text-base focus:outline-none focus:ring-1 sm:text-lg"
                      style={{
                        color: colors.text.primary,
                        caretColor: colors.primary.DEFAULT,
                        borderColor: colors.border.light,
                      }}
                      placeholderStyle={{ color: colors.text.secondary }}
                      data-placeholder-color={colors.text.secondary}
                      aria-label="Search services"
                      aria-expanded={showDropdown}
                      aria-controls="service-suggestions"
                      autoComplete="off"
                      spellCheck={false}
                    />

                    <AnimatePresence>
                      {searchQuery && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setShowDropdown(false);
                            setActiveIndex(-1);
                            inputRef.current?.focus?.();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-xl border shadow-sm transition cursor-pointer"
                          style={{
                            borderColor: colors.border.light,
                            backgroundColor: colors.background.secondary,
                            color: colors.text.secondary,
                          }}
                          aria-label="Clear search"
                        >
                          <X className="h-5 w-5" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quick chips (optional, uses categories if provided) */}
                  {!!quickChips.length && !hasQuery && (
                    <div className="mt-2 flex flex-wrap gap-2 px-1 pb-1">
                      {quickChips.map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setSearchQuery(chip)}
                          className="rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition cursor-pointer"
                          style={{
                            borderColor: colors.border.light,
                            backgroundColor: colors.background.secondary,
                            color: colors.text.secondary,
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dropdown Results */}
              <AnimatePresence>
                {shouldShowResults && (
                  <motion.div
                    id="service-suggestions"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ type: "spring", damping: 24, stiffness: 260 }}
                    className="absolute left-0 right-0 z-50 mt-3 max-h-96 overflow-y-auto rounded-2xl shadow-2xl backdrop-blur-xl"
                    style={{
                      borderColor: colors.border.light,
                      backgroundColor: colors.background.primary,
                      borderWidth: "1px",
                    }}
                    role="listbox"
                  >
                    <div className="px-4 pb-2 pt-4">
                      <p
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: colors.text.secondary }}
                      >
                        {filteredServices.length} result
                        {filteredServices.length !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="px-2 pb-2">
                      {filteredServices.map((service, index) => {
                        const Icon = service.iconName
                          ? iconMap[service.iconName]
                          : null;

                        const isActive = index === activeIndex;

                        return (
                          <motion.div
                            key={service._id}
                            id={`service-opt-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 transition"
                            style={{
                              backgroundColor: isActive
                                ? colors.primary.light
                                : "transparent",
                              borderColor: isActive
                                ? colors.primary.DEFAULT
                                : "transparent",
                              borderWidth: isActive ? "1px" : "0",
                            }}
                            role="option"
                            aria-selected={isActive}
                            onMouseEnter={() => setActiveIndex(index)}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ring-1"
                                style={{
                                  backgroundColor: colors.primary.light,
                                  borderColor: colors.border.light,
                                }}
                              >
                                {Icon ? (
                                  <Icon
                                    className="h-6 w-6"
                                    style={{ color: colors.primary.DEFAULT }}
                                  />
                                ) : (
                                  <Search
                                    className="h-6 w-6"
                                    style={{ color: colors.primary.DEFAULT }}
                                  />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p
                                  className="truncate text-base font-semibold"
                                  style={{ color: colors.text.primary }}
                                >
                                  {service.service}
                                </p>
                                <p
                                  className="line-clamp-1 text-sm"
                                  style={{ color: colors.text.secondary }}
                                >
                                  {service.description ||
                                    "Tap to book instantly"}
                                </p>
                              </div>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleBookService(service)}
                              type="button"
                              className="group inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 cursor-pointer"
                            >
                              Book
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty */}
              <AnimatePresence>
                {shouldShowEmpty && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute left-0 right-0 z-50 mt-3 rounded-2xl p-6 text-center shadow-xl backdrop-blur-xl"
                    style={{
                      borderColor: colors.border.light,
                      backgroundColor: colors.background.primary,
                      borderWidth: "1px",
                    }}
                    role="status"
                    aria-live="polite"
                  >
                    <div
                      className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: colors.primary.light }}
                    >
                      <Search
                        className="h-6 w-6"
                        style={{ color: colors.primary.DEFAULT }}
                      />
                    </div>
                    <p
                      className="mb-1 text-base font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      No results for "{searchQuery}"
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      Try a different keyword, or browse services from the menu.
                    </p>
                    {!!servicesError && (
                      <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                        {servicesError}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Loading */}
              <AnimatePresence>
                {shouldShowLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-0 right-0 z-50 mt-3 rounded-2xl p-6 text-center shadow-xl backdrop-blur-xl"
                    style={{
                      borderColor: colors.border.light,
                      backgroundColor: colors.background.primary,
                      borderWidth: "1px",
                    }}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div
                        className="h-5 w-5 animate-spin rounded-full border-2"
                        style={{
                          borderColor: colors.border.light,
                          borderTopColor: colors.primary.DEFAULT,
                        }}
                      />
                      <p
                        className="text-sm font-semibold"
                        style={{ color: colors.text.primary }}
                      >
                        Searching services…
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={staggerContainer}
              className="mb-10 flex flex-col gap-3 sm:flex-row sm:gap-4 lg:justify-start"
            >
              <motion.button
                variants={staggerItem}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startBooking()}
                type="button"
                className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-7 py-4 text-base font-semibold text-white shadow-xl transition hover:shadow-2xl sm:w-auto cursor-pointer"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative flex items-center gap-3">
                  Book a Service Now
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </motion.button>

              <motion.button
                variants={staggerItem}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setShowProfessionalModal && setShowProfessionalModal(true)
                }
                type="button"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white/80 px-7 py-4 text-base font-semibold text-gray-900 shadow-sm backdrop-blur-xl transition hover:bg-gray-50 hover:shadow-md dark:border-gray-800 dark:bg-gray-950/60 dark:text-gray-50 dark:hover:bg-gray-900 sm:w-auto cursor-pointer"
                style={{ background: colors.secondary.gradient }}
              >
                <span
                  className="bg-clip-text text-transparent"
                  style={{ color: "#FFFFFF" }}
                >
                  Become a Professional
                </span>
              </motion.button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={staggerContainer}
              className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              {[
                {
                  icon: Shield,
                  text: "Verified Pros",
                  tone: "text-emerald-600 dark:text-emerald-400",
                  useSecondary: true,
                },
                {
                  icon: Clock,
                  text: "Quick Response",
                  tone: "text-blue-600 dark:text-blue-400",
                },
                { icon: Star, text: "Top Ratings", tone: "text-amber-500" },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  variants={staggerItem}
                  whileHover={{ y: -2 }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200/70  px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm backdrop-blur-xl transition dark:border-gray-800/70  dark:text-gray-100"
                >
                  <item.icon
                    className={`h-4 w-4 ${item.tone}`}
                    style={
                      item.useSecondary
                        ? { color: colors.secondary.DEFAULT }
                        : {}
                    }
                  />
                  {item.text}
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={staggerContainer}
              className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
            >
              {[
                { icon: Users, value: "50K+", label: "Happy Customers" },
                { icon: UserCheck, value: "2K+", label: "Experts" },
                { icon: ThumbsUp, value: "98%", label: "Satisfaction" },
                { icon: Star, value: "4.8★", label: "Avg Rating" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group rounded-2xl border border-gray-200/70  p-4 text-center shadow-sm backdrop-blur-xl transition hover:shadow-md dark:border-gray-800/70 "
                >
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 ring-1 ring-black/5 dark:ring-white/10">
                      <stat.icon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </span>
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            animate={animate}
            className="relative flex w-full justify-center lg:w-1/2 lg:justify-end lg:-mt-32"
          >
            <div
              className="relative w-full max-w-xl"
              style={{ perspective: 1200 }}
            >
              {/* Glow */}
              <div
                className="pointer-events-none absolute -inset-5 rounded-[32px] blur-2xl opacity-70"
                style={{ background: colors.secondary.light }}
              />

              <motion.div
                whileHover={{ rotateY: 4, rotateX: 3 }}
                transition={{ type: "spring", damping: 20 }}
                className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white shadow-2xl ring-1 ring-black/5 dark:border-gray-800/70 dark:bg-gray-950 dark:ring-white/10"
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
                <motion.img
                  src={bannerImg}
                  alt="Local service professionals at work"
                  loading="lazy"
                  decoding="async"
                  width="640"
                  height="640"
                  initial={{ scale: 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="h-[360px] w-full object-cover sm:h-[440px] lg:h-[520px]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-950/20 via-transparent to-transparent" />
              </motion.div>

              {/* Floating testimonial */}
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.35, duration: 0.55 }}
                whileHover={{ y: -4 }}
                className="absolute -bottom-6 -left-4 hidden w-[260px] rounded-2xl border border-gray-200/70 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-gray-800/70 dark:bg-gray-950/80 sm:block"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
                    style={{ background: colors.secondary.gradient }}
                  >
                    <Star className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-gray-50">
                      Life Saver!
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Found a plumber in 5 minutes
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
