import { motion } from "framer-motion";
import { iconMap } from "../maps/iconMap";
import { useAnimations } from "../../animations/animations";

const HowItWorksSection = ({ steps }) => {
  const { ref, animate, staggerContainer, staggerItem, fadeInUp } =
    useAnimations({ scroll: true });

  return (
    <section ref={ref} className="py-6 sm:py-8 lg:py-12 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        {/* ---------- Header ---------- */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={animate}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <h2 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Simple, fast, and reliable booking in three easy steps
          </p>
        </motion.div>

        {/* ---------- Mobile / Tablet ---------- */}
        <div className="space-y-4 lg:hidden">
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon];
            return (
              <motion.div
                key={step.title + index}
                variants={fadeInUp}
                initial="hidden"
                animate={animate}
                className="
                  flex items-start gap-4
                  rounded-2xl
                  bg-card
                  p-4 sm:p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    flex h-12 w-12 flex-shrink-0 items-center justify-center
                    rounded-xl
                    bg-primary/10
                    text-primary
                  "
                >
                  {Icon && <Icon className="h-6 w-6" />}
                </div>

                <div className="flex-1">
                  <p className="mb-1 text-xs font-semibold text-primary">
                    Step {index + 1}
                  </p>
                  <h3 className="mb-1 text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ---------- Desktop ---------- */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="hidden lg:grid grid-cols-3 gap-8"
        >
          {steps.map((step, index) => {
            const Icon = iconMap[step.icon];
            return (
              <motion.div
                key={step.title + index}
                variants={staggerItem}
                whileHover={{ y: -6 }}
                className="
                  relative
                  rounded-2xl
                  bg-card
                  p-8
                  text-center
                  shadow-sm
                  transition-shadow duration-300
                  hover:shadow-md
                "
              >
                <div
                  className="
                    mx-auto mb-5
                    flex h-16 w-16 items-center justify-center
                    rounded-2xl
                    bg-primary/10
                    text-primary
                  "
                >
                  {Icon && <Icon className="h-8 w-8" />}
                </div>

                <p className="mb-2 text-xs font-semibold text-primary">
                  Step {index + 1}
                </p>

                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
