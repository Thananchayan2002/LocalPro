import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { useAnimations } from "../../animations/animations";

const TestimonialCard = ({ testimonial }) => {
  const { fadeInUp } = useAnimations();

  return (
    <motion.article
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
      className="
        flex h-full flex-col
        rounded-2xl
        bg-card
        p-4 sm:p-5 lg:p-6
        shadow-sm
        transition-shadow duration-300
        hover:shadow-md
      "
      aria-label={`Testimonial from ${testimonial.name}`}
    >
      {/* ---------- Header ---------- */}
      <div className="mb-4 flex items-center gap-3">
        <img
          src={testimonial.image}
          alt={`Photo of ${testimonial.name}`}
          className="
            h-12 w-12 sm:h-14 sm:w-14
            rounded-full
            object-cover
            bg-muted
            flex-shrink-0
          "
        />

        <div className="text-left">
          <h4 className="text-sm sm:text-base font-semibold text-foreground">
            {testimonial.name}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {testimonial.role}
          </p>
        </div>
      </div>

      {/* ---------- Rating ---------- */}
      <div className="mb-3 flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 text-yellow-500 fill-yellow-500"
            aria-hidden="true"
          />
        ))}
      </div>

      {/* ---------- Content ---------- */}
      <p className="text-sm leading-relaxed text-muted-foreground text-left">
        “{testimonial.text}”
      </p>
    </motion.article>
  );
};

export default TestimonialCard;
