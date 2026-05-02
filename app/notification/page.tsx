"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "@/components/layout/Sidebar";
import styles from "@/styles/notification/notification.module.css";

interface NotificationSchedule {
  type: "treatment" | "maintenance";
  stepIndex?: number;
  title: string;
  message: string;
  scheduledTime: string;
  icon: string;
  read: boolean;
}

interface Notification extends NotificationSchedule {
  id: string;
  treatmentTitle: string;
  timeAgo: string;
  isPast: boolean;
}

export default function Notification() {
  const [filter, setFilter] = useState<"all" | "maintenance" | "treatment">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadNotifications(user.uid);
      } else {
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadNotifications = async (userId: string) => {
    try {
      setLoading(true);
      const treatmentsRef = collection(db, 'treatments');
      const q = query(treatmentsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const allNotifications: Notification[] = [];
      const now = new Date();

      querySnapshot.forEach((doc) => {
        const treatment = doc.data();
        const schedules = treatment.notificationSchedules || [];
        
        schedules.forEach((schedule: NotificationSchedule, index: number) => {
          const scheduledDate = new Date(schedule.scheduledTime);
          const isPast = scheduledDate <= now;
          
          // Only show notifications that are due (scheduled time has passed)
          if (isPast) {
            allNotifications.push({
              id: `${treatment.id}_${index}`,
              treatmentTitle: treatment.title,
              timeAgo: getTimeAgo(scheduledDate),
              isPast: true,
              ...schedule,
            });
          }
        });
      });

      // Sort by scheduled time (most recent/upcoming first)
      allNotifications.sort((a, b) => 
        new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
      );

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} h ago`;
    } else if (diffDays < 7) {
      return `${diffDays} d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getTimeUntil = (date: Date): string => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      return `In ${diffMins} min`;
    } else if (diffHours < 24) {
      return `In ${diffHours} h`;
    } else {
      return `On ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "all") return true;
    return notif.type === filter;
  });

  const hasNotifications = filteredNotifications.length > 0;

  if (loading) {
    return (
      <div className={styles.notificationContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.filterTabs}>
            <button className={`${styles.filterButton} ${styles.activeFilter}`}>All</button>
            <button className={styles.filterButton}>Maintenance</button>
            <button className={styles.filterButton}>Treatment</button>
          </div>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading notifications...</p>
          </div>
        </main>
      </div>
    );
  }

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
              <div 
                key={notification.id} 
                className={styles.notificationCard}
              >
                <div className={styles.notificationIcon}>{notification.icon}</div>
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <div>
                      <h3 className={styles.notificationTitle}>{notification.title}</h3>
                      <p className={styles.treatmentSubtitle}>{notification.treatmentTitle}</p>
                    </div>
                    <span className={styles.notificationTime}>
                      {notification.timeAgo}
                    </span>
                  </div>
                  <p className={styles.notificationMessage}>{notification.message}</p>
                  <div className={styles.notificationFooter}>
                    <div className={styles.notificationBadge}>
                      {notification.type === 'treatment' ? '🧴 Treatment' : '🔧 Maintenance'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
