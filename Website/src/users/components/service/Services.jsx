import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { motion } from "framer-motion";
import { useAnimations } from "../../../animations/animations";
import IssuesModal from "./IssuesModal";
import { colors } from "../../../styles/colors";

const { Search, Loader, AlertTriangle, Briefcase, ChevronRight } = LucideIcons;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
};

export const Services = () => {
  const navigate = useNavigate();
  const { fadeInUp, staggerContainer, staggerItem } = useAnimations();

  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const getIconComponent = (iconName) => {
    if (!iconName) return Briefcase;
    return LucideIcons[iconName] || Briefcase;
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/services`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      data.success ? setServices(data.data || []) : setError(data.message);
    } catch {
      setError("Failed to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchIssuesForService = async (serviceId) => {
    try {
      setLoadingIssues(true);
      const res = await fetch(
        `${API_BASE_URL}/api/issues?serviceId=${serviceId}&limit=1000`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      setIssues(data.success ? data.data || [] : []);
    } catch {
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

  const filteredServices = services.filter(
    (s) =>
      s.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* -------------------- STATES -------------------- */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader
          className="w-10 h-10 animate-spin"
          style={{ color: colors.primary.DEFAULT }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div
          className="w-full max-w-md rounded-xl shadow-lg p-6 text-center"
          style={{ backgroundColor: colors.background.primary }}
        >
          <AlertTriangle
            className="w-12 h-12 mx-auto mb-4"
            style={{ color: colors.error.DEFAULT }}
          />
          <p className="mb-4" style={{ color: colors.text.secondary }}>
            {error}
          </p>
          <button
            onClick={fetchServices}
            className="px-6 py-2 rounded-lg font-semibold"
            style={{
              backgroundColor: colors.primary.DEFAULT,
              color: colors.text.inverse,
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="min-h-screen"
      style={{ backgroundColor: colors.background.secondary }}
    >
      {/* Hero */}
      <section
        className="py-10 mt-20 mb-2"
        style={{
          background: colors.primary.gradient,
          color: colors.text.inverse,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1
            className="text-3xl sm:text-4xl font-bold mb-3"
            style={{ color: colors.text.inverse }}
          >
            Professional Services
          </h1>
          <p
            className="mb-6 font-bold"
            style={{ color: colors.text.inverse, opacity: 0.9 }}
          >
            Browse {services.length} professional services
          </p>

          <div className="relative max-w-xl mx-auto">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: colors.primary.DEFAULT }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="
                w-full
                pl-12 pr-4 py-3
                rounded-xl
                border
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]
                placeholder:text-[var(--color-text-muted)]
              "
              style={{
                backgroundColor: colors.background.primary,
                borderColor: colors.border.light,
                color: colors.text.primary,
              }}
            />
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredServices.map((service) => {
          const Icon = getIconComponent(service.iconName);
          return (
            <motion.div
              key={service._id}
              variants={staggerItem}
              onClick={() => handleServiceClick(service)}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="
                rounded-xl
                p-6
                shadow-lg
                cursor-pointer
                transition
                hover:shadow-xl
              "
              style={{ backgroundColor: colors.background.primary }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ background: colors.primary.gradient }}
                >
                  <Icon
                    className="w-7 h-7"
                    style={{ color: colors.text.inverse }}
                  />
                </div>
                <h3
                  className="font-bold text-lg"
                  style={{ color: colors.text.primary }}
                >
                  {service.service}
                </h3>
              </div>

              <p
                className="line-clamp-2 mb-4"
                style={{ color: colors.text.secondary }}
              >
                {service.description}
              </p>

              <div
                className="flex justify-end"
                style={{ color: colors.primary.DEFAULT }}
              >
                <ChevronRight className="w-5 h-5" />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Issues Modal */}
      <IssuesModal
        isOpen={showModal}
        service={selectedService}
        issues={issues}
        loadingIssues={loadingIssues}
        onClose={handleCloseModal}
        getIconComponent={getIconComponent}
        onBook={() => {
          handleCloseModal();
          navigate("/professionals");
        }}
      />
    </motion.div>
  );
};
