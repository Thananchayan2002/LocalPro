import { motion } from "framer-motion";
import WorkerCard from "./WorkerCard";
import { useAnimations } from "../../animations/animations";

const FeaturedProfessionalsSection = ({
  featuredWorkers,
  currentIndex,
  setCurrentIndex,
}) => {
  const { ref, animate, staggerContainer, staggerItem, fadeInUp, fadeInRight } =
    useAnimations({ scroll: true });

  return (
    <section ref={ref} className="w-full py-7 lg:py-12 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {/* ---------- Heading ---------- */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={animate}
          className="mb-10 text-center max-w-xl"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground mb-3">
            Featured Professionals
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Top-rated workers in your area
          </p>
        </motion.div>

        {/* ---------- Mobile Carousel ---------- */}
        <div className="relative w-full max-w-md lg:hidden">
          <div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide">
            <div className="flex gap-5 px-1">
              {featuredWorkers.map((worker) => (
                <motion.div
                  key={worker.id}
                  variants={fadeInRight}
                  initial="hidden"
                  animate={animate}
                  className="w-full flex-shrink-0 snap-center rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <WorkerCard worker={worker} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* ---------- Pagination Dots ---------- */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {featuredWorkers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ---------- Desktop Grid ---------- */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="hidden lg:grid w-full grid-cols-3 gap-8"
        >
          {featuredWorkers.map((worker) => (
            <motion.div
              key={worker.id}
              variants={staggerItem}
              className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <WorkerCard worker={worker} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProfessionalsSection;
