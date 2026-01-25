"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/dashboard/dashboard.module.css";

interface ScanItem {
  id: string;
  name: string;
  status: string;
  daysAgo: number;
  icon: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Home");
  
  const recentScans: ScanItem[] = [
    {
      id: "1",
      name: "Outdoor Chair",
      status: "Minor surface scratches detected",
      daysAgo: 2,
      icon: "🪑"
    },
    {
      id: "2",
      name: "Indoor Table",
      status: "No issues found",
      daysAgo: 5,
      icon: "🪑"
    },
    {
      id: "3",
      name: "Wooden Desk",
      status: "Slight discoloration detected",
      daysAgo: 7,
      icon: "🪑"
    },
    {
      id: "4",
      name: "Garden Bench",
      status: "Moisture damage detected",
      daysAgo: 10,
      icon: "🪑"
    },
    {
      id: "5",
      name: "Dining Chair",
      status: "Excellent condition",
      daysAgo: 14,
      icon: "🪑"
    }
  ];

  return (
    <div className={styles.dashboardContainer}>
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
          <button 
            className={`${styles.navButton} ${activeTab === "Home" ? styles.active : ""}`}
            onClick={() => setActiveTab("Home")}
          >
            Home
          </button>
          <Link href="/scan">
            <button 
              className={`${styles.navButton} ${activeTab === "Scan" ? styles.active : ""}`}
            >
              Scan
            </button>
          </Link>
          <Link href="/notification">
            <button 
              className={`${styles.navButton} ${activeTab === "Notification" ? styles.active : ""}`}
            >
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
        {/* Welcome Banner */}
        <div className={styles.welcomeBanner}>
          <h1 className={styles.welcomeTitle}>Welcome back, Kendall!</h1>
          <p className={styles.welcomeSubtitle}>Ready to check your furniture's condition?</p>
        </div>

        {/* Recent Scans Section */}
        <section className={styles.recentScansSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Scans</h2>
            <button className={styles.viewAllButton}>View All</button>
          </div>

          <div className={styles.scansList}>
            {recentScans.map((scan) => (
              <div key={scan.id} className={styles.scanCard}>
                <div className={styles.scanIcon}>{scan.icon}</div>
                <div className={styles.scanInfo}>
                  <h3 className={styles.scanName}>{scan.name}</h3>
                  <p className={styles.scanStatus}>{scan.status}</p>
                  <p className={styles.scanTime}>{scan.daysAgo} days ago</p>
                </div>
                <button className={styles.scanArrow}>▶</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
