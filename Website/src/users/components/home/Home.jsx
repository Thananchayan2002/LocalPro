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
import { getFeaturedFeedback } from "../../api/feedback/feedback";

import {
  assets,
  categories,
  featuredWorkers,
  features,
  steps,
  testimonials as defaultTestimonials, 
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
  const [testimonials, setTestimonials] = useState(defaultTestimonials);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);

  const handleStartBooking = (service) => {
    // If service is an object, extract the service name string
    const serviceName = service && typeof service === 'object' ? service.service : service;
    setInitialService(serviceName || null);
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

  // Fetch testimonials from API
  useEffect(() => {
    const loadTestimonials = async () => {
      setTestimonialsLoading(true);
      try {
        const data = await getFeaturedFeedback(6);
        console.log("📊 FETCHED TESTIMONIALS:", data.length, "testimonials");
        data.forEach((t, i) => {
          console.log(`  [${i}] ${t.name} - ${t.rating}⭐ - "${t.comment?.substring(0, 30)}..."`);
        });
        if (data && data.length > 0) {
          setTestimonials(data);
          setCurrentIndex(0); // Reset index when testimonials change
        }
      } catch (error) {
        console.error("Failed to load testimonials:", error);
        // Use default testimonials on error
        setTestimonials(defaultTestimonials);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  useEffect(() => {
    if (!testimonials || testimonials.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        return next >= testimonials.length ? 0 : next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials]);

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
          isLoading={testimonialsLoading}
        />
      </AnimatedSection>

      <AnimatedSection>
        <CTASection setShowBookingModal={setShowBookingModal} setShowRegisterModal={setShowProfessionalModal} />
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
