import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  UserCog,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { API_BASE_URL } from "../../utils/api";

export const Account = () => {
  const { admin, updateProfile } = useAdminAuth();

  const [verifyForm, setVerifyForm] = useState({
    currentPhone: admin?.phone || "",
    currentPassword: "",
  });

  const [updatePhoneChecked, setUpdatePhoneChecked] = useState(false);

  const [newPhone, setNewPhone] = useState("");
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleVerifyChange = (e) => {
    setVerifyForm({ ...verifyForm, [e.target.name]: e.target.value });
  };

  const handlePasswordsChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const resetAll = () => {
    setVerified(false);
    setUpdatePhoneChecked(false);
    setNewPhone("");
    setPasswords({ newPassword: "", confirmPassword: "" });
    setVerifyForm({ currentPhone: admin?.phone || "", currentPassword: "" });
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/auth/verify-credentials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          phone: verifyForm.currentPhone.trim(),
          password: verifyForm.currentPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Verification failed");

      setVerified(true);
      // Use the verified phone from backend response to ensure exact match
      const verifiedPhone =
        data.phone || admin?.phone || verifyForm.currentPhone;
      setVerifyForm({ ...verifyForm, currentPhone: verifiedPhone });

      console.log("Verification successful! Verified phone:", verifiedPhone);

      toast.success("Credentials verified — choose what to update.", {
        icon: "✅",
        style: {
          borderRadius: "12px",
          background: "#10b981",
          color: "#fff",
          fontWeight: "600",
        },
        duration: 4000,
      });
    } catch (err) {
      setVerified(false);
      toast.error(err.message, {
        icon: "❌",
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff",
          fontWeight: "600",
        },
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Determine what the user wants to update
    const wantsPhone = updatePhoneChecked;
    const wantsPassword =
      passwords.newPassword && passwords.newPassword.trim() !== "";

    // Debug logging
    console.log("=== Phone Update Debug ===");
    console.log("admin.phone:", admin?.phone);
    console.log("verifyForm.currentPhone:", verifyForm.currentPhone);
    console.log("newPhone:", newPhone);
    console.log("wantsPhone:", wantsPhone);
    console.log("wantsPassword:", wantsPassword);

    // Require at least one change
    if (!wantsPhone && !wantsPassword) {
      toast.error("Select to update phone or provide a new password", {
        icon: "⚠️",
        style: {
          borderRadius: "12px",
          background: "#f59e0b",
          color: "#fff",
          fontWeight: "600",
        },
      });
      setLoading(false);
      return;
    }

    if (wantsPhone) {
      if (!newPhone) {
        toast.error("Enter new phone number", {
          icon: "⚠️",
          style: {
            borderRadius: "12px",
            background: "#f59e0b",
            color: "#fff",
            fontWeight: "600",
          },
        });
        setLoading(false);
        return;
      }
      if (newPhone === admin?.phone) {
        toast.error("New phone must be different from current phone", {
          icon: "⚠️",
          style: {
            borderRadius: "12px",
            background: "#f59e0b",
            color: "#fff",
            fontWeight: "600",
          },
        });
        setLoading(false);
        return;
      }
    }

    if (wantsPassword) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        toast.error("New passwords do not match", {
          icon: "⚠️",
          style: {
            borderRadius: "12px",
            background: "#f59e0b",
            color: "#fff",
            fontWeight: "600",
          },
        });
        setLoading(false);
        return;
      }
      if (passwords.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters", {
          icon: "⚠️",
          style: {
            borderRadius: "12px",
            background: "#f59e0b",
            color: "#fff",
            fontWeight: "600",
          },
        });
        setLoading(false);
        return;
      }
    }

    try {
      // Perform updates sequentially; abort on first failure and show message
      if (wantsPhone) {
        const phonePayload = {
          currentPhone: verifyForm.currentPhone.trim(),
          newPhone: newPhone.trim(),
          password: verifyForm.currentPassword,
        };

        console.log("Sending phone update payload:", phonePayload);

        const res = await fetch(`${API_BASE_URL}/api/admin/auth/update-phone`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(phonePayload),
        });

        const data = await res.json();
        console.log("Phone update response:", data);
        if (!res.ok) throw new Error(data.message || "Failed to update phone");

        // Update context admin
        const updatedAdmin = { ...admin, phone: data.user?.phone || newPhone };
        updateProfile(updatedAdmin);

        // CRITICAL: Update verifyForm.currentPhone to the new phone for subsequent password update
        const updatedPhone = data.user?.phone || newPhone.trim();
        setVerifyForm({ ...verifyForm, currentPhone: updatedPhone });
        console.log("Phone updated successfully. New phone:", updatedPhone);
      }

      if (wantsPassword) {
        // Use the latest phone (either newly updated or original verified phone)
        const currentPhoneForPasswordUpdate = wantsPhone
          ? newPhone.trim()
          : verifyForm.currentPhone.trim();

        console.log(
          "Updating password with currentPhone:",
          currentPhoneForPasswordUpdate
        );

        const res2 = await fetch(`${API_BASE_URL}/api/admin/auth/update-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPhone: currentPhoneForPasswordUpdate,
            currentPassword: verifyForm.currentPassword,
            newPassword: passwords.newPassword,
          }),
        });

        const data2 = await res2.json();
        console.log("Password update response:", data2);
        if (!res2.ok)
          throw new Error(data2.message || "Failed to update password");
      }

      toast.success("Updates applied successfully!", {
        icon: "🎉",
        style: {
          borderRadius: "12px",
          background: "#10b981",
          color: "#fff",
          fontWeight: "600",
        },
        duration: 4000,
      });
      resetAll();
    } catch (err) {
      toast.error(err.message, {
        icon: "❌",
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff",
          fontWeight: "600",
        },
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 lg:mt-8 min-h-screen flex items-center justify-center">
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          top: 80,
          right: 20,
        }}
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontWeight: "600",
          },
        }}
      />

      <div className="w-full max-w-3xl lg:max-w-2xl m-2 rounded-2xl bg-green-550">
        {/* Header */}
        <div className="text-center mb-8 mt-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            Account Settings
          </h1>
          <p className="hidden lg:block text-gray-600">
            Manage your email and password securely
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl shadow-xl p-4 lg:p-8 border border-gray-200 mb-12">
          {!verified ? (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-200">
                  <Info size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    Verify your identity first
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Phone Number
                </label>
                <input
                  type="tel"
                  name="currentPhone"
                  value={verifyForm.currentPhone}
                  onChange={handleVerifyChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                  placeholder={admin?.phone}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    name="currentPassword"
                    value={verifyForm.currentPassword}
                    onChange={handleVerifyChange}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                  >
                    {showPasswords.current ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? "Verifying..." : "Verify Credentials"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setVerifyForm({
                      currentPhone: admin?.phone || "",
                      currentPassword: "",
                    })
                  }
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all font-semibold text-gray-700"
                >
                  Reset
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-200">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Verified — Choose what to update
                  </span>
                </div>
              </div>

              {/* Phone Update Section */}
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <input
                    id="updPhone"
                    type="checkbox"
                    checked={updatePhoneChecked}
                    onChange={(e) => setUpdatePhoneChecked(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                  />
                  <label
                    htmlFor="updPhone"
                    className="font-semibold text-gray-800 cursor-pointer"
                  >
                    Update Phone Number
                  </label>
                </div>

                {updatePhoneChecked && (
                  <div className="mt-3 animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Phone Number
                    </label>
                    <input
                      type="tel"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                      placeholder="9876543210"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Password Update Section */}
              <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <div className="mb-3">
                  <label className="font-semibold text-gray-800">
                    Update Password{" "}
                    <span className="text-sm font-normal text-gray-500">
                      (optional)
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handlePasswordsChange}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            new: !showPasswords.new,
                          })
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                      >
                        {showPasswords.new ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordsChange}
                        className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords({
                            ...showPasswords,
                            confirm: !showPasswords.confirm,
                          })
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? "Applying Changes..." : "Apply Changes"}
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all font-semibold text-gray-700 hover:text-red-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
