import React from "react";
import { Calendar } from "lucide-react";
import { colors } from "../../../../styles/colors";

const formatStatus = (status) => {
  const statusMap = {
    requested: "Requested",
    assigned: "Assigned",
    inspecting: "Inspecting",
    approved: "Approved",
    inProgress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return statusMap[status] || status;
};

const EmptyState = ({ filterStatus }) => {
  return (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="text-center py-8">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
          style={{ backgroundColor: colors.primary.light }}
        >
          <Calendar size={32} style={{ color: colors.primary.DEFAULT }} />
        </div>
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: colors.text.primary }}
        >
          No Bookings Found
        </h3>
        <p style={{ color: colors.text.secondary }} className="text-sm">
          {filterStatus === "all"
            ? "You haven't made any bookings yet."
            : `No ${formatStatus(filterStatus).toLowerCase()} bookings.`}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
