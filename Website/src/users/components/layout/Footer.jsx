import React from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { motion } from "framer-motion";
import { colors } from "../../../styles/colors";

export const Footer = () => {
  const services = [
    "Electrician",
    "Plumber",
    "AC Technician",
    "CCTV Installation",
    "Painter",
    "House Cleaning",
  ];

  const company = [
    "About Us",
    "Careers",
    "Become a Pro",
    "Terms of Service",
    "Privacy Policy",
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.08 * i },
    }),
  };

  const linkHover = { x: 6 };
  const socialHover = { y: -4, scale: 1.02 };
  const socialTap = { scale: 0.96 };

  // Keep the same hover behavior but FIX the UI/UX bugs:
  // - remove invalid escaped quotes in className strings
  // - avoid e.target issues by styling the Link directly via currentTarget
  const handleLinkEnter = (e) => {
    e.currentTarget.style.color = colors.text.primary;
  };
  const handleLinkLeave = (e) => {
    e.currentTarget.style.color = colors.text.secondary;
  };

  return (
    <footer className="relative overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-18">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-14">
          {/* Brand */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={1}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                <span style={{ color: "#0f64c8" }}>Help</span>
                <span style={{ color: "#1fa34a" }}>Go</span>
              </span>
            </div>

            <p
              className="mt-5 max-w-xs text-sm leading-relaxed"
              style={{ color: colors.text.secondary }}
            >
              Book verified local professionals across Sri Lanka. We assign the
              best available worker. Guaranteed quality and satisfaction.
            </p>

            {/* Social */}
            <div className="mt-7 flex items-center gap-3">
              {[
                {
                  Icon: Facebook,
                  name: "Facebook",
                  color: "#1877F2",
                },
                {
                  Icon: Instagram,
                  name: "Instagram",
                  color: "#E4405F",
                },
                {
                  Icon: Twitter,
                  name: "X",
                  color: "#000000",
                },
              ].map(({ Icon, name, color }, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  whileHover={socialHover}
                  whileTap={socialTap}
                  className="group relative inline-flex cursor-pointer items-center justify-center rounded-xl p-3 shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-4"
                  style={{
                    backgroundColor: colors.background.secondary,
                    "--tw-ring-color": color,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = color;
                    e.currentTarget.style.boxShadow = `0 0 20px ${color}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      colors.background.secondary;
                    e.currentTarget.style.boxShadow = "";
                  }}
                  aria-label={`${name} link`}
                >
                  <Icon
                    className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: color }}
                  />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={2}
          >
            <h4
              className="inline-flex items-center gap-2 text-lg font-semibold"
              style={{ color: colors.text.primary }}
            >
              <span>Services</span>
              <span
                className="h-px w-10"
                style={{ backgroundColor: colors.primary.light }}
              />
            </h4>

            <ul className="mt-6 space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <motion.div
                    whileHover={linkHover}
                    transition={{ duration: 0.18 }}
                  >
                    <Link
                      to="/services"
                      className="group inline-flex cursor-pointer items-center gap-2 text-sm transition-colors duration-300 focus:outline-none focus-visible:ring-4 rounded-md"
                      style={{
                        color: colors.text.secondary,
                        "--tw-ring-color": colors.primary.light,
                      }}
                      onMouseEnter={handleLinkEnter}
                      onMouseLeave={handleLinkLeave}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ backgroundColor: colors.primary.DEFAULT }}
                      />
                      <span className="transition-all duration-300 group-hover:font-medium">
                        {service}
                      </span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={3}
          >
            <h4
              className="inline-flex items-center gap-2 text-lg font-semibold"
              style={{ color: colors.text.primary }}
            >
              <span>Company</span>
              <span
                className="h-px w-10"
                style={{ backgroundColor: colors.primary.light }}
              />
            </h4>

            <ul className="mt-6 space-y-3">
              {company.map((item) => (
                <li key={item}>
                  <motion.div
                    whileHover={linkHover}
                    transition={{ duration: 0.18 }}
                  >
                    <Link
                      to={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="group inline-flex cursor-pointer items-center gap-2 text-sm transition-colors duration-300 focus:outline-none focus-visible:ring-4 rounded-md"
                      style={{
                        color: colors.text.secondary,
                        "--tw-ring-color": colors.primary.light,
                      }}
                      onMouseEnter={handleLinkEnter}
                      onMouseLeave={handleLinkLeave}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ backgroundColor: colors.primary.DEFAULT }}
                      />
                      <span className="transition-all duration-300 group-hover:font-medium">
                        {item}
                      </span>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={4}
          >
            <h4
              className="inline-flex items-center gap-2 text-lg font-semibold"
              style={{ color: colors.text.primary }}
            >
              <span>Contact</span>
              <span
                className="h-px w-10"
                style={{ backgroundColor: colors.primary.light }}
              />
            </h4>

            <ul className="mt-6 space-y-4">
              {[
                {
                  Icon: MapPin,
                  text: "123 Main Street, Colombo 07, Sri Lanka",
                },
                { Icon: Phone, text: "+94 11 234 5678" },
                { Icon: Mail, text: "support@helpgo.lk" },
              ].map(({ Icon, text }, idx) => (
                <motion.li
                  key={idx}
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-4"
                >
                  <div
                    className="rounded-xl p-2.5 shadow-lg transition-shadow duration-300"
                    style={{ backgroundColor: colors.primary.light }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: colors.primary.DEFAULT }}
                    />
                  </div>
                  <span
                    className="text-sm leading-relaxed transition-colors duration-300"
                    style={{ color: colors.text.secondary }}
                  >
                    {text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          custom={5}
          className="mt-12 flex flex-col items-center justify-between gap-4 pt-8 md:flex-row"
          style={{ borderTop: `1px solid ${colors.border.light}` }}
        >
          <p
            className="text-sm transition-colors duration-300"
            style={{ color: colors.text.secondary }}
          >
            © {new Date().getFullYear()} HelpGo. All rights reserved.
          </p>

          <div className="group inline-flex cursor-pointer items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-pulse" />
            <p
              className="text-sm transition-colors duration-300"
              style={{ color: colors.text.secondary }}
            >
              Made with{" "}
              <motion.span
                className="inline-block"
                animate={{ y: [0, -2, 0] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ❤️
              </motion.span>{" "}
              in Sri Lanka
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
