import React from "react";
import { ChevronRight } from "lucide-react";
import { colors } from "../../../../styles/colors";

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="flex items-center gap-4">
      <div
        className="flex items-center gap-2"
        style={{
          color: currentStep === 1 ? "white" : "rgba(255,255,255,0.5)",
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor:
              currentStep === 1 ? "white" : "rgba(255,255,255,0.3)",
            color: currentStep === 1 ? colors.primary.DEFAULT : "white",
          }}
        >
          1
        </div>
        <span className="font-medium">Select Service</span>
      </div>
      <ChevronRight className="w-5 h-5" />
      <div
        className="flex items-center gap-2"
        style={{
          color: currentStep === 2 ? "white" : "rgba(255,255,255,0.5)",
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor:
              currentStep === 2 ? "white" : "rgba(255,255,255,0.3)",
            color: currentStep === 2 ? colors.primary.DEFAULT : "white",
          }}
        >
          2
        </div>
        <span className="font-medium">Booking Details</span>
      </div>
    </div>
  );
};

export default StepIndicator;
