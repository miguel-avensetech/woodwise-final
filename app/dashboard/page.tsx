"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Sidebar from "@/components/layout/Sidebar";
import styles from "@/styles/dashboard/dashboard.module.css";

interface ScanItem {
  id: string;
  name: string;
  status: string;
  daysAgo: number;
  icon: string;
}

export default function Dashboard() {
  const [userName, setUserName] = useState<string>("User");

  // Get user's first name from Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        // Extract first name from display name
        const firstName = user.displayName.split(' ')[0];
        setUserName(firstName);
      }
    });

    return () => unsubscribe();
  }, []);
  
  const recentScans: ScanItem[] = [
    // Empty array to show "Scan now" state
    // Uncomment below to show actual scans
    /*
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
    */
  ];

  const hasScans = recentScans.length > 0;

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Welcome Banner */}
        <div className={styles.welcomeBanner}>
          <h1 className={styles.welcomeTitle}>Welcome back, {userName}!</h1>
          <p className={styles.welcomeSubtitle}>Ready to check your furniture's condition?</p>
        </div>

        {/* Recent Scans Section */}
        <section className={styles.recentScansSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Scans</h2>
            {hasScans && (
              <button className={styles.viewAllButton}>View All</button>
            )}
          </div>

          {!hasScans ? (
            // Empty State - Show "Scan Now"
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📷</div>
              <h3 className={styles.emptyStateTitle}>No scans yet</h3>
              <p className={styles.emptyStateText}>Start scanning your furniture to track its condition</p>
              <Link href="/scan">
                <button className={styles.scanNowButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Scan Now
                </button>
              </Link>
            </div>
          ) : (
            // Scans List
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
          )}
        </section>
      </main>
    </div>
  );
}
