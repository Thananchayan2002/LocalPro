import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAnimations } from "../../animations/animations";

const CTASection = ({ setShowBookingModal }) => {
  const navigate = useNavigate();
  const { ref, animate, fadeInUp, staggerContainer, staggerItem } =
    useAnimations({ scroll: true });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-background py-7 sm:py-9 lg:py-12"
    >
      {/* Subtle background accents */}
      <div className="pointer-events-none absolute -top-32 right-0 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        {/* ---------- Content ---------- */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="flex flex-col items-center"
        >
          <motion.h2
            variants={staggerItem}
            className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight"
          >
            Ready to Get Started?
          </motion.h2>

          <motion.p
            variants={staggerItem}
            className="mb-8 max-w-2xl text-base sm:text-lg opacity-95"
          >
            Join thousands who trust LocalPro for their service needs. Book your
            first service today.
          </motion.p>

          {/* ---------- Actions ---------- */}
          <motion.div
            variants={staggerContainer}
            className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4"
          >
            <motion.button
              variants={staggerItem}
              onClick={() => setShowBookingModal && setShowBookingModal(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl
                bg-card
                px-6 sm:px-8
                py-3.5
                text-sm sm:text-base
                font-semibold
                text-primary
                shadow-sm
                transition-transform
                cursor-pointer
              "
            >
              Book a Service Now
              <ArrowRight className="h-5 w-5" />
            </motion.button>

            <motion.button
              variants={staggerItem}
              onClick={() => navigate("/app/contact")}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl
                border border-primary-foreground/30
                px-6 sm:px-8
                py-3.5
                text-sm sm:text-base
                font-semibold
                text-primary-foreground
                transition-colors
                hover:bg-primary-foreground
                hover:text-primary
                cursor-pointer
              "
            >
              <Phone className="h-5 w-5" />
              Contact Us
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
