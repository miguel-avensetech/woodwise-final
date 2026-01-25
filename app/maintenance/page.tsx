"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/maintenance/maintenance.module.css";

interface FurnitureItem {
  id: string;
  name: string;
  status: string;
  icon: string;
}

export default function Maintenance() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 9)); // October 2025

  const furnitureItems: FurnitureItem[] = [
    {
      id: "1",
      name: "Outdoor Table",
      status: "Mold Detected",
      icon: "🪑"
    }
  ];

  // Calendar events for October 2025
  const events: { [key: number]: string } = {
    1: "Spray with anti-mold solution",
    15: "Re-apply anti-mold treatment",
    31: "Inspect outdoor wood surface"
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();

  const renderCalendar = () => {
    const days = [];
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDay + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const hasEvent = isValidDay && events[dayNumber];

      days.push(
        <div 
          key={i} 
          className={`${styles.calendarDay} ${!isValidDay ? styles.emptyDay : ''} ${hasEvent ? styles.eventDay : ''}`}
        >
          {isValidDay && (
            <>
              <span className={styles.dayNumber}>{dayNumber}</span>
              {hasEvent && (
                <div className={styles.eventText}>{events[dayNumber]}</div>
              )}
            </>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.maintenanceContainer}>
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
          <div>
            <h1 className={styles.pageTitle}>Maintenance Schedule</h1>
            <p className={styles.pageSubtitle}>Keep track of your furniture's maintenance with WoodWise</p>
          </div>
        </div>

        {/* Calendar */}
        <div className={styles.calendarSection}>
          <h2 className={styles.calendarMonth}>{monthName}</h2>
          <div className={styles.calendar}>
            <div className={styles.calendarHeader}>
              <div className={styles.calendarHeaderDay}>SUN</div>
              <div className={styles.calendarHeaderDay}>MON</div>
              <div className={styles.calendarHeaderDay}>TUE</div>
              <div className={styles.calendarHeaderDay}>WED</div>
              <div className={styles.calendarHeaderDay}>THU</div>
              <div className={styles.calendarHeaderDay}>FRI</div>
              <div className={styles.calendarHeaderDay}>SAT</div>
            </div>
            <div className={styles.calendarGrid}>
              {renderCalendar()}
            </div>
          </div>
        </div>

        {/* Furniture List */}
        <div className={styles.furnitureSection}>
          <h2 className={styles.sectionTitle}>My Furniture:</h2>
          <div className={styles.furnitureList}>
            {furnitureItems.map((item) => (
              <div key={item.id} className={styles.furnitureCard}>
                <div className={styles.furnitureIcon}>{item.icon}</div>
                <div className={styles.furnitureInfo}>
                  <span className={styles.furnitureName}>{item.name}</span>
                  <span className={styles.furnitureStatus}> – {item.status}</span>
                </div>
                <button className={styles.furnitureArrow}>▶</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
