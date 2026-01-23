import React, { useState } from "react";
import { colors } from "../../../styles/colors";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Send,
  CheckCircle,
  Award,
  Users,
  Quote,
  Star as StarIcon,
  AlertCircle,
  Smile,
  Frown,
  Meh,
} from "lucide-react";
import AppLoader from "../common/AppLoader";
import { motion, AnimatePresence } from "framer-motion";

export const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("general");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    experience: "good",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const feedbackTypes = [
    {
      id: "general",
      label: "General Feedback",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: "suggestion",
      label: "Suggestion",
      icon: <ThumbsUp className="w-5 h-5" />,
    },
    {
      id: "issue",
      label: "Report Issue",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      id: "feature",
      label: "Feature Request",
      icon: <Award className="w-5 h-5" />,
    },
  ];

  const experiences = [
    {
      id: "excellent",
      label: "Excellent",
      icon: <Smile className="w-6 h-6" />,
      color: "text-green-600",
    },
    {
      id: "good",
      label: "Good",
      icon: <Smile className="w-6 h-6" />,
      color: "text-blue-600",
    },
    {
      id: "average",
      label: "Average",
      icon: <Meh className="w-6 h-6" />,
      color: "text-yellow-600",
    },
    {
      id: "poor",
      label: "Poor",
      icon: <Frown className="w-6 h-6" />,
      color: "text-red-600",
    },
  ];

  const testimonials = [
    {
      name: "Rajesh Kumar",
      rating: 5,
      comment:
        "The website is incredibly easy to use! Found a plumber within minutes.",
      date: "2 days ago",
      type: "suggestion",
    },
    {
      name: "Priya Silva",
      rating: 4,
      comment: "Great platform. Would love to see more payment options.",
      date: "1 week ago",
      type: "feature",
    },
    {
      name: "Kamal Perera",
      rating: 5,
      comment: "Best service platform in Sri Lanka. Keep up the good work!",
      date: "2 weeks ago",
      type: "general",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the feedback to your backend
    console.log("Feedback submitted:", { ...formData, rating, feedbackType });

    setSubmitting(true);
    setSubmitted(false);

    setTimeout(() => {
      // Show success message
      setSubmitted(true);
      setSubmitting(false);

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setRating(0);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          experience: "good",
        });
      }, 3000);
    }, 600);
  };

  const pageIn = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 10, scale: 0.99 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: colors.background.gradient }}
    >
      {/* Fullscreen submitting loader */}
      <AnimatePresence>
        {submitting && (
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <AppLoader
              title="Submitting feedback"
              subtitle="Thanks for helping us improve"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative overflow-hidden text-white" style={{}}>
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
      
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <motion.div
            variants={pageIn}
            initial="hidden"
            animate="show"
            className="max-w-3xl"
          >
            <motion.div
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-md border border-white/15 shadow-sm cursor-pointer"
              style={{ background: colors.background.secondary + "1A" }}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">We Value Your Opinion</span>
            </motion.div>

            <div className="mt-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                Share Your{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    background: colors.secondary.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Feedback
                </span>
              </h1>

              <p
                className="mt-4 text-base sm:text-lg md:text-xl max-w-2xl"
               
              >
                Help us improve LocalPro. Your feedback is important to make our
                platform better for everyone.
              </p>

              {/* Quick info chips (mobile-app feel) */}
              <div className="mt-6 flex flex-wrap gap-2">
                <div className="rounded-full px-3 py-1.5 border border-white/15 bg-white/10 backdrop-blur-md text-xs sm:text-sm font-medium">
                  Fast submission
                </div>
                <div className="rounded-full px-3 py-1.5 border border-white/15 bg-white/10 backdrop-blur-md text-xs sm:text-sm font-medium">
                  Real humans read it
                </div>
                <div className="rounded-full px-3 py-1.5 border border-white/15 bg-white/10 backdrop-blur-md text-xs sm:text-sm font-medium">
                  Improvements shipped
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      >
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Feedback Form */}
          <motion.div variants={item} className="lg:col-span-2">
            <div
              className="rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] border border-black/5 dark:border-white/10 overflow-hidden"
              style={{ background: colors.background.paper }}
            >
              {/* Top bar */}
              <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2
                      className="text-xl sm:text-2xl font-extrabold tracking-tight"
                      style={{ color: colors.text.primary }}
                    >
                      Share Your Thoughts
                    </h2>
                    <p
                      className="mt-1 text-sm sm:text-base"
                      style={{ color: colors.text.secondary }}
                    >
                      A minute of your time helps a lot.
                    </p>
                  </div>

                  {/* Status pill */}
                  <div className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      Online
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 sm:px-8 py-6 sm:py-8">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10, scale: 0.99 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { duration: 0.45, ease: "easeOut" },
                      }}
                      exit={{
                        opacity: 0,
                        y: -6,
                        transition: { duration: 0.25 },
                      }}
                      className="text-center py-10 sm:py-12"
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          transition: {
                            duration: 0.5,
                            ease: "easeOut",
                            delay: 0.05,
                          },
                        }}
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_12px_30px_-15px_rgba(16,185,129,0.55)]"
                        style={{ background: colors.success.bg }}
                      >
                        <CheckCircle
                          className="w-10 h-10"
                          style={{ color: colors.success.DEFAULT }}
                        />
                      </motion.div>
                      <h3
                        className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight"
                        style={{ color: colors.text.primary }}
                      >
                        Thank You for Your Feedback!
                      </h3>
                      <p
                        className="text-sm sm:text-base"
                        style={{ color: colors.text.secondary }}
                      >
                        We appreciate you taking the time to share your thoughts
                        with us.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.45, ease: "easeOut" },
                      }}
                      exit={{
                        opacity: 0,
                        y: -8,
                        transition: { duration: 0.25 },
                      }}
                    >
                      <form onSubmit={handleSubmit} className="space-y-7">
                        {/* Overall Rating */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <label
                              className="block text-sm sm:text-base font-semibold"
                              style={{ color: colors.text.primary }}
                            >
                              How would you rate our website?
                            </label>
                            <div
                              className="text-xs sm:text-sm font-semibold"
                              style={{ color: colors.text.secondary }}
                            >
                              {rating > 0 ? `${rating}/5` : "Tap to rate"}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <motion.button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.94 }}
                                className="p-1 cursor-pointer"
                                aria-label={`Rate ${star} star`}
                              >
                                <Star
                                  className={`w-10 h-10 transition-colors ${
                                    (hoverRating || rating) >= star
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              </motion.button>
                            ))}
                          </div>

                          {/* Micro-helper */}
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            <p
                              className="text-xs sm:text-sm"
                              style={{ color: colors.text.secondary }}
                            >
                              Your rating helps us prioritize improvements.
                            </p>
                          </div>
                        </div>

                        {/* Experience */}
                        <div className="space-y-3">
                          <label
                            className="block text-sm sm:text-base font-semibold"
                            style={{ color: colors.text.primary }}
                          >
                            How was your overall experience?
                          </label>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {experiences.map((exp) => {
                              const active = formData.experience === exp.id;
                              return (
                                <motion.button
                                  key={exp.id}
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      experience: exp.id,
                                    }))
                                  }
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`group flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none ${
                                    active
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-[0_14px_30px_-18px_rgba(59,130,246,0.6)]"
                                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-[0_14px_30px_-22px_rgba(0,0,0,0.25)]"
                                  }`}
                                >
                                  <div className={`${exp.color} mb-2`}>
                                    {exp.icon}
                                  </div>
                                  <span
                                    className="text-sm font-semibold"
                                    style={{ color: colors.text.primary }}
                                  >
                                    {exp.label}
                                  </span>
                                  <span
                                    className="mt-1 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ color: colors.text.secondary }}
                                  >
                                    {active ? "Selected" : "Choose"}
                                  </span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Feedback Type */}
                        <div className="space-y-3">
                          <label
                            className="block text-sm sm:text-base font-semibold"
                            style={{ color: colors.text.primary }}
                          >
                            What type of feedback do you have?
                          </label>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {feedbackTypes.map((type) => {
                              const active = feedbackType === type.id;
                              return (
                                <motion.button
                                  key={type.id}
                                  type="button"
                                  onClick={() => setFeedbackType(type.id)}
                                  whileHover={{ y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer select-none ${
                                    active
                                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-[0_14px_30px_-18px_rgba(59,130,246,0.6)]"
                                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300 hover:shadow-[0_14px_30px_-22px_rgba(0,0,0,0.25)]"
                                  }`}
                                >
                                  <div className="mb-2">{type.icon}</div>
                                  <span
                                    className="text-sm font-semibold text-center leading-tight"
                                    style={{ color: colors.text.primary }}
                                  >
                                    {type.label}
                                  </span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Personal Details */}
                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label
                              className="block text-sm font-semibold"
                              style={{ color: colors.text.primary }}
                            >
                              Your Name
                            </label>
                            <motion.input
                              whileFocus={{ scale: 1.01 }}
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-2xl border outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 cursor-text"
                              style={{
                                borderColor: colors.border.light,
                                background: colors.background.paper,
                                color: colors.text.primary,
                              }}
                              placeholder="Enter your name"
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              className="block text-sm font-semibold"
                              style={{ color: colors.text.primary }}
                            >
                              Email Address
                            </label>
                            <motion.input
                              whileFocus={{ scale: 1.01 }}
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 rounded-2xl border outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 cursor-text"
                              style={{
                                borderColor: colors.border.light,
                                background: colors.background.paper,
                                color: colors.text.primary,
                              }}
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                          <label
                            className="block text-sm font-semibold"
                            style={{ color: colors.text.primary }}
                          >
                            Subject
                          </label>
                          <motion.input
                            whileFocus={{ scale: 1.01 }}
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-2xl border outline-none transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 cursor-text"
                            style={{
                              borderColor: colors.border.light,
                              background: colors.background.paper,
                              color: colors.text.primary,
                            }}
                            placeholder="Brief summary of your feedback"
                          />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                          <label
                            className="block text-sm font-semibold"
                            style={{ color: colors.text.primary }}
                          >
                            Your Feedback
                          </label>
                          <motion.textarea
                            whileFocus={{ scale: 1.01 }}
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows="6"
                            className="w-full px-4 py-3 rounded-2xl border outline-none resize-none transition-all duration-200 focus:ring-4 focus:ring-blue-500/20 cursor-text"
                            style={{
                              borderColor: colors.border.light,
                              background: colors.background.paper,
                              color: colors.text.primary,
                            }}
                            placeholder="Please share your detailed feedback, suggestions, or issues..."
                          />
                          <div className="flex items-center justify-between">
                            <p
                              className="text-xs"
                              style={{ color: colors.text.secondary }}
                            >
                              Tip: include steps to reproduce issues.
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: colors.text.secondary }}
                            >
                              {formData.message.length}/5000
                            </p>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-1">
                          <motion.button
                            type="submit"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="group w-full text-white px-6 py-4 rounded-2xl font-semibold shadow-[0_18px_45px_-20px_rgba(0,0,0,0.45)] hover:shadow-[0_20px_50px_-18px_rgba(0,0,0,0.55)] transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
                            style={{ background: colors.primary.gradient }}
                          >
                            <motion.span
                              initial={false}
                              animate={{ x: 0 }}
                              className="inline-flex items-center gap-3"
                            >
                              <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              Submit Feedback
                            </motion.span>
                          </motion.button>

                          <p
                            className="text-xs sm:text-sm text-center mt-3"
                            style={{ color: colors.text.secondary }}
                          >
                            We read every piece of feedback and respond to
                            important issues.
                          </p>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={item} className="space-y-6">
            {/* Testimonials */}
            <div
              className="rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] border border-black/5 dark:border-white/10 overflow-hidden"
              style={{ background: colors.background.paper }}
            >
              <div className="px-6 pt-6 pb-4 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-blue-600/10 flex items-center justify-center">
                    <Quote className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3
                      className="font-extrabold tracking-tight"
                      style={{ color: colors.text.primary }}
                    >
                      Recent Feedback
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: colors.text.secondary }}
                    >
                      What users are saying lately
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-black/5 dark:border-white/10 p-4 shadow-sm hover:shadow-[0_14px_30px_-20px_rgba(0,0,0,0.25)] transition-all duration-300"
                    style={{ background: colors.background.paper }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4
                          className="font-bold truncate"
                          style={{ color: colors.text.primary }}
                        >
                          {testimonial.name}
                        </h4>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: colors.text.tertiary }}
                        >
                          {testimonial.date}
                        </p>
                      </div>

                      <div className="flex items-center flex-shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p
                      className="text-sm mt-3 leading-relaxed"
                      style={{ color: colors.text.secondary }}
                    >
                      {testimonial.comment}
                    </p>

                    <div className="mt-4 flex justify-end">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold cursor-pointer select-none ${
                          testimonial.type === "suggestion"
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : testimonial.type === "feature"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {testimonial.type.charAt(0).toUpperCase() +
                          testimonial.type.slice(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div
              className="text-white rounded-2xl sm:rounded-3xl p-6 shadow-[0_16px_50px_-26px_rgba(0,0,0,0.55)] overflow-hidden relative"
              style={{ background: colors.primary.gradient }}
            >
              <div className="absolute inset-0">
                <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute inset-0 bg-black/10" />
              </div>

              <div className="relative">
                <h3 className="font-extrabold text-lg tracking-tight">
                  Feedback Impact
                </h3>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur-md">
                    <p
                      className="text-xs font-medium"
                      style={{ color: "black" }}
                    >
                      Feedback Received
                    </p>
                    <p className="mt-2 text-2xl font-extrabold">2,548</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur-md">
                    <p
                      className="text-xs font-medium"
                      style={{ color: "black" }}
                    >
                      Average Rating
                    </p>
                    <p className="mt-2 text-2xl font-extrabold inline-flex items-center gap-2">
                      4.7 <Star className="w-5 h-5 fill-current" />
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur-md">
                    <p
                      className="text-xs font-medium"
                      style={{ color: "black" }}
                    >
                      Suggestions Implemented
                    </p>
                    <p className="mt-2 text-2xl font-extrabold">187</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 border border-white/10 p-4 backdrop-blur-md">
                    <p
                      className="text-xs font-medium"
                      style={{ color: "black" }}
                    >
                      Response Time
                    </p>
                    <p className="mt-2 text-2xl font-extrabold">24-48 hrs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div
              className="rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] border border-black/5 dark:border-white/10 overflow-hidden"
              style={{ background: colors.background.paper }}
            >
              <div className="px-6 pt-6 pb-4 border-b border-black/5 dark:border-white/10">
                <h3
                  className="font-extrabold tracking-tight"
                  style={{ color: colors.text.primary }}
                >
                  Tips for Great Feedback
                </h3>
                <p
                  className="text-xs mt-1"
                  style={{ color: colors.text.secondary }}
                >
                  Quick ways to help us help you
                </p>
              </div>

              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span
                      className="text-sm leading-relaxed"
                      style={{ color: colors.text.secondary }}
                    >
                      Be specific about what you like or dislike
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      Include suggestions for improvement
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      Share your use case or scenario
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      Mention what worked well for you
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Why Feedback Matters */}
        <motion.div variants={item}>
          <div
            className="mt-10 sm:mt-12 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-black/5 dark:border-white/10 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]"
            style={{ background: colors.background.secondary }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2
                className="text-xl sm:text-2xl font-extrabold tracking-tight"
                style={{ color: colors.text.primary }}
              >
                Why Your Feedback Matters
              </h2>
              <p
                className="mt-3 text-sm sm:text-base"
                style={{ color: colors.text.secondary }}
              >
                We use your feedback to continuously improve LocalPro. Every
                suggestion helps us create a better experience for both
                customers and professionals.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-7 sm:mt-8">
                <motion.div
                  whileHover={{ y: -3 }}
                  className="rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 shadow-sm hover:shadow-[0_14px_30px_-20px_rgba(0,0,0,0.25)] transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4
                    className="font-extrabold"
                    style={{ color: colors.text.primary }}
                  >
                    Community Driven
                  </h4>
                  <p
                    className="text-sm mt-2"
                    style={{ color: colors.text.secondary }}
                  >
                    We build features based on what our users need most
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -3 }}
                  className="rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 shadow-sm hover:shadow-[0_14px_30px_-20px_rgba(0,0,0,0.25)] transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4
                    className="font-extrabold"
                    style={{ color: colors.text.primary }}
                  >
                    Continuous Improvement
                  </h4>
                  <p
                    className="text-sm mt-2"
                    style={{ color: colors.text.secondary }}
                  >
                    Regular updates based on user suggestions and feedback
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ y: -3 }}
                  className="rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 p-5 shadow-sm hover:shadow-[0_14px_30px_-20px_rgba(0,0,0,0.25)] transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4
                    className="font-extrabold"
                    style={{ color: colors.text.primary }}
                  >
                    Better Experience
                  </h4>
                  <p
                    className="text-sm mt-2"
                    style={{ color: colors.text.secondary }}
                  >
                    Your feedback helps us create a more user-friendly platform
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile bottom safe-area spacing (native-app feel) */}
        <div className="h-10 sm:h-0" />
      </motion.div>
    </div>
  );
};
