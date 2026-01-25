"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/profile/profile.module.css";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className={styles.profileContainer}>
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
          <button 
            className={`${styles.navButton} ${activeTab === "Profile" ? styles.active : ""}`}
            onClick={() => setActiveTab("Profile")}
          >
            Profile
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Profile Header */}
        <div className={styles.profileHeader}>
          <div className={styles.avatarContainer}>
            <svg 
              className={styles.avatar} 
              viewBox="0 0 100 100" 
              fill="none"
            >
              <circle cx="50" cy="50" r="50" fill="#2C2C2C"/>
              <circle cx="50" cy="35" r="15" fill="white"/>
              <path 
                d="M25 75 Q25 55 50 55 Q75 55 75 75" 
                fill="white"
              />
            </svg>
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.nameContainer}>
              <h1 className={styles.profileName}>Kendall Jenner</h1>
              <button className={styles.editButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
            <p className={styles.memberSince}>Member since Oct 2024</p>
          </div>
        </div>

        {/* Menu Options */}
        <div className={styles.menuOptions}>
          <Link href="/maintenance" className={styles.menuLink}>
            <button className={styles.menuItem}>
              <div className={styles.menuIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span className={styles.menuText}>Maintenance Schedules</span>
            </button>
          </Link>

          <button className={styles.menuItem}>
            <div className={styles.menuIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <span className={styles.menuText}>Saved Reccommendation</span>
          </button>

          <Link href="/settings" className={styles.menuLink}>
            <button className={styles.menuItem}>
              <div className={styles.menuIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M1 12h6m6 0h6m-13.2 5.2l4.2-4.2m0-6l-4.2-4.2"/>
                </svg>
              </div>
              <span className={styles.menuText}>Settings</span>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
