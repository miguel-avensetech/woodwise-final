"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, orderBy, updateDoc } from "firebase/firestore";
import Sidebar from "@/components/layout/Sidebar";
import Modal from "@/components/Modal";
import styles from "@/styles/saved/saved.module.css";
import jsPDF from "jspdf";

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
}

export default function Saved() {
  const router = useRouter();
  const [savedTreatments, setSavedTreatments] = useState<SavedTreatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
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
        const data = doc.data();
        // Filter for saved treatments in client-side
        if (data.saved === true) {
          treatments.push(data as SavedTreatment);
        }
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

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!currentUserId || !deleteTargetId) return;
    
    try {
      const treatmentDoc = doc(db, 'treatments', deleteTargetId);
      // Instead of deleting, just mark as not saved
      await updateDoc(treatmentDoc, { saved: false });

      // Update local state
      const updatedTreatments = savedTreatments.filter((t) => t.id !== deleteTargetId);
      setSavedTreatments(updatedTreatments);
      
      // Close modal after successful operation
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Error removing from saved:', error);
      // Close modal even on error
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  const handleDownloadPDF = (treatment: SavedTreatment) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    const margin = 20;
    const lineHeight = 7;

    // Helper function to add text with word wrap
    const addText = (text: string, x: number, fontSize: number = 11, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      lines.forEach((line: string) => {
        if (yPos > pageHeight - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, x, yPos);
        yPos += lineHeight;
      });
    };

    // Title
    doc.setFillColor(93, 78, 55); // Brown color
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(treatment.title, pageWidth / 2, 25, { align: 'center' });
    
    yPos = 50;
    doc.setTextColor(0, 0, 0);

    // Furniture Details
    addText('FURNITURE DETAILS', margin, 14, true);
    yPos += 3;
    addText(`Type: ${treatment.furnitureType}`, margin + 5, 11);
    addText(`Placement: ${treatment.placement}`, margin + 5, 11);
    addText(`Defect: ${treatment.defectType}`, margin + 5, 11);
    addText(`Description: ${treatment.description}`, margin + 5, 11);
    addText(`Progress: ${treatment.progress}%`, margin + 5, 11);
    yPos += 5;

    // Materials Needed
    if (treatment.treatmentData?.materialsNeeded) {
      addText('MATERIALS NEEDED', margin, 14, true);
      yPos += 3;
      treatment.treatmentData.materialsNeeded.forEach((material: any, index: number) => {
        addText(`${index + 1}. ${material.name}${material.quantity ? ` - ${material.quantity}` : ''}`, margin + 5, 11);
      });
      yPos += 5;
    }

    // Treatment Steps
    if (treatment.treatmentData?.treatmentSteps) {
      addText('TREATMENT STEPS', margin, 14, true);
      yPos += 3;
      treatment.treatmentData.treatmentSteps.forEach((step: any, index: number) => {
        addText(`${index + 1}. ${step.title}`, margin + 5, 12, true);
        addText(step.description, margin + 10, 10);
        step.steps.forEach((substep: string, subIndex: number) => {
          addText(`   ${String.fromCharCode(97 + subIndex)}. ${substep}`, margin + 10, 10);
        });
        if (step.scheduledDate) {
          addText(`   Scheduled: ${new Date(step.scheduledDate).toLocaleString()}`, margin + 10, 9);
        }
        yPos += 3;
      });
    }

    // Maintenance Schedule
    if (treatment.treatmentData?.maintenanceSchedule && treatment.treatmentData.maintenanceSchedule.length > 0) {
      yPos += 5;
      addText('MAINTENANCE SCHEDULE', margin, 14, true);
      yPos += 3;
      treatment.treatmentData.maintenanceSchedule.forEach((maintenance: any, index: number) => {
        addText(`${index + 1}. ${maintenance.title}`, margin + 5, 12, true);
        addText(maintenance.description, margin + 10, 10);
        addText(`   Frequency: ${maintenance.frequency}`, margin + 10, 9);
        addText(`   Priority: ${maintenance.priority}`, margin + 10, 9);
        if (maintenance.scheduledDate) {
          addText(`   Scheduled: ${new Date(maintenance.scheduledDate).toLocaleString()}`, margin + 10, 9);
        }
        yPos += 3;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated by WoodWise on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save PDF
    doc.save(`${treatment.title.replace(/[^a-z0-9]/gi, '_')}_Treatment_Plan.pdf`);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return styles.progressHigh;
    if (progress >= 50) return styles.progressMedium;
    return styles.progressLow;
  };

  if (loading) {
    return (
      <div className={styles.savedContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.headerBanner}>
            <h1 className={styles.bannerTitle}>Saved Recommendations</h1>
            <p className={styles.bannerSubtitle}>Your bookmarked wood care recommendations</p>
          </div>
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading saved treatments...</p>
          </div>
        </main>
      </div>
    );
  }

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
        {savedTreatments.length === 0 ? (
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
            {savedTreatments.map((treatment) => (
              <div key={treatment.id} className={styles.recommendationCard}>
                <div className={styles.cardImage}>
                  <img src={treatment.image} alt={treatment.title} />
                  <div className={styles.categoryBadge}>{treatment.defectType}</div>
                </div>
                
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.recommendationTitle}>{treatment.title}</h3>
                    <span className={styles.savedDate}>
                      {new Date(treatment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <p className={styles.recommendationDescription}>
                    {treatment.placement} {treatment.furnitureType} - {treatment.description}
                  </p>
                  
                  <div className={styles.progressSection}>
                    <div className={styles.progressBar}>
                      <div 
                        className={`${styles.progressFill} ${getProgressColor(treatment.progress)}`}
                        style={{ width: `${treatment.progress}%` }}
                      ></div>
                    </div>
                    <span className={styles.progressText}>{treatment.progress}% Complete</span>
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <button 
                      className={styles.downloadButton}
                      onClick={() => handleDownloadPDF(treatment)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download PDF
                    </button>
                    <button 
                      className={styles.removeButton}
                      onClick={() => handleDelete(treatment.id)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      Remove
                    </button>
                    <button 
                      className={styles.viewButton}
                      onClick={() => handleViewTreatment(treatment)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteTargetId(null);
        }}
        onConfirm={confirmDelete}
        title="Remove Treatment"
        message="Are you sure you want to remove this saved treatment? This action cannot be undone."
        type="confirm"
        confirmText="Remove"
        cancelText="Cancel"
      />
    </div>
  );
}
