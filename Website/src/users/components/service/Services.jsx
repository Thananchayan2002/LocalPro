import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import {
  getAllServices,
  getIssuesByServiceId,
} from "../../api/service/service";
import { colors } from "../../../styles/colors";
import AppLoader from "../common/AppLoader";
const {
  Search,
  Loader,
  AlertTriangle,
  DollarSign,
  Briefcase,
  ChevronRight,
  X,
} = LucideIcons;

export const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);

  // Get icon component dynamically
  const getIconComponent = (iconName) => {
    if (!iconName) return Briefcase;
    const IconComponent = LucideIcons[iconName];
    return IconComponent || Briefcase;
  };

  // Fetch services and issues
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await getAllServices();
      setServices(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching services:", error);
      setError(error.message || "Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchIssuesForService = async (serviceId) => {
    try {
      setLoadingIssues(true);
      const data = await getIssuesByServiceId(serviceId);
      setIssues(data);
    } catch (error) {
      console.error("Error fetching issues:", error);
      setIssues([]);
    } finally {
      setLoadingIssues(false);
    }
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setShowModal(true);
    fetchIssuesForService(service._id);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setIssues([]);
  };

  // Handle body scroll lock and hide header/navbar when modal is open
  useEffect(() => {
    const mobileNavbar = document.querySelector(
      "nav[aria-label='Mobile navigation']",
    );

    if (showModal) {
      // Lock body scroll
      document.body.style.overflow = "hidden";
      // Hide header and mobile navbar
      document.body.classList.add("modal-open");
      if (mobileNavbar) {
        mobileNavbar.style.display = "none";
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = "";
      // Show header and mobile navbar
      document.body.classList.remove("modal-open");
      if (mobileNavbar) {
        mobileNavbar.style.display = "";
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
      if (mobileNavbar) {
        mobileNavbar.style.display = "";
      }
    };
  }, [showModal]);

  const filteredServices = services.filter(
    (service) =>
      service.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredIssues = issues.filter((issue) =>
    issue.issueName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <AppLoader
        title="Loading services"
        subtitle="Fetching the latest list for you"
      />
    );
  }

  if (error) {
    return (
      <div
        className="min-h-[100svh] pt-16 sm:pt-20"
        style={{ backgroundColor: colors.background.secondary }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div
            className="w-full max-w-md rounded-2xl border p-6 shadow-lg sm:p-8"
            style={{
              backgroundColor: colors.background.primary,
              borderColor: colors.border.light,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1"
                style={{
                  backgroundColor: colors.error.bg,
                  ringColor: colors.error.light,
                }}
              >
                <AlertTriangle
                  className="h-6 w-6"
                  style={{ color: colors.error.DEFAULT }}
                />
              </div>
              <div className="min-w-0">
                <h2
                  className="text-lg font-semibold tracking-tight sm:text-xl"
                  style={{ color: colors.text.primary }}
                >
                  Error Loading Services
                </h2>
                <p
                  className="mt-1 text-sm leading-relaxed"
                  style={{ color: colors.text.secondary }}
                >
                  {error}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                onClick={fetchServices}
                className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm ring-1 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm focus:outline-none focus:ring-2 sm:w-auto"
                style={{
                  background: colors.primary.gradient,
                  color: colors.text.inverse,
                  ringColor: colors.primary.dark,
                }}
              >
                Try Again
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-lg transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.10)" }}
                >
                  <ChevronRight className="h-4 w-4" />
                </span>
              </button>
              <p
                className="text-center text-xs sm:text-left"
                style={{ color: colors.text.secondary }}
              >
                Check your connection and retry.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Shield = LucideIcons["Shield"];
  const Award = LucideIcons["Award"];
  const ThumbsUp = LucideIcons["ThumbsUp"];

  return (
    <div
      className="min-h-[100svh] pt-0 sm:pt-0"
      style={{ backgroundColor: colors.background.secondary }}
    >
      {/* HERO */}
      <section className="relative flex items-center justify-center overflow-hidden ">
        {/* Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg,  ${colors.primary.DEFAULT})`,
          }}
        />
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `radial-gradient(900px circle at 20% 20%, ${colors.primary.light}33, transparent 60%), radial-gradient(900px circle at 80% 30%, ${colors.secondary.light}2a, transparent 55%), radial-gradient(900px circle at 50% 110%, ${colors.primary.DEFAULT}20, transparent 60%)`,
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center">
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.15)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: colors.text.inverse,
                  opacity: 0.9,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: colors.success.DEFAULT }}
                />
                Verified Professionals • Transparent Pricing
              </div>
            </div>

            <h1
              className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: colors.text.inverse }}
            >
              Professional Services
            </h1>

            <p
              className="mt-3 max-w-2xl mx-auto text-base leading-relaxed sm:text-lg"
              style={{ color: colors.text.inverse, opacity: 0.75 }}
            >
              Browse{" "}
              <span
                className="font-semibold"
                style={{ color: colors.text.inverse }}
              >
                {services.length}
              </span>{" "}
              professional services with verified professionals.
            </p>

            {/* Search */}
            <div className="mt-6 max-w-2xl mx-auto">
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search
                    className="h-5 w-5 transition-colors"
                    style={{
                      color: "grey",
                      opacity: 0.55,
                    }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search services or descriptions..."
                  className="w-full rounded-2xl border px-4 py-4 pl-12 text-sm shadow-[0_18px_55px_rgba(0,0,0,0.30)] backdrop-blur transition-all duration-200 focus:outline-none focus:ring-2 sm:text-base"
                  style={{
                    borderColor: "white",
                    backgroundColor: "white",
                    color: "black",
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* subtle glow on focus */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-1 transition-opacity duration-200 group-focus-within:opacity-100"
                  style={{ borderColor: "black" }}
                />
              </div>

              <div
                className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs"
                style={{ color: "white", opacity: 0.6 }}
              >
                <span
                  className="rounded-full border px-3 py-1"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.10)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  Tip: try "plumbing", "repair", "clean"
                </span>
                <span
                  className="rounded-full border px-3 py-1"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.10)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  Results update instantly
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-7 sm:mb-9">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                className="text-xl font-semibold tracking-tight sm:text-2xl"
                style={{ color: colors.text.primary }}
              >
                Available Services
              </h2>
              <p
                className="mt-1 text-sm"
                style={{ color: colors.text.secondary }}
              >
                <span
                  className="font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {filteredServices.length}
                </span>{" "}
                service{filteredServices.length !== 1 ? "s" : ""} available
              </p>
            </div>

            <div
              className="inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium shadow-sm"
              style={{
                borderColor: colors.border.light,
                backgroundColor: colors.background.primary,
                color: colors.text.secondary,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: colors.primary.DEFAULT }}
              />
              Tap a service to view issues & pricing
            </div>
          </div>
        </div>

        {/* Empty */}
        {filteredServices.length === 0 ? (
          <div
            className="rounded-2xl border p-8 text-center shadow-[0_18px_55px_rgba(2,6,23,0.10)] sm:p-10"
            style={{
              borderColor: colors.border.light,
              backgroundColor: colors.background.primary,
            }}
          >
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1"
              style={{
                backgroundColor: colors.background.secondary,
                borderColor: colors.border.light,
              }}
            >
              <Search
                className="h-7 w-7"
                style={{ color: colors.text.tertiary }}
              />
            </div>
            <h3
              className="text-lg font-semibold"
              style={{ color: colors.text.primary }}
            >
              No services found
            </h3>
            <p
              className="mt-2 text-sm"
              style={{ color: colors.text.secondary }}
            >
              Try adjusting your search query.
            </p>
          </div>
        ) : (
          /* Grid */
          <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => {
              const IconComponent = getIconComponent(service.iconName);
              return (
                <div
                  key={service._id}
                  onClick={() => handleServiceClick(service)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border p-6 shadow-[0_18px_55px_rgba(2,6,23,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(2,6,23,0.12)] active:translate-y-0"
                  style={{
                    borderColor: colors.border.light,
                    backgroundColor: colors.background.primary,
                  }}
                >
                  {/* Hover wash */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div
                      className="absolute -top-24 -right-24 h-56 w-56 rounded-full blur-3xl"
                      style={{ backgroundColor: `${colors.primary.light}33` }}
                    />
                    <div
                      className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full blur-3xl"
                      style={{ backgroundColor: `${colors.secondary.light}33` }}
                    />
                  </div>

                  <div className="relative">
                    <div className="mb-4 flex items-start gap-4">
                      <div className="relative">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ring-1 transition-transform duration-200 group-hover:scale-[1.03]"
                          style={{
                            backgroundColor: colors.primary.dark,
                            borderColor: `${colors.primary.dark}1a`,
                          }}
                        >
                          <IconComponent
                            className="h-6 w-6"
                            style={{ color: colors.text.inverse }}
                          />
                        </div>
                        <div
                          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 ring-2 transition-opacity duration-200 group-hover:opacity-100"
                          style={{ borderColor: `${colors.primary.dark}26` }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3
                          className="text-base font-semibold tracking-tight transition-colors duration-200"
                          style={{ color: colors.text.primary }}
                        >
                          {service.service}
                        </h3>
                        <p
                          className="mt-1 line-clamp-2 text-sm leading-relaxed"
                          style={{ color: colors.text.secondary }}
                        >
                          {service.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className="mt-5 flex items-center justify-between border-t pt-4"
                      style={{ borderColor: colors.border.light }}
                    >
                      <span
                        className="text-xs font-medium"
                        style={{ color: colors.text.secondary }}
                      >
                        View issues & pricing
                      </span>

                      <span
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition-all duration-200 group-hover:shadow-sm"
                        style={{
                          backgroundColor: colors.background.secondary,
                          color: colors.text.primary,
                          borderColor: colors.border.light,
                        }}
                      >
                        Open
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TRUST */}
        <div className="mt-12 sm:mt-16">
          <div
            className="overflow-hidden rounded-3xl border shadow-[0_18px_55px_rgba(2,6,23,0.10)]"
            style={{
              borderColor: colors.border.light,
              backgroundColor: colors.background.primary,
            }}
          >
            <div className="relative p-8 sm:p-10">
              <div className="pointer-events-none absolute inset-0 opacity-60 " />
              <div className="relative mx-auto max-w-3xl text-center">
                <h3
                  className="text-xl font-semibold tracking-tight sm:text-2xl"
                  style={{ color: colors.text.primary }}
                >
                  Why Choose Our Services?
                </h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: colors.text.secondary }}
                >
                  Trusted experts, clear pricing, and quality you can rely on.
                </p>

                <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
                  <div
                    className="group rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      borderColor: colors.border.light,
                      backgroundColor: `${colors.background.primary}b3`,
                    }}
                  >
                    <div
                      className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ring-1 transition-transform duration-200 group-hover:scale-[1.03]"
                      style={{
                        backgroundColor: colors.primary.dark,
                        borderColor: `${colors.primary.dark}1a`,
                      }}
                    >
                      <Shield
                        className="h-5 w-5"
                        style={{ color: colors.text.inverse }}
                      />
                    </div>
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      Verified & Safe
                    </h4>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      All professionals are background checked.
                    </p>
                  </div>

                  <div
                    className="group rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      borderColor: colors.border.light,
                      backgroundColor: `${colors.background.primary}b3`,
                    }}
                  >
                    <div
                      className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ring-1 transition-transform duration-200 group-hover:scale-[1.03]"
                      style={{
                        backgroundColor: colors.primary.dark,
                        borderColor: `${colors.primary.dark}1a`,
                      }}
                    >
                      <Award
                        className="h-5 w-5"
                        style={{ color: colors.text.inverse }}
                      />
                    </div>
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      Quality Guaranteed
                    </h4>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      We stand behind every job completed.
                    </p>
                  </div>

                  <div
                    className="group rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    style={{
                      borderColor: colors.border.light,
                      backgroundColor: `${colors.background.primary}b3`,
                    }}
                  >
                    <div
                      className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ring-1 transition-transform duration-200 group-hover:scale-[1.03]"
                      style={{
                        backgroundColor: colors.primary.dark,
                        borderColor: `${colors.primary.dark}1a`,
                      }}
                    >
                      <ThumbsUp
                        className="h-5 w-5"
                        style={{ color: colors.text.inverse }}
                      />
                    </div>
                    <h4
                      className="text-sm font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      Transparent Pricing
                    </h4>
                    <p
                      className="mt-1 text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      Clear pricing with no hidden charges.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="border-t px-8 py-5 text-center text-xs sm:px-10"
              style={{
                borderColor: colors.border.light,
                backgroundColor: colors.background.secondary,
                color: colors.text.secondary,
              }}
            >
              Tip: open a service to see available issues and base pricing.
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedService && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center p-0 sm:p-4 overflow-hidden sm:overflow-visible">
          {/* Backdrop */}
          <div
            className="fixed inset-0 backdrop-blur-sm transition-opacity duration-200 hidden sm:block"
            style={{ backgroundColor: "rgba(2, 6, 23, 0.60)" }}
            onClick={handleCloseModal}
          />
          <div
            className="fixed inset-0 sm:hidden"
            style={{ backgroundColor: colors.background.primary }}
            onClick={handleCloseModal}
          />

          <div
            className="relative w-full h-full sm:h-auto sm:max-w-5xl overflow-hidden rounded-none sm:rounded-3xl border-0 sm:border shadow-none sm:shadow-[0_30px_120px_rgba(0,0,0,0.40)] ring-0 sm:ring-0 z-50"
            style={{
              backgroundColor: colors.background.primary,
              borderColor: `${colors.primary.dark}1a`,
            }}
          >
            {/* Modal Header */}
            <div className="relative overflow-hidden">
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom right, ${colors.primary.dark}, ${colors.primary.DEFAULT})`,
                }}
              />
              <div className="absolute inset-0 opacity-90 [background:radial-gradient(800px_circle_at_20%_20%,rgba(56,189,248,0.18),transparent_60%),radial-gradient(800px_circle_at_80%_25%,rgba(168,85,247,0.16),transparent_55%)]" />

              <div className="relative flex items-start justify-between gap-4 p-4 sm:p-6 md:p-7">
                <div className="flex min-w-0 items-start gap-4">
                  {(() => {
                    const IconComponent = getIconComponent(
                      selectedService.iconName,
                    );
                    return (
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl  shadow-sm"
                        style={{
                          backgroundColor: "rgba(255, 255, 255, 0.10)",
                          borderColor: "rgba(255, 255, 255, 0.15)",
                        }}
                      >
                        <IconComponent
                          className="h-6 w-6"
                          style={{ color: colors.text.inverse }}
                        />
                      </div>
                    );
                  })()}

                  <div className="min-w-0">
                    <h2
                      className="text-2xl font-semibold tracking-tight sm:text-3xl"
                      style={{ color: colors.text.inverse }}
                    >
                      {selectedService.service}
                    </h2>
                    <p
                      className="mt-1 line-clamp-2 text-sm sm:text-base"
                      style={{ color: colors.text.inverse, opacity: 0.7 }}
                    >
                      {selectedService.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="group inline-flex cursor-pointer items-center justify-center rounded-2xl p-2.5 ring-1 transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.10)",
                    color: colors.text.inverse,
                    borderColor: "rgba(255, 255, 255, 0.15)",
                  }}
                  aria-label="Close"
                >
                  <X className="h-5 w-5 transition-transform duration-200 group-hover:rotate-90" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="h-[calc(100vh-140px)] sm:max-h-[calc(90svh-140px)] overflow-y-auto p-4 sm:p-6 md:p-7">
              {loadingIssues ? (
                <div className="flex items-center justify-center py-16">
                  <div
                    className="flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-sm"
                    style={{
                      borderColor: colors.border.light,
                      backgroundColor: colors.background.secondary,
                    }}
                  >
                    <Loader
                      className="h-5 w-5 animate-spin"
                      style={{ color: colors.text.primary }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.text.primary }}
                    >
                      Loading issues...
                    </span>
                  </div>
                </div>
              ) : issues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div
                    className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ring-1"
                    style={{
                      backgroundColor: colors.warning.bg,
                      borderColor: colors.warning.light,
                    }}
                  >
                    <AlertTriangle
                      className="h-7 w-7"
                      style={{ color: colors.warning.DEFAULT }}
                    />
                  </div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: colors.text.primary }}
                  >
                    No Issues Available
                  </h3>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: colors.text.secondary }}
                  >
                    No issues found for this service.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3
                        className="text-base font-semibold"
                        style={{ color: colors.text.primary }}
                      >
                        {issues.length} issue{issues.length !== 1 ? "s" : ""}{" "}
                        available
                      </h3>
                      <p
                        className="mt-1 text-sm"
                        style={{ color: colors.text.secondary }}
                      >
                        Base price shown — final cost may vary.
                      </p>
                    </div>
                    <div
                      className="rounded-2xl border px-4 py-2 text-xs font-medium"
                      style={{
                        borderColor: colors.border.light,
                        backgroundColor: colors.background.secondary,
                        color: colors.text.secondary,
                      }}
                    >
                      Choose an issue to proceed
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {issues.map((issue) => (
                      <div
                        key={issue._id}
                        className="group relative overflow-hidden rounded-2xl border p-6 shadow-[0_18px_55px_rgba(2,6,23,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(2,6,23,0.12)]"
                        style={{
                          borderColor: colors.border.light,
                          backgroundColor: colors.background.primary,
                        }}
                      >
                        {/* Decorative glow */}
                        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <div
                            className="absolute -top-20 -right-20 h-44 w-44 rounded-full blur-3xl"
                            style={{
                              backgroundColor: `${colors.primary.light}33`,
                            }}
                          />
                          <div
                            className="absolute -bottom-20 -left-20 h-44 w-44 rounded-full blur-3xl"
                            style={{
                              backgroundColor: `${colors.secondary.light}33`,
                            }}
                          />
                        </div>

                        <div className="relative">
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <h3
                              className="text-base font-semibold tracking-tight"
                              style={{ color: colors.text.primary }}
                            >
                              {issue.issueName}
                            </h3>
                            <span
                              className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-semibold ring-1"
                              style={{
                                backgroundColor: colors.background.secondary,
                                color: colors.text.primary,
                                borderColor: colors.border.light,
                              }}
                            >
                              Base
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div
                              className="flex items-center gap-2"
                              style={{ color: colors.text.primary }}
                            >
                              <div>
                                <div className="text-2xl font-bold tracking-tight">
                                  LKR{" "}
                                  {issue.basicCost?.toLocaleString() || "N/A"}
                                </div>
                                <div
                                  className="text-xs"
                                  style={{ color: colors.text.tertiary }}
                                >
                                  Base price (may vary)
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              handleCloseModal();
                              navigate("/app", {
                                state: {
                                  bookService: {
                                    service: selectedService.service,
                                    issueName: issue.issueName,
                                  },
                                },
                              });
                            }}
                            className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-sm ring-1 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm focus:outline-none focus:ring-2"
                            style={{
                              backgroundColor: colors.primary.dark,
                              color: colors.text.inverse,
                              borderColor: `${colors.primary.dark}1a`,
                            }}
                          >
                            Book Service
                            <span
                              className="inline-flex h-6 w-6 items-center justify-center rounded-xl transition-transform duration-200 group-hover:translate-x-0.5"
                              style={{
                                backgroundColor: "rgba(255, 255, 255, 0.10)",
                              }}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div
              className="hidden sm:flex items-center justify-between gap-3 border-t px-4 py-4 text-xs sm:px-6 md:px-7"
              style={{
                borderColor: colors.border.light,
                backgroundColor: colors.background.secondary,
                color: colors.text.secondary,
              }}
            >
              <span>Click outside to close.</span>
              <button
                onClick={handleCloseModal}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl px-3 py-2 font-semibold shadow-sm ring-1 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0"
                style={{
                  backgroundColor: colors.background.primary,
                  color: colors.text.primary,
                  borderColor: colors.border.light,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
