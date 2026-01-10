import React from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Users,
  Shield,
  Clock,
  Star,
} from "lucide-react";
import { container, fadeUp, fadeScale } from "../../../animations/animations";
import { colors } from "../../../styles/colors";

const MotionDiv = motion.div;

const About = () => {
  return (
    <section className="min-h-screen px-4 py-12 sm:py-20 md:py-28">
      <div className="mx-auto max-w-7xl space-y-16 sm:space-y-20 md:space-y-28">
        {/* HERO SECTION */}
        <MotionDiv
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="text-center max-w-4xl mx-auto space-y-8 px-4"
        >
          <div className="relative">
            <div
              className="absolute -inset-4 blur-xl opacity-60 rounded-full"
              style={{ backgroundColor: colors.primary.light }}
            />
            <h1
              className="relative text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight"
              style={{ color: colors.text.primary }}
            >
              About{" "}
              <span
                className="bg-gradient-to-r bg-clip-text text-transparent"
                style={{
                  backgroundImage: colors.primary.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                HelpGo
              </span>
            </h1>
          </div>
          <p
            className="text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto"
            style={{ color: colors.text.secondary }}
          >
            We're redefining how people connect with trusted local service
            providers — making it{" "}
            <span
              className="font-semibold"
              style={{ color: colors.primary.DEFAULT }}
            >
              simple, transparent, and reliable
            </span>
            .
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: colors.primary.light }}
            >
              <Users
                className="h-4 w-4"
                style={{ color: colors.primary.DEFAULT }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: colors.primary.DEFAULT }}
              >
                4+ Verified Providers
              </span>
            </div>
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ backgroundColor: colors.success.bg }}
            >
              <Star
                className="h-4 w-4"
                style={{ color: colors.success.DEFAULT }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: colors.success.DEFAULT }}
              >
                4.5/5 Satisfaction
              </span>
            </div>
          </div>
        </MotionDiv>

        {/* MISSION STATEMENT */}
        <MotionDiv
          variants={fadeScale}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="relative overflow-hidden rounded-3xl shadow-lg p-8 sm:p-12 md:p-16"
          style={{
            background: `linear-gradient(to bottom right, ${colors.background.primary}, ${colors.background.secondary})`,
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-32 translate-x-32 opacity-20"
            style={{ backgroundColor: colors.primary.light }}
          />
          <div className="relative space-y-6">
            <div
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-4"
              style={{ backgroundColor: colors.primary.light }}
            >
              <Shield
                className="h-5 w-5"
                style={{ color: colors.primary.DEFAULT }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: colors.primary.DEFAULT }}
              >
                Our Mission
              </span>
            </div>

            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: colors.text.primary }}
            >
              Making Local Services Simple and Trustworthy
            </h2>

            <div className="space-y-4">
              <p
                className="leading-relaxed text-lg"
                style={{ color: colors.text.secondary }}
              >
                Finding a reliable electrician, plumber, or technician shouldn't
                be stressful or uncertain. HelpGo exists to make that process
                clear, simple, and dependable.
              </p>

              <p
                className="leading-relaxed text-lg"
                style={{ color: colors.text.secondary }}
              >
                With HelpGo, you know{" "}
                <span
                  className="font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  who you’re booking and what to expect
                </span>{" "}
                — view verified providers, see transparent details, and make an
                informed decision before booking.
              </p>
            </div>
          </div>
        </MotionDiv>

        {/* HOW IT WORKS */}
        <MotionDiv
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          className="space-y-12"
        >
          <div className="text-center space-y-4">
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: colors.text.primary }}
            >
              Simple, Transparent Process
            </h2>
            <p
              className="max-w-2xl mx-auto"
              style={{ color: colors.text.secondary }}
            >
              Three easy steps to get your needs met by trusted professionals
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Select Service",
                description: "Choose from 4+ service categories",
                icon: "🔍",
              },
              {
                title: "Compare Providers",
                description: "View ratings, reviews, and pricing",
                icon: "📊",
              },
              {
                title: "Book Confidently",
                description: "Secure booking with clear expectations",
                icon: "✅",
              },
            ].map((step, index) => (
              <MotionDiv
                key={index}
                variants={fadeUp}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group relative rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border"
                style={{
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border.DEFAULT,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.primary.light;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border.DEFAULT;
                }}
              >
                <div
                  className="absolute -top-4 -left-4 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                  style={{
                    background: colors.primary.gradient,
                    color: colors.text.inverse,
                  }}
                >
                  {index + 1}
                </div>
                <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                <h3
                  className="text-xl font-semibold mb-3 transition-colors"
                  style={{ color: colors.text.primary }}
                >
                  {step.title}
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ color: colors.text.secondary }}
                >
                  {step.description}
                </p>
                <div
                  className="mt-6 pt-6 border-t"
                  style={{ borderColor: colors.border.DEFAULT }}
                ></div>
              </MotionDiv>
            ))}
          </div>
        </MotionDiv>

        {/* TRUST & VALUES */}
        <MotionDiv
          variants={fadeScale}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="rounded-3xl shadow-2xl p-8 sm:p-12 md:p-16 overflow-hidden"
          style={{
            background: colors.primary.gradient,
            color: colors.text.inverse,
          }}
        >
          <div className="relative">
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl"
              style={{ backgroundColor: colors.primary.light, opacity: 0.1 }}
            />
            <div className="relative space-y-10">
              <div className="space-y-4 max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-bold">
                  Why Professionals & Customers Trust HelpGo
                </h2>
                <p className="text-lg" style={{ opacity: 0.9 }}>
                  Built on transparency, quality, and community values
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: <Shield className="h-6 w-6" />,
                    title: "Verified Professionals",
                    description: "Manual verification of every provider",
                  },
                  {
                    icon: <Clock className="h-6 w-6" />,
                    title: "Transparent Pricing",
                    description: "No hidden fees or surprises",
                  },
                  {
                    icon: <Users className="h-6 w-6" />,
                    title: "Direct Communication",
                    description: "Connect instantly with providers",
                  },
                  {
                    icon: <Star className="h-6 w-6" />,
                    title: "Quality Focus",
                    description: "Built with local-first mindset",
                  },
                ].map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05 }}
                    className="backdrop-blur-sm rounded-2xl p-6 border transition-colors group"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.primary.light;
                      e.currentTarget.style.borderOpacity = "0.3";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(255, 255, 255, 0.1)";
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ background: colors.primary.gradient }}
                    >
                      {value.icon}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm" style={{ opacity: 0.8 }}>
                      {value.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </MotionDiv>

        {/* CONTACT SECTION */}
        <MotionDiv
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="rounded-3xl shadow-xl p-8 sm:p-12 md:p-16"
          style={{
            background: `linear-gradient(to bottom right, ${colors.background.primary}, ${colors.background.secondary})`,
          }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6 mb-12">
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: colors.text.primary }}
              >
                Get in Touch
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: colors.text.secondary }}
              >
                Have questions or need assistance? Our team is here to help.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  icon: <MapPin className="h-8 w-8" />,
                  title: "Our Location",
                  content: "Colombo, Sri Lanka",
                  description: "Serving nationwide",
                  color: colors.primary.DEFAULT,
                  bg: colors.primary.light,
                },
                {
                  icon: <Phone className="h-8 w-8" />,
                  title: "Call Us",
                  content: "+94 11 234 5678",
                  description: "Mon-Sun, 8AM-10PM",
                  color: colors.success.DEFAULT,
                  bg: colors.success.bg,
                  hover: true,
                },
                {
                  icon: <Mail className="h-8 w-8" />,
                  title: "Email Us",
                  content: "support@helpgo.lk",
                  description: "Response within 24 hours",
                  color: colors.text.secondary,
                  bg: colors.background.secondary,
                  hover: true,
                },
              ].map((contact, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className={`relative group ${
                    contact.hover ? "cursor-pointer" : ""
                  }`}
                >
                  <div
                    className="rounded-2xl p-8 text-center h-full transition-all duration-300 group-hover:shadow-lg"
                    style={{ backgroundColor: contact.bg }}
                  >
                    <div className="mb-6 flex justify-center">
                      <div
                        className="p-4 rounded-xl shadow-sm"
                        style={{ backgroundColor: colors.background.primary }}
                      >
                        <div style={{ color: contact.color }}>
                          {contact.icon}
                        </div>
                      </div>
                    </div>
                    <h3
                      className="font-semibold mb-3"
                      style={{ color: colors.text.primary }}
                    >
                      {contact.title}
                    </h3>
                    <p
                      className="font-medium text-lg mb-2 transition-colors"
                      style={{ color: colors.text.primary }}
                      onMouseEnter={(e) => {
                        if (contact.hover)
                          e.currentTarget.style.color = colors.primary.DEFAULT;
                      }}
                      onMouseLeave={(e) => {
                        if (contact.hover)
                          e.currentTarget.style.color = colors.text.primary;
                      }}
                    >
                      {contact.content}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: colors.text.secondary }}
                    >
                      {contact.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
};

export default About;
