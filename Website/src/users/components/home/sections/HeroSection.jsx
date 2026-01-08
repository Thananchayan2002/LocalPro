import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  Sparkles,
  Star,
  ThumbsUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useAnimations } from "../../animations/animations";

const HeroSection = ({
  searchQuery,
  setSearchQuery,
  bannerImg,
  setShowBookingModal,
  setShowProfessionalModal,
}) => {
  const { staggerContainer, staggerItem, fadeInRight, animate } =
    useAnimations();

  return (
    <section className="relative overflow-hidden bg-background">
      {/* Decorative background accents */}
      <div className="pointer-events-none absolute -top-32 right-[-6rem] h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 left-[-6rem] h-72 w-72 rounded-full bg-accent/20 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:py-7 lg:py-10 mt-20 sm:mt-24 lg:mt-24">
        <div className="flex flex-col items-center gap-14 lg:flex-row lg:items-center lg:gap-20">
          {/* LEFT CONTENT */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={animate}
            className="w-full lg:w-1/2 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              variants={staggerItem}
              className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-2 lg:mx-0"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                Trusted by 50,000+ customers
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={staggerItem}
              className="mb-6 text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-6xl"
            >
              Find Trusted Local Pros Near You
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={staggerItem}
              className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0"
            >
              Book verified electricians, plumbers, cleaners, and more in
              minutes. Quality service guaranteed.
            </motion.p>

            {/* Desktop Search */}
            <motion.div
              variants={staggerItem}
              className="mb-10 hidden sm:block"
            >
              <div className="flex items-center gap-2 rounded-2xl bg-card p-2 shadow-md transition-shadow hover:shadow-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 w-full rounded-xl bg-transparent pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <button className="h-12 cursor-pointer rounded-xl bg-primary px-6 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-95">
                  Search
                </button>
              </div>
            </motion.div>

            {/* Desktop CTA Buttons */}
            <motion.div
              variants={staggerItem}
              className="mb-10 hidden sm:flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={() => setShowBookingModal && setShowBookingModal(true)}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                Book a Service Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() =>
                  setShowProfessionalModal && setShowProfessionalModal(true)
                }
                className="bg-card border-2 border-border text-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:border-primary transition-all duration-300 cursor-pointer"
              >
                Become a Professional
              </button>
            </motion.div>

            {/* Mobile CTA */}
            <motion.div variants={staggerItem} className="sm:hidden">
              <button
                onClick={() => setShowBookingModal && setShowBookingModal(true)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-95"
              >
                Book a Service Now
                <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={staggerContainer}
              className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4"
            >
              {[
                { icon: Users, value: "50K+", label: "Happy Customers" },
                { icon: UserCheck, value: "2K+", label: "Skilled Pros" },
                { icon: ThumbsUp, value: "98%", label: "Satisfaction" },
                { icon: Star, value: "4.8", label: "Avg Rating" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={staggerItem}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl bg-card p-4 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-center gap-2">
                    <stat.icon className="h-5 w-5 text-primary" />
                    <span className="text-xl font-bold text-foreground sm:text-2xl">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT IMAGE */}
          <motion.div
            variants={fadeInRight}
            initial="hidden"
            animate={animate}
            className="flex w-full justify-center lg:w-1/2 lg:justify-end"
          >
            <motion.img
              src={bannerImg}
              alt="Local service professionals"
              loading="lazy"
              decoding="async"
              width="640"
              height="640"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg rounded-3xl object-cover shadow-xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
