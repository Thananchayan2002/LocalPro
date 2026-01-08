import { useReducedMotion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Unified animation system
 * - Mobile-first
 * - Accessible (prefers-reduced-motion)
 * - Replayable on scroll up & down
 * - Lighthouse-friendly
 * - Clean UX motion (no gimmicks)
 */
export const useAnimations = ({ scroll = false } = {}) => {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);

  const isInView = scroll
    ? useInView(ref, {
        margin: "-15% 0px -15% 0px", // earlier + smoother trigger
      })
    : true;

  /* ------------------ Timing ------------------ */
  const FAST = reduceMotion ? 0.01 : 0.35;
  const NORMAL = reduceMotion ? 0.01 : 0.5;
  const SLOW = reduceMotion ? 0.01 : 0.65;

  const EASE_OUT = [0.22, 1, 0.36, 1];
  const EASE_SOFT = [0.4, 0, 0.2, 1];

  /* ------------------ Variants ------------------ */

  const fadeInUp = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: NORMAL,
        ease: EASE_OUT,
      },
    },
    exit: reduceMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          y: 16,
          transition: {
            duration: FAST,
            ease: EASE_SOFT,
          },
        },
  };

  const fadeInRight = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, x: 28 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: NORMAL,
        ease: EASE_OUT,
      },
    },
    exit: reduceMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          x: 16,
          transition: {
            duration: FAST,
            ease: EASE_SOFT,
          },
        },
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? {}
        : {
            staggerChildren: 0.1,
            delayChildren: 0.05,
          },
    },
    exit: reduceMotion
      ? {}
      : {
          transition: {
            staggerChildren: 0.05,
            staggerDirection: -1,
          },
        },
  };

  const staggerItem = {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: FAST,
        ease: EASE_SOFT,
      },
    },
    exit: reduceMotion
      ? { opacity: 0 }
      : {
          opacity: 0,
          y: 10,
          transition: {
            duration: FAST,
            ease: EASE_SOFT,
          },
        },
  };

  return {
    ref: scroll ? ref : undefined,
    animate: isInView ? "visible" : "hidden",
    initial: "hidden",
    exit: "exit",

    fadeInUp,
    fadeInRight,
    staggerContainer,
    staggerItem,
  };
};
