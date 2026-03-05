"use client";

import Sidebar from "@/components/layout/Sidebar";
import styles from "@/styles/saved/saved.module.css";

interface SavedRecommendation {
  id: string;
  title: string;
  description: string;
  priority: string;
  savedDate: string;
  category: string;
}

export default function Saved() {
  // Empty array - no saved recommendations yet
  const savedRecommendations: SavedRecommendation[] = [
    // Uncomment to show sample recommendations
    /*
    {
      id: "1",
      title: "Apply Anti-Mold Treatment",
      description: "Use a specialized anti-mold solution to prevent further mold growth. Apply evenly across the affected surface and let it dry for 24 hours.",
      priority: "high",
      savedDate: "2 days ago",
      category: "Treatment"
    },
    {
      id: "2",
      title: "Regular Varnish Application",
      description: "Apply a protective varnish layer every 6 months to maintain the wood's finish and protect against moisture damage.",
      priority: "medium",
      savedDate: "1 week ago",
      category: "Maintenance"
    },
    {
      id: "3",
      title: "Surface Cleaning",
      description: "Clean the wood surface with a soft cloth and mild wood cleaner. Avoid harsh chemicals that can damage the finish.",
      priority: "low",
      savedDate: "2 weeks ago",
      category: "Care"
    }
    */
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return styles.priorityHigh;
      case "medium":
        return styles.priorityMedium;
      case "low":
        return styles.priorityLow;
      default:
        return "";
    }
  };

  return (
    <div className={styles.savedContainer}>
      <Sidebar />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header Banner */}
        <div className={styles.headerBanner}>
          <h1 className={styles.bannerTitle}>Saved Recommendations</h1>
          <p className={styles.bannerSubtitle}>Your bookmarked wood care recommendations</p>
        </div>

        {/* Recommendations List or Empty State */}
        {savedRecommendations.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <img 
                src="/assets/icons/bookmark.png" 
                alt="No saved recommendations" 
                className={styles.emptyIcon}
              />
            </div>
            <h3 className={styles.emptyStateTitle}>No saved recommendations</h3>
            <p className={styles.emptyStateText}>Recommendations you save will appear here</p>
          </div>
        ) : (
          <div className={styles.recommendationsList}>
          {savedRecommendations.map((rec) => (
            <div key={rec.id} className={styles.recommendationCard}>
              <div className={styles.cardHeader}>
                <div className={styles.categoryBadge}>{rec.category}</div>
                <span className={styles.savedDate}>{rec.savedDate}</span>
              </div>
              <h3 className={styles.recommendationTitle}>{rec.title}</h3>
              <p className={styles.recommendationDescription}>{rec.description}</p>
              <div className={styles.cardFooter}>
                <span className={`${styles.priorityBadge} ${getPriorityColor(rec.priority)}`}>
                  {rec.priority.toUpperCase()} PRIORITY
                </span>
                <button className={styles.removeButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </main>
    </div>
  );
}
