"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/layout/OfficeSidebar.module.css";
import { getOfficeUnreadCount } from "@/lib/officeMockData";

export default function OfficeSidebar() {
  const pathname = usePathname();
  const unreadCount = getOfficeUnreadCount();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <Link href="/office">
          <img src="/assets/images/woodwise-logo.png" alt="WoodWise Logo" className={styles.logo} />
        </Link>
      </div>

      <nav className={styles.nav}>
        <Link href="/office">
          <button className={`${styles.navButton} ${isActive("/office") ? styles.active : ""}`}>
            <span>Home</span>
          </button>
        </Link>
        <Link href="/office/scan">
          <button className={`${styles.navButton} ${isActive("/office/scan") ? styles.active : ""}`}>
            <span>Scan</span>
          </button>
        </Link>
        <Link href="/office/notifications">
          <button className={`${styles.navButton} ${isActive("/office/notifications") ? styles.active : ""}`}>
            <span>Notifications</span>
            {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
          </button>
        </Link>
        <Link href="/office/bookings">
          <button className={`${styles.navButton} ${isActive("/office/bookings") ? styles.active : ""}`}>
            <span>Bookings</span>
          </button>
        </Link>
        <Link href="/office/schedule">
          <button className={`${styles.navButton} ${isActive("/office/schedule") ? styles.active : ""}`}>
            <span>Schedule</span>
          </button>
        </Link>
      </nav>

      <div className={styles.profileSection}>
        <div className={styles.profileCard}>
          <div className={styles.avatarPlaceholder}>O</div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>Office Console</div>
            <div className={styles.profileEmail}>Professionals Workspace</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

