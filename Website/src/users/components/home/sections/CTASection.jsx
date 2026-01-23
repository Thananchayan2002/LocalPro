import { motion } from "framer-motion";
import { ArrowRight, Phone, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../../../styles/colors";
import { useAnimations } from "../../animations/animations";
import AppLoader from "../../common/AppLoader";

const CTASection = ({ setShowBookingModal, isLoading = false }) => {
  const navigate = useNavigate();
  const { ref, animate, fadeInUp, staggerContainer, staggerItem } =
    useAnimations({ scroll: true });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-12 sm:py-16 lg:py-20"
      style={{ backgroundColor: colors.background.primary }}
    >
      {isLoading && (
        <AppLoader
          title="Loading"
          subtitle="Getting things ready for you"
        />
      )}
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Decorative top element */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ backgroundColor: colors.primary.light }}
          >
            <Sparkles
              className="h-4 w-4"
              style={{ color: colors.primary.DEFAULT }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: colors.primary.DEFAULT }}
            >
              Limited Time Offer
            </span>
          </div>
        </motion.div>

        {/* Main content container */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="relative rounded-2xl p-8 backdrop-blur-sm sm:p-10 lg:p-12"
          style={{ backgroundColor: colors.background.secondary }}
        >
          {/* Subtle border gradient */}
          <div
            className="absolute inset-0 rounded-2xl p-[1px]"
            style={{
              background: `linear-gradient(to right, ${colors.primary.light}, transparent, ${colors.secondary.light})`,
            }}
          >
            <div
              className="h-full w-full rounded-2xl"
              style={{ backgroundColor: colors.background.secondary }}
            />
          </div>

          <div className="relative">
            {/* Heading section */}
            <motion.div
              variants={staggerContainer}
              className="mb-10 text-center"
            >
              <motion.h2
                variants={staggerItem}
                className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl"
                style={{ color: colors.text.primary }}
              >
                Transform Your Experience
                <span
                  className="block"
                  style={{ color: colors.primary.DEFAULT }}
                >
                  Starting Today
                </span>
              </motion.h2>

              <motion.p
                variants={staggerItem}
                className="mx-auto max-w-3xl text-lg opacity-90 sm:text-xl"
                style={{ color: colors.text.secondary }}
              >
                Join{" "}
                <span
                  className="font-semibold"
                  style={{ color: colors.primary.DEFAULT }}
                >
                  15,000+
                </span>{" "}
                satisfied clients who trust our premium services. Your journey
                to excellence begins with a single click.
              </motion.p>
            </motion.div>

            {/* Stats preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6"
            >
              {[
                { value: "4.9/5", label: "Customer Rating" },
                { value: "24/7", label: "Support" },
                { value: "98%", label: "Satisfaction" },
                { value: "2H", label: "Avg Response" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: colors.background.primary }}
                >
                  <div
                    className="text-2xl font-bold sm:text-3xl"
                    style={{ color: colors.primary.DEFAULT }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="mt-1 text-xs font-medium opacity-80 sm:text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Action buttons section */}
            <motion.div
              variants={staggerContainer}
              className="flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-6"
            >
              <motion.button
                variants={staggerItem}
                onClick={() => setShowBookingModal && setShowBookingModal(true)}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px -10px rgba(15, 100, 200, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group relative w-full max-w-xs overflow-hidden rounded-xl px-8 py-4 text-center font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl sm:w-auto"
                style={{ background: colors.primary.gradient }}
              >
                {/* Button background shine effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-700" />

                <span className="relative flex items-center justify-center gap-3">
                  Begin Your Journey
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>

              <motion.button
                variants={staggerItem}
                onClick={() => navigate("/app")}
                whileHover={{
                  scale: 1.05,
                }}
                whileTap={{ scale: 0.98 }}
                className="group w-full max-w-xs rounded-xl px-8 py-4 font-semibold shadow-sm transition-all duration-300 hover:shadow-md sm:w-auto"
                style={{
                  background: colors.secondary.gradient,
                  border: `2px solid ${colors.border.light}`,
                  color: "#FFFFFF",
                }}
              >
                <span className="flex items-center justify-center gap-3">
                  <Phone className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Schedule a Consultation
                </span>
              </motion.button>
            </motion.div>

            {/* Trust indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-10 text-center"
            >
              <p
                className="text-sm opacity-70"
                style={{ color: colors.text.secondary }}
              >
                <span className="font-medium">No commitments</span> •
                <span className="font-medium"> Cancel anytime</span> •
                <span className="font-medium"> 30-day guarantee</span>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
