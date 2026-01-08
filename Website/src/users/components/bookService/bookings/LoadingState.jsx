import React from "react";
import { Loader } from "lucide-react";
import { colors } from "../../../../styles/colors";

const LoadingState = () => {
  return (
    <div className="bg-white rounded-lg shadow p-8 text-center">
      <Loader
        className="w-8 h-8 animate-spin mx-auto mb-4"
        style={{ color: colors.primary.DEFAULT }}
      />
      <p style={{ color: colors.text.secondary }}>Loading bookings...</p>
    </div>
  );
};

export default LoadingState;
