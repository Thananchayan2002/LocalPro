import { logout } from "../../api/auth/auth";
import toast from "react-hot-toast";

export const performLogout = async () => {
  if (typeof window === "undefined") return false;

  try {
    await logout();
    toast.success("Logged out successfully");
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Logout failed. Please try again.");
    return false;
  }
};
