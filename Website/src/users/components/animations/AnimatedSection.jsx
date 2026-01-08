import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { useAnimations } from "./animations";

const AnimatedSection = ({ children, className = "" }) => {
  const { fadeInUp, ref: scrollRef, animate } = useAnimations({ scroll: true });
  const ref = scrollRef || useRef(null);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={animate}
      variants={fadeInUp}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
