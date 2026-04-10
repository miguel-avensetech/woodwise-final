"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Sidebar from "@/components/layout/Sidebar";
import Modal from "@/components/Modal";
import styles from "@/styles/settings/settings.module.css";

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Account Settings
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Password Change
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Notifications
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  
  // Appearance
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  
  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setFullName(currentUser.displayName || "");
        setEmail(currentUser.email || "");
        setLoading(false);
      } else {
        router.push("/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateName = async () => {
    if (!user || !fullName.trim()) {
      setErrorMessage("Please enter a valid name");
      setShowErrorModal(true);
      return;
    }

    try {
      await updateProfile(user, {
        displayName: fullName
      });
      setSuccessMessage("Name updated successfully!");
      setShowSuccessModal(true);
      setIsEditingName(false);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to update name");
      setShowErrorModal(true);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user || !email.trim()) {
      setErrorMessage("Please enter a valid email");
      setShowErrorModal(true);
      return;
    }

    try {
      await updateEmail(user, email);
      setSuccessMessage("Email updated successfully! Please verify your new email.");
      setShowSuccessModal(true);
      setIsEditingEmail(false);
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setErrorMessage("Please sign out and sign in again before changing your email");
      } else {
        setErrorMessage(error.message || "Failed to update email");
      }
      setShowErrorModal(true);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      setShowErrorModal(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setShowErrorModal(true);
      return;
    }

    try {
      await updatePassword(user, newPassword);
      setSuccessMessage("Password changed successfully!");
      setShowSuccessModal(true);
      setIsChangingPassword(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setErrorMessage("Please sign out and sign in again before changing your password");
      } else {
        setErrorMessage(error.message || "Failed to change password");
      }
      setShowErrorModal(true);
    }
  };

  if (loading) {
    return (
      <div className={styles.settingsContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.settingsContainer}>
      <Sidebar />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header Banner */}
        <div className={styles.headerBanner}>
          <h1 className={styles.bannerTitle}>Settings</h1>
          <p className={styles.bannerSubtitle}>Manage your account and preferences</p>
        </div>

        {/* Settings Grid - 2x2 Layout */}
        <div className={styles.settingsGrid}>
          
          {/* Account Settings */}
          <section className={styles.settingsSection}>
            <h2 className={styles.sectionTitle}>Account Settings</h2>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Full Name</label>
                {isEditingName ? (
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={styles.settingInput}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className={styles.settingValue}>{fullName || "Not set"}</p>
                )}
              </div>
              {isEditingName ? (
                <div className={styles.editActions}>
                  <button 
                    className={styles.saveButton}
                    onClick={handleUpdateName}
                  >
                    Save
                  </button>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => {
                      setIsEditingName(false);
                      setFullName(user?.displayName || "");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditingName(true)}
                >
                  Edit
                </button>
              )}
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Email Address</label>
                {isEditingEmail ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.settingInput}
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className={styles.settingValue}>{email || "Not set"}</p>
                )}
              </div>
              {isEditingEmail ? (
                <div className={styles.editActions}>
                  <button 
                    className={styles.saveButton}
                    onClick={handleUpdateEmail}
                  >
                    Save
                  </button>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => {
                      setIsEditingEmail(false);
                      setEmail(user?.email || "");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  className={styles.editButton}
                  onClick={() => setIsEditingEmail(true)}
                >
                  Edit
                </button>
              )}
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Password</label>
                {isChangingPassword ? (
                  <div className={styles.passwordInputs}>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={styles.settingInput}
                      placeholder="New password (min 6 characters)"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={styles.settingInput}
                      placeholder="Confirm new password"
                    />
                  </div>
                ) : (
                  <p className={styles.settingValue}>••••••••</p>
                )}
              </div>
              {isChangingPassword ? (
                <div className={styles.editActions}>
                  <button 
                    className={styles.saveButton}
                    onClick={handleChangePassword}
                  >
                    Save
                  </button>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => {
                      setIsChangingPassword(false);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  className={styles.editButton}
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change
                </button>
              )}
            </div>
          </section>

          {/* Notifications */}
          <section className={styles.settingsSection}>
            <h2 className={styles.sectionTitle}>Notifications</h2>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Push Notifications</label>
                <p className={styles.settingDescription}>Receive notifications about maintenance schedules</p>
              </div>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Email Updates</label>
                <p className={styles.settingDescription}>Get weekly summaries and tips via email</p>
              </div>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  checked={emailUpdates}
                  onChange={(e) => setEmailUpdates(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
          </section>

          {/* Appearance */}
          <section className={styles.settingsSection}>
            <h2 className={styles.sectionTitle}>Appearance</h2>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Dark Mode</label>
                <p className={styles.settingDescription}>Switch to dark theme (Coming soon)</p>
              </div>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  disabled
                />
                <span className={`${styles.toggleSlider} ${styles.disabled}`}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Language</label>
                <p className={styles.settingDescription}>Choose your preferred language</p>
              </div>
              <select 
                className={styles.selectInput}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </section>

          {/* Support & About */}
          <section className={`${styles.settingsSection} ${styles.supportSection}`}>
            <h2 className={styles.sectionTitle}>Support & About</h2>
            
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Help Center</label>
                <p className={styles.settingDescription}>Get help and support</p>
              </div>
              <button className={styles.linkButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>About WoodWise</label>
                <p className={styles.settingDescription}>Version 1.0.0</p>
              </div>
              <button className={styles.linkButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </button>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Privacy Policy</label>
                <p className={styles.settingDescription}>Read our privacy policy</p>
              </div>
              <button className={styles.linkButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success"
        message={successMessage}
        type="success"
        confirmText="OK"
      />

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Error"
        message={errorMessage}
        type="error"
        confirmText="OK"
      />
    </div>
  );
}
