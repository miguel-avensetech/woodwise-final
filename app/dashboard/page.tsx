"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, doc, getDocs, deleteDoc, updateDoc, query, orderBy, where } from "firebase/firestore";
import Sidebar from "@/components/layout/Sidebar";
import Modal from "@/components/Modal";
import styles from "@/styles/dashboard/dashboard.module.css";

interface SavedTreatment {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  furnitureType: string;
  placement: string;
  defectType: string;
  date: string;
  treatmentData: any;
  checkedSteps: any;
  checkedMaterials: any;
}

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("User");
  const [savedTreatments, setSavedTreatments] = useState<SavedTreatment[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.displayName) {
          const firstName = user.displayName.split(' ')[0];
          setUserName(firstName);
        }
        setCurrentUserId(user.uid);
        loadTreatments(user.uid);
      } else {
        setCurrentUserId(null);
        setSavedTreatments([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadTreatments = async (userId: string) => {
    try {
      setLoading(true);
      const treatmentsRef = collection(db, 'treatments');
      const q = query(treatmentsRef, where('userId', '==', userId), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const treatments: SavedTreatment[] = [];
      querySnapshot.forEach((doc) => {
        treatments.push(doc.data() as SavedTreatment);
      });
      
      setSavedTreatments(treatments);
    } catch (error) {
      console.error('Error loading treatments from Firestore:', error);
      setSavedTreatments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTreatment = (treatment: SavedTreatment) => {
    // Store treatment data in sessionStorage to view it
    sessionStorage.setItem('treatmentData', JSON.stringify(treatment.treatmentData));
    sessionStorage.setItem('furnitureImage', treatment.image);
    sessionStorage.setItem('treatmentId', treatment.id);
    router.push('/scan/results');
  };

  const handleRename = (treatment: SavedTreatment) => {
    setEditingId(treatment.id);
    setEditTitle(treatment.title);
    setActiveMenu(null);
  };

  const handleSaveRename = async (id: string) => {
    if (!editTitle.trim() || !currentUserId) {
      setEditingId(null);
      return;
    }

    try {
      const treatmentDoc = doc(db, 'treatments', id);
      
      await updateDoc(treatmentDoc, {
        title: editTitle
      });

      // Update local state
      const updatedTreatments = savedTreatments.map((t: SavedTreatment) =>
        t.id === id ? { ...t, title: editTitle } : t
      );
      setSavedTreatments(updatedTreatments);
      setEditingId(null);
    } catch (error) {
      console.error('Error renaming treatment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!currentUserId || !deleteTargetId) return;
    
    try {
      const treatmentDoc = doc(db, 'treatments', deleteTargetId);
      
      await deleteDoc(treatmentDoc);

      // Update local state
      const updatedTreatments = savedTreatments.filter((t: SavedTreatment) => t.id !== deleteTargetId);
      setSavedTreatments(updatedTreatments);
      setActiveMenu(null);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error deleting treatment:', error);
    }
  };

  const hasScans = savedTreatments.length > 0;

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.welcomeBanner}>
            <h1 className={styles.welcomeTitle}>Loading...</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <div className={styles.welcomeBanner}>
          <h1 className={styles.welcomeTitle}>Welcome back, {userName}!</h1>
          <p className={styles.welcomeSubtitle}>Ready to check your furniture's condition?</p>
        </div>

        <section className={styles.recentScansSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recent Scans</h2>
          </div>

          {!hasScans ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>📷</div>
              <h3 className={styles.emptyStateTitle}>No scans yet</h3>
              <p className={styles.emptyStateText}>Start scanning your furniture to track its condition</p>
              <Link href="/scan">
                <button className={styles.scanNowButton}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  Scan Now
                </button>
              </Link>
            </div>
          ) : (
            <div className={styles.treatmentsList}>
              {savedTreatments.map((treatment) => (
                <div key={treatment.id} className={styles.treatmentCard}>
                  <div className={styles.treatmentImage}>
                    <img src={treatment.image} alt={treatment.title} />
                  </div>
                  
                  <div className={styles.treatmentContent}>
                    {editingId === treatment.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleSaveRename(treatment.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(treatment.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className={styles.titleInput}
                        autoFocus
                      />
                    ) : (
                      <h3 className={styles.treatmentTitle}>{treatment.title}</h3>
                    )}
                    
                    <p className={styles.treatmentDate}>
                      {new Date(treatment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })} at {new Date(treatment.date).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                    
                    <p className={styles.treatmentDescription}>{treatment.description}</p>
                    
                    <div className={styles.progressSection}>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ width: `${treatment.progress}%` }}
                        ></div>
                      </div>
                      <span className={styles.progressText}>{treatment.progress}% Complete</span>
                    </div>
                  </div>

                  <div className={styles.treatmentActions}>
                    <button 
                      className={styles.menuButton}
                      onClick={() => setActiveMenu(activeMenu === treatment.id ? null : treatment.id)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="12" cy="5" r="1"/>
                        <circle cx="12" cy="19" r="1"/>
                      </svg>
                    </button>

                    {activeMenu === treatment.id && (
                      <div className={styles.menuDropdown}>
                        <button 
                          className={styles.menuItem}
                          onClick={() => handleViewTreatment(treatment)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          View
                        </button>
                        <button 
                          className={styles.menuItem}
                          onClick={() => handleRename(treatment)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Rename
                        </button>
                        <button 
                          className={`${styles.menuItem} ${styles.menuItemDanger}`}
                          onClick={() => handleDelete(treatment.id)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTargetId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Treatment Plan"
        message="Are you sure you want to delete this treatment plan? This action cannot be undone."
        type="confirm"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
