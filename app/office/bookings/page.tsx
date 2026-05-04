"use client";

import OfficeSidebar from "@/components/layout/OfficeSidebar";
import styles from "@/styles/office/office.module.css";
import { officeBookings } from "@/lib/officeMockData";

export default function OfficeBookingsPage() {
  return (
    <div className={styles.container}>
      <OfficeSidebar />
      <main className={styles.mainContent}>
        <div className={styles.headerBanner}>
          <h1 className={styles.title}>Bookings Queue</h1>
          <p className={styles.subtitle}>Repair intake and triage queue for professional scheduling.</p>
        </div>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Repair Bookings</h2>
          <ul className={styles.list}>
            {officeBookings.map((item) => (
              <li key={item.id} className={styles.listItem}>
                <div className={styles.itemRow}>
                  <div>
                    <div className={styles.itemPrimary}>{item.id} - {item.customerName}</div>
                    <div className={styles.itemSecondary}>{item.furniture} | {item.issue}</div>
                    <div className={styles.itemSecondary}>Requested: {new Date(item.requestedDate).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`${styles.badge} ${item.priority === "high" ? styles.badgeHigh : styles.badgeProgress}`}>{item.priority}</span>
                    <div className={styles.itemSecondary}>{item.status.replace("_", " ")}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

