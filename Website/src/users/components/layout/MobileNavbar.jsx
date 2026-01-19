import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Briefcase, MessageSquare, Users, Info } from "lucide-react";
import { useAnimations } from "../animations/animations";

const navItems = [
  { icon: Home, label: "Home", path: "/app" },
  { icon: Briefcase, label: "Services", path: "/app/services" },
  { icon: Users, label: "Professionals", path: "/app/professionals" },
  { icon: MessageSquare, label: "Feedback", path: "/app/feedback" },
  { icon: Info, label: "About", path: "/app/about" },
];

function MobileNavbar() {
  const { staggerContainer, staggerItem } = useAnimations();

  return (
    <nav
      role="navigation"
      aria-label="Mobile navigation"
      className="MobileNavbar
        fixed inset-x-0 bottom-0 z-50 lg:hidden
        border-t border-gray-200 dark:border-gray-800
        bg-white/95 dark:bg-gray-900/95 backdrop-blur
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <motion.ul
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="
          mx-auto flex max-w-md
          items-center justify-between
          px-2 py-2
        "
      >
        {navItems.map(({ icon: Icon, label, path }) => (
          <li key={path} className="flex-1">
            <NavLink
              to={path}
              className="group flex flex-col items-center gap-1 py-1"
            >
              {({ isActive }) => (
                <motion.div
                  variants={staggerItem}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`
                      flex h-11 w-11 items-center justify-center
                      rounded-2xl transition-all duration-200
                      ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-500 dark:text-gray-400 group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span
                    className={`
                      text-[11px] font-medium
                      ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      }
                    `}
                  >
                    {label}
                  </span>
                </motion.div>
              )}
            </NavLink>
          </li>
        ))}
      </motion.ul>
    </nav>
  );
}

export default MobileNavbar;
