import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { colors } from "../../../styles/colors";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  Award,
  Target,
  Heart,
  Globe,
  ArrowRight,
  Star,
  CheckCircle,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ThumbsUp,
  Briefcase,
  Award as AwardIcon,
  Users as UsersIcon,
} from "lucide-react";
import bannerImg from "../../../assets/images/bannerAbout.png";

export const About = () => {
  const navigate = useNavigate();
  const teamMembers = [
    {
      name: "Thananchayan K",
      role: "Co-Founder",
      image: "",
      description:
        "Working on shaping the HelpGo idea and overall direction of the platform",
    },
    {
      name: "Sarvayan M",
      role: "Co-Founder & Development",
      image: "",
      description:
        "Building the platform and handling the technical development of HelpGo",
    },
    {
      name: "Kajanan S",
      role: "Product & Engineering",
      image: "",
      description:
        "Focusing on product features, system logic, and smooth user experience",
    },
    {
      name: "Harushanan K",
      role: "Operations & Community",
      image: "",
      description:
        "Managing day-to-day operations and connecting with local service providers",
    },
  ];

  const milestones = [
    {
      year: "2025",
      title: "Concept & Planning",
      description:
        "Identified local service challenges and designed the HelpGo platform solution",
    },
    {
      year: "2025",
      title: "Platform Development",
      description:
        "Building the HelpGo platform with focus on trust, simplicity, and local professionals",
    },
    {
      year: "2026",
      title: "Beta Launch",
      description:
        "Preparing for initial launch with a limited number of verified local service providers",
    },
    {
      year: "2026",
      title: "Public Launch",
      description:
        "Official launch of HelpGo for public users across selected regions",
    },
    {
      year: "2026",
      title: "Early Growth Phase",
      description:
        "Onboarding more professionals and serving the first wave of customers",
    },
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust & Safety",
      description:
        "Every professional is thoroughly verified and background checked",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Customer First",
      description: "Ytatisfaction is our top priority in every service",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Excellence",
      description: "We maintain high standards for all services provided",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "Building connections between professionals and customers",
    },
  ];

  const stats = [
    {
      value: "50+",
      label: "Happy Customers",
      icon: <UsersIcon className="w-6 h-6" />,
    },
    {
      value: "4+",
      label: "Verified Pros",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      value: "98%",
      label: "Satisfaction Rate",
      icon: <ThumbsUp className="w-6 h-6" />,
    },
    {
      value: "1",
      label: "Districts Covered",
      icon: <MapPin className="w-6 h-6" />,
    },
    { value: "4.8", label: "Avg. Rating", icon: <Star className="w-6 h-6" /> },
    {
      value: "15+",
      label: "Jobs Completed",
      icon: <AwardIcon className="w-6 h-6" />,
    },
  ];

  // Motion helpers (no logic changes, only UI/UX)
  const motionPresets = useMemo(() => {
    const ease = [0.22, 1, 0.36, 1];

    return {
      section: {
        initial: { opacity: 0, y: 14 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.6, ease },
      },
      fadeUp: (delay = 0) => ({
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.6, ease, delay },
      }),
      card: (delay = 0) => ({
        initial: { opacity: 0, y: 14, scale: 0.98 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, amount: 0.25 },
        transition: { duration: 0.65, ease, delay },
      }),
      hoverLift: {
        whileHover: { y: -4, scale: 1.01 },
        whileTap: { scale: 0.99 },
        transition: { type: "spring", stiffness: 320, damping: 22 },
      },
      button: {
        whileHover: { y: -1, scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { type: "spring", stiffness: 380, damping: 24 },
      },
    };
  }, []);

  return (
    <div
      className="min-h-screen "
      style={{ backgroundColor: colors.background.secondary }}
    >
      {/* Hero Section */}
      <section
        className="relative overflow-hidden text-white pb-10 sm:pb-12 lg:pb-16 pt-7 sm:pt-8 lg:pt-12"
        style={{
          background: `linear-gradient(135deg,  ${colors.primary.DEFAULT})`,
        }}
      >
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

        {/* Soft blobs (purely decorative) */}
        <motion.div
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-20"
          style={{ background: colors.secondary.gradient }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full blur-3xl opacity-15"
          style={{ background: colors.primary.gradient }}
          animate={{ scale: [1, 1.06, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="flex flex-col lg:flex-row items-center justify-between max-w-11/12 mx-auto px-4 sm:px-6 lg:px-8 gap-8">
          <div className="lg:max-w-3xl w-full relative">
          <div className="max-w-3xl">
            <motion.div
              {...motionPresets.fadeUp(0)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm mb-6 border border-white/20"
              style={{ background: colors.background.secondary + "1A" }}
            >
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">
                Award Winning Service Platform
              </span>
            </motion.div>

            <motion.h1
              {...motionPresets.fadeUp(0.05)}
              className="text-xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight tracking-tight"
            >
              Connecting Trusted{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  background: colors.secondary.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Professionals
              </span>{" "}
              with You
            </motion.h1>

            <motion.p
              {...motionPresets.fadeUp(0.1)}
              className="text-base sm:text-lg lg:text-xl mb-8 max-w-2xl leading-relaxed"
            >
              HelpGo is Sri Lanka&apos;s leading platform connecting customers
              with verified local professionals. Our mission is to make quality
              services accessible, reliable, and convenient for everyone.
            </motion.p>

            <motion.div
              {...motionPresets.fadeUp(0.15)}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
            >
              <motion.button
                className="
                  w-full sm:w-auto
                  px-6 sm:px-8 py-3.5
                  rounded-xl font-semibold
                  transition-colors
                  flex items-center justify-center gap-2
                  shadow-[0_10px_24px_rgba(2,6,23,0.18)]
                  cursor-pointer
                  active:scale-[0.99]
                "
                style={{
                  background: "white",
                  color: colors.secondary.DEFAULT,
                }}
                {...motionPresets.button}
                onClick={() => navigate("/app/services")}
              >
                Our Services <ArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                className="
                  w-full sm:w-auto
                  border-2
                  px-6 sm:px-8 py-3.5
                  rounded-xl font-semibold
                  transition-all
                  cursor-pointer
                  hover:bg-white/10
                  active:scale-[0.99]
                "
                onClick={() => {
                  window.open("https://wa.me/94740536517", "_blank");
                }}
                style={{
                  borderColor: colors.background.paper,
                  color: colors.text.onPrimary,
                }}
                {...motionPresets.button}
              >
                Contact Team
              </motion.button>
            </motion.div>
          </div>
          </div>
          <div className="w-full flex justify-center relative hidden md:block">
                <motion.img
                  src={bannerImg}
                  alt="Local service professionals at work"
                  loading="lazy"
                  decoding="async"
                  initial={{ scale: 1.06 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="w-full h-full object-cover"
                />
          </div>
        </div>
      </section>

      {/* Our Story */}
      <motion.section
        {...motionPresets.section} 
        className="py-14 sm:py-16 lg:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <motion.div
                {...motionPresets.fadeUp(0)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 border"
                style={{
                  background: colors.primary.light,
                  color: colors.primary.dark,
                  borderColor: colors.border.light,
                }}
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">Our Story</span>
              </motion.div>

              <motion.h2
                {...motionPresets.fadeUp(0.05)}
                className="text-3xl sm:text-4xl font-bold mb-5 tracking-tight"
                style={{ color: colors.text.primary }}
              >
                Revolutionizing Local Services in Sri Lanka
              </motion.h2>

              <motion.div
                {...motionPresets.fadeUp(0.1)}
                className="space-y-4 text-base leading-relaxed"
                style={{ color: colors.text.secondary }}
              >
                <p>
                  Founded in 2025, HelpGo started with a simple vision: to solve
                  the challenge of finding reliable local professionals in Sri
                  Lanka. We noticed that customers struggled to find trustworthy
                  service providers, while skilled professionals lacked a
                  platform to showcase their expertise.
                </p>
                <p>
                  Today, we&apos;ve grown into Sri Lanka&apos;s most trusted
                  service platform, connecting thousands of customers with
                  verified professionals across all 25 districts. Our rigorous
                  verification process ensures that every professional on our
                  platform meets our high standards of quality and reliability.
                </p>
                <p>
                  We&apos;re proud to have created opportunities for local
                  professionals while providing peace of mind to customers
                  across the country.
                </p>
              </motion.div>
            </div>

            <motion.div {...motionPresets.card(0.05)} className="relative">
              <div
                className="
                  rounded-3xl p-7 sm:p-8 lg:p-12
                  shadow-[0_18px_50px_rgba(2,6,23,0.18)]
                  border border-white/10
                  overflow-hidden
                "
                style={{
                  background: colors.primary.gradient,
                }}
              >
                <motion.div
                  className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl opacity-20"
                  style={{ background: colors.secondary.gradient }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <h3 className="text-white text-2xl font-bold mb-4 tracking-tight">
                  Our Mission
                </h3>

                <p className="mb-7 leading-relaxed text-white">
                  To empower local communities by creating reliable connections
                  between customers and verified professionals, while setting
                  new standards for service quality and customer satisfaction in
                  Sri Lanka.
                </p>

                <div className="space-y-3 text-white">
                  <div className="flex items-center gap-3">
                    <CheckCircle
                      className="w-5 h-5"
                      style={{ color: colors.success.DEFAULT }}
                    />
                    <span className="font-medium">
                      100% Verified Professionals
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="font-medium">
                      Quality Service Guarantee
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="font-medium">Nationwide Coverage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="font-medium">24/7 Customer Support</span>
                  </div>
                </div>
              </div>

              <div
                className="absolute -bottom-6 -right-6 w-36 h-36 sm:w-40 sm:h-40 rounded-3xl -z-10"
                style={{ background: colors.secondary.gradient }}
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        {...motionPresets.section}
        className="py-10 sm:py-12"
        style={{ background: colors.background.paper }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="
              grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6
              gap-3 sm:gap-5 lg:gap-6
            "
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                {...motionPresets.card(index * 0.04)}
                className="
                  rounded-2xl
                  px-4 py-4 sm:px-5 sm:py-5
                  border
                  shadow-[0_10px_26px_rgba(2,6,23,0.08)]
                  hover:shadow-[0_16px_34px_rgba(2,6,23,0.12)]
                  transition-shadow
                  cursor-pointer
                  active:scale-[0.99]
                  bg-white/60
                "
                style={{
                  borderColor: colors.border.light,
                  background: colors.background.primary,
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div style={{ color: colors.primary.DEFAULT }}>
                    {stat.icon}
                  </div>
                  <div
                    className="text-2xl sm:text-3xl font-bold tracking-tight"
                    style={{ color: colors.text.primary }}
                  >
                    {stat.value}
                  </div>
                </div>
                <div
                  className="text-xs sm:text-sm text-center"
                  style={{ color: colors.text.secondary }}
                >
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Our Values */}
      <motion.section
        {...motionPresets.section}
        className="py-14 sm:py-16 lg:py-20"
        style={{}}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <motion.h2
              {...motionPresets.fadeUp(0)}
              className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight"
              style={{ color: colors.text.primary }}
            >
              Our Core Values
            </motion.h2>
            <motion.p
              {...motionPresets.fadeUp(0.05)}
              className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: colors.text.secondary }}
            >
              These principles guide everything we do at HelpGo
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                {...motionPresets.card(index * 0.05)}
                className="
                  rounded-3xl p-6
                  border
                  shadow-[0_14px_40px_rgba(2,6,23,0.08)]
                  hover:shadow-[0_22px_55px_rgba(2,6,23,0.12)]
                  transition-shadow
                  cursor-pointer
                "
                style={{
                  background: colors.background.paper,
                  borderColor: colors.border.light,
                }}
                {...motionPresets.hoverLift}
              >
                <div
                  className="
                    w-14 h-14 rounded-2xl
                    flex items-center justify-center mb-4
                    shadow-[0_10px_24px_rgba(2,6,23,0.08)]
                  "
                  style={{
                    background: colors.primary.light,
                    color: colors.primary.DEFAULT,
                  }}
                >
                  {value.icon}
                </div>
                <h3
                  className="text-lg font-bold mb-2 tracking-tight"
                  style={{ color: colors.text.primary }}
                >
                  {value.title}
                </h3>
                <p
                  className="text-sm sm:text-base leading-relaxed"
                  style={{ color: colors.text.secondary }}
                >
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Journey Timeline */}
      <motion.section
        {...motionPresets.section}
        className="py-14 sm:py-16 lg:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <motion.h2
              {...motionPresets.fadeUp(0)}
              className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight"
              style={{ color: colors.text.primary }}
            >
              Our Journey
            </motion.h2>
            <motion.p
              {...motionPresets.fadeUp(0.05)}
              className="text-base sm:text-lg"
              style={{ color: colors.text.secondary }}
            >
              Milestones in our growth story
            </motion.p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div
              className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 hidden lg:block"
              style={{ background: colors.primary.gradient }}
            />

            <div className="space-y-8 sm:space-y-10 lg:space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  {...motionPresets.fadeUp(index * 0.06)}
                  className={`relative flex flex-col lg:flex-row items-center lg:items-start ${
                    index % 2 === 0 ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Dot */}
                  <motion.div
                    className="
                      absolute left-1/2 transform -translate-x-1/2
                      w-4 h-4 rounded-full z-10
                      ring-4
                      shadow-[0_10px_24px_rgba(2,6,23,0.12)]
                    "
                    style={{
                      background: colors.primary.gradient,
                      ringColor: colors.background.default,
                    }}
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Content */}
                  <div
                    className={`lg:w-5/12 ${
                      index % 2 === 0 ? "lg:pr-12 text-right" : "lg:pl-12"
                    }`}
                  >
                    <motion.div
                      className="
                        rounded-3xl p-6
                        border
                        shadow-[0_16px_46px_rgba(2,6,23,0.10)]
                        hover:shadow-[0_24px_60px_rgba(2,6,23,0.14)]
                        transition-shadow
                        cursor-pointer
                        backdrop-blur
                      "
                      style={{
                        background: colors.background.paper,
                        borderColor: colors.border.light,
                      }}
                      {...motionPresets.hoverLift}
                    >
                      <div
                        className="text-2xl font-bold mb-2 tracking-tight"
                        style={{ color: colors.primary.DEFAULT }}
                      >
                        {milestone.year}
                      </div>
                      <h3
                        className="text-lg font-bold mb-2 tracking-tight"
                        style={{ color: colors.text.primary }}
                      >
                        {milestone.title}
                      </h3>
                      <p
                        className="leading-relaxed"
                        style={{ color: colors.text.secondary }}
                      >
                        {milestone.description}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Team Section */}
      <motion.section
        {...motionPresets.section}
        className="py-14 sm:py-16 lg:py-20"
        style={{ background: colors.background.paper }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <motion.h2
              {...motionPresets.fadeUp(0)}
              className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight"
              style={{ color: colors.text.primary }}
            >
              Meet Our Team
            </motion.h2>
            <motion.p
              {...motionPresets.fadeUp(0.05)}
              className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: colors.text.secondary }}
            >
              The passionate people behind HelpGo&apos;s success
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                {...motionPresets.card(index * 0.05)}
                className="
                  rounded-3xl p-6 text-center
                  border
                  shadow-[0_14px_42px_rgba(2,6,23,0.10)]
                  hover:shadow-[0_22px_60px_rgba(2,6,23,0.14)]
                  transition-shadow
                  cursor-pointer
                "
                style={{
                  background: colors.background.primary,
                  borderColor: colors.border.light,
                }}
                {...motionPresets.hoverLift}
              >
                <div className="relative mx-auto mb-4 w-24 h-24">
                  <div
                    className="absolute inset-0 rounded-full blur-xl opacity-30"
                    style={{ background: colors.primary.gradient }}
                  />
                  <img
                    src={member.image}
                    alt={member.name}
                    className="
                      relative
                      w-24 h-24 rounded-full mx-auto
                      border-4
                      shadow-[0_12px_26px_rgba(2,6,23,0.14)]
                    "
                    style={{ borderColor: colors.primary.light }}
                  />
                </div>
                <h3
                  className="font-bold text-lg mb-1 tracking-tight"
                  style={{ color: colors.text.primary }}
                >
                  {member.name}
                </h3>
                <p
                  className="font-semibold mb-3 text-sm"
                  style={{ color: colors.primary.DEFAULT }}
                >
                  {member.role}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: colors.text.secondary }}
                >
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            {...motionPresets.fadeUp(0.1)}
            className="text-center mt-10 sm:mt-12"
          >
            <p
              className="text-sm sm:text-base"
              style={{ color: colors.text.secondary }}
            >
              And 50+ more dedicated team members working across Sri Lanka
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section
        className="py-14 sm:py-16 lg:py-20 text-white"
        style={{
          background: `linear-gradient(135deg,  ${colors.primary.DEFAULT})`,
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            {...motionPresets.fadeUp(0)}
            className="text-3xl sm:text-4xl font-bold mb-5 tracking-tight"
          >
            Join Our Growing Community
          </motion.h2>

          <motion.p
            {...motionPresets.fadeUp(0.05)}
            className="text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
            style={{}}
          >
            Whether you&apos;re looking for reliable services or want to grow
            your professional business, HelpGo is here to help you succeed.
          </motion.p>

          {/* Native-feel contact actions row (visual only, no logic change) */}
          <motion.div
            {...motionPresets.fadeUp(0.15)}
            className="mt-10 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto"
          >
            {[
              { icon: <MessageSquare className="w-5 h-5 text-white" />, label: "Chat" },
              { icon: <Phone className="w-5 h-5 text-white" />, label: "Call" },
              { icon: <Mail className="w-5 h-5 text-white" />, label: "Email" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="
                  rounded-2xl
                  px-3 py-3
                  border border-white/15
                  bg-white/10 backdrop-blur
                  flex flex-col items-center justify-center
                  cursor-pointer
                "
                {...motionPresets.hoverLift}
              >
                <div
                  className="mb-1"
                  style={{ color: colors.secondary.DEFAULT }}
                >
                  {item.icon}
                </div>
                <div className="text-xs sm:text-sm font-medium">
                  {item.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Info */}
      <motion.section {...motionPresets.section} className="py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <motion.div
              {...motionPresets.card(0)}
              className="
                rounded-3xl
                p-6 sm:p-7
                text-center
                border
                shadow-[0_14px_42px_rgba(2,6,23,0.08)]
                hover:shadow-[0_22px_60px_rgba(2,6,23,0.12)]
                transition-shadow
                cursor-pointer
              "
              style={{
                background: colors.background.paper,
                borderColor: colors.border.light,
              }}
              {...motionPresets.hoverLift}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_10px_22px_rgba(2,6,23,0.08)]"
                style={{ background: colors.primary.light }}
              >
                <MapPin
                  className="w-6 h-6"
                  style={{ color: colors.primary.DEFAULT }}
                />
              </div>
              <h3
                className="font-bold mb-2 tracking-tight"
                style={{ color: colors.text.primary }}
              >
                Our Office
              </h3>
              <p
                className="leading-relaxed"
                style={{ color: colors.text.secondary }}
              >
                123 Innovation Street,
                <br />
                Jaffna, Sri Lanka
              </p>
            </motion.div>

            <motion.div
              {...motionPresets.card(0.05)}
              className="
                rounded-3xl
                p-6 sm:p-7
                text-center
                border
                shadow-[0_14px_42px_rgba(2,6,23,0.08)]
                hover:shadow-[0_22px_60px_rgba(2,6,23,0.12)]
                transition-shadow
                cursor-pointer
              "
              style={{
                background: colors.background.paper,
                borderColor: colors.border.light,
              }}
              {...motionPresets.hoverLift}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_10px_22px_rgba(2,6,23,0.08)]"
                style={{ background: colors.primary.light }}
              >
                <Phone
                  className="w-6 h-6"
                  style={{ color: colors.primary.DEFAULT }}
                />
              </div>
              <h3
                className="font-bold mb-2 tracking-tight"
                style={{ color: colors.text.primary }}
              >
                Call Us
              </h3>
              <p
                className="leading-relaxed"
                style={{ color: colors.text.secondary }}
              >
                +94 76 123 4567
                <br />
                24/7 Customer Support
              </p>
            </motion.div>

            <motion.div
              {...motionPresets.card(0.1)}
              className="
                rounded-3xl
                p-6 sm:p-7
                text-center
                border
                shadow-[0_14px_42px_rgba(2,6,23,0.08)]
                hover:shadow-[0_22px_60px_rgba(2,6,23,0.12)]
                transition-shadow
                cursor-pointer
              "
              style={{
                background: colors.background.paper,
                borderColor: colors.border.light,
              }}
              {...motionPresets.hoverLift}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_10px_22px_rgba(2,6,23,0.08)]"
                style={{ background: colors.primary.light }}
              >
                <Mail
                  className="w-6 h-6"
                  style={{ color: colors.primary.DEFAULT }}
                />
              </div>
              <h3
                className="font-bold mb-2 tracking-tight"
                style={{ color: colors.text.primary }}
              >
                Email Us
              </h3>
              <p
                className="leading-relaxed"
                style={{ color: colors.text.secondary }}
              >
                hello@HelpGo.lk
                <br />
                support@HelpGo.lk
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <style jsx>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(
              to right,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            );
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};
