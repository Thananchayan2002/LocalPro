import React, { useState, useEffect, useMemo } from "react";
import { colors } from "../../../styles/colors";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAllProfessionals,
  getProfessionalImageUrl,
} from "../../api/professional/professional";
import { getAllServices } from "../../api/service/service";
import { getReviewsByProfessionalPhone } from "../../api/review/review";
import AppLoader from "../common/AppLoader";
import { ProfessionalModal } from "./ProfessionalModal";

const {
  Search,
  Star,
  MapPin,
  Briefcase,
  Shield,
  Award: AwardIcon,
  ThumbsUp,
  ChevronRight,
  X,
  MessageSquare,
  Loader,
  Users,
  ChevronDown,
} = LucideIcons;

export const Professionals = () => {
  const [selectedService, setSelectedService] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [showReviews, setShowReviews] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [expandedMobileFilter, setExpandedMobileFilter] = useState(null);

  const sriLankaDistricts = [
    "Colombo",
    "Gampaha",
    "Kalutara",
    "Kandy",
    "Matale",
    "Nuwara Eliya",
    "Galle",
    "Matara",
    "Hambantota",
    "Jaffna",
    "Kilinochchi",
    "Mannar",
    "Vavuniya",
    "Mullaitivu",
    "Batticaloa",
    "Ampara",
    "Trincomalee",
    "Kurunegala",
    "Puttalam",
    "Anuradhapura",
    "Polonnaruwa",
    "Badulla",
    "Moneragala",
    "Ratnapura",
    "Kegalle",
  ];

  // Map icon names to Lucide icon components dynamically
  const getIconComponent = (iconName) => {
    if (!iconName) return Briefcase;
    const IconComponent = LucideIcons[iconName];
    return IconComponent || Briefcase;
  };

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const data = await getAllProfessionals({
        status: "accepted",
        limit: 1000,
      });
      setProfessionals(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      setError(
        error.message || "Failed to load professionals. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await getAllServices();
      setServices(data);
      console.log("Services fetched:", data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  useEffect(() => {
    fetchProfessionals();
    fetchServices();
  }, []);

  const fetchReviews = async (professionalPhone) => {
    try {
      setLoadingReviews(true);
      setReviews([]);

      // Fetch reviews directly by professional phone number
      const reviewsData = await getReviewsByProfessionalPhone(professionalPhone);
      setReviews(reviewsData || []);
      console.log("Reviews fetched:", reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Generate service categories dynamically from services state
  const serviceCategories = useMemo(() => {
    return [
      {
        id: "all",
        name: "All Professionals",
        icon: Briefcase,
        count: professionals.length,
      },
      ...services.map((service) => ({
        id: service._id,
        name: service.service,
        icon: getIconComponent(service.iconName),
        count: professionals.filter((p) => p.serviceId?._id === service._id)
          .length,
      })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, professionals]);

  const filteredProfessionals = useMemo(() => {
    return professionals.filter((professional) => {
      const matchesService =
        selectedService === "all" ||
        professional.serviceId?._id === selectedService;
      const matchesDistrict =
        selectedDistrict === "all" ||
        professional.district === selectedDistrict;
      const matchesSearch =
        professional.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (professional.serviceId?.service || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (professional.location || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesService && matchesDistrict && matchesSearch;
    });
  }, [professionals, selectedService, selectedDistrict, searchQuery]);

  const openProfessionalModal = (professional) => {
    setSelectedProfessional(professional);
    setShowReviews(false);
    setReviews([]);
    // Fetch reviews using professional's phone number
    if (professional.phone) {
      fetchReviews(professional.phone);
    }
  };

  const closeModal = () => {
    setSelectedProfessional(null);
    setShowReviews(false);
    setReviews([]);
  };

  const activeServiceName =
    selectedService === "all"
      ? "All Professionals"
      : serviceCategories.find((s) => s.id === selectedService)?.name || "";
  const showAppLoader = loading && professionals.length === 0;

  return (
    <div
      className="min-h-[100svh] pt-0 sm:pt-0"
      style={{ backgroundColor: colors.background.secondary }}
    >
      {showAppLoader && (
        <AppLoader
          title="Loading professionals"
          subtitle="Finding trusted experts near you"
        />
      )}
      {/* Hero */}
      <section className="relative flex items-center justify-center overflow-hidden">
        {/* Background (match the first section style/structure) */}
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
          {/* Center vertically + horizontally */}
          <div className="max-w-3xl mx-auto text-center">
            {/* Badge */}
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
                Verified & background checked
              </div>
            </div>

            {/* Title */}
            <h1
              className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: colors.text.inverse }}
            >
              Find Verified Professionals
            </h1>

            {/* Subtitle */}
            <p
              className="mt-3 max-w-2xl mx-auto text-base leading-relaxed sm:text-lg"
              style={{ color: colors.text.inverse, opacity: 0.75 }}
            >
              Connect with trusted professionals in your area. All verified and
              background checked.
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
                  placeholder="Search by name, service, or location..."
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

              {/* Quick pills (match first section style) */}
              <div
                className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs"
                style={{ color: "white", opacity: 0.6 }}
              >
                <span
                  className="rounded-full border px-3 py-1 inline-flex items-center gap-2"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.10)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <Users className="h-4 w-4" />
                  {professionals.length} professionals
                </span>

                <span
                  className="rounded-full border px-3 py-1 inline-flex items-center gap-2"
                  style={{
                    borderColor: "rgba(255, 255, 255, 0.10)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <Star className="h-4 w-4" />
                  {professionals.length > 0
                    ? (
                        professionals.reduce(
                          (sum, p) => sum + (p.rating || 0),
                          0,
                        ) / professionals.length
                      ).toFixed(1)
                    : "0.0"}{" "}
                  avg rating
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Filters (desktop sidebar / mobile dropdowns) */}
          <aside className="lg:col-span-4 xl:col-span-3">
            {/* DESKTOP SIDEBAR */}
            <div className="hidden lg:block lg:sticky lg:top-24 space-y-4">
              {/* Service */}
              <div
                className="rounded-2xl shadow-sm border overflow-hidden"
                style={{
                  background: colors.background.primary,
                  borderColor: colors.border?.light || "rgba(0,0,0,0.08)",
                }}
              >
                <div className="px-4 py-4 sm:px-5 sm:py-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Briefcase
                      className="h-5 w-5"
                      style={{ color: colors.primary.DEFAULT }}
                    />
                    <h2
                      className="text-base font-bold"
                      style={{ color: colors.text.primary }}
                    >
                      Service Category
                    </h2>
                  </div>
                  <span
                    className="text-xs font-semibold rounded-full px-2.5 py-1"
                    style={{
                      background: colors.neutral[100],
                      color: colors.text.primary,
                    }}
                  >
                    {filteredProfessionals.length} results
                  </span>
                </div>

                <div className="px-3 pb-4 sm:px-4 sm:pb-5">
                  <div className="space-y-2">
                    {serviceCategories.map((category) => {
                      const IconComponent = category.icon;
                      const isActive = selectedService === category.id;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedService(category.id)}
                          className={[
                            "w-full cursor-pointer select-none",
                            "flex items-center gap-3",
                            "rounded-xl px-3 py-3",
                            "transition-all duration-200",
                            "active:scale-[0.99]",
                            "hover:shadow-sm",
                            "border",
                          ].join(" ")}
                          style={{
                            background: isActive
                              ? colors.primary.light
                              : colors.background.primary,
                            color: isActive
                              ? colors.primary.DEFAULT
                              : colors.text.primary,
                            borderColor: isActive
                              ? "transparent"
                              : colors.border?.light || "rgba(0,0,0,0.06)",
                          }}
                        >
                          <span className="h-9 w-9 rounded-xl flex items-center justify-center bg-black/5">
                            <IconComponent className="h-4 w-4" />
                          </span>
                          <span className="font-semibold text-sm flex-1 text-left">
                            {category.name}
                          </span>
                          <span
                            className="px-2 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background: colors.neutral[100],
                              color: colors.text.primary,
                            }}
                          >
                            {category.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* District */}
              <div
                className="rounded-2xl shadow-sm border overflow-hidden"
                style={{
                  background: colors.background.primary,
                  borderColor: colors.border?.light || "rgba(0,0,0,0.08)",
                }}
              >
                <div className="px-4 py-4 sm:px-5 sm:py-5 flex items-center gap-2">
                  <MapPin
                    className="h-5 w-5"
                    style={{ color: colors.success.DEFAULT }}
                  />
                  <h2
                    className="text-base font-bold"
                    style={{ color: colors.text.primary }}
                  >
                    District
                  </h2>
                </div>

                <div className="px-3 pb-4 sm:px-4 sm:pb-5">
                  <div className="max-h-64 sm:max-h-80 overflow-y-auto pr-1 space-y-2">
                    <button
                      onClick={() => setSelectedDistrict("all")}
                      className={[
                        "w-full cursor-pointer select-none",
                        "rounded-xl px-3 py-3 text-left",
                        "transition-all duration-200",
                        "active:scale-[0.99]",
                        "hover:shadow-sm border",
                        "font-semibold text-sm",
                      ].join(" ")}
                      style={{
                        background:
                          selectedDistrict === "all"
                            ? colors.primary.light
                            : colors.background.primary,
                        color:
                          selectedDistrict === "all"
                            ? colors.primary.DEFAULT
                            : colors.text.primary,
                        borderColor:
                          selectedDistrict === "all"
                            ? "transparent"
                            : colors.border?.light || "rgba(0,0,0,0.06)",
                      }}
                    >
                      All Districts
                    </button>

                    {sriLankaDistricts.map((district) => {
                      const isActive = selectedDistrict === district;
                      return (
                        <button
                          key={district}
                          onClick={() => setSelectedDistrict(district)}
                          className={[
                            "w-full cursor-pointer select-none",
                            "rounded-xl px-3 py-3 text-left",
                            "transition-all duration-200",
                            "active:scale-[0.99]",
                            "hover:shadow-sm border",
                            "font-medium text-sm",
                          ].join(" ")}
                          style={{
                            background: isActive
                              ? colors.primary.light
                              : colors.background.primary,
                            color: isActive
                              ? colors.primary.DEFAULT
                              : colors.text.primary,
                            borderColor: isActive
                              ? "transparent"
                              : colors.border?.light || "rgba(0,0,0,0.06)",
                          }}
                        >
                          {district}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div
                className="rounded-2xl shadow-sm border p-5"
                style={{
                  background: colors.background.primary,
                  borderColor: colors.border?.light || "rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex items-center justify-between">
                  <h3
                    className="text-base font-bold"
                    style={{ color: colors.text.primary }}
                  >
                    Quick Stats
                  </h3>
                  <span className="text-xs font-semibold text-gray-500">
                    Live
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      Total Professionals
                    </span>
                    <span
                      className="text-sm font-extrabold"
                      style={{ color: colors.text.primary }}
                    >
                      {professionals.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Verified
                    </span>
                    <span
                      className="text-sm font-extrabold"
                      style={{ color: colors.success.DEFAULT }}
                    >
                      {professionals.length > 0
                        ? Math.round(
                            (professionals.filter(
                              (p) => p.status === "accepted",
                            ).length /
                              professionals.length) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      Avg. Rating
                    </span>
                    <span
                      className="text-sm font-extrabold"
                      style={{ color: colors.warning.DEFAULT }}
                    >
                      {professionals.length > 0
                        ? (
                            professionals.reduce(
                              (sum, p) => sum + (p.rating || 0),
                              0,
                            ) / professionals.length
                          ).toFixed(1)
                        : "0"}{" "}
                      ★
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      Jobs Completed
                    </span>
                    <span
                      className="text-sm font-extrabold"
                      style={{ color: colors.text.primary }}
                    >
                      {professionals
                        .reduce((sum, p) => sum + (p.totalJobs || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSelectedService("all");
                  setSelectedDistrict("all");
                  setSearchQuery("");
                }}
                className="w-full cursor-pointer rounded-2xl px-4 py-3 font-semibold shadow-sm border transition-all duration-200 hover:shadow active:scale-[0.99]"
                style={{
                  background: colors.neutral[100],
                  color: colors.text.primary,
                  borderColor: colors.border?.light || "rgba(0,0,0,0.08)",
                }}
              >
                Reset Filters
              </button>
            </div>

            {/* MOBILE DROPDOWNS */}
            <div className="lg:hidden space-y-3">
              {/* Service Category Dropdown */}
              <div
                className="rounded-2xl shadow-sm border overflow-hidden"
                style={{
                  background: colors.background.primary,
                  borderColor: colors.border?.light || "rgba(0,0,0,0.08)",
                }}
              >
                <button
                  onClick={() =>
                    setExpandedMobileFilter(
                      expandedMobileFilter === "service" ? null : "service",
                    )
                  }
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase
                      className="h-5 w-5"
                      style={{ color: colors.primary.DEFAULT }}
                    />
                    <div className="text-left">
                      <h2
                        className="text-sm font-bold"
                        style={{ color: colors.text.primary }}
                      >
                        Service Category
                      </h2>
                      <p className="text-xs mt-0.5" style={{ color: colors.text.secondary }}>
                        {
                          serviceCategories.find(
                            (s) => s.id === selectedService,
                          )?.name
                        }
                      </p>
                    </div>
                  </div>
                  <motion.span
                    animate={{
                      rotate: expandedMobileFilter === "service" ? 180 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown
                      className="h-5 w-5"
                      style={{ color: colors.text.secondary }}
                    />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {expandedMobileFilter === "service" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t"
                      style={{
                        borderColor: colors.border?.light || "rgba(0,0,0,0.06)",
                      }}
                    >
                      <div className="px-3 py-3 max-h-64 overflow-y-auto space-y-2">
                        {serviceCategories.map((category) => {
                          const IconComponent = category.icon;
                          const isActive = selectedService === category.id;
                          return (
                            <button
                              key={category.id}
                              onClick={() => {
                                setSelectedService(category.id);
                                setExpandedMobileFilter(null);
                              }}
                              className={[
                                "w-full cursor-pointer select-none",
                                "flex items-center gap-3",
                                "rounded-xl px-3 py-3",
                                "transition-all duration-200",
                                "active:scale-[0.99]",
                                "hover:shadow-sm",
                                "border",
                              ].join(" ")}
                              style={{
                                background: isActive
                                  ? colors.primary.light
                                  : colors.background.primary,
                                color: isActive
                                  ? colors.primary.DEFAULT
                                  : colors.text.primary,
                                borderColor: isActive
                                  ? "transparent"
                                  : colors.border?.light || "rgba(0,0,0,0.06)",
                              }}
                            >
                              <span className="h-8 w-8 rounded-lg flex items-center justify-center bg-black/5">
                                <IconComponent className="h-4 w-4" />
                              </span>
                              <span className="font-semibold text-sm flex-1 text-left">
                                {category.name}
                              </span>
                              <span
                                className="px-2 py-1 rounded-full text-xs font-semibold"
                                style={{
                                  background: colors.neutral[100],
                                  color: colors.text.primary,
                                }}
                              >
                                {category.count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* District Dropdown */}
              <div
                className="rounded-2xl shadow-sm border overflow-hidden"
                style={{
                  background: colors.background.primary,
                  borderColor: colors.border?.light || "rgba(0,0,0,0.08)",
                }}
              >
                <button
                  onClick={() =>
                    setExpandedMobileFilter(
                      expandedMobileFilter === "district" ? null : "district",
                    )
                  }
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin
                      className="h-5 w-5"
                      style={{ color: colors.success.DEFAULT }}
                    />
                    <div className="text-left">
                      <h2
                        className="text-sm font-bold"
                        style={{ color: colors.text.primary }}
                      >
                        District
                      </h2>
                      <p className="text-xs mt-0.5" style={{ color: colors.text.secondary }}>
                        {selectedDistrict === "all"
                          ? "All Districts"
                          : selectedDistrict}
                      </p>
                    </div>
                  </div>
                  <motion.span
                    animate={{
                      rotate: expandedMobileFilter === "district" ? 180 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown
                      className="h-5 w-5"
                      style={{ color: colors.text.secondary }}
                    />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {expandedMobileFilter === "district" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t"
                      style={{
                        borderColor: colors.border?.light || "rgba(0,0,0,0.06)",
                      }}
                    >
                      <div className="px-3 py-3 max-h-64 overflow-y-auto space-y-2">
                        <button
                          onClick={() => {
                            setSelectedDistrict("all");
                            setExpandedMobileFilter(null);
                          }}
                          className={[
                            "w-full cursor-pointer select-none",
                            "rounded-xl px-3 py-3 text-left",
                            "transition-all duration-200",
                            "active:scale-[0.99]",
                            "hover:shadow-sm border",
                            "font-semibold text-sm",
                          ].join(" ")}
                          style={{
                            background:
                              selectedDistrict === "all"
                                ? colors.primary.light
                                : colors.background.primary,
                            color:
                              selectedDistrict === "all"
                                ? colors.primary.DEFAULT
                                : colors.text.primary,
                            borderColor:
                              selectedDistrict === "all"
                                ? "transparent"
                                : colors.border?.light || "rgba(0,0,0,0.06)",
                          }}
                        >
                          All Districts
                        </button>

                        {sriLankaDistricts.map((district) => {
                          const isActive = selectedDistrict === district;
                          return (
                            <button
                              key={district}
                              onClick={() => {
                                setSelectedDistrict(district);
                                setExpandedMobileFilter(null);
                              }}
                              className={[
                                "w-full cursor-pointer select-none",
                                "rounded-xl px-3 py-3 text-left",
                                "transition-all duration-200",
                                "active:scale-[0.99]",
                                "hover:shadow-sm border",
                                "font-medium text-sm",
                              ].join(" ")}
                              style={{
                                background: isActive
                                  ? colors.primary.light
                                  : colors.background.primary,
                                color: isActive
                                  ? colors.primary.DEFAULT
                                  : colors.text.primary,
                                borderColor: isActive
                                  ? "transparent"
                                  : colors.border?.light || "rgba(0,0,0,0.06)",
                              }}
                            >
                              {district}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Reset Button */}
              <button
                onClick={() => {
                  setSelectedService("all");
                  setSelectedDistrict("all");
                  setSearchQuery("");
                  setExpandedMobileFilter(null);
                }}
                className="w-full cursor-pointer rounded-2xl px-4 py-3 font-semibold shadow-sm border transition-all duration-200 hover:shadow active:scale-[0.99]"
                style={{
                  background: colors.neutral[100],
                  color: colors.text.primary,
                  borderColor: colors.border?.light || "rgba(0,0,0,0.08)",
                }}
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Results */}
          <main className="lg:col-span-8 xl:col-span-9 w-full min-w-0">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
              <div className="transform-gpu transition-all duration-500 ease-out animate-[fadeInUp_700ms_ease-out_both]">

                <h2
                  className="text-xl sm:text-xl lg:text-2xl font-bold tracking-tight bg-clip-text text-transparent"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${colors.primary.DEFAULT}, ${colors.secondary.DEFAULT})`,
                  }}
                >
                  Verified Professionals
                </h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="mt-1 text-base sm:text-base font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  <span
                    className="font-bold"
                    style={{ color: colors.primary.DEFAULT }}
                  >
                    {filteredProfessionals.length}
                  </span>{" "}
                  professional{filteredProfessionals.length !== 1 ? "s" : ""}{" "}
                  found
                  {selectedService !== "all" ? (
                    <span style={{ color: colors.text.primary }}>
                      {" "}
                      in{" "}
                      <span style={{ color: colors.secondary.DEFAULT }}>
                        {activeServiceName}
                      </span>
                    </span>
                  ) : (
                    ""
                  )}
                  {selectedDistrict !== "all" ? (
                    <span style={{ color: colors.text.primary }}>
                      {" "}
                      from{" "}
                      <span style={{ color: colors.success.DEFAULT }}>
                        {selectedDistrict}
                      </span>
                    </span>
                  ) : (
                    ""
                  )}
                </motion.p>
              </div>

              <button
                onClick={() => {
                  setSelectedService("all");
                  setSelectedDistrict("all");
                  setSearchQuery("");
                }}
                className="hidden sm:inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2 font-semibold shadow-sm border transition-all duration-200 hover:shadow active:scale-[0.99]
       transform-gpu hover:-translate-y-[1px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/30
       motion-safe:animate-[fadeInUp_800ms_ease-out_both] motion-safe:hover:animate-[softWiggle_550ms_ease-out_both]"
                style={{
                  background: colors.neutral[100],
                  color: colors.text.primary,
                  borderColor: colors.border?.light || "rgba(0,0,0,0.08)",
                }}
              >
                Reset Filters
              </button>
            </div>

            {/* Content states */}
            <div className="mt-6">
              {loading ? null : error ? (
                <div className="rounded-2xl border bg-red-50 dark:bg-red-900/20 p-6 sm:p-8 text-center animate-[fadeInUp_500ms_ease-out_both]">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shadow-sm">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="mt-4 text-lg sm:text-xl font-bold text-red-900 dark:text-red-200">
                    {error}
                  </h3>
                  <button
                    onClick={fetchProfessionals}
                    className="mt-5 cursor-pointer inline-flex items-center justify-center rounded-xl px-5 py-2.5 font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.99]
           transform-gpu hover:-translate-y-[1px] motion-safe:hover:animate-[softWiggle_550ms_ease-out_both]"
                    style={{ background: colors.danger?.DEFAULT || "#DC2626" }}
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredProfessionals.length === 0 ? (
                <div className="rounded-2xl border p-8 text-center bg-white/70 dark:bg-gray-800/70 backdrop-blur animate-[fadeInUp_500ms_ease-out_both]">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-black/5 flex items-center justify-center shadow-sm">
                    <Search className="h-7 w-7 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                    No professionals found
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Try adjusting your filters or search criteria.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 sm:gap-6">
                  {filteredProfessionals.map((professional, idx) => {
                    const imageSrc =
                      getProfessionalImageUrl(professional.profileImage) ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${professional.name}`;

                    return (
                      <div
                        key={professional._id}
                        className="group relative rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden
               transition-all duration-300 transform-gpu
               hover:shadow-md hover:-translate-y-1
               animate-[cardIn_650ms_ease-out_both]
               [animation-delay:calc(var(--i)*80ms)]
               focus-within:ring-2 focus-within:ring-blue-500/20"
                        style={{ "--i": idx }}
                      >
                        {/* Top accent */}
                        <div className="h-1" />

                        <div className="relative p-4 sm:p-5">
                          {/* Header */}
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0">
                              <div className="relative">
                                <img
                                  src={imageSrc}
                                  alt={professional.name}
                                  className="h-16 w-16 sm:h-18 sm:w-18 rounded-2xl object-cover 
                         transition-transform duration-300 transform-gpu
                         group-hover:scale-[1.03]"
                                />
                                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white dark:ring-white/5" />
                              </div>

                              {professional.isAvailable && (
                                <span
                                  className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800
                         animate-[pulseSoft_1800ms_ease-in-out_infinite]"
                                />
                              )}
                            </div>

                            {/* ✅ Make name always visible: prevent badge/status from shrinking it to 0 */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                {/* LEFT: Name + Verified + Service */}
                                <div className="min-w-0 flex-1">
                                  {/* Name + Verified (top row) */}
                                  <div className="flex items-start gap-2 min-w-0">
                                    <div className="min-w-0 flex-1">
                                      {(() => {
                                        const full = (professional?.name || "")
                                          .trim()
                                          .replace(/\s+/g, " ");
                                        const parts = full
                                          ? full.split(" ")
                                          : [];
                                        const first = parts[0] || "N/A";
                                        const rest =
                                          parts.length > 1
                                            ? parts.slice(1).join(" ")
                                            : "";

                                        return (
                                          <div className="min-w-0">
                                            <p className="truncate text-base sm:text-lg  text-gray-900 dark:text-white leading-tight">
                                              {first}
                                            </p>
                                            {rest ? (
                                              <p className="truncate text-sm sm:text-base  text-gray-700 dark:text-gray-300 leading-tight">
                                                {rest}
                                              </p>
                                            ) : null}
                                          </div>
                                        );
                                      })()}
                                    </div>

                                    {professional.status === "accepted" && (
                                      <span
                                        className="shrink-0 mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold
            bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200
            transition-transform duration-300 transform-gpu group-hover:scale-[1.02]
            motion-safe:animate-[chipPop_520ms_ease-out_both]"
                                      >
                                        <Shield className="h-3 w-3" />
                                        Verified
                                      </span>
                                    )}
                                  </div>

                                  {/* Service (second row) */}
                                  <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400 truncate">
                                    {professional.serviceId?.service ||
                                      "Professional"}
                                  </p>
                                </div>

                                  <span
                                    className="shrink-0 mt-0.5 hidden md:flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold
            bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200
            transition-transform duration-300 transform-gpu group-hover:scale-[1.02]
            motion-safe:animate-[chipPop_520ms_ease-out_both]"
                                  >
                                    Available
                                  </span>
                              </div>

                              {/* Rating + district */}
                              <div className="mt-2 flex flex-wrap items-center gap-3">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 transition-transform duration-300 transform-gpu group-hover:scale-110" />
                                  <span className="ml-1 text-sm font-bold text-gray-900 dark:text-white">
                                    {professional.rating || 4}
                                  </span>
                                  <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                                    ({professional.totalJobs || 0} jobs)
                                  </span>
                                </div>

                                <div className="flex items-center text-gray-600 dark:text-gray-400">
                                  <MapPin className="h-4 w-4" />
                                  <span className="ml-1 text-xs sm:text-sm font-medium">
                                    {professional.district}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="mt-4 rounded-2xl bg-gray-50 dark:bg-gray-700/70 p-3 transition-all duration-300 group-hover:shadow-sm group-hover:-translate-y-[1px] transform-gpu">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                              <span className="text-sm text-gray-700 dark:text-gray-200 leading-snug">
                                {professional.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex md:hidden">
                                <Briefcase className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {professional.experience} years experience
                                </span>
                              </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-4 flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 hidden md:flex">
                                <Briefcase className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {professional.experience} years experience
                                </span>
                              </div>

                              <div className="mt-1 flex items-center gap-2  hidden md:flex">
                                <AwardIcon className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                  {selectedService === "all"
                                    ? professional.serviceId?.service
                                    : professional.district}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                openProfessionalModal(professional)
                              }
                              className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm ring-1 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm focus:outline-none focus:ring-2 sm:w-auto"
                              style={{
                                background: colors.primary.gradient,
                                color: colors.text.inverse,
                                ringColor: colors.primary.dark,
                              }}
                            >
                              View
                              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Trust section */}
            <div
              className="mt-10 sm:mt-12 rounded-3xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 p-6 sm:p-8 shadow-sm
      animate-[fadeInUp_700ms_ease-out_both]"
            >
              <div className="mx-auto max-w-3xl text-center">
                <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                  Why Choose Our Professionals?
                </h3>
                <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  A clean, safe marketplace built for trust, quality, and
                  convenience.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="rounded-2xl bg-white/70 dark:bg-gray-900/30  p-5 shadow-sm transition-all duration-300 transform-gpu hover:-translate-y-1 hover:shadow-md cursor-pointer motion-safe:hover:animate-[softWiggle_550ms_ease-out_both]">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h4 className="mt-4 font-bold text-gray-900 dark:text-white">
                      Verified & Safe
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      All professionals are background checked.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/70 dark:bg-gray-900/30  p-5 shadow-sm transition-all duration-300 transform-gpu hover:-translate-y-1 hover:shadow-md cursor-pointer motion-safe:hover:animate-[softWiggle_550ms_ease-out_both]">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <AwardIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h4 className="mt-4 font-bold text-gray-900 dark:text-white">
                      Quality Guaranteed
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      We stand behind every job completed.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/70 dark:bg-gray-900/30  p-5 shadow-sm transition-all duration-300 transform-gpu hover:-translate-y-1 hover:shadow-md cursor-pointer motion-safe:hover:animate-[softWiggle_550ms_ease-out_both]">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <ThumbsUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h4 className="mt-4 font-bold text-gray-900 dark:text-white">
                      Customer Reviews
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      Real feedback from thousands of customers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Animation keyframes (Tailwind arbitrary) */}
            <style>{`
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translate3d(0, 10px, 0); }
      100% { opacity: 1; transform: translate3d(0, 0, 0); }
    }
    @keyframes fadeIn {
      0% { opacity: 0; transform: translate3d(0, 4px, 0); }
      100% { opacity: 1; transform: translate3d(0, 0, 0); }
    }
    @keyframes cardIn {
      0% { opacity: 0; transform: translate3d(0, 14px, 0) scale(0.98); }
      100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
    }
    @keyframes pulseSoft {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.12); opacity: 0.85; }
    }

    /* Added (no logic changes) */
    @keyframes softWiggle {
      0% { transform: translate3d(0,0,0) rotate(0deg); }
      40% { transform: translate3d(0,-1px,0) rotate(-0.15deg); }
      70% { transform: translate3d(0,0,0) rotate(0.15deg); }
      100% { transform: translate3d(0,0,0) rotate(0deg); }
    }
    @keyframes ctaPulse {
      0% { transform: translate3d(0,0,0) scale(1); filter: brightness(1); }
      45% { transform: translate3d(0,-1px,0) scale(1.02); filter: brightness(1.05); }
      100% { transform: translate3d(0,0,0) scale(1); filter: brightness(1); }
    }
    @keyframes chipPop {
      0% { transform: scale(0.96); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `}</style>
          </main>
        </div>
      </div>

      {/* Modal Component */}
      <ProfessionalModal
        selectedProfessional={selectedProfessional}
        isOpen={Boolean(selectedProfessional)}
        closeModal={closeModal}
        reviews={reviews}
        loadingReviews={loadingReviews}
        showReviews={showReviews}
        setShowReviews={setShowReviews}
      />
    </div>
  );
};

export default Professionals;
