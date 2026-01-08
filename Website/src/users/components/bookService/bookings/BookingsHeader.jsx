import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { colors } from "../../../../styles/colors";
import { useAnimations } from "../../../../animations/animations";

const BookingsHeader = ({ bookingsCount }) => {
  const { fadeInUp, staggerContainer, staggerItem } = useAnimations();

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="
        flex items-center gap-4
        mb-5
        px-1
      "
    >
      {/* Icon */}
      <motion.div
        variants={staggerItem}
        className="
          flex items-center justify-center
          w-11 h-11
          rounded-xl
          shadow-sm
          flex-shrink-0
        "
        style={{ backgroundColor: colors.primary.DEFAULT }}
      >
        <Calendar className="w-5 h-5" style={{ color: "white" }} />
      </motion.div>

      {/* Text */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col leading-tight"
      >
        <h1
          className="
            text-lg sm:text-xl
            font-bold
            tracking-tight
          "
          style={{ color: colors.text.primary }}
        >
          My Bookings
        </h1>

        <p
          className="
            text-sm
            mt-0.5
          "
          style={{ color: colors.text.secondary }}
        >
          {bookingsCount} total booking{bookingsCount !== 1 && "s"}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default BookingsHeader;
