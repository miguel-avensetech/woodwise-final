"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Sidebar from "@/components/layout/Sidebar";
import Modal from "@/components/Modal";
import styles from "@/styles/profile/profile.module.css";
import { logOut } from "@/lib/auth";

export default function Profile() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string>("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Real stats from Firestore
  const [totalScans, setTotalScans] = useState(0);
  const [furnitureItems, setFurnitureItems] = useState(0);
  const [scheduledTasks, setScheduledTasks] = useState(0);
  const [savedItems, setSavedItems] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserName(user.displayName || "User");
        setUserEmail(user.email || "");
        setUserPhoto(user.photoURL);
        
        // Format member since date
        if (user.metadata.creationTime) {
          const date = new Date(user.metadata.creationTime);
          const formatted = date.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          });
          setMemberSince(formatted);
        }
        
        // Load user stats
        loadUserStats(user.uid);
      } else {
        router.push("/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const loadUserStats = async (userId: string) => {
    try {
      setLoading(true);
      const treatmentsRef = collection(db, 'treatments');
      const q = query(treatmentsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      let totalTasks = 0;
      const treatments = querySnapshot.docs.length;
      
      querySnapshot.forEach((doc) => {
        const treatment = doc.data();
        
        // Count scheduled tasks (treatment steps + maintenance schedule)
        if (treatment.treatmentData?.treatmentSteps) {
          totalTasks += treatment.treatmentData.treatmentSteps.length;
        }
        if (treatment.treatmentData?.maintenanceSchedule) {
          totalTasks += treatment.treatmentData.maintenanceSchedule.length;
        }
      });
      
      setTotalScans(treatments);
      setFurnitureItems(treatments);
      setScheduledTasks(totalTasks);
      setSavedItems(treatments);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      setShowErrorModal(true);
    }
  };

  if (loading) {
    return (
      <div className={styles.profileContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <Sidebar />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header Banner */}
        <div className={styles.headerBanner}>
          <h1 className={styles.bannerTitle}>Profile</h1>
          <p className={styles.bannerSubtitle}>Manage your account information and view your activity</p>
        </div>

        {/* Profile Content Grid */}
        <div className={styles.profileGrid}>
          
          {/* Left Column - Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.avatarContainer}>
              {userPhoto ? (
                <img src={userPhoto} alt="Profile" className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <button className={styles.changePhotoButton}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
            </div>
            
            <h2 className={styles.profileName}>{userName}</h2>
            <p className={styles.profileEmail}>{userEmail}</p>
            <p className={styles.memberSince}>Member since {memberSince || "Recently"}</p>
            
            <div className={styles.profileDivider}></div>
            
            <div className={styles.quickStats}>
              <div className={styles.quickStatItem}>
                <span className={styles.quickStatValue}>{totalScans}</span>
                <span className={styles.quickStatLabel}>Scans</span>
              </div>
              <div className={styles.quickStatItem}>
                <span className={styles.quickStatValue}>{furnitureItems}</span>
                <span className={styles.quickStatLabel}>Items</span>
              </div>
              <div className={styles.quickStatItem}>
                <span className={styles.quickStatValue}>{savedItems}</span>
                <span className={styles.quickStatLabel}>Saved</span>
              </div>
            </div>

            <div className={styles.profileDivider}></div>

            {/* Logout Button in Profile Card */}
            <button 
              className={styles.logoutButton} 
              onClick={() => setShowLogoutModal(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Logout
            </button>
          </div>

          {/* Right Column - Activity Stats */}
          <div className={styles.activitySection}>
            <h3 className={styles.sectionTitle}>Activity Overview</h3>
            <div className={styles.activityGrid}>
              <div className={styles.activityCard}>
                <div className={styles.activityIcon}>📷</div>
                <div className={styles.activityInfo}>
                  <div className={styles.activityValue}>{totalScans}</div>
                  <div className={styles.activityLabel}>Total Scans</div>
                  <div className={styles.activityDescription}>Furniture analyzed</div>
                </div>
              </div>
              <div className={styles.activityCard}>
                <div className={styles.activityIcon}>🪑</div>
                <div className={styles.activityInfo}>
                  <div className={styles.activityValue}>{furnitureItems}</div>
                  <div className={styles.activityLabel}>Furniture Items</div>
                  <div className={styles.activityDescription}>In your collection</div>
                </div>
              </div>
              <div className={styles.activityCard}>
                <div className={styles.activityIcon}>📅</div>
                <div className={styles.activityInfo}>
                  <div className={styles.activityValue}>{scheduledTasks}</div>
                  <div className={styles.activityLabel}>Scheduled Tasks</div>
                  <div className={styles.activityDescription}>Maintenance reminders</div>
                </div>
              </div>
              <div className={styles.activityCard}>
                <div className={styles.activityIcon}>🔖</div>
                <div className={styles.activityInfo}>
                  <div className={styles.activityValue}>{savedItems}</div>
                  <div className={styles.activityLabel}>Saved Items</div>
                  <div className={styles.activityDescription}>Recommendations saved</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        message="Are you sure you want to logout?"
        type="confirm"
        confirmText="Yes, Logout"
        cancelText="Cancel"
      />

      {/* Error Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="Logout Failed"
        message="Failed to logout. Please try again."
        type="error"
        confirmText="OK"
      />
    </div>
  );
}
