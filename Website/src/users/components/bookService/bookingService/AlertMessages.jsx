import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import { colors } from "../../../../styles/colors";
import { useAnimations } from "../../../../animations/animations";

const AlertMessages = ({ error, success }) => {
  const { fadeInUp } = useAnimations();

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          key="error"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="
            mb-4
            flex items-start gap-3
            rounded-xl
            px-4 py-3
            shadow-sm
          "
          style={{
            backgroundColor: colors.error.bg,
            borderColor: colors.error.DEFAULT,
            borderWidth: "1px",
          }}
        >
          <AlertCircle
            className="flex-shrink-0 mt-0.5"
            size={20}
            style={{ color: colors.error.DEFAULT }}
          />
          <p
            className="
              text-sm
              leading-relaxed
            "
            style={{ color: colors.error.DEFAULT }}
          >
            {error}
          </p>
        </motion.div>
      )}

      {success && (
        <motion.div
          key="success"
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="
            mb-4
            flex items-start gap-3
            rounded-xl
            px-4 py-3
            shadow-sm
          "
          style={{
            backgroundColor: colors.success.bg,
            borderColor: colors.success.DEFAULT,
            borderWidth: "1px",
          }}
        >
          <Check
            className="flex-shrink-0 mt-0.5"
            size={20}
            style={{ color: colors.success.DEFAULT }}
          />
          <p
            className="
              text-sm
              leading-relaxed
            "
            style={{ color: colors.success.DEFAULT }}
          >
            Booking created successfully!
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertMessages;
