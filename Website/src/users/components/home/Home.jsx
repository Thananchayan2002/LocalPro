import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import HeroSection from "./sections/HeroSection";
import AnimatedSection from "../animations/AnimatedSection";
import PopularServicesSection from "./sections/PopularServicesSection";
import WhyChooseAndHowItWorksSection from "./sections/WhyChooseAndHowItWorksSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import CTASection from "./sections/CTASection";
import BookService from "../bookService/BookService";
import RegisterProfessional from "../professionalRegister/RegisterProfessional";

import {
  assets,
  categories,
  featuredWorkers,
  features,
  steps,
  testimonials,
} from "./data/homeData";

export const Home = () => {
  const location = useLocation();
  const heroRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);
  const [initialService, setInitialService] = useState(null);
  const [initialIssueName, setInitialIssueName] = useState("");

  const handleStartBooking = (service) => {
    setInitialService(service || null);
    setShowBookingModal(true);
  };

  // Open booking modal if navigated with state from Services (IssuesModal)
  useEffect(() => {
    const state = location.state;
    if (state && state.bookService) {
      const svc = state.bookService.service;
      const issue = state.bookService.issueName || "";
      // Normalize and open modal
      setInitialService(svc || null);
      setInitialIssueName(issue);
      setShowBookingModal(true);
      // Clear the state so repeated renders don't reopen
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredWorkers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen text-foreground overflow-x-hidden">
      <div ref={heroRef}>
        <HeroSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          bannerImg={assets.bannerImg}
          categories={categories}
          onStartBooking={handleStartBooking}
          setShowProfessionalModal={setShowProfessionalModal}
        />
      </div>

      <AnimatedSection>
        <PopularServicesSection
          categories={categories}
          onStartBooking={handleStartBooking}
        />
      </AnimatedSection>

      <AnimatedSection>
        <WhyChooseAndHowItWorksSection
          steps={steps}
          features={features}
          heroRef={heroRef}
        />
      </AnimatedSection>

      <AnimatedSection>
        <TestimonialsSection
          testimonials={testimonials}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      </AnimatedSection>

      <AnimatedSection>
        <CTASection setShowBookingModal={setShowBookingModal} />
      </AnimatedSection>

      {/* Modals */}
      <BookService
        isOpen={showBookingModal}
        initialService={initialService}
        initialIssueName={initialIssueName}
        onClose={() => {
          setShowBookingModal(false);
          setInitialService(null);
          setInitialIssueName("");
        }}
      />
      <RegisterProfessional
        isOpen={showProfessionalModal}
        onClose={() => setShowProfessionalModal(false)}
      />

      <div className="h-8 lg:h-12" />
    </div>
  );
};
