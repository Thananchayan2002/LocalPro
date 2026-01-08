import React from "react";
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

const FilterTabs = ({ filterStatus, setFilterStatus }) => {
  const statuses = [
    "all",
    "requested",
    "assigned",
    "inProgress",
    "completed",
    "cancelled",
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => setFilterStatus(status)}
          className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition"
          style={
            filterStatus === status
              ? {
                  backgroundColor: colors.primary.DEFAULT,
                  color: "white",
                }
              : {
                  backgroundColor: "white",
                  color: colors.text.primary,
                  borderWidth: "1px",
                  borderColor: "var(--color-border)",
                }
          }
          onMouseEnter={(e) => {
            if (filterStatus !== status) {
              e.target.style.backgroundColor = colors.neutral[100];
            }
          }}
          onMouseLeave={(e) => {
            if (filterStatus !== status) {
              e.target.style.backgroundColor = "white";
            }
          }}
        >
          {status === "all" ? "All" : formatStatus(status)}
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;
