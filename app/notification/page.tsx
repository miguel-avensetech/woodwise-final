"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import styles from "@/styles/notification/notification.module.css";

interface Notification {
  id: string;
  type: "treatment" | "maintenance";
  title: string;
  message: string;
  time: string;
  icon: string;
}

export default function Notification() {
  const [filter, setFilter] = useState<"all" | "maintenance" | "treatment">("all");

  const notifications: Notification[] = [
    // Empty array - no notifications yet
    // Uncomment below to show sample notifications
    /*
    {
      id: "1",
      type: "treatment",
      title: "Treatment Reminder",
      message: "Your furniture should be dry now. Time to apply the anti-mold treatment.",
      time: "1 h ago",
      icon: "🧴"
    },
    {
      id: "2",
      type: "maintenance",
      title: "Maintenance Schedule",
      message: "It's been 6 months since you applied varnish on your table. Time to inspect the finish — reapply if it looks dull or uneven.",
      time: "1 d ago",
      icon: "🪣"
    }
    */
  ];

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "all") return true;
    return notif.type === filter;
  });

  const hasNotifications = filteredNotifications.length > 0;

  return (
    <div className={styles.notificationContainer}>
      <Sidebar />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.filterButton} ${filter === "all" ? styles.activeFilter : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button 
            className={`${styles.filterButton} ${filter === "maintenance" ? styles.activeFilter : ""}`}
            onClick={() => setFilter("maintenance")}
          >
            Maintenance
          </button>
          <button 
            className={`${styles.filterButton} ${filter === "treatment" ? styles.activeFilter : ""}`}
            onClick={() => setFilter("treatment")}
          >
            Treatment
          </button>
        </div>

        {/* Notifications List or Empty State */}
        {!hasNotifications ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <img 
                src="/assets/icons/bell.png" 
                alt="No notifications" 
                className={styles.emptyIcon}
              />
            </div>
            <h3 className={styles.emptyStateTitle}>No notifications yet</h3>
            <p className={styles.emptyStateText}>
              {filter === "all" 
                ? "You'll receive notifications about maintenance schedules and treatment reminders here"
                : `No ${filter} notifications at the moment`
              }
            </p>
          </div>
        ) : (
          <div className={styles.notificationsList}>
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className={styles.notificationCard}>
                <div className={styles.notificationIcon}>{notification.icon}</div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h3 className={styles.notificationTitle}>{notification.title}</h3>
                    <span className={styles.notificationTime}>{notification.time}</span>
                  </div>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
