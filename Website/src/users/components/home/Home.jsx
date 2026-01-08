import { useEffect, useState } from "react";
import HeroSection from "./sections/HeroSection";
import AnimatedSection from "../animations/AnimatedSection";
import EmergencyServicesSection from "./sections/EmergencyServicesSection";
import PopularServicesSection from "./sections/PopularServicesSection";
import TrendingSection from "./sections/TrendingSection";
import FeaturedProfessionalsSection from "./sections/FeaturedProfessionalsSection";
import HowItWorksSection from "./sections/HowItWorksSection";
import WhyChooseSection from "./sections/WhyChooseSection";
import TestimonialsSection from "./sections/TestimonialsSection";
import CTASection from "./sections/CTASection";
import BookService from "../bookService/BookService";
import RegisterProfessional from "../professionalRegister/RegisterProfessional";

import {
  assets,
  categories,
  emergencyServices,
  featuredWorkers,
  features,
  popularRequests,
  steps,
  testimonials,
} from "./data/homeData";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfessionalModal, setShowProfessionalModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredWorkers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        bannerImg={assets.bannerImg}
        setShowBookingModal={setShowBookingModal}
        setShowProfessionalModal={setShowProfessionalModal}
      />

      <AnimatedSection>
        <EmergencyServicesSection services={emergencyServices} />
      </AnimatedSection>

      <AnimatedSection>
        <PopularServicesSection categories={categories} />
      </AnimatedSection>

      <AnimatedSection>
        <TrendingSection popularRequests={popularRequests} />
      </AnimatedSection>

      <AnimatedSection>
        <FeaturedProfessionalsSection
          featuredWorkers={featuredWorkers}
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
        />
      </AnimatedSection>

      <AnimatedSection>
        <HowItWorksSection steps={steps} />
      </AnimatedSection>

      <AnimatedSection>
        <WhyChooseSection features={features} />
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
        onClose={() => setShowBookingModal(false)}
      />
      <RegisterProfessional
        isOpen={showProfessionalModal}
        onClose={() => setShowProfessionalModal(false)}
      />

      <div className="h-8 lg:h-12" />
    </div>
  );
}
