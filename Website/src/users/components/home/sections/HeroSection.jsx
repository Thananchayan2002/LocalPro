import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  Sparkles,
  Star,
  ThumbsUp,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAnimations } from "../../animations/animations";
import { iconMap } from "../maps/iconMap";
import { colors } from "../../../../styles/colors";
import { useBookNow } from "../../../hooks/useBookNow";

const HeroSection = ({
  searchQuery,
  setSearchQuery,
  bannerImg,
  categories = [],
  onStartBooking,
}) => {
  const { staggerContainer, staggerItem, fadeInRight, animate } =
    useAnimations();
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredServices, setFilteredServices] = useState([]);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const searchRef = useRef(null);
  const { startBooking } = useBookNow({ onStartBooking });

  // Fetch real services from backend to power search suggestions
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setServicesLoading(true);
        setServicesError("");
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/services`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        const data = await response.json();
        if (response.ok && data.success && Array.isArray(data.data)) {
          setServices(data.data);
        } else {
          setServicesError(data.message || "Failed to load services");
        }
      } catch (error) {
        setServicesError("Unable to load services. Please try again.");
      } finally {
        setServicesLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services in real-time as user types
  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      const filtered = services.filter((service) =>
        service?.service?.toLowerCase().startsWith(query)
      );
      setFilteredServices(filtered);
      setShowDropdown(true);
    } else {
      setFilteredServices([]);
      setShowDropdown(false);
    }
  }, [searchQuery, services]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBookService = (service) => {
    startBooking(service);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const handleServiceChipClick = (service) => {
    startBooking(service);
  };

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Decorative background accents */}
      <div className="pointer-events-none absolute -top-32 right-[-6rem] h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 left-[-6rem] h-72 w-72 rounded-full bg-accent/20 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:py-7 lg:py-10 mt-20 sm:mt-24 lg:mt-24">
        <div className="flex flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-20">
          {/* LEFT CONTENT */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={animate}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              variants={staggerItem}
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 lg:mx-0"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Trusted by 50,000+ customers
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={staggerItem}
              className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              Find Trusted Local Pros
            </motion.h1>
            <motion.p
              variants={staggerItem}
              className="mb-2 text-lg font-semibold text-primary"
            >
              Instantly connect with verified professionals near you
            </motion.p>

            {/* Description */}
            <motion.p
              variants={staggerItem}
              className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0"
            >
              Electricians, plumbers, cleaners & more. Vetted profiles, real
              ratings, transparent pricing. Book in minutes.
            </motion.p>

            {/* Search - Visible on all devices */}
            <motion.div
              variants={staggerItem}
              ref={searchRef}
              className="mb-6 relative"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-card p-2 shadow-lg transition-shadow hover:shadow-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search services... (e.g., Plumbing, Electrical)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setShowDropdown(true)}
                    className="h-12 w-full rounded-xl bg-transparent pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm sm:text-base"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setShowDropdown(false);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dropdown Results */}
              {showDropdown && filteredServices.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-border z-50 max-h-80 overflow-y-auto"
                >
                  {filteredServices.map((service) => {
                    const Icon = service.iconName
                      ? iconMap[service.iconName]
                      : null;
                    return (
                      <motion.div
                        key={service._id}
                        whileHover={{
                          backgroundColor: "rgba(var(--color-primary), 0.05)",
                        }}
                        className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-b-0 transition"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {Icon && (
                            <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate">
                              {service.service}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {service.description}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleBookService(service)}
                          className="group px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-white"
                          style={{ background: colors.primary.gradient }}
                        >
                          Book Now
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {/* No results message */}
              {showDropdown && searchQuery && filteredServices.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-xl border border-border z-50 p-4 text-center"
                >
                  <p className="text-muted-foreground">
                    No services found for "{searchQuery}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Browse all services below or try a different search
                  </p>
                </motion.div>
              )}

              {/* Loading / error states */}
              {servicesLoading && showDropdown && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-xl border border-border z-50 p-4 text-center"
                >
                  <p className="text-muted-foreground text-sm">
                    Loading services…
                  </p>
                </motion.div>
              )}

              {servicesError && !servicesLoading && showDropdown && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-xl border border-border z-50 p-4 text-center"
                >
                  <p
                    className="text-sm"
                    style={{ color: colors.error.DEFAULT }}
                  >
                    {servicesError}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Single Primary CTA */}
            <motion.div
              variants={staggerItem}
              className="mb-10 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <button
                onClick={() => startBooking()}
                className="group px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-white"
                style={{ background: colors.primary.gradient }}
              >
                Book a Service Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Compact Stats - Below fold */}
            <motion.div
              variants={staggerContainer}
              className="mt-12 grid grid-cols-2 gap-2 sm:grid-cols-4"
            >
              {[
                { icon: Users, value: "50K+", label: "Customers" },
                { icon: UserCheck, value: "2K+", label: "Pros" },
                { icon: ThumbsUp, value: "98%", label: "Satisfaction" },
                { icon: Star, value: "4.8★", label: "Rating" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  whileHover={{ y: -2 }}
                  className="rounded-lg bg-card p-2 sm:p-3 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <stat.icon className="h-4 w-4 text-primary" />
                    <span className="text-sm sm:text-base font-bold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            animate={animate}
            className="flex w-full justify-center lg:w-1/2 lg:justify-end"
          >
            <motion.img
              src={bannerImg}
              alt="Local service professionals"
              loading="lazy"
              decoding="async"
              width="640"
              height="640"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg rounded-3xl object-cover shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
