"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/styles/settings/settings.module.css";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Profile");
  const router = useRouter();

  const handleLogout = () => {
    // Add logout logic here
    console.log("Logging out...");
    router.push("/");
  };

  return (
    <div className={styles.settingsContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img 
            src="/assets/images/woodwise-logo.png" 
            alt="WoodWise Logo" 
            className={styles.logo}
          />
        </div>
        
        <nav className={styles.nav}>
          <Link href="/dashboard">
            <button className={styles.navButton}>
              Home
            </button>
          </Link>
          <Link href="/scan">
            <button className={styles.navButton}>
              Scan
            </button>
          </Link>
          <Link href="/notification">
            <button className={styles.navButton}>
              Notification
            </button>
          </Link>
          <Link href="/profile">
            <button 
              className={`${styles.navButton} ${activeTab === "Profile" ? styles.active : ""}`}
            >
              Profile
            </button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <Link href="/profile">
            <button className={styles.backButton}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          </Link>
          <h1 className={styles.pageTitle}>Settings</h1>
        </div>

        {/* Settings Options */}
        <div className={styles.settingsOptions}>
          <button className={styles.settingItem}>
            <div className={styles.settingLeft}>
              <div className={styles.settingIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="5" y="11" width="14" height="10" rx="2" ry="2"/>
                  <circle cx="12" cy="16" r="1"/>
                  <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
              </div>
              <span className={styles.settingText}>Change Password</span>
            </div>
            <svg className={styles.settingArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button className={styles.settingItem}>
            <div className={styles.settingLeft}>
              <div className={styles.settingIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <span className={styles.settingText}>Help & Support</span>
            </div>
            <svg className={styles.settingArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button className={styles.settingItem}>
            <div className={styles.settingLeft}>
              <div className={styles.settingIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <span className={styles.settingText}>About WoodWise</span>
            </div>
            <svg className={styles.settingArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button className={styles.settingItem} onClick={handleLogout}>
            <div className={styles.settingLeft}>
              <div className={styles.settingIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <span className={styles.settingText}>Logout</span>
            </div>
            <svg className={styles.settingArrow} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
