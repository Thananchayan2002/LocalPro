import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { colors } from "../../../../styles/colors";
import { useAnimations } from "../../animations/animations";

/* ---------- Helpers (UNCHANGED LOGIC) ---------- */
const getStatusStyle = (status) => {
  const statusColors = {
    requested: { bg: colors.category.yellow },
    assigned: { bg: colors.category.blue },
    inspecting: { bg: colors.primary.light },
    approved: { bg: colors.success.bg },
    inProgress: { bg: colors.category.cyan },
    completed: { bg: colors.success.bg },
    cancelled: { bg: colors.error.bg },
  };
  return statusColors[status] || { bg: colors.neutral[100] };
};

const getStatusIcon = (status) => {
  switch (status) {
    case "requested":
      return <Clock className="h-4 w-4" />;
    case "assigned":
    case "approved":
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const formatStatus = (status) => {
  const map = {
    requested: "Requested",
    assigned: "Assigned",
    inspecting: "Inspecting",
    approved: "Approved",
    inProgress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return map[status] || status;
};

/* ---------- Component ---------- */
const BookingDetailModal = ({ booking, onClose }) => {
  const { fadeInUp, staggerContainer, staggerItem } = useAnimations();
  const modalRef = useRef(null);
  const previouslyFocused = useRef(null);

  /* ---------- Focus Trap ---------- */
  useEffect(() => {
    previouslyFocused.current = document.activeElement;
    modalRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();

      if (e.key === "Tab") {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus();
    };
  }, [onClose]);

  if (!booking) return null;

  return (
    <AnimatePresence>
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      >
        <motion.div
          ref={modalRef}
          tabIndex={-1}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120) onClose();
          }}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="
            w-full max-w-2xl
            bg-white rounded-2xl
            shadow-2xl
            flex flex-col
            max-h-[90vh]
            outline-none
          "
        >
          {/* ---------- Header ---------- */}
          <div
            className="flex items-center justify-between px-5 py-4 rounded-t-2xl"
            style={{ background: colors.primary.gradient }}
          >
            <div>
              <h2 className="text-lg font-bold text-white">Booking Details</h2>
              <p className="text-xs" style={{ color: colors.primary.light }}>
                Order ID: {booking._id.slice(-8).toUpperCase()}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/20 cursor-pointer"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* ---------- Content ---------- */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <motion.div
              variants={staggerItem}
              className="rounded-xl p-3"
              style={{ backgroundColor: getStatusStyle(booking.status).bg }}
            >
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(booking.status)}
                <span className="text-xs font-semibold uppercase">Status</span>
              </div>
              <p className="text-base font-bold">
                {formatStatus(booking.status)}
              </p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="rounded-xl p-3"
              style={{ backgroundColor: colors.category.blue }}
            >
              <p className="text-xs font-semibold uppercase mb-1">
                Service & Issue
              </p>
              <p className="text-base font-bold">{booking.service}</p>
              <p className="text-sm mt-1">{booking.issueType}</p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="rounded-xl p-3"
              style={{ backgroundColor: colors.background.secondary }}
            >
              <p className="text-xs font-semibold uppercase mb-1">
                Description
              </p>
              <p className="text-sm">{booking.description}</p>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="rounded-xl p-3"
              style={{ backgroundColor: colors.category.orange }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase">
                  Scheduled Time
                </span>
              </div>
              <p className="text-sm font-semibold">
                {new Date(booking.scheduledTime).toLocaleString()}
              </p>
            </motion.div>

            {booking.professionalId && (
              <motion.div
                variants={staggerItem}
                className="rounded-xl p-3"
                style={{ backgroundColor: colors.primary.light }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-semibold uppercase">
                    Assigned Professional
                  </span>
                </div>
                <p className="text-sm font-semibold">
                  {booking.professionalId.name}
                </p>
              </motion.div>
            )}
          </div>

          {/* ---------- Footer ---------- */}
          <div className="border-t px-4 py-4">
            <button
              onClick={onClose}
              className="
                w-full rounded-xl
                px-4 py-2 font-semibold
                cursor-pointer
                hover:opacity-90
              "
              style={{
                backgroundColor: colors.neutral[200],
                color: colors.text.primary,
              }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingDetailModal;
