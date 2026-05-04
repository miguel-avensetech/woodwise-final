"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Sidebar from "@/components/layout/Sidebar";
import styles from "@/styles/maintenance/maintenance.module.css";

interface FurnitureItem {
  id: string;
  name: string;
  status: string;
  icon: string;
  image: string;
  treatmentData: any;
}

interface CalendarEvent {
  date: string;
  title: string;
  description: string;
  furnitureName: string;
  type: 'treatment' | 'maintenance';
  priority?: string;
}

export default function Maintenance() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([]);
  const [events, setEvents] = useState<{ [key: string]: CalendarEvent[] }>({});
  const [loading, setLoading] = useState(true);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFurnitureDetails, setSelectedFurnitureDetails] = useState<FurnitureItem | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadFurnitureAndSchedules(user.uid);
      } else {
        setFurnitureItems([]);
        setEvents({});
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showDetailsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDetailsModal]);

  const loadFurnitureAndSchedules = async (userId: string) => {
    try {
      setLoading(true);
      const treatmentsRef = collection(db, 'treatments');
      const q = query(treatmentsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const furniture: FurnitureItem[] = [];
      const calendarEvents: { [key: string]: CalendarEvent[] } = {};

      querySnapshot.forEach((doc) => {
        const treatment = doc.data();
        
        // Only process saved treatments
        if (treatment.saved !== true) return;
        
        // Add to furniture list
        furniture.push({
          id: treatment.id,
          name: treatment.title,
          status: treatment.defectType,
          icon: getFurnitureIcon(treatment.furnitureType),
          image: treatment.image,
          treatmentData: treatment.treatmentData,
        });

        // Process treatment steps with scheduled dates
        if (treatment.treatmentData?.treatmentSteps) {
          treatment.treatmentData.treatmentSteps.forEach((step: any) => {
            if (step.scheduledDate) {
              const dateKey = formatDateKey(new Date(step.scheduledDate));
              if (!calendarEvents[dateKey]) {
                calendarEvents[dateKey] = [];
              }
              calendarEvents[dateKey].push({
                date: step.scheduledDate,
                title: step.title,
                description: step.description,
                furnitureName: treatment.title,
                type: 'treatment',
              });
            }
          });
        }

        // Process maintenance schedule
        if (treatment.treatmentData?.maintenanceSchedule) {
          treatment.treatmentData.maintenanceSchedule.forEach((maintenance: any) => {
            if (maintenance.scheduledDate) {
              const dateKey = formatDateKey(new Date(maintenance.scheduledDate));
              if (!calendarEvents[dateKey]) {
                calendarEvents[dateKey] = [];
              }
              calendarEvents[dateKey].push({
                date: maintenance.scheduledDate,
                title: maintenance.title,
                description: maintenance.description,
                furnitureName: treatment.title,
                type: 'maintenance',
                priority: maintenance.priority,
              });
            }
          });
        }
      });

      setFurnitureItems(furniture);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading furniture and schedules:', error);
      setFurnitureItems([]);
      setEvents({});
    } finally {
      setLoading(false);
    }
  };

  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFurnitureIcon = (type: string): string => {
    const typeMap: { [key: string]: string } = {
      'table': '🪑',
      'chair': '🪑',
      'cabinet': '🗄️',
      'desk': '🪑',
      'shelf': '📚',
      'door': '🚪',
      'bed': '🛏️',
      'bench': '🪑',
    };
    
    const lowerType = type.toLowerCase();
    for (const key in typeMap) {
      if (lowerType.includes(key)) {
        return typeMap[key];
      }
    }
    return '🪵';
  };

  const calculateProgress = (treatmentData: any): number => {
    if (!treatmentData?.treatmentSteps) return 0;
    const total = treatmentData.treatmentSteps.length;
    const now = new Date();
    const completed = treatmentData.treatmentSteps.filter((step: any) => {
      if (!step.scheduledDate) return false;
      return new Date(step.scheduledDate) <= now;
    }).length;
    return Math.round((completed / total) * 100);
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 75) return '#4CAF50';
    if (progress >= 50) return '#FF9800';
    return '#2196F3';
  };

  const handleFurnitureClick = (furnitureId: string) => {
    const furniture = furnitureItems.find(f => f.id === furnitureId);
    if (furniture) {
      setSelectedFurnitureDetails(furniture);
      setShowDetailsModal(true);
    }
  };

  const handleDayClick = (dayNumber: number) => {
    const dayEvents = getEventForDay(dayNumber);
    if (dayEvents.length > 0) {
      // Sort events by furniture name to group them together
      const sortedEvents = [...dayEvents].sort((a, b) => 
        a.furnitureName.localeCompare(b.furnitureName)
      );
      setSelectedDayEvents(sortedEvents);
      const dateStr = `${currentMonth.toLocaleString('default', { month: 'long' })} ${dayNumber}, ${currentMonth.getFullYear()}`;
      setSelectedDayDate(dateStr);
      setShowDayModal(true);
    }
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    // Small delay before clearing the details to allow animation
    setTimeout(() => {
      setSelectedFurnitureDetails(null);
    }, 200);
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

  const getEventForDay = (dayNumber: number): CalendarEvent[] => {
    const dateKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    return events[dateKey] || [];
  };

  const renderCalendar = () => {
    const days = [];
    const totalCells = 42;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDay + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const isTodayDay = isValidDay && isToday(dayNumber);
      const dayEvents = isValidDay ? getEventForDay(dayNumber) : [];
      const hasEvents = dayEvents.length > 0;

      days.push(
        <div 
          key={i} 
          className={`${styles.calendarDay} ${!isValidDay ? styles.emptyDay : ''} ${isTodayDay ? styles.todayDay : ''} ${hasEvents ? styles.eventDay : ''} ${hasEvents ? styles.clickableDay : ''}`}
          onClick={() => isValidDay && hasEvents && handleDayClick(dayNumber)}
        >
          {isValidDay && (
            <>
              <span className={styles.dayNumber}>{dayNumber}</span>
              {hasEvents && (
                <div className={styles.eventsContainer}>
                  {dayEvents.slice(0, 2).map((event, idx) => (
                    <div 
                      key={idx} 
                      className={`${styles.eventBadge} ${event.type === 'maintenance' ? styles.maintenanceEvent : styles.treatmentEvent}`}
                    >
                      <span className={styles.eventTitle}>{event.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className={styles.moreEvents}>
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      );
    }

    return days;
  };

  const hasFurniture = furnitureItems.length > 0;

  if (loading) {
    return (
      <div className={styles.maintenanceContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading maintenance schedule...</p>
          </div>
        </main>
      </div>
    );
  }

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
                <button 
                  className={styles.scanButton}
                  onClick={() => router.push('/scan')}
                >
                  Scan Now
                </button>
              </div>
            ) : (
              <div className={styles.furnitureList}>
                {furnitureItems.map((item) => (
                  <div 
                    key={item.id} 
                    className={`${styles.furnitureCard} ${selectedFurniture === item.id ? styles.selectedFurniture : ''}`}
                    onClick={() => handleFurnitureClick(item.id)}
                  >
                    <div className={styles.furnitureInfo}>
                      <span className={styles.furnitureName}>{item.name}</span>
                      <span className={styles.furnitureStatus}> – {item.status}</span>
                    </div>
                    <button className={styles.furnitureArrow}>
                      {selectedFurniture === item.id ? '▼' : '▶'}
                    </button>
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

      {/* Furniture Details Modal */}
      {showDetailsModal && selectedFurnitureDetails && (
        <div className={styles.detailsModalOverlay} onClick={closeDetailsModal}>
          <div className={styles.detailsModal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={closeDetailsModal}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className={styles.modalHeader}>
              <div className={styles.modalIcon}>{selectedFurnitureDetails.icon}</div>
              <h2 className={styles.modalTitle}>{selectedFurnitureDetails.name}</h2>
              <p className={styles.modalSubtitle}>{selectedFurnitureDetails.status}</p>
            </div>

            {selectedFurnitureDetails.image && (
              <div className={styles.modalImage}>
                <img src={selectedFurnitureDetails.image} alt={selectedFurnitureDetails.name} />
              </div>
            )}

            {selectedFurnitureDetails.treatmentData && (
              <>
                <div className={styles.modalSection}>
                  <h3 className={styles.sectionTitle}>Treatment Progress</h3>
                  <div className={styles.progressInfo}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ 
                          width: `${calculateProgress(selectedFurnitureDetails.treatmentData)}%`,
                          backgroundColor: getProgressColor(calculateProgress(selectedFurnitureDetails.treatmentData))
                        }}
                      ></div>
                    </div>
                    <span className={styles.progressText}>
                      {calculateProgress(selectedFurnitureDetails.treatmentData)}% Complete
                    </span>
                  </div>
                </div>

                <div className={styles.modalSection}>
                  <h3 className={styles.sectionTitle}>Treatment Steps</h3>
                  <div className={styles.stepsList}>
                    {selectedFurnitureDetails.treatmentData.treatmentSteps?.map((step: any, index: number) => (
                      <div key={index} className={styles.stepItem}>
                        <div className={styles.stepNumber}>{index + 1}</div>
                        <div className={styles.stepContent}>
                          <h4 className={styles.stepTitle}>{step.title}</h4>
                          {step.scheduledDate && (
                            <p className={styles.stepDate}>
                              📅 {new Date(step.scheduledDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedFurnitureDetails.treatmentData.maintenanceSchedule && 
                 selectedFurnitureDetails.treatmentData.maintenanceSchedule.length > 0 && (
                  <div className={styles.modalSection}>
                    <h3 className={styles.sectionTitle}>Upcoming Maintenance</h3>
                    <div className={styles.maintenanceList}>
                      {selectedFurnitureDetails.treatmentData.maintenanceSchedule.slice(0, 3).map((maintenance: any, index: number) => (
                        <div key={index} className={styles.maintenanceItem}>
                          <div className={styles.maintenanceIcon}>
                            {maintenance.priority === 'high' ? '🔴' : maintenance.priority === 'medium' ? '🟡' : '🟢'}
                          </div>
                          <div className={styles.maintenanceContent}>
                            <h4 className={styles.maintenanceTitle}>{maintenance.title}</h4>
                            <p className={styles.maintenanceDate}>
                              {new Date(maintenance.scheduledDate).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <button 
              className={styles.closeModalButton}
              onClick={closeDetailsModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
      {/* Day Details Modal */}
      {showDayModal && (
        <div className={styles.detailsModalOverlay} onClick={() => setShowDayModal(false)}>
          <div className={styles.dayModal} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowDayModal(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className={styles.dayModalHeader}>
              <div className={styles.dayModalIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h2 className={styles.dayModalTitle}>{selectedDayDate}</h2>
              <p className={styles.dayModalSubtitle}>{selectedDayEvents.length} scheduled {selectedDayEvents.length === 1 ? 'task' : 'tasks'}</p>
            </div>

            <div className={styles.dayEventsList}>
              {(() => {
                // Group events by furniture name
                const groupedEvents: { [key: string]: CalendarEvent[] } = {};
                selectedDayEvents.forEach(event => {
                  if (!groupedEvents[event.furnitureName]) {
                    groupedEvents[event.furnitureName] = [];
                  }
                  groupedEvents[event.furnitureName].push(event);
                });

                return Object.entries(groupedEvents).map(([furnitureName, events]) => (
                  <div key={furnitureName} className={styles.furnitureGroup}>
                    <div className={styles.furnitureGroupHeader}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      </svg>
                      <h3 className={styles.furnitureGroupTitle}>{furnitureName}</h3>
                      <span className={styles.furnitureGroupCount}>{events.length} {events.length === 1 ? 'task' : 'tasks'}</span>
                    </div>
                    <div className={styles.furnitureGroupEvents}>
                      {events.map((event, index) => (
                        <div key={index} className={`${styles.dayEventCard} ${event.type === 'maintenance' ? styles.maintenanceCard : styles.treatmentCard}`}>
                          <div className={styles.dayEventContent}>
                            <div className={styles.dayEventHeader}>
                              <h4 className={styles.dayEventTitle}>{event.title}</h4>
                              <span className={`${styles.dayEventType} ${event.type === 'maintenance' ? styles.maintenanceType : styles.treatmentType}`}>
                                {event.type === 'maintenance' ? 'Maintenance' : 'Treatment'}
                              </span>
                            </div>
                            <p className={styles.dayEventDescription}>{event.description}</p>
                            <p className={styles.dayEventTime}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {new Date(event.date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                            {event.priority && (
                              <span className={`${styles.priorityBadge} ${styles[`priority${event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}`]}`}>
                                {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <button 
              className={styles.closeModalButton}
              onClick={() => setShowDayModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
