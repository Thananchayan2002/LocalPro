import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { colors } from "../../../../styles/colors";
import { iconMap } from "../maps/iconMap";
import { useAnimations } from "../../animations/animations";

const TrendingSection = ({ popularRequests }) => {
  const { ref, animate, staggerContainer, staggerItem } = useAnimations({
    scroll: true,
  });

  return (
    <section className="w-full bg-background py-5 sm:py-7">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Trending This Week
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground">
            Most requested services in your area
          </p>
        </div>

        {/* Grid */}
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {popularRequests.map((req, i) => {
            const categoryColor = colors.category[req.color];
            const Icon = iconMap[req.icon];

            return (
              <motion.button
                key={req.service + i}
                variants={staggerItem}
                whileHover={{ scale: 1.04, x: 6 }}
                whileTap={{ scale: 0.97 }}
                className="group flex w-full items-center gap-4 rounded-2xl bg-card px-5 py-4 text-left shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer"
              >
                {/* Icon */}
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:rotate-6"
                  style={{
                    backgroundColor: categoryColor.bg,
                    color: categoryColor.text,
                  }}
                >
                  {Icon && <Icon className="h-6 w-6" />}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col">
                  <span className="text-sm sm:text-base font-semibold text-foreground leading-tight">
                    {req.service}
                  </span>
                  <span className="mt-0.5 text-xs sm:text-sm text-muted-foreground">
                    {req.requests} requests this week
                  </span>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default TrendingSection;
