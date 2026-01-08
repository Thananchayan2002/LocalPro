import React, { useState } from "react";
import Header from "./Header";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";
import MobileNav from "./MobileNav";

// Add CSS for hiding mobile components when BookService or IssuesModal is open
const styles = `
  body.bookservice-mobile-open .lg\\:hidden,
  body.issuesmodal-mobile-open .lg\\:hidden {
    display: none !important;
  }
`;

export const Layout = () => {
  const [activeTab, setActiveTab] = useState("home");
  return (
    <>
      <style>{styles}</style>
      <div className="overflow-x-hidden">
        <Header />
        <main className="relative z-1 min-h-screen pb-24 lg:pb-0">
          <Outlet />
        </main>
        <footer className="hidden md:block">
          <Footer />
        </footer>
        <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </>
  );
};
