import { motion } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
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
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
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

        {/* Testimonials Grid with enhanced animation */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-12"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={staggerItem}
              whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Card gradient border effect */}
              <div
                className="absolute inset-0 bg-gradient-to-br rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(to bottom right, ${colors.primary.light}, transparent, ${colors.secondary.light})`,
                }}
              ></div>

              <div
                className="relative h-full rounded-2xl backdrop-blur-sm p-7 sm:p-8 shadow-lg transition-all duration-300 group-hover:shadow-2xl"
                style={{ backgroundColor: colors.background.secondary }}
              >
                {/* Quote icon */}
                <Quote
                  className="absolute top-6 right-6 w-8 h-8"
                  style={{ color: colors.primary.light }}
                />

                {/* User info with enhanced styling */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div whileHover={{ scale: 1.1 }} className="relative">
                    <div
                      className="absolute inset-0 rounded-full blur"
                      style={{ background: colors.primary.gradient }}
                    ></div>
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="relative w-14 h-14 rounded-full border-2 object-cover"
                      style={{ borderColor: colors.background.secondary }}
                    />
                  </motion.div>
                  <div>
                    <h4
                      className="font-bold text-lg tracking-tight"
                      style={{ color: colors.text.primary }}
                    >
                      {testimonial.name}
                    </h4>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.primary.DEFAULT }}
                    >
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Stars with enhanced animation */}
                <div className="flex gap-1 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + i * 0.1 }}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                    >
                      <Star
                        className="w-5 h-5 transition-transform duration-200"
                        style={{
                          color:
                            i < testimonial.rating
                              ? colors.warning.DEFAULT
                              : colors.neutral[200],
                          fill:
                            i < testimonial.rating
                              ? colors.warning.DEFAULT
                              : "transparent",
                        }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Testimonial text */}
                <p
                  className="leading-relaxed mb-6 italic relative pl-4"
                  style={{
                    color: colors.text.secondary,
                    borderLeftColor: colors.primary.light,
                    borderLeftWidth: "2px",
                  }}
                >
                  "{testimonial.text}"
                </p>

                {/* Decorative bottom accent */}
                <div
                  className="h-1 w-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: colors.primary.gradient }}
                ></div>
              </div>
            </motion.div>
          ))}
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
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-8" : ""
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
