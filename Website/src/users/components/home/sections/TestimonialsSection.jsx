import React from "react";
import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { colors } from "../../../../styles/colors";
import { useAnimations } from "../../animations/animations";
import AppLoader from "../../common/AppLoader";
const TestimonialsSection = ({
  testimonials,
  currentIndex,
  setCurrentIndex,
  isLoading = false,
}) => {
  const { ref, animate, staggerContainer, staggerItem } = useAnimations({
    scroll: true,
  });
  const handlePrev = () => {
    setCurrentIndex((prev) =>
      (prev - 3 + testimonials.length) % testimonials.length
    );
  };
  const handleNext = () => {
    setCurrentIndex((prev) =>
      (prev + 3) % testimonials.length
    );
  };
  return (
    <section
      ref={ref}
      className="relative py-10 sm:py-12 lg:py-16 overflow-hidden"
      style={{ backgroundColor: colors.background.primary }}
    >
      {isLoading && (
        <AppLoader
          title="Loading testimonials"
          subtitle="Gathering the latest feedback"
        />
      )}
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: colors.primary.light, opacity: 0.15 }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: colors.secondary.light, opacity: 0.15 }}
        ></div>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with enhanced animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div
            className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: colors.primary.light,
              color: colors.primary.DEFAULT,
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: colors.primary.DEFAULT }}
            ></div>
            Testimonials
          </div>
          <h2
            className="mb-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ color: colors.text.primary }}
          >
            Trusted by{" "}
            <span style={{ color: colors.primary.DEFAULT }}>Thousands</span>
          </h2>
          <p
            className="mx-auto max-w-2xl text-lg sm:text-xl leading-relaxed"
            style={{ color: colors.text.secondary }}
          >
            Join our community of satisfied customers who have transformed their
            experiences
          </p>
        </motion.div>
        {/* Testimonials Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-12"
        >
          {[0, 1, 2].map((offset) => {
            const index = (currentIndex + offset) % testimonials.length;
            const testimonial = testimonials[index];
            if (!testimonial) return null;
            return (
              <motion.div
                key={testimonial._id || testimonial.id || `${testimonial.name}-${testimonial.date}-${index}`}
                variants={staggerItem}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-black/5 dark:border-white/10 p-6 shadow-sm hover:shadow-[0_14px_30px_-20px_rgba(0,0,0,0.25)] transition-all duration-300"
                style={{ background: colors.background.paper }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <motion.div
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: colors.primary.gradient }}
                  >
                    {testimonial.name.charAt(0).toUpperCase()}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-bold truncate"
                      style={{ color: colors.text.primary }}
                    >
                      {testimonial.name}
                    </h4>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: colors.text.tertiary }}
                    >
                      {testimonial.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < testimonial.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300 dark:text-gray-600"
                        }`}
                    />
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: colors.text.secondary }}
                >
                  {testimonial.comment}
                </p>
                <div className="flex justify-end">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${testimonial.type === "suggestion"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      : testimonial.type === "feature"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    {(testimonial.type || "general").charAt(0).toUpperCase() +
                      (testimonial.type || "general").slice(1)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        {/* Navigation Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrev}
            className="p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            style={{
              backgroundColor: colors.background.secondary,
              borderColor: colors.border.light,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <ChevronLeft
              className="w-5 h-5 transition-colors"
              style={{ color: colors.text.primary }}
            />
          </motion.button>
          {/* Indicators */}
          <div className="flex gap-2 mx-6">
            {testimonials.map((_, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-8" : ""
                  }`}
                style={{
                  backgroundColor:
                    idx === currentIndex
                      ? colors.primary.DEFAULT
                      : colors.border.light,
                }}
              />
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            className="p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
            style={{
              backgroundColor: colors.background.secondary,
              borderColor: colors.border.light,
              border: `1px solid ${colors.border.light}`,
            }}
          >
            <ChevronRight
              className="w-5 h-5 transition-colors"
              style={{ color: colors.text.primary }}
            />
          </motion.button>
        </motion.div>
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 pt-10"
          style={{ borderTopColor: colors.border.light, borderTopWidth: "1px" }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "50+", label: "Happy Customers" },
              { value: "4.9/5", label: "Average Rating" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="p-6 rounded-xl hover:transition-all duration-300"
                style={{
                  backgroundColor: colors.background.secondary,
                  borderColor: colors.border.light,
                  borderWidth: "1px",
                }}
              >
                <div
                  className="text-3xl font-bold"
                  style={{
                    background: colors.primary.gradient,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm mt-2 font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
export default TestimonialsSection;