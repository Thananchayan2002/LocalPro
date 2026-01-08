import React from "react";
import {
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Star,
} from "lucide-react";
import { colors } from "../../../../styles/colors";

const getStatusStyle = (status) => {
  const statusColors = {
    requested: { bg: colors.category.yellow, text: "text-yellow-800" },
    assigned: { bg: colors.category.blue, text: "text-blue-800" },
    inspecting: { bg: colors.primary.light, text: colors.text.primary },
    approved: { bg: colors.success.bg, text: colors.text.primary },
    inProgress: { bg: colors.category.cyan, text: "text-cyan-800" },
    completed: { bg: colors.success.bg, text: colors.text.primary },
    cancelled: { bg: colors.error.bg, text: colors.text.primary },
  };
  return (
    statusColors[status] || {
      bg: colors.neutral[100],
      text: colors.text.primary,
    }
  );
};

const getStatusIcon = (status) => {
  switch (status) {
    case "requested":
      return <Clock className="w-4 h-4" />;
    case "assigned":
    case "approved":
    case "completed":
      return <CheckCircle className="w-4 h-4" />;
    case "cancelled":
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

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

const BookingsTable = ({
  bookings,
  reviewableBookings,
  onViewDetails,
  onOpenReview,
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            style={{
              backgroundColor: colors.neutral[50],
              borderBottomColor: "var(--color-border)",
            }}
            className="border-b"
          >
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.text.secondary }}
              >
                Service
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.text.secondary }}
              >
                Issue
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.text.secondary }}
              >
                Scheduled
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.text.secondary }}
              >
                Location
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.text.secondary }}
              >
                Professional
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.text.secondary }}
              >
                Status
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.text.secondary }}
              >
                Payment
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider"
                style={{ color: colors.text.secondary }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody
            className="bg-white divide-y"
            style={{ borderColor: "var(--color-border)" }}
          >
            {bookings.map((booking) => (
              <tr
                key={booking._id}
                className="transition"
                style={{ borderColor: "var(--color-border)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.neutral[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                }}
              >
                <td className="px-4 py-3">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    {booking.service}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p
                    className="text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    {booking.issueType}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: colors.primary.DEFAULT }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {new Date(booking.scheduledTime).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2 max-w-xs">
                    <MapPin
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: colors.primary.DEFAULT }}
                    />
                    <p
                      className="text-sm truncate"
                      style={{ color: colors.text.secondary }}
                    >
                      {booking.location?.address ||
                        `${booking.location?.area}, ${booking.location?.district}`}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {booking.professionalId ? (
                    <div className="flex items-center gap-2">
                      <User
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: colors.primary.DEFAULT }}
                      />
                      <p
                        className="text-sm"
                        style={{ color: colors.text.primary }}
                      >
                        {booking.professionalId.name || "Assigned"}
                      </p>
                    </div>
                  ) : (
                    <p
                      className="text-sm"
                      style={{ color: colors.text.tertiary }}
                    >
                      Not assigned
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      backgroundColor: getStatusStyle(booking.status).bg,
                      borderColor: getStatusStyle(booking.status).bg,
                    }}
                  >
                    {getStatusIcon(booking.status)}
                    {formatStatus(booking.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {booking.payment && booking.payment.paymentByUser ? (
                    <div
                      className="flex items-center gap-1.5"
                      style={{ color: colors.success.DEFAULT }}
                    >
                      <span className="text-sm font-semibold">
                        {booking.payment.paymentByUser}/=
                      </span>
                    </div>
                  ) : (
                    <span
                      className="text-xs italic"
                      style={{ color: colors.text.tertiary }}
                    >
                      Not paid
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onViewDetails(booking)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-semibold transition"
                      style={{
                        backgroundColor: colors.primary.DEFAULT,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          colors.primary.dark;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          colors.primary.DEFAULT;
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    {reviewableBookings[booking._id] && (
                      <button
                        onClick={() => onOpenReview(booking)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded-lg text-xs font-semibold transition"
                        style={{
                          backgroundColor: colors.success.DEFAULT,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            colors.success.dark;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor =
                            colors.success.DEFAULT;
                        }}
                      >
                        <Star className="w-3.5 h-3.5" />
                        Review
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsTable;
