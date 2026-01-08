import React from "react";
import { Loader, Package, Check, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { colors } from "../../../../styles/colors";
import { useAnimations } from "../../../../animations/animations";

const ServiceSelection = ({
  services,
  selectedService,
  loading,
  onServiceSelect,
  onNext,
}) => {
  const { initial, animate, exit, fadeInUp, staggerContainer, staggerItem } =
    // Disable scroll-triggered animation; animate on mount instead
    useAnimations();

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      variants={fadeInUp}
      className="w-full"
    >
      {/* Title */}
      <h3
        className="mb-4 text-base sm:text-lg font-semibold"
        style={{ color: colors.text.primary }}
      >
        Choose a Service
      </h3>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader
            className="h-8 w-8 animate-spin"
            style={{ color: colors.primary.DEFAULT }}
          />
        </div>
      ) : (
        <motion.div
          initial={initial}
          animate={animate}
          exit={exit}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {(services || []).map((service) => {
            const isSelected = selectedService?._id === service._id;

            return (
              <motion.button
                key={service._id}
                variants={staggerItem}
                type="button"
                onClick={() => onServiceSelect(service)}
                className="
                  w-full text-left cursor-pointer
                  rounded-2xl border-2 p-4
                  transition-all duration-300
                  hover:shadow-md
                  focus:outline-none
                "
                style={{
                  borderColor: isSelected
                    ? colors.primary.DEFAULT
                    : "var(--color-border)",
                  backgroundColor: isSelected
                    ? colors.primary.light
                    : "transparent",
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="
                      flex h-12 w-12 shrink-0 items-center justify-center
                      rounded-xl text-white
                    "
                    style={{ background: colors.primary.gradient }}
                  >
                    <Package className="h-6 w-6" />
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h4
                      className="mb-1 text-sm sm:text-base font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      {service.service}
                    </h4>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: colors.text.secondary }}
                    >
                      {service.description}
                    </p>
                  </div>

                  {/* Selected indicator */}
                  {isSelected && (
                    <Check
                      className="h-6 w-6 shrink-0"
                      style={{ color: colors.primary.DEFAULT }}
                    />
                  )}
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Action */}
      <div className="mt-6 flex justify-end">
        {/** Soften appearance when disabled to signal inactivity */}
        {(() => {
          const isDisabled = !selectedService;
          const enabledStyle = {
            background: colors.primary.gradient,
            color: "white",
          };
          const disabledStyle = {
            background: "var(--color-border)",
            color: colors.text.secondary,
            border: "1px solid var(--color-border-strong)",
            boxShadow: "none",
          };

          return (
            <motion.button
              variants={fadeInUp}
              type="button"
              onClick={onNext}
              disabled={isDisabled}
              className="
            inline-flex items-center gap-2
            rounded-xl px-6 py-3
            text-sm sm:text-base font-semibold text-white
              cursor-pointer transition-all duration-300
            hover:shadow-lg
            disabled:cursor-not-allowed disabled:opacity-50
          "
              style={isDisabled ? disabledStyle : enabledStyle}
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          );
        })()}
      </div>
    </motion.div>
  );
};

export default ServiceSelection;
