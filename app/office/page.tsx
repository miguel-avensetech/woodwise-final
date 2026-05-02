"use client";

import { useMemo, useState } from "react";
import OfficeSidebar from "@/components/layout/OfficeSidebar";
import styles from "@/styles/office/office.module.css";
import {
  officeAppointments,
  officeBookings,
  officeFollowUps,
  officeRepairTasks,
  officeTechnicianAvailability,
} from "@/lib/officeMockData";

type OfficeCalendarEvent = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  kind: "appointment" | "followup";
};

const formatSlot = (iso: string): string =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export default function OfficeHome() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const todayAppointments = officeAppointments.filter((a) => new Date(a.startTime).getDate() === today.getDate()).length;
  const pendingBookings = officeBookings.filter((b) => b.status === "new" || b.status === "confirmed").length;
  const activeRepairs = officeRepairTasks.filter((r) => r.status === "in_progress" || r.status === "assigned").length;
  const followupsDue = officeFollowUps.length;
  const todaysAppointmentsList = officeAppointments
    .filter((item) => new Date(item.startTime).toDateString() === today.toDateString())
    .slice(0, 3);
  const upcomingFollowups = [...officeFollowUps]
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 4);
  const latestBookings = officeBookings.slice(0, 4);
  const upcomingEvents = [...officeAppointments]
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

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
        subtitle: formatSlot(item.startTime),
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
          <h1 className={styles.title}>Office Dashboard</h1>
          <p className={styles.subtitle}>Professional CRM for mahogany repairs, appointments, and follow-ups.</p>
        </div>

        <div className={styles.dashboardKpiGrid}>
          <div className={styles.kpiCardLarge}>
            <div className={styles.kpiCardHeader}>
              <div>
                <div className={styles.kpiValue}>{todayAppointments}</div>
                <div className={styles.kpiLabel}>Appointments</div>
              </div>
              <ul className={styles.kpiMetaList}>
                <li><span className={styles.kpiDot} />{pendingBookings} New bookings</li>
                <li><span className={styles.kpiDot} />{activeRepairs} Active repairs</li>
                <li><span className={styles.kpiDot} />{followupsDue} Follow-ups</li>
              </ul>
            </div>
            <button className={styles.kpiActionButton}>View all appointments</button>
          </div>
          <div className={styles.kpiCardLarge}>
            <div className={styles.kpiCardHeader}>
              <div>
                <div className={styles.kpiValue}>{pendingBookings}</div>
                <div className={styles.kpiLabel}>Bookings</div>
              </div>
              <ul className={styles.kpiMetaList}>
                <li><span className={styles.kpiDot} />{latestBookings.length} New requests</li>
                <li><span className={styles.kpiDot} />{officeRepairTasks.length} SLA tasks</li>
                <li><span className={styles.kpiDot} />{officeTechnicianAvailability.length} Carpenters</li>
              </ul>
            </div>
            <button className={styles.kpiActionButton}>View all bookings</button>
          </div>
          <div className={styles.kpiCardLarge}>
            <div className={styles.kpiCardHeader}>
              <div>
                <div className={styles.kpiValue}>{activeRepairs}</div>
                <div className={styles.kpiLabel}>Repairs</div>
              </div>
              <ul className={styles.kpiMetaList}>
                <li><span className={styles.kpiDot} />{officeRepairTasks.filter((task) => task.slaRisk !== "ok").length} SLA risks</li>
                <li><span className={styles.kpiDot} />{officeAppointments.filter((item) => item.type === "maintenance").length} Maintenance visits</li>
                <li><span className={styles.kpiDot} />{officeAppointments.filter((item) => item.type === "inspection").length} Inspections</li>
              </ul>
            </div>
            <button className={styles.kpiActionButton}>View repair pipeline</button>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          <section className={styles.calendarCard}>
            <div className={styles.calendarHeader}>
              <div>
                <h2 className={styles.panelTitle}>My Schedules</h2>
                <p className={styles.calendarSubtitle}>Appointments and follow-ups for the month.</p>
              </div>
              <div className={styles.calendarControls}>
                <button className={styles.calendarNavButton} onClick={goToPreviousMonth} aria-label="Previous month">
                  ◀
                </button>
                <span className={styles.calendarMonth}>{monthLabel}</span>
                <button className={styles.calendarNavButton} onClick={goToNextMonth} aria-label="Next month">
                  ▶
                </button>
              </div>
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
                const isToday = isSameDay(date, today);

                return (
                  <div key={key} className={`${styles.calendarCell} ${isToday ? styles.calendarCellToday : ""}`}>
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

          <aside className={styles.dashboardSidebar}>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Today&apos;s Schedules</h2>
              {todaysAppointmentsList.length === 0 ? (
                <p className={styles.emptyStateText}>No appointments scheduled for today.</p>
              ) : (
                <ul className={styles.list}>
                  {todaysAppointmentsList.map((item) => (
                    <li key={item.id} className={styles.listItemCompact}>
                      <div className={styles.itemPrimary}>{item.customerName}</div>
                      <div className={styles.itemSecondary}>{item.furniture} • {formatSlot(item.startTime)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Upcoming Schedules</h2>
              {upcomingEvents.length === 0 ? (
                <p className={styles.emptyStateText}>No upcoming schedules found.</p>
              ) : (
                <ul className={styles.list}>
                  {upcomingEvents.map((item) => (
                    <li key={item.id} className={styles.listItemCompact}>
                      <div className={styles.itemPrimary}>{item.customerName}</div>
                      <div className={styles.itemSecondary}>{item.furniture} • {new Date(item.startTime).toLocaleDateString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Recently Added</h2>
              <ul className={styles.list}>
                {latestBookings.map((item) => (
                  <li key={item.id} className={styles.listItemCompact}>
                    <div className={styles.itemPrimary}>{item.customerName}</div>
                    <div className={styles.itemSecondary}>{item.furniture} • {item.issue}</div>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        <div className={styles.metricRow}>
          <section className={styles.miniPanel}>
            <h2 className={styles.panelTitle}>Carpenter Availability</h2>
            <ul className={styles.list}>
              {officeTechnicianAvailability.map((tech) => (
                <li key={tech.name} className={styles.listItem}>
                  <div className={styles.itemRow}>
                    <span className={styles.itemPrimary}>{tech.name}</span>
                    <span className={`${styles.badge} ${tech.status === "Available" ? styles.badgeNew : styles.badgeNeutral}`}>{tech.status}</span>
                  </div>
                  <div className={styles.itemSecondary}>{tech.slot}</div>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.miniPanel}>
            <h2 className={styles.panelTitle}>SLA and Escalation</h2>
            <div className={styles.itemRow}>
              <div>
                <div className={styles.itemPrimary}>Revenue at risk</div>
                <div className={styles.itemSecondary}>Pending high-priority repairs</div>
              </div>
              <div className={styles.miniValue}>₱48,000</div>
            </div>
            <ul className={styles.list}>
              {officeRepairTasks.map((task) => (
                <li key={task.id} className={styles.listItem}>
                  <div className={styles.itemRow}>
                    <span className={styles.itemPrimary}>{task.title}</span>
                    <span className={`${styles.badge} ${task.slaRisk === "ok" ? styles.badgeNew : styles.badgeHigh}`}>{task.slaRisk.replace("_", " ")}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

