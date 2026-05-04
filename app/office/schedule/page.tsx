"use client";

import { useMemo, useState } from "react";
import OfficeSidebar from "@/components/layout/OfficeSidebar";
import styles from "@/styles/office/office.module.css";
import { officeAppointments, officeFollowUps } from "@/lib/officeMockData";

type OfficeCalendarEvent = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  kind: "appointment" | "followup";
};

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const buildCalendarDays = (month: Date) => {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const startOffset = firstDay.getDay();
  const totalCells = 42;
  const cells: Array<Date | null> = Array(totalCells).fill(null);

  for (let day = 1; day <= daysInMonth; day++) {
    cells[startOffset + (day - 1)] = new Date(month.getFullYear(), month.getMonth(), day);
  }

  return cells;
};

export default function OfficeSchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const eventsByDate = useMemo(() => {
    const map: Record<string, OfficeCalendarEvent[]> = {};
    const addEvent = (date: string, event: OfficeCalendarEvent) => {
      const key = formatDateKey(new Date(date));
      if (!map[key]) map[key] = [];
      map[key].push(event);
    };

    officeAppointments.forEach((item) => {
      addEvent(item.startTime, {
        id: item.id,
        date: item.startTime,
        title: `${item.customerName} - ${item.furniture}`,
        subtitle: new Date(item.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        kind: "appointment",
      });
    });

    officeFollowUps.forEach((item) => {
      addEvent(item.dueAt, {
        id: item.id,
        date: item.dueAt,
        title: `${item.customerName} - ${item.furniture}`,
        subtitle: "Follow-up",
        kind: "followup",
      });
    });

    return map;
  }, []);

  const monthLabel = currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return Object.values(eventsByDate)
      .flat()
      .filter((item) => new Date(item.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6);
  }, [eventsByDate]);

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className={styles.container}>
      <OfficeSidebar />
      <main className={styles.mainContent}>
        <div className={styles.headerBanner}>
          <h1 className={styles.title}>Schedule</h1>
          <p className={styles.subtitle}>Appointments, maintenance visits, and customer follow-up timelines.</p>
        </div>

        <div className={styles.calendarLayout}>
          <section className={styles.calendarCard}>
            <div className={styles.calendarHeader}>
              <button className={styles.calendarNavButton} onClick={goToPreviousMonth} aria-label="Previous month">
                ◀
              </button>
              <h2 className={styles.calendarMonth}>{monthLabel}</h2>
              <button className={styles.calendarNavButton} onClick={goToNextMonth} aria-label="Next month">
                ▶
              </button>
            </div>
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
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className={`${styles.calendarCell} ${styles.calendarCellEmpty}`} />;
                }

                const key = formatDateKey(date);
                const dayEvents = eventsByDate[key] ?? [];
                const today = isSameDay(date, new Date());

                return (
                  <div key={key} className={`${styles.calendarCell} ${today ? styles.calendarCellToday : ""}`}>
                    <div className={styles.calendarDate}>{date.getDate()}</div>
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`${styles.eventChip} ${event.kind === "appointment" ? styles.eventAppointment : styles.eventFollowup}`}
                        title={`${event.title} • ${event.subtitle}`}
                      >
                        <span>{event.kind === "appointment" ? "🗓️" : "🔁"}</span>
                        <span className={styles.eventText}>{event.title}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.upcomingPanel}>
            <h2 className={styles.panelTitle}>Upcoming Highlights</h2>
            {upcomingEvents.length === 0 ? (
              <p className={styles.emptyStateText}>No upcoming events scheduled.</p>
            ) : (
              <ul className={styles.upcomingList}>
                {upcomingEvents.map((event) => (
                  <li key={event.id} className={styles.upcomingItem}>
                    <div className={styles.itemPrimary}>{event.title}</div>
                    <div className={styles.itemSecondary}>
                      {new Date(event.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })} • {event.subtitle}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

