import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  CreditCard,
  Bell,
  UserCog,
  X,
} from "lucide-react";
import { colors } from "../../../styles/colors";

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { path: "/worker/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/worker/bookings", icon: Calendar, label: "Bookings" },
    { path: "/worker/payments", icon: CreditCard, label: "Payments" },
    { path: "/worker/services", icon: Briefcase, label: "Services" },
    { path: "/worker/notifications", icon: Bell, label: "Notifications" },
    { path: "/worker/account", icon: UserCog, label: "Account" },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={[
          "fixed inset-0 z-40 lg:hidden",
          "backdrop-blur-sm",
          "transition-all duration-300 ease-out",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
        style={{ background: colors.background.primary + "80" }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={[
          "fixed top-0 left-0 z-50 h-dvh w-[86%] max-w-[18rem] lg:w-64",
          "border-r",
          "shadow-[0_20px_60px_-20px_rgba(0,0,0,0.7)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.2,0.9,0.2,1)]",
          "will-change-transform",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
        style={{
          color: colors.neutral[50],
          background: colors.background.primary,
          borderColor: colors.neutral[100],
        }}
        aria-hidden={!isOpen ? "true" : "false"}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between px-5 py-5 lg:px-6 lg:py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div />
            </div>

            <div className="leading-tight">
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

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            type="button"
            className={[
              "lg:hidden",
              "inline-flex items-center justify-center",
              "h-10 w-10 rounded-xl",
              "bg-white/5 ring-1 ring-white/10",
              "shadow-sm",
              "transition-all duration-200 ease-out",
              "hover:bg-white/10 hover:ring-white/20",
              "active:scale-95",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70",
              "cursor-pointer",
            ].join(" ")}
            aria-label="Close sidebar"
          >
            <X size={20} style={{ color: colors.neutral[200] }} />
          </button>
        </div>

        {/* Divider */}
        <div
          className="mx-5 lg:mx-6 h-px"
          style={{ background: colors.primary.light, opacity: 0.12 }}
        />

        {/* Navigation */}
        <nav className="px-3 py-4 lg:px-4 lg:py-5">
          <div className="mb-3 px-3 lg:px-2">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: colors.secondary.DEFAULT, opacity: 0.7 }}
            >
              Navigation
            </p>
          </div>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      "group relative flex items-center gap-3",
                      "px-3 py-3 lg:px-3.5",
                      "rounded-2xl",
                      "transition-all duration-200 ease-out",
                      "cursor-pointer select-none",
                      "outline-none",
                      "focus-visible:ring-2 focus-visible:ring-indigo-400/70",
                      isActive
                        ? [
                            "bg-white/10 ring-1 ring-white/15",
                            "shadow-[0_16px_30px_-18px_rgba(0,0,0,0.7)]",
                          ].join(" ")
                        : "hover:bg-white/7 hover:ring-1 hover:ring-white/10",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active accent bar */}
                      <span
                        className={[
                          "absolute left-1 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full",
                          "transition-all duration-200 ease-out",
                          isActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-60",
                        ].join(" ")}
                        style={
                          isActive
                            ? { background: colors.primary.gradient }
                            : { background: colors.primary.light, opacity: 0.3 }
                        }
                        aria-hidden="true"
                      />

                      {/* Hover/active glow */}
                      <span
                        className={[
                          "pointer-events-none absolute inset-0 rounded-2xl",
                          "transition-opacity duration-200",
                          isActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100",
                        ].join(" ")}
                        aria-hidden="true"
                      >
                        <span
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: colors.primary.gradient,
                            opacity: 0.1,
                          }}
                        />
                      </span>

                      {/* Icon */}
                      <div
                        className={[
                          "relative grid h-10 w-10 place-items-center rounded-2xl",
                          "ring-1 transition-all duration-200",
                          isActive
                            ? "bg-white/10 ring-white/15"
                            : "bg-white/5 ring-white/10 group-hover:bg-white/10 group-hover:ring-white/15",
                          "shadow-sm",
                          "transform-gpu",
                          isActive
                            ? "scale-[1.02]"
                            : "group-hover:scale-[1.03]",
                        ].join(" ")}
                      >
                        <Icon
                          size={20}
                          style={{
                            color: isActive
                              ? colors.primary.DEFAULT
                              : colors.secondary.DEFAULT,
                            transition: "color 0.2s",
                          }}
                        />
                      </div>

                      {/* Label */}
                      <div className="relative flex min-w-0 flex-1 items-center justify-between">
                        <span
                          className={[
                            "truncate text-sm font-medium",
                            "transition-colors duration-200",
                          ].join(" ")}
                          style={{
                            color: isActive
                              ? colors.primary.DEFAULT
                              : colors.secondary.DEFAULT,
                          }}
                        >
                          {item.label}
                        </span>

                        {/* Subtle chevron-like indicator using a dot */}
                        <span
                          className={[
                            "ml-3 inline-block h-1.5 w-1.5 rounded-full",
                            "transition-all duration-200",
                          ].join(" ")}
                          style={
                            isActive
                              ? {
                                  background: colors.primary.gradient,
                                  opacity: 1,
                                }
                              : {
                                  background: colors.primary.light,
                                  opacity: 0.6,
                                }
                          }
                          aria-hidden="true"
                        />
                      </div>

                      {/* Active micro-animation */}
                      <span
                        className={[
                          "pointer-events-none absolute inset-0 rounded-2xl",
                          "transform-gpu transition-transform duration-200 ease-out",
                          isActive
                            ? "scale-[1.01]"
                            : "scale-100 group-hover:scale-[1.01]",
                        ].join(" ")}
                        aria-hidden="true"
                      />
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-sm overflow-hidden">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <p
                  className="text-xs font-medium"
                  style={{ color: colors.primary.DEFAULT }}
                >
                  © 2026{" "}
                  <span>
                    <span style={{ color: "#0f64c8" }}>Help</span>
                    <span style={{ color: "#1fa34a" }}>Go</span>
                  </span>
                </p>
                <span className="inline-flex items-center gap-2">
                  <span className="relative inline-flex h-2.5 w-2.5">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full"
                      style={{ background: colors.success.bg }}
                    />
                    <span
                      className="relative inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ background: colors.success.DEFAULT }}
                    />
                  </span>
                  <span
                    className="text-[11px]"
                    style={{ color: colors.secondary.DEFAULT }}
                  >
                    Online
                  </span>
                </span>
              </div>
              <p
                className="mt-1 text-[11px] leading-relaxed"
                style={{ color: colors.secondary.DEFAULT, opacity: 0.7 }}
              >
                Clean, responsive navigation with smooth interactions.
              </p>
            </div>
            <div
              className="h-px"
              style={{ background: colors.primary.light, opacity: 0.12 }}
            />
            <div className="px-4 py-3">
              <div
                className="flex items-center justify-between text-[11px]"
                style={{ color: colors.secondary.DEFAULT, opacity: 0.7 }}
              >
                <span className="tracking-wide">v1.0</span>
                <span className="tracking-wide">Secure Workspace</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
