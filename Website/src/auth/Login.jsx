import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import aboutBanner from "../assets/images/landing-bg-1.png";
import PhoneAuth from "./PhoneAuth";
import MobileLogin from "./MobileLogin";
import { useAuth } from "../worker/context/AuthContext";
import { useTypewriter } from "../hooks/useTypewriter";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );
  const { displayText } = useTypewriter("Welcome to", 80, 200);
  const { displayText: subtitleText } = useTypewriter(
    "To continue, enter your phone number",
    50,
    1400
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { setAuthData } = useAuth();
  // Handle phone verification success
  const handlePhoneVerified = async ({ phoneE164, userExists, user }) => {
    if (!userExists) {
      // Fallback: attempt login API once before redirecting to signup
      const fallback = await loginExistingUser(phoneE164, false); // don't show toast in helper
      if (fallback) {
        const existingUser = fallback.user;

        // Professional routing
        if (existingUser?.role === "professional") {
          if (existingUser?.status === "active") {
            toast.success("Login successful!");
            navigate("/worker/dashboard", { replace: true });
            return;
          } else {
            toast.error(
              existingUser?.status
                ? `Account status: ${existingUser.status}`
                : "Account not active."
            );
            return;
          }
        }

        // Non-professional: persist and go to app
        toast.success("Login successful!");
        navigate("/app");
        return;
      }

      // No account found, navigate to signup
      toast.success("Phone verified! Please complete your profile.");
      navigate("/signup", {
        state: { phoneNumber: phoneE164, phoneVerified: true },
      });
      return;
    }

    // User exists — prefer user/token returned from OTP verify, otherwise call login API
    let existingUser = user || null;

    if (!existingUser) {
      const res = await loginExistingUser(phoneE164, false); // don't show toast in helper
      if (!res) return; // helper already showed errors
      existingUser = res.user;
    }

    // Ensure session is persisted via AuthContext
    setAuthData(existingUser);
    localStorage.setItem("userPhone", phoneE164);
    localStorage.setItem("phone_verified", "true");

    // If professional and active, route to worker dashboard
    if (existingUser?.role === "professional") {
      if (existingUser?.status === "active") {
        toast.success("Login successful!");
        navigate("/worker/dashboard", { replace: true });
        return;
      } else {
        // Account not active/blocked/denied
        toast.error(
          existingUser?.status
            ? `Account status: ${existingUser.status}`
            : "Account not active."
        );
        return;
      }
    }

    // Regular user - navigate to app
    toast.success("Login successful!");
    navigate("/app");
  };

  if (isMobile) {
    return <MobileLogin />;
  }

  // Login existing user (returns { token, user } or null on failure)
  const loginExistingUser = async (phoneE164, showToast = true) => {
    try {
      const controller = new AbortController();
      const res = await fetch(`${API_BASE_URL}/api/auth/login-with-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneE164 }),
        credentials: "include",
        signal: controller.signal,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Persist session via AuthContext
        setAuthData(data.user);
        localStorage.setItem("userPhone", phoneE164);
        localStorage.setItem("phone_verified", "true");

        return { user: data.user };
      } else {
        if (showToast) {
          toast.error(data.message || "Login failed");
        }
        return null;
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Login error:", error);
        if (showToast) {
          toast.error("Network error. Please try again.");
        }
      }
      return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-row bg-slate-50">
      <div className="hidden md:block flex-1 relative">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('${aboutBanner}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-purple-100/70 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1">
              <span>{displayText}</span>
              <span>
                <span style={{ color: "#0f64c8" }}>Help</span>
                <span style={{ color: "#1fa34a" }}>Go</span>
              </span>
            </h1>
            <p className="text-gray-600 mt-1">{subtitleText}</p>
          </div>

          {/* PhoneAuth Component */}
          <PhoneAuth
            initialCountryDial="+94"
            onVerified={handlePhoneVerified}
            variant="login"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
