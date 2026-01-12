import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import aboutBanner from "../assets/images/aboutBanner.png";
import PhoneAuth from "./PhoneAuth";
import MobileLogin from "./MobileLogin";
import { useAuth } from "../worker/context/AuthContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Login = () => {
  const navigate = useNavigate(); 
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { setAuthData } = useAuth();
  // Handle phone verification success
  const handlePhoneVerified = async ({ phoneE164, userExists, user, token }) => {
    if (!userExists) {
      // Fallback: attempt login API once before redirecting to signup
      const fallback = await loginExistingUser(phoneE164);
      if (fallback) {
        const existingUser = fallback.user;
        const existingToken = fallback.token;

        // Professional routing
        if (existingUser?.role === "professional") {
          if (existingUser?.status === "active") {
            setAuthData(existingToken, existingUser);
            localStorage.setItem("userPhone", phoneE164);
            localStorage.setItem("phone_verified", "true");
            toast.success("Login successful!");
            navigate("/worker/dashboard", { replace: true });
            return;
          } else {
            toast.error(existingUser?.status ? `Account status: ${existingUser.status}` : "Account not active.");
            return;
          }
        }

        // Non-professional: persist and go to app
        setAuthData(existingToken, existingUser);
        localStorage.setItem("userPhone", phoneE164);
        localStorage.setItem("phone_verified", "true");
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
    let existingToken = token || null;

    if (!existingUser) {
      const res = await loginExistingUser(phoneE164);
      if (!res) return; // helper already showed errors
      existingUser = res.user;
      existingToken = res.token;
    }

    // If professional and active, route to worker dashboard
    if (existingUser?.role === "professional") {
      if (existingUser?.status === "active") {
        // Ensure session is persisted via AuthContext
        if (existingToken && existingUser) {
          setAuthData(existingToken, existingUser);
          localStorage.setItem("userPhone", phoneE164);
          localStorage.setItem("phone_verified", "true");
        }
        toast.success("Login successful!");
        navigate("/worker/dashboard", { replace: true });
        return;
      } else {
        // Account not active/blocked/denied
        toast.error(existingUser?.status ? `Account status: ${existingUser.status}` : "Account not active.");
        return;
      }
    }

    // Not a professional — ensure session then go to app
    if (!existingToken || !existingUser) {
      const res = await loginExistingUser(phoneE164);
      if (!res) return;
      existingToken = res.token;
      existingUser = res.user;
    }

    // Persist session through AuthContext
    setAuthData(existingToken, existingUser);
    toast.success("Login successful!");
    navigate("/app");
  };

  if (isMobile) {
    return <MobileLogin />;
  }

  // Login existing user (returns { token, user } or null on failure)
  const loginExistingUser = async (phoneE164) => {
    try {
      const controller = new AbortController();
      const res = await fetch(`${API_BASE_URL}/api/auth/login-with-phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneE164 }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Persist session via AuthContext
        setAuthData(data.token, data.user);
        localStorage.setItem("userPhone", phoneE164);
        localStorage.setItem("phone_verified", "true");

        return { token: data.token, user: data.user };
      } else {
        toast.error(data.message || "Login failed");
        return null;
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Login error:", error);
        toast.error("Network error. Please try again.");
      }
      return null;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15)), url('${aboutBanner}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        backgroundColor: "rgb(240, 249, 255)",
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-purple-100/70 p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 mb-3">
            <Lock size={22} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to HelpGo
          </h1>
          <p className="text-gray-600 mt-1">
            To continue, enter your phone number
          </p>
        </div>

        {/* PhoneAuth Component */}
        <PhoneAuth
          initialCountryDial="+94"
          onVerified={handlePhoneVerified}
          variant="login"
        />
      </div>
    </div>
  );
};

export default Login;
