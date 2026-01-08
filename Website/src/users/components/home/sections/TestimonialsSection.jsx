import { motion } from "framer-motion";
import TestimonialCard from "./TestimonialCard";
import { useAnimations } from "../../animations/animations";

const TestimonialsSection = ({
  testimonials,
  currentIndex,
  setCurrentIndex,
}) => {
  const { ref, animate, staggerContainer, staggerItem, fadeInUp } =
    useAnimations({ scroll: true });

  return (
    <section ref={ref} className="py-6 sm:py-8 lg:py-12 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        {/* ---------- Header ---------- */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={animate}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <h2 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Customer Stories
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Trusted by thousands of happy customers
          </p>
        </motion.div>

        {/* ---------- Mobile / Tablet Carousel ---------- */}
        <div className="lg:hidden">
          <div className="relative -mx-4 overflow-x-auto px-4 scrollbar-hide snap-x snap-mandatory">
            <div className="flex gap-4">
              {testimonials.map((item, index) => (
                <motion.div
                  key={item.name + index}
                  variants={fadeInUp}
                  initial="hidden"
                  animate={animate}
                  className="w-[85%] flex-shrink-0 snap-center sm:w-[70%]"
                >
                  <TestimonialCard testimonial={item} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Indicators */}
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                className={`
                  h-2 rounded-full transition-all duration-300 cursor-pointer
                  ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-border hover:bg-muted-foreground"
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* ---------- Desktop Grid ---------- */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="hidden lg:grid grid-cols-3 gap-8"
        >
          {testimonials.map((test, i) => (
            <motion.div key={test.name + i} variants={staggerItem}>
              <TestimonialCard testimonial={test} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
