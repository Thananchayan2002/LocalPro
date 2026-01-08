import { motion } from "framer-motion";
import { Star, BadgeCheck } from "lucide-react";
import { useAnimations } from "../../animations/animations";

const WorkerCard = ({ worker }) => {
  const { fadeInUp, staggerContainer, staggerItem } = useAnimations();

  const isTopRated = worker.rating >= 4.5;

  return (
    <motion.article
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6 }}
      className="
        flex h-full flex-col
        rounded-2xl
        bg-card
        p-4 sm:p-5
        transition-shadow duration-300   
      "
      aria-label={`Worker card for ${worker.name}`}
    >
      {/* ---------- Header ---------- */}
      <motion.div
        variants={staggerContainer}
        className="mb-4 flex items-center gap-3"
      >
        <motion.img
          variants={staggerItem}
          src={worker.avatar}
          alt={`Profile photo of ${worker.name}`}
          className="
            h-14 w-14 sm:h-16 sm:w-16
            rounded-full
            object-cover
            bg-muted
            flex-shrink-0
          "
        />

        <motion.div variants={staggerItem} className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-base sm:text-lg font-semibold text-foreground">
              {worker.name}
            </h3>

            {isTopRated && (
              <BadgeCheck
                className="h-4 w-4 text-primary"
                aria-label="Top rated professional"
              />
            )}
          </div>

          <p className="text-sm text-muted-foreground">{worker.service}</p>

          <div className="mt-1 flex items-center gap-1.5">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-foreground">
              {worker.rating}
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* ---------- Footer ---------- */}
      <motion.div
        variants={staggerContainer}
        className="mt-auto flex items-center justify-between gap-4"
      >
        <motion.div variants={staggerItem}>
          <p className="text-xs text-muted-foreground">Starting from</p>
          <p className="text-lg sm:text-xl font-bold text-foreground">
            <span className="text-sm font-medium">Rs.</span>{" "}
            {worker.startingFrom.toLocaleString()}
          </p>
        </motion.div>

        <motion.button
          variants={staggerItem}
          whileHover={{
            scale: 1.04,
            backgroundColor: "var(--color-primary)",
            transition: { duration: 0.3 },
          }}
          whileTap={{ scale: 0.96 }}
          className="
            rounded-xl
            px-4 sm:px-5
            py-2.5
            text-sm font-semibold
            text-white
            cursor-pointer
          "
          style={{
            backgroundColor: "var(--color-primary-strong)",
            transition: "background-color 0.3s ease",
          }}
          aria-label={`Book ${worker.name}`}
        >
          Book Now
        </motion.button>
      </motion.div>
    </motion.article>
  );
};

export default WorkerCard;
