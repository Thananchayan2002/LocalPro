import React, { useState } from "react";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
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

    // Show success message
    setSubmitted(true);

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
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm mb-6">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">We Value Your Opinion</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Share Your{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Feedback
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              Help us improve LocalPro. Your feedback is important to make our
              platform better for everyone.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 lg:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Thank You for Your Feedback!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We appreciate you taking the time to share your thoughts
                    with us.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Share Your Thoughts
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Overall Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        How would you rate our website?
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1"
                          >
                            <Star
                              className={`w-10 h-10 transition-colors ${
                                (hoverRating || rating) >= star
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">
                          {rating > 0 ? `${rating}/5` : "Select rating"}
                        </span>
                      </div>
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        How was your overall experience?
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {experiences.map((exp) => (
                          <button
                            key={exp.id}
                            type="button"
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                experience: exp.id,
                              }))
                            }
                            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                              formData.experience === exp.id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                            }`}
                          >
                            <div className={`${exp.color} mb-2`}>
                              {exp.icon}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {exp.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        What type of feedback do you have?
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {feedbackTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFeedbackType(type.id)}
                            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 ${
                              feedbackType === type.id
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <div className="mb-2">{type.icon}</div>
                            <span className="text-sm font-medium">
                              {type.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Personal Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief summary of your feedback"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Your Feedback
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows="6"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Please share your detailed feedback, suggestions, or issues..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
                      >
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        Submit Feedback
                      </button>
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                        We read every piece of feedback and respond to important
                        issues.
                      </p>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Testimonials */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Quote className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Recent Feedback
                </h3>
              </div>

              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <div className="flex items-center">
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {testimonial.comment}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {testimonial.date}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
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
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Feedback Impact</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Feedback Received</span>
                  <span className="font-bold">2,548</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Average Rating</span>
                  <span className="font-bold flex items-center">
                    4.7 <Star className="w-4 h-4 fill-current ml-1" />
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Suggestions Implemented</span>
                  <span className="font-bold">187</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-100">Response Time</span>
                  <span className="font-bold">24-48 hrs</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                Tips for Great Feedback
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Be specific about what you like or dislike
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Include suggestions for improvement
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Share your use case or scenario
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Mention what worked well for you
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Why Feedback Matters */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why Your Feedback Matters
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We use your feedback to continuously improve LocalPro. Every
              suggestion helps us create a better experience for both customers
              and professionals.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  Community Driven
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  We build features based on what our users need most
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ThumbsUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  Continuous Improvement
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Regular updates based on user suggestions and feedback
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  Better Experience
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Your feedback helps us create a more user-friendly platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
