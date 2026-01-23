import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";
import MobileNavbar from "./MobileNavbar";

// Add CSS for hiding mobile components when BookService or IssuesModal is open
const styles = `
  body.bookservice-mobile-open .lg\\:hidden,
  body.issuesmodal-mobile-open .lg\\:hidden {
    display: none !important;
  }
`;

export const Layout = () => {
  const [activeTab, setActiveTab] = useState("home");
  // Hide header and mobile navbar if RegisterProfessional modal is open
  const [modalOpen, setModalOpen] = useState(
    typeof window !== "undefined" &&
      document.body.classList.contains("modal-open"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setModalOpen(document.body.classList.contains("modal-open"));
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const hideHeaderAndNavbar = modalOpen;
  return (
    <>
      <style>{styles}</style>
      <div className="min-h-screen">
        {!hideHeaderAndNavbar && <Header />}
        <main className="relative z-1 min-h-screen pb-24 lg:pb-0">
          <Outlet />
        </main>
        <footer className="hidden md:block">
          <Footer />
        </footer>
        {!hideHeaderAndNavbar && (
          <MobileNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </div>
    </>
  );
};
