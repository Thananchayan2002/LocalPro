import React, { useEffect } from "react";
import {
  Loader,
  AlertTriangle,
  ChevronRight,
  IndianRupee,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAnimations } from "../../../animations/animations";
import { colors } from "../../../styles/colors";

const IssuesModal = ({
  isOpen,
  service,
  issues,
  loadingIssues,
  onClose,
  getIconComponent,
  onBook,
}) => {
  const IconComponent = getIconComponent(service?.iconName);
  const { fadeInUp, staggerContainer, staggerItem } = useAnimations();

  // Hide mobile header and nav when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("issuesmodal-mobile-open");
    } else {
      document.body.classList.remove("issuesmodal-mobile-open");
    }
    return () => {
      document.body.classList.remove("issuesmodal-mobile-open");
    };
  }, [isOpen]);

  if (!isOpen || !service) return null;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        backdrop-blur-sm
      "
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--color-text) 60%, transparent)",
      }}
    >
      {/* Modal Container */}
      <div
        className="
          flex flex-col
          w-full h-full sm:h-auto
          sm:max-w-5xl
          sm:max-h-[90vh]
          sm:rounded-2xl
          shadow-2xl
          overflow-hidden
        "
        style={{ backgroundColor: colors.background.primary }}
      >
        {/* Header */}
        <div
          className="px-4 py-4 sm:px-6"
          style={{
            background: colors.primary.gradient,
            color: colors.text.inverse,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: colors.background.secondary }}
              >
                <IconComponent
                  className="w-7 h-7"
                  style={{ color: colors.primary.dark }}
                />
              </div>

              <div>
                <h2
                  className="text-xl sm:text-3xl font-bold leading-tight"
                  style={{ color: colors.text.inverse }}
                >
                  {service.service}
                </h2>
                <p
                  className="text-sm sm:text-base mt-1"
                  style={{ color: colors.text.inverse, opacity: 0.85 }}
                >
                  {service.description}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="
                p-2 rounded-full
                transition
                focus:outline-none
              "
              style={{ color: colors.text.inverse }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {loadingIssues ? (
            <div className="flex items-center justify-center py-24">
              <Loader
                className="w-8 h-8 animate-spin"
                style={{ color: colors.primary.DEFAULT }}
              />
            </div>
          ) : issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <AlertTriangle
                className="w-14 h-14 mb-4"
                style={{ color: colors.warning.DEFAULT }}
              />
              <h3
                className="text-lg font-semibold"
                style={{ color: colors.text.primary }}
              >
                No Issues Available
              </h3>
              <p className="mt-1" style={{ color: colors.text.secondary }}>
                No issues found for this service.
              </p>
            </div>
          ) : (
            <>
              {/* Count */}
              <div className="mb-5">
                <h3
                  className="text-sm sm:text-base font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {issues.length} issue{issues.length !== 1 ? "s" : ""}{" "}
                  available
                </h3>
              </div>

              {/* Issues Grid */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {issues.map((issue) => (
                  <motion.div
                    key={issue._id}
                    variants={staggerItem}
                    className="
                      rounded-xl
                      p-5
                      flex flex-col justify-between
                      transition
                      hover:shadow-lg
                    "
                    style={{
                      backgroundColor: colors.background.secondary,
                      border: `2px solid ${colors.border.light}`,
                    }}
                  >
                    <div>
                      <h4
                        className="text-base font-bold mb-3"
                        style={{ color: colors.text.primary }}
                      >
                        {issue.issueName}
                      </h4>

                      <div
                        className="flex items-center gap-2 mb-2"
                        style={{ color: colors.success.DEFAULT }}
                      >
                        <span className="text-xl font-bold">
                          LKR {issue.basicCost?.toLocaleString() || "N/A"}
                        </span>
                      </div>

                      <p
                        className="text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        Base price – Final cost may vary
                      </p>
                    </div>

                    <motion.button
                      onClick={() => onBook(issue)}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                      className="
                        mt-4
                        w-full
                        py-3
                        rounded-lg
                        font-semibold
                        flex items-center justify-center gap-2
                        transition-colors
                        cursor-pointer
                      "
                      style={{
                        background: colors.primary.gradient,
                        color: colors.text.inverse,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.primary.dark;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          colors.primary.gradient;
                      }}
                    >
                      Book Service
                      <motion.div
                        initial={{ x: 0 }}
                        animate={{ x: 0 }}
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </motion.div>
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default IssuesModal;
