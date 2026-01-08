import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../../../styles/colors";
import { iconMap } from "../maps/iconMap";
import { useAnimations } from "../../animations/animations";

const PopularServicesSection = ({ categories }) => {
  const navigate = useNavigate();
  const { ref, animate, staggerContainer, staggerItem } = useAnimations({
    scroll: true,
  });

  const handleBookService = (categoryId) => {
    navigate(`/app/book/${categoryId}`);
  };

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

          <div className="flex-1 flex justify-end">
            <motion.button
              onClick={() => navigate("/app/services")}
              whileHover={{ x: 6 }}
              className="group inline-flex items-center gap-1 text-sm sm:text-base font-semibold text-primary cursor-pointer"
            >
              All
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        </div>

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 lg:gap-5"
        >
          {categories.map((cat, i) => {
            const categoryColor = colors.category[cat.colorKey];
            const Icon = iconMap[cat.icon];

            return (
              <motion.button
                key={cat.label + i}
                onClick={() => handleBookService(cat.id)}
                variants={staggerItem}
                whileHover={{ scale: 1.06, y: -6 }}
                whileTap={{ scale: 0.95 }}
                className="group flex flex-col items-center justify-center rounded-2xl bg-card p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                {/* Icon */}
                <div
                  className="mb-3 flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:rotate-6"
                  style={{
                    backgroundColor: categoryColor.bg,
                    color: categoryColor.text,
                  }}
                >
                  {Icon && (
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                  )}
                </div>

                {/* Text */}
                <div className="text-center">
                  <span className="block text-xs sm:text-sm font-semibold text-foreground">
                    {cat.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] sm:text-xs text-muted-foreground">
                    {cat.jobs}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default PopularServicesSection;
