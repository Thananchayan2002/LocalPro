import { motion } from "framer-motion";
import { iconMap } from "../maps/iconMap";
import { useAnimations } from "../../animations/animations";

const WhyChooseSection = ({ features }) => {
  const { ref, animate, staggerContainer, staggerItem, fadeInUp } =
    useAnimations({ scroll: true });

  return (
    <section ref={ref} className="py-6 sm:py-8 lg:py-12 bg-background">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-center">
        {/* ---------- Header ---------- */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={animate}
          className="mx-auto mb-10 max-w-2xl text-center"
        >
          <h2 className="mb-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Why Choose LocalPro
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Reliable local services you can trust
          </p>
        </motion.div>

        {/* ---------- Features Grid ---------- */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={animate}
          className="
            grid grid-cols-1
            gap-4
            sm:grid-cols-2 sm:gap-6
            lg:grid-cols-3
            w-full
            max-w-5xl
            justify-items-center
          "
        >
          {features.map((feat, i) => {
            const Icon = iconMap[feat.icon];

            return (
              <motion.div
                key={feat.title + i}
                variants={staggerItem}
                whileHover={{ y: -6 }}
                className="
                  rounded-2xl
                  bg-card
                  p-5 sm:p-6
                  shadow-sm
                  transition-shadow duration-300
                  hover:shadow-md
                "
              >
                <div
                  className="
                    mb-4
                    flex h-12 w-12 items-center justify-center
                    rounded-xl
                    bg-primary/10
                    text-primary
                  "
                >
                  {Icon && <Icon className="h-6 w-6" />}
                </div>

                <h3 className="mb-2 text-base sm:text-lg font-semibold text-foreground">
                  {feat.title}
                </h3>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
