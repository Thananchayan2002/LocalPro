import React, { useState, useEffect, useMemo } from "react";
import {
  Menu,
  Bell,
  LogOut,
  LayoutDashboard,
  Briefcase,
  Calendar,
  CreditCard,
  UserCog,
  Power,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ConfirmModal } from "../../components/common/ConfirmModal";
import toast from "react-hot-toast";
import { authFetch } from "../../../utils/authFetch";
import { colors } from "../../../styles/colors";

export const Topbar = ({ onMenuClick }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAvailabilityConfirm, setShowAvailabilityConfirm] = useState(false);
  const [pendingAvailability, setPendingAvailability] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Get page title and icon based on current route
  const getPageInfo = () => {
    const path = location.pathname.replace(/^\/worker/, "") || "/";
    if (path === "/" || path === "/dashboard")
      return { title: "Dashboard", icon: LayoutDashboard };
    if (path === "/services") return { title: "Services", icon: Briefcase };
    if (path === "/bookings") return { title: "Bookings", icon: Calendar };
    if (path === "/payments") return { title: "Payments", icon: CreditCard };
    if (path === "/notifications")
      return { title: "Notifications", icon: Bell };
    if (path === "/account") return { title: "Account", icon: UserCog };
    return { title: "Dashboard", icon: LayoutDashboard };
  };

  const pageInfo = getPageInfo();
  const PageIcon = pageInfo.icon;

  // Fetch current availability status
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?.professionalId) return;

      try {
        const res = await authFetch(
          `${apiUrl}/api/worker/availability/${user.professionalId}`,
        );
        const data = await res.json();

        if (data.success) {
          setIsAvailable(data.isAvailable);
        }
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      }
    };

    fetchAvailability();
  }, [user?.professionalId, apiUrl]);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/login");
  };

  const handleToggleClick = () => {
    setPendingAvailability(!isAvailable);
    setShowAvailabilityConfirm(true);
  };

  const confirmAvailabilityToggle = async () => {
    setLoading(true);
    setShowAvailabilityConfirm(false);

    try {
      const res = await authFetch(
        `${apiUrl}/api/worker/availability/${user.professionalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isAvailable: pendingAvailability }),
        },
      );

      const data = await res.json();

      if (data.success) {
        setIsAvailable(pendingAvailability);
        toast.success(
          `You are now ${pendingAvailability ? "available" : "unavailable"} for bookings`,
        );
      } else {
        toast.error(data.message || "Failed to update availability");
      }
    } catch (error) {
      toast.error("Failed to update availability");
    } finally {
      setLoading(false);
      setPendingAvailability(null);
    }
  };

  const availabilityLabel = useMemo(
    () => (isAvailable ? "Available" : "Unavailable"),
    [isAvailable],
  );

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-45",
        "h-16 lg:h-[72px]",
        "border-b",
        "shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)]",
        "backdrop-blur supports-[backdrop-filter]:backdrop-blur-md",
        "transition-[box-shadow,transform] duration-300 ease-out",
        "lg:left-64",
      ].join(" ")}
      style={{
        background: colors.background.primary,
        borderColor: colors.border.DEFAULT,
      }}
    >
      {/* subtle top sheen */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.24), rgba(255,255,255,0))",
        }}
      />

      <div className="relative mx-auto flex h-full max-w-[1600px] items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Left section */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            type="button"
            className={[
              "lg:hidden",
              "group inline-flex items-center justify-center",
              "h-11 w-11 rounded-2xl",
              "shadow-sm",
              "ring-1 ring-white/10",
              "transition-all duration-200 ease-out",
              "hover:shadow-md hover:scale-[1.03]",
              "active:scale-95",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "cursor-pointer",
            ].join(" ")}
            style={{
              background: colors.primary.gradient,
              color: colors.neutral[50],
            }}
            aria-label="Open menu"
          >
            <Menu
              size={20}
              className="transition-transform duration-200 group-hover:rotate-3"
            />
          </button>

          {/* Mobile brand */}
          <div className="lg:hidden flex min-w-0 items-center gap-2">
            <div className="min-w-0">
              <h1
                className="text-lg font-semibold tracking-tight"
                style={{ color: colors.primary.DEFAULT }}
              >
                <span style={{ color: "#0f64c8" }}>Help</span>
                <span style={{ color: "#1fa34a" }}>Go</span>
              </h1>
              <p
                className="text-xs"
                style={{ color: colors.secondary.DEFAULT }}
              >
                Service Partner Dashboard
              </p>
            </div>
          </div>

          {/* Desktop page title */}
          <div className="hidden lg:flex min-w-0 items-center gap-3">
            <div className="relative">
              <div
                className="absolute -inset-2 rounded-2xl opacity-20 blur-md"
                style={{ background: colors.primary.gradient }}
              />
              <div
                className={[
                  "relative grid h-11 w-11 place-items-center rounded-2xl",
                  "shadow-sm ring-1 ring-white/10",
                  "transition-transform duration-200 ease-out",
                  "hover:scale-[1.03]",
                ].join(" ")}
                style={{ background: colors.primary.gradient }}
              >
                <PageIcon size={20} style={{ color: colors.neutral[50] }} />
              </div>
            </div>

            <div className="min-w-0">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: colors.text.secondary }}
              >
                Service Partner
              </p>
              <h2
                className="truncate text-xl font-extrabold tracking-tight"
                style={{
                  background: colors.primary.gradient,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                {pageInfo.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Availability pill */}
          <div
            className={[
              "group relative flex items-center gap-2",
              "rounded-2xl border",
              "px-2.5 py-2 sm:px-3",
              "shadow-sm",
              "transition-all duration-200 ease-out",
              "hover:shadow-md",
            ].join(" ")}
            style={{
              background: colors.background.secondary,
              borderColor: colors.border.DEFAULT,
            }}
          >
            <div className="relative flex items-center gap-2">
              <span className="relative inline-flex h-2.5 w-2.5">
                <span
                  className={[
                    "absolute inline-flex h-full w-full rounded-full",
                    "animate-ping",
                  ].join(" ")}
                  style={{
                    backgroundColor: isAvailable
                      ? `${colors.success.DEFAULT}55`
                      : `${colors.error.DEFAULT}55`,
                  }}
                />
                <span
                  className="relative inline-flex h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: isAvailable
                      ? colors.success.DEFAULT
                      : colors.error.DEFAULT,
                  }}
                />
              </span>

              <Power
                size={18}
                className="transition-transform duration-200 group-hover:scale-110"
                style={{
                  color: isAvailable
                    ? colors.success.DEFAULT
                    : colors.error.DEFAULT,
                }}
              />

              <span
                className="hidden sm:inline text-sm font-semibold"
                style={{ color: colors.text.primary }}
              >
                {availabilityLabel}
              </span>
            </div>

            {/* Switch */}
            <button
              onClick={handleToggleClick}
              disabled={loading}
              type="button"
              className={[
                "relative inline-flex h-6 w-11 items-center rounded-full",
                "transition-all duration-200 ease-out",
                "ring-1 ring-black/5",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                loading ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                !loading ? "hover:brightness-[1.02] active:scale-[0.98]" : "",
              ].join(" ")}
              style={{
                background: isAvailable
                  ? colors.success.DEFAULT
                  : colors.neutral[200],
              }}
              aria-label="Toggle availability"
            >
              <span
                className={[
                  "inline-block h-4.5 w-4.5 rounded-full bg-white",
                  "shadow-[0_6px_14px_-10px_rgba(0,0,0,0.6)]",
                  "transition-all duration-200 ease-out",
                  isAvailable ? "translate-x-6" : "translate-x-1",
                ].join(" ")}
              />
              {/* sheen */}
              <span className="pointer-events-none absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </button>

            {/* Loading shimmer */}
            {loading && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -left-1/2 top-0 h-full w-1/2 animate-[shimmer_1.1s_ease-in-out_infinite] bg-white/10 blur-sm" />
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogoutClick}
            type="button"
            className={[
              "group inline-flex items-center gap-2",
              "rounded-2xl",
              "px-3 py-2 sm:px-4",
              "shadow-sm",
              "ring-1 ring-black/5",
              "transition-all duration-200 ease-out",
              "hover:shadow-md hover:scale-[1.02]",
              "active:scale-95",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "cursor-pointer",
            ].join(" ")}
            style={{
              background: colors.error.DEFAULT,
              color: colors.neutral[50],
            }}
            aria-label="Logout"
          >
            <LogOut
              size={18}
              className="transition-transform duration-200 group-hover:rotate-6 group-hover:scale-105"
              style={{ color: colors.neutral[50] }}
            />
            <span
              className="hidden sm:block text-sm font-semibold tracking-tight"
              style={{ color: colors.neutral[50] }}
            >
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Logout Confirm Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        isDangerous={true}
        position="right"
      />

      {/* Availability Confirm Modal */}
      <ConfirmModal
        isOpen={showAvailabilityConfirm}
        title="Confirm Availability Change"
        message={`Are you sure you want to change your availability status to ${
          pendingAvailability ? "Available" : "Unavailable"
        }?`}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={confirmAvailabilityToggle}
        onCancel={() => {
          setShowAvailabilityConfirm(false);
          setPendingAvailability(null);
        }}
        isDangerous={!pendingAvailability}
        position="right"
      />

      {/* keyframes for shimmer (Tailwind arbitrary animation) */}
      <style>
        {`
          @keyframes shimmer {
            0% { transform: translateX(-40%); opacity: 0; }
            30% { opacity: 1; }
            100% { transform: translateX(240%); opacity: 0; }
          }
        `}
      </style>
    </header>
  );
};
