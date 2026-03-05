"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/layout/Sidebar";
import styles from "@/styles/maintenance/maintenance.module.css";

interface FurnitureItem {
  id: string;
  name: string;
  status: string;
  icon: string;
}

export default function Maintenance() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Empty array - no furniture scanned yet
  const furnitureItems: FurnitureItem[] = [
    // Uncomment to show sample furniture
    /*
    {
      id: "1",
      name: "Outdoor Table",
      status: "Mold Detected",
      icon: "🪑"
    }
    */
  ];

  // Calendar events - empty if no scheduled treatments
  const events: { [key: string]: string } = {
    // Format: "YYYY-MM-DD": "Event description"
    // Uncomment to show sample events
    /*
    "2025-10-01": "Spray with anti-mold solution",
    "2025-10-15": "Re-apply anti-mold treatment",
    "2025-10-31": "Inspect outdoor wood surface"
    */
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isToday = (dayNumber: number) => {
    const today = new Date();
    return (
      dayNumber === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const getEventForDay = (dayNumber: number) => {
    const dateKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    return events[dateKey];
  };

  const renderCalendar = () => {
    const days = [];
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDay + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const isTodayDay = isValidDay && isToday(dayNumber);
      const eventText = isValidDay ? getEventForDay(dayNumber) : null;

      days.push(
        <div 
          key={i} 
          className={`${styles.calendarDay} ${!isValidDay ? styles.emptyDay : ''} ${isTodayDay ? styles.todayDay : ''} ${eventText ? styles.eventDay : ''}`}
        >
          {isValidDay && (
            <>
              <span className={styles.dayNumber}>{dayNumber}</span>
              {eventText && (
                <div className={styles.eventText}>{eventText}</div>
              )}
            </>
          )}
        </div>
      );
    }

    return days;
  };

  const hasFurniture = furnitureItems.length > 0;

  return (
    <div className={styles.maintenanceContainer}>
      <Sidebar />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header Banner */}
        <div className={styles.headerBanner}>
          <h1 className={styles.bannerTitle}>Maintenance Schedule</h1>
          <p className={styles.bannerSubtitle}>Keep track of your furniture care and schedule regular maintenance tasks</p>
        </div>

        {/* Two Column Layout */}
        <div className={styles.contentGrid}>
          {/* Furniture List - Left Side */}
          <div className={styles.furnitureSection}>
            <h2 className={styles.sectionTitle}>My Furniture:</h2>
            
            {!hasFurniture ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <img 
                    src="/assets/icons/calendar-cog.png" 
                    alt="No furniture" 
                    className={styles.emptyIcon}
                  />
                </div>
                <h3 className={styles.emptyStateTitle}>No furniture so far</h3>
                <p className={styles.emptyStateText}>Scan your furniture to start tracking maintenance</p>
                <Link href="/scan">
                  <button className={styles.scanButton}>Scan Now</button>
                </Link>
              </div>
            ) : (
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
            )}
          </div>

          {/* Calendar - Right Side */}
          <div className={styles.calendarSection}>
            <div className={styles.monthHeader}>
              <button className={styles.monthNavButton} onClick={goToPreviousMonth} aria-label="Previous month">
                ◀
              </button>
              <h2 className={styles.calendarMonth}>{monthName}</h2>
              <button className={styles.monthNavButton} onClick={goToNextMonth} aria-label="Next month">
                ▶
              </button>
            </div>
            <div className={styles.calendar}>
              <div className={styles.calendarWeekHeader}>
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
        </div>
      </main>
    </div>
  );
}
