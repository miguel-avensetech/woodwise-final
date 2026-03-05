"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import styles from "@/styles/settings/settings.module.css";
import { logOut } from "@/lib/auth";

export default function Settings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

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
                <p className={styles.settingValue}>Kendall Jenner</p>
              </div>
              <button className={styles.editButton}>Edit</button>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Email Address</label>
                <p className={styles.settingValue}>kendall@example.com</p>
              </div>
              <button className={styles.editButton}>Edit</button>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Password</label>
                <p className={styles.settingValue}>••••••••</p>
              </div>
              <button className={styles.editButton}>Change</button>
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
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
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
                <p className={styles.settingDescription}>Switch to dark theme</p>
              </div>
              <label className={styles.toggle}>
                <input 
                  type="checkbox" 
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>

            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label className={styles.settingLabel}>Language</label>
                <p className={styles.settingDescription}>Choose your preferred language</p>
              </div>
              <button className={styles.editButton}>English</button>
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
    </div>
  );
}
