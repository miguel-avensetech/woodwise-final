"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/auth.module.css";

type Step = "email" | "verify" | "reset" | "success";

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentCode, setSentCode] = useState("");
  const router = useRouter();

  // Step 1: Send verification code to email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setSentCode(code);

      // Send code via API
      const response = await fetch("/api/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send verification code");
      }

      // Show success message
      setSuccess(`A 6-digit verification code has been sent to ${email}`);
      
      // Wait 2 seconds to show success message, then proceed
      setTimeout(() => {
        setStep("verify");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to send verification code. Please try again.");
      setLoading(false);
    }
  };

  // Step 2: Verify code
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(false); // Reset loading state

    if (verificationCode === sentCode) {
      setStep("reset");
      setError(""); // Clear any previous errors
    } else {
      setError("Invalid verification code. Please try again.");
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reset password");
      }

      setStep("success");
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/signin");
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logoContainer}>
          <Link href="/">
            <img 
              src="/assets/images/woodwise-logo.png" 
              alt="WoodWise Logo" 
              className={styles.logo}
            />
          </Link>
        </div>

        {/* Step 1: Enter Email */}
        {step === "email" && (
          <>
            <h1 className={styles.title}>Forgot Password?</h1>
            <p className={styles.subtitle}>Enter your email to receive a verification code</p>

            <form onSubmit={handleSendCode} className={styles.form}>
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              {success && (
                <div className={styles.successMessage}>
                  {success}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton} 
                disabled={loading}
              >
                {loading ? "Sending Code..." : "Send Verification Code"}
              </button>
            </form>

            <Link href="/signin" className={styles.backLink}>
              ← Back to Sign In
            </Link>
          </>
        )}

        {/* Step 2: Verify Code */}
        {step === "verify" && (
          <>
            <h1 className={styles.title}>Verify Your Email</h1>
            <p className={styles.subtitle}>
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            
            <div className={styles.infoMessage}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>
                A 6-digit verification code has been sent to <strong>{email}</strong>. Please check your email inbox.
              </span>
            </div>

            <form onSubmit={handleVerifyCode} className={styles.form}>
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label htmlFor="code" className={styles.label}>
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={styles.input}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
              >
                Verify Code
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className={styles.secondaryButton}
              >
                Resend Code
              </button>
            </form>
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === "reset" && (
          <>
            <h1 className={styles.title}>Create New Password</h1>
            <p className={styles.subtitle}>Enter your new password</p>

            <form onSubmit={handleResetPassword} className={styles.form}>
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              <div className={styles.inputGroup}>
                <label htmlFor="newPassword" className={styles.label}>
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton} 
                disabled={loading}
              >
                {loading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <>
            <div className={styles.successIcon}>
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <h1 className={styles.title}>Password Reset Successful!</h1>
            <p className={styles.subtitle}>
              Your password has been successfully reset. You can now sign in with your new password.
            </p>

            <button 
              onClick={handleBackToLogin}
              className={styles.submitButton}
            >
              Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
}
