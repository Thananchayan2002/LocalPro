import { motion } from "framer-motion";
import { useEffect, useState } from "react";
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
        // Fetch curated services from backend: trending === true or first 5 fallback
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

  return (
    <section ref={ref} className="w-full py-5 sm:py-7 lg:py-10 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div className="flex-1" />
          <div className="text-center">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              Popular Services
            </h2>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Find the right professional
            </p>
          </div>
          <div className="flex-1" />
        </div>

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {(services.length > 0 ? services : categories.slice(0, 5)).map(
            (item, i) => {
              const isBackend = !!item._id;
              const Icon = isBackend
                ? iconMap[item.iconName]
                : iconMap[item.icon];
              const colorKeyCycle = [
                "blue",
                "purple",
                "green",
                "cyan",
                "emerald",
              ];
              const colorKey = isBackend
                ? colorKeyCycle[i % colorKeyCycle.length]
                : item.colorKey;
              const categoryColor =
                colors.category[colorKey] || colors.category.blue;
              const serviceName = isBackend ? item.service : item.label;

              return (
                <motion.div
                  key={(isBackend ? item._id : item.id) || i}
                  variants={staggerItem}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative flex flex-col items-stretch rounded-2xl bg-card p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="relative h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-3"
                      style={{
                        backgroundColor: categoryColor.bg,
                        color: categoryColor.text,
                      }}
                    >
                      {Icon ? (
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                      ) : (
                        <span className="text-sm font-semibold">
                          {serviceName?.[0] || ""}
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-foreground">
                          {serviceName}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {item.description ||
                          item.desc ||
                          "Expert support for this service."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            }
          )}
        </motion.div>

        {/* View All Button */}
        <div className="mt-10 flex justify-center">
          <motion.button
            onClick={() => navigate("/app/services")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            style={{ background: colors.primary.gradient }}
          >
            View All Services
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default PopularServicesSection;
