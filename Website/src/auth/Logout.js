import { logout } from "../users/api/auth/auth";

export const performLogout = async () => {
  if (typeof window === "undefined") return;
  try {
    await logout();
  } catch (error) {
    // Ignore logout errors
    console.error("Logout error:", error);
  }
};
