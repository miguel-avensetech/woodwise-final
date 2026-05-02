"use client";

import { useMemo, useState } from "react";
import OfficeSidebar from "@/components/layout/OfficeSidebar";
import styles from "@/styles/office/office.module.css";
import { officeNotifications, NotificationKind } from "@/lib/officeMockData";

type Filter = "all" | NotificationKind;

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OfficeNotificationsPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return officeNotifications;
    return officeNotifications.filter((item) => item.kind === filter);
  }, [filter]);

  return (
    <div className={styles.container}>
      <OfficeSidebar />
      <main className={styles.mainContent}>
        <div className={styles.headerBanner}>
          <h1 className={styles.title}>Office Notifications</h1>
          <p className={styles.subtitle}>Booking, repair, and maintenance updates for the professional team.</p>
        </div>

        <div className={styles.filters}>
          <button className={`${styles.filterButton} ${filter === "all" ? styles.activeFilter : ""}`} onClick={() => setFilter("all")}>All</button>
          <button className={`${styles.filterButton} ${filter === "booking" ? styles.activeFilter : ""}`} onClick={() => setFilter("booking")}>Bookings</button>
          <button className={`${styles.filterButton} ${filter === "repair" ? styles.activeFilter : ""}`} onClick={() => setFilter("repair")}>Repairs</button>
          <button className={`${styles.filterButton} ${filter === "maintenance" ? styles.activeFilter : ""}`} onClick={() => setFilter("maintenance")}>Maintenance</button>
        </div>

        <section className={styles.panel}>
          <ul className={styles.list}>
            {filtered.map((item) => (
              <li key={item.id} className={styles.listItem}>
                <div className={styles.itemRow}>
                  <div>
                    <div className={styles.itemPrimary}>
                      {item.kind === "booking" ? "📥" : item.kind === "repair" ? "🧰" : "📅"} {item.title}
                    </div>
                    <div className={styles.itemSecondary}>
                      {item.customerName} - {item.furniture} | {item.message}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className={`${styles.badge} ${item.state === "overdue" ? styles.badgeHigh : item.state === "updated" ? styles.badgeProgress : styles.badgeNew}`}>
                      {item.state}
                    </span>
                    <div className={styles.itemSecondary}>{timeAgo(item.createdAt)}</div>
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

