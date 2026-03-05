"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "@/styles/layout/Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Link href="/dashboard">
          <img 
            src="/assets/images/woodwise-logo.png" 
            alt="WoodWise Logo" 
            className={styles.logo}
          />
        </Link>
      </div>
      
      <nav className={styles.nav}>
        <Link href="/dashboard">
          <button 
            className={`${styles.navButton} ${isActive("/dashboard") ? styles.active : ""}`}
          >
            <img 
              src={isActive("/dashboard") ? "/assets/icons/layout-dashboard-white.png" : "/assets/icons/layout-dashboard.png"} 
              alt="Home" 
              className={styles.navIcon} 
            />
            Home
          </button>
        </Link>
        <Link href="/scan">
          <button 
            className={`${styles.navButton} ${isActive("/scan") ? styles.active : ""}`}
          >
            <img 
              src={isActive("/scan") ? "/assets/icons/scan-search-white.png" : "/assets/icons/scan-search.png"} 
              alt="Scan" 
              className={styles.navIcon} 
            />
            Scan
          </button>
        </Link>
        <Link href="/notification">
          <button 
            className={`${styles.navButton} ${isActive("/notification") ? styles.active : ""}`}
          >
            <img 
              src={isActive("/notification") ? "/assets/icons/bell-white.png" : "/assets/icons/bell.png"} 
              alt="Notification" 
              className={styles.navIcon} 
            />
            Notification
          </button>
        </Link>
        <Link href="/maintenance">
          <button 
            className={`${styles.navButton} ${isActive("/maintenance") ? styles.active : ""}`}
          >
            <img 
              src={isActive("/maintenance") ? "/assets/icons/calendar-cog-white.png" : "/assets/icons/calendar-cog.png"} 
              alt="Maintenance" 
              className={styles.navIcon} 
            />
            Maintenance
          </button>
        </Link>
        <Link href="/saved">
          <button 
            className={`${styles.navButton} ${isActive("/saved") ? styles.active : ""}`}
          >
            <img 
              src={isActive("/saved") ? "/assets/icons/bookmark-white.png" : "/assets/icons/bookmark.png"} 
              alt="Saved" 
              className={styles.navIcon} 
            />
            Saved
          </button>
        </Link>
        <Link href="/settings">
          <button 
            className={`${styles.navButton} ${isActive("/settings") ? styles.active : ""}`}
          >
            <img 
              src={isActive("/settings") ? "/assets/icons/settings-white.png" : "/assets/icons/settings.png"} 
              alt="Settings" 
              className={styles.navIcon} 
            />
            Settings
          </button>
        </Link>
      </nav>

      {/* Profile Section at Bottom */}
      <div className={styles.profileSection}>
        <Link href="/profile">
          <div className={styles.profileCard}>
            {!loading && (
              <>
                <div className={styles.profileAvatar}>
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Profile" 
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className={styles.profileInfo}>
                  <div className={styles.profileName}>
                    {user?.displayName || "User"}
                  </div>
                  <div className={styles.profileEmail}>
                    {user?.email || "user@example.com"}
                  </div>
                </div>
              </>
            )}
            {loading && (
              <>
                <div className={styles.profileAvatar}>
                  <div className={styles.avatarPlaceholder}>U</div>
                </div>
                <div className={styles.profileInfo}>
                  <div className={styles.profileName}>Loading...</div>
                  <div className={styles.profileEmail}>Please wait</div>
                </div>
              </>
            )}
          </div>
        </Link>
      </div>
    </aside>
  );
}
