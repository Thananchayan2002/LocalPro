import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Briefcase, Calendar, MessageSquare, User } from "lucide-react";
import { useAnimations } from "../animations/animations";

function MobileNav() {
  const navigate = useNavigate();
  const { staggerContainer, staggerItem } = useAnimations();
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("user");
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener("storage", loadUser);
    return () => window.removeEventListener("storage", loadUser);
  }, []);

  const navItems = [
    { icon: Home, label: "Home", path: "/app" },
    { icon: Briefcase, label: "Services", path: "/app/services" },
    { icon: Calendar, label: "My Bookings", path: "/app/bookings" },
    { icon: MessageSquare, label: "Feedback", path: "/app/feedback" },
    { icon: User, label: "Profile", path: "/app/profile" },
  ];

  return (
    <nav
      className="
        fixed inset-x-0 bottom-0 z-50
        border-t border-gray-200 dark:border-gray-800
        bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
        lg:hidden
      "
      role="navigation"
      aria-label="Mobile navigation"
    >
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="
          mx-auto flex max-w-md
          items-center justify-between
          px-2 py-2
        "
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex flex-1 flex-col items-center justify-center
                gap-1
                rounded-xl
                px-2 py-2
                transition-colors duration-200
                cursor-pointer
                ${isActive ? "" : ""}
              `
              }
            >
              {({ isActive }) => (
                <motion.div
                  variants={staggerItem}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`
                      flex h-10 w-10 items-center justify-center
                      rounded-xl
                      transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span
                    className={`
                      text-xs font-medium
                      transition-colors
                      ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    `}
                  >
                    {item.label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          );
        })}
      </motion.div>
    </nav>
  );
}

export default MobileNav;
