import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { iconMap } from "../maps/iconMap";
import { useAnimations } from "../../animations/animations";

const EmergencyServicesSection = ({ services }) => {
  const animations = useAnimations({ scroll: true });

  return (
    <section className="relative w-full py-10 sm:py-14 lg:py-20 bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={animations.ref}
          variants={animations.fadeInUp}
          initial="hidden"
          animate={animations.animate}
          className="mx-auto max-w-4xl rounded-3xl bg-card shadow-lg backdrop-blur-sm"
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-4 px-4 pt-6 sm:flex-row sm:items-center sm:justify-center sm:gap-5 sm:px-6 sm:pt-8">
            <motion.div
              variants={animations.fadeInUp}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-destructive to-orange-500"
            >
              {iconMap.Zap && (
                <iconMap.Zap className="h-6 w-6 text-primary-foreground" />
              )}
            </motion.div>

            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                Emergency Services
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                24/7 Available · Fast Response
              </p>
            </div>
          </div>

          {/* Services */}
          <motion.div
            variants={animations.staggerContainer}
            initial="hidden"
            animate={animations.animate}
            className="grid grid-cols-1 gap-3 px-4 pb-6 pt-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:gap-4"
          >
            {services.map((service, i) => {
              const Icon = iconMap[service.icon];

              return (
                <motion.button
                  key={service.label + i}
                  variants={animations.staggerItem}
                  whileHover={{ y: -3, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl bg-background px-4 py-3 text-left shadow-sm transition-all hover:shadow-md focus:outline-none"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-foreground/20">
                    {Icon && <Icon className="h-5 w-5 text-foreground" />}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {service.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Arrives in {service.time}
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmergencyServicesSection;
