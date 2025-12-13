"use client";
import React, { useState } from "react";
import {
  Mail,
  User,
  Key,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Username & Email, 2: MFA OTP, 3: New Password
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMFARequired, setIsMFARequired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitUsernameEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call to check if MFA is required
    setTimeout(() => {
      setIsLoading(false);
      setIsMFARequired(true); // Change this based on actual MFA requirement
      setStep(2);
    }, 1500);
  };

  const handleSubmitOTP = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
    }, 1000);
  };

  const handleSubmitNewPassword = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Password validation
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords don't match!");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      alert("Password must be at least 8 characters!");
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      alert(
        "Password reset successful! You can now login with your new password."
      );
      // Redirect to login page
    }, 1500);
  };

  const handleResendOTP = () => {
    // Logic to resend OTP
    alert("New OTP has been sent to your registered email!");
  };

  const passwordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        <div className="flex items-center">
          {/* Step 1 */}
          <div
            className={`flex items-center ${
              step >= 1 ? "text-teal-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1
                  ? "bg-teal-100 border-2 border-teal-500"
                  : "bg-gray-100 border-2 border-gray-300"
              }`}
            >
              {step > 1 ? <CheckCircle className="w-5 h-5" /> : <span>1</span>}
            </div>
            <span className="ml-2 font-medium">Account Info</span>
          </div>

          <div
            className={`w-16 h-1 mx-4 ${
              step >= 2 ? "bg-teal-500" : "bg-gray-300"
            }`}
          ></div>

          {/* Step 2 */}
          <div
            className={`flex items-center ${
              step >= 2 ? "text-teal-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2
                  ? "bg-teal-100 border-2 border-teal-500"
                  : "bg-gray-100 border-2 border-gray-300"
              }`}
            >
              {step > 2 ? <CheckCircle className="w-5 h-5" /> : <span>2</span>}
            </div>
            <span className="ml-2 font-medium">Verification</span>
          </div>

          <div
            className={`w-16 h-1 mx-4 ${
              step >= 3 ? "bg-teal-500" : "bg-gray-300"
            }`}
          ></div>

          {/* Step 3 */}
          <div
            className={`flex items-center ${
              step >= 3 ? "text-teal-600" : "text-gray-400"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3
                  ? "bg-teal-100 border-2 border-teal-500"
                  : "bg-gray-100 border-2 border-gray-300"
              }`}
            >
              <span>3</span>
            </div>
            <span className="ml-2 font-medium">New Password</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-teal-900 mb-2">
            Reset Password
          </h1>
          <p className="text-teal-700">
            Follow the steps to reset your password
          </p>
        </div>

        {/* Progress Steps */}
        {renderStepIndicator()}

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl border border-teal-100 p-6 md:p-8">
          {/* Step 1: Username & Email */}
          {step === 1 && (
            <form onSubmit={handleSubmitUsernameEmail}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-teal-900 mb-2">
                    <User className="inline w-4 h-4 mr-1" />
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-11 bg-teal-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      placeholder="Enter your username"
                      required
                    />
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-900 mb-2">
                    <Mail className="inline w-4 h-4 mr-1" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-11 bg-teal-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 px-4 rounded-xl font-medium hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="animate-spin w-5 h-5 mr-2" />
                      Checking...
                    </span>
                  ) : (
                    "Continue to Verification"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: MFA OTP */}
          {step === 2 && (
            <form onSubmit={handleSubmitOTP}>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-teal-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-teal-900 mb-2">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-teal-700 text-sm">
                    {isMFARequired
                      ? "Enter the 6-digit code from your authenticator app"
                      : "A verification code has been sent to your email"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-900 mb-2">
                    {isMFARequired ? "Authenticator Code" : "Verification Code"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      maxLength="6"
                      className="w-full px-4 py-3 text-center text-2xl font-mono bg-teal-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all tracking-widest"
                      placeholder="000000"
                      required
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center"
                    >
                      ← Back
                    </button>
                    {!isMFARequired && (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Resend Code
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || formData.otp.length !== 6}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 px-4 rounded-xl font-medium hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <RefreshCw className="animate-spin w-5 h-5 mr-2" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify & Continue"
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleSubmitNewPassword}>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key className="w-6 h-6 text-teal-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-teal-900 mb-2">
                    Create New Password
                  </h2>
                  <p className="text-teal-700 text-sm">
                    Your new password must be different from previous passwords
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-900 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-11 bg-teal-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      placeholder="Enter new password"
                      required
                    />
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-500 hover:text-teal-700"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-teal-700">
                          Password strength
                        </span>
                        <span className="text-sm font-medium text-teal-600">
                          {passwordStrength(formData.newPassword)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordStrength(formData.newPassword) >= 75
                              ? "bg-green-500"
                              : passwordStrength(formData.newPassword) >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${passwordStrength(formData.newPassword)}%`,
                          }}
                        ></div>
                      </div>
                      <ul className="mt-2 text-xs text-teal-700 space-y-1">
                        <li
                          className={`flex items-center ${
                            formData.newPassword.length >= 8
                              ? "text-green-600"
                              : ""
                          }`}
                        >
                          {formData.newPassword.length >= 8 ? "✓" : "○"} At
                          least 8 characters
                        </li>
                        <li
                          className={`flex items-center ${
                            /[A-Z]/.test(formData.newPassword)
                              ? "text-green-600"
                              : ""
                          }`}
                        >
                          {/[A-Z]/.test(formData.newPassword) ? "✓" : "○"} One
                          uppercase letter
                        </li>
                        <li
                          className={`flex items-center ${
                            /[0-9]/.test(formData.newPassword)
                              ? "text-green-600"
                              : ""
                          }`}
                        >
                          {/[0-9]/.test(formData.newPassword) ? "✓" : "○"} One
                          number
                        </li>
                        <li
                          className={`flex items-center ${
                            /[^A-Za-z0-9]/.test(formData.newPassword)
                              ? "text-green-600"
                              : ""
                          }`}
                        >
                          {/[^A-Za-z0-9]/.test(formData.newPassword)
                            ? "✓"
                            : "○"}{" "}
                          One special character
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-teal-900 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-11 bg-teal-50 border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                      required
                    />
                    <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-teal-500 w-5 h-5" />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-500 hover:text-teal-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="mt-2">
                      <div
                        className={`flex items-center text-sm ${
                          formData.newPassword === formData.confirmPassword
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formData.newPassword === formData.confirmPassword ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Passwords match
                          </>
                        ) : (
                          <>
                            <div className="w-4 h-4 rounded-full border-2 border-red-600 mr-1 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            </div>
                            Passwords do not match
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-teal-600 hover:text-teal-800 font-medium flex items-center"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      formData.newPassword !== formData.confirmPassword ||
                      formData.newPassword.length < 8
                    }
                    className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 px-8 rounded-xl font-medium hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <RefreshCw className="animate-spin w-5 h-5 mr-2" />
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <p className="text-teal-700">
            Remember your password?{" "}
            <a
              href="/"
              className="text-teal-600 hover:text-teal-800 font-semibold"
            >
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
