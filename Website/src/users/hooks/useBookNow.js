import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const resolveServiceId = (service) => {
  if (!service) return "";
  if (typeof service === "string") return service;
  return service._id || service.id || service.serviceId || "";
};

/**
 * Centralised booking trigger to keep Book Now behaviour consistent.
 * - If an `onStartBooking` handler is provided, it is used for launching modals or setting state.
 * - Otherwise, it falls back to routing directly to the booking page when an id is available.
 */
export const useBookNow = ({ onStartBooking, fallbackToRoute = true } = {}) => {
  const navigate = useNavigate();

  const startBooking = useCallback(
    (service) => {
      if (onStartBooking) {
        onStartBooking(service || null);
        return;
      }

      if (!fallbackToRoute) return;

      const id = resolveServiceId(service);
      if (id) {
        navigate(`/app/book/${id}`);
      }
    },
    [navigate, onStartBooking, fallbackToRoute]
  );

  return { startBooking };
};
