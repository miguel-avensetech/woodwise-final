"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import Sidebar from "@/components/layout/Sidebar";
import Modal from "@/components/Modal";
import styles from "@/styles/scan/results.module.css";

interface Material {
  name: string;
  quantity: string;
}

interface Recipe {
  name: string;
  ingredients: string[];
  instructions: string[];
}

interface TreatmentStep {
  title: string;
  description: string;
  steps: string[];
  scheduledDate?: string;
  duration?: string;
  checked: boolean;
}

interface MaintenanceSchedule {
  title: string;
  description: string;
  scheduledDate: string;
  frequency: string;
  priority: string;
}

interface TreatmentData {
  furnitureType: string;
  placement: string;
  defectType: string;
  defectDescription: string;
  materialsNeeded: Material[];
  diyRecipes: Recipe[];
  treatmentSteps: TreatmentStep[];
  maintenanceSchedule?: MaintenanceSchedule[];
}

export default function ScanResults() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [treatmentData, setTreatmentData] = useState<TreatmentData | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<{ [key: number]: boolean }>({});
  const [checkedSubSteps, setCheckedSubSteps] = useState<{ [key: string]: boolean }>({});
  const [checkedMaterials, setCheckedMaterials] = useState<{ [key: number]: boolean }>({});
  const [imageUrl, setImageUrl] = useState<string>("");
  const [planTitle, setPlanTitle] = useState<string>("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isDiyOpen, setIsDiyOpen] = useState(false);
  const [treatmentId, setTreatmentId] = useState<string>("");
  const [showSavingPopup, setShowSavingPopup] = useState(false);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [mahoganyData, setMahoganyData] = useState<any>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('treatmentData');
    const storedImage = sessionStorage.getItem('furnitureImage');
    const storedId = sessionStorage.getItem('treatmentId');
    
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setTreatmentData(parsed);
        setPlanTitle(`${parsed.furnitureType} Treatment Plan`);
        
        if (storedImage) {
          setImageUrl(storedImage);
        }

        // Get mahogany classification from treatment data or sessionStorage
        if (parsed.mahoganyClassification) {
          setMahoganyData(parsed.mahoganyClassification);
        } else {
          const storedMahogany = sessionStorage.getItem('mahoganyClassification');
          if (storedMahogany) {
            setMahoganyData(JSON.parse(storedMahogany));
          }
        }

        // Set or create treatment ID
        let currentId = storedId;
        if (!currentId) {
          // This should rarely happen since scan page now sets it
          currentId = `treatment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('treatmentId', currentId);
        }
        setTreatmentId(currentId);

        // Load existing saved treatment to restore checkbox states from Firestore
        const loadExistingTreatment = async () => {
          try {
            const userId = auth.currentUser?.uid;
            if (!userId) {
              setLoading(false);
              return;
            }

            const treatmentDocRef = doc(db, 'treatments', currentId);
            
            // Try to get the specific treatment
            const { getDoc } = await import('firebase/firestore');
            const docSnap = await getDoc(treatmentDocRef);
            
            if (docSnap.exists()) {
              const existingTreatment = docSnap.data();
              // Verify this treatment belongs to the current user
              if (existingTreatment.userId === userId) {
                // Restore checkbox states from saved treatment
                if (existingTreatment.checkedSteps) {
                  setCheckedSteps(existingTreatment.checkedSteps);
                }
                if (existingTreatment.checkedSubSteps) {
                  setCheckedSubSteps(existingTreatment.checkedSubSteps);
                }
                if (existingTreatment.checkedMaterials) {
                  setCheckedMaterials(existingTreatment.checkedMaterials);
                }
                if (existingTreatment.title) {
                  setPlanTitle(existingTreatment.title);
                }
                console.log('Restored checkbox states from Firestore');
              }
            }
            setLoading(false);
          } catch (error) {
            console.warn('Could not load existing treatment:', error);
            setLoading(false);
          }
        };

        loadExistingTreatment();
      } catch (error) {
        console.error('Error parsing treatment data:', error);
        router.push('/scan');
      }
    } else {
      router.push('/scan');
    }
  }, [router]);

  // Auto-save whenever checkboxes or title changes to Firestore
  useEffect(() => {
    if (!treatmentData || !treatmentId || loading) return;

    const autoSave = async () => {
      // Don't show popup for auto-save, only save silently
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.warn('No user logged in, cannot save treatment');
          return;
        }

        // Calculate progress based on substeps
        const totalSubSteps = treatmentData.treatmentSteps.reduce((sum, step) => sum + step.steps.length, 0);
        const checkedSubStepsCount = Object.values(checkedSubSteps).filter(Boolean).length;
        const progress = totalSubSteps > 0 ? Math.round((checkedSubStepsCount / totalSubSteps) * 100) : 0;

        // Use OpenAI-provided schedules from treatmentData
        const notificationSchedules = generateNotificationSchedulesFromTreatment(treatmentData);

        const treatmentEntry = {
          id: treatmentId,
          userId: userId,
          title: planTitle,
          description: treatmentData.defectDescription,
          image: imageUrl,
          progress: progress,
          furnitureType: treatmentData.furnitureType,
          placement: treatmentData.placement,
          defectType: treatmentData.defectType,
          date: new Date().toISOString(),
          treatmentData: treatmentData,
          checkedSteps: checkedSteps,
          checkedSubSteps: checkedSubSteps,
          checkedMaterials: checkedMaterials,
          notificationSchedules: notificationSchedules,
        };

        // Save to Firestore: treatments/{treatmentId}
        const treatmentDoc = doc(db, 'treatments', treatmentId);
        
        await setDoc(treatmentDoc, treatmentEntry, { merge: true });
      } catch (error) {
        console.error('Error auto-saving treatment to Firestore:', error);
      }
    };

    // Debounce auto-save by 300ms
    const timeoutId = setTimeout(autoSave, 300);
    return () => clearTimeout(timeoutId);
  }, [checkedSteps, checkedSubSteps, checkedMaterials, planTitle, treatmentData, treatmentId, imageUrl, loading]);

  const handleStepCheck = (index: number) => {
    const newChecked = !checkedSteps[index];
    setCheckedSteps(prev => ({
      ...prev,
      [index]: newChecked
    }));

    // Check/uncheck all substeps when main step is toggled
    if (treatmentData) {
      const step = treatmentData.treatmentSteps[index];
      const newSubSteps = { ...checkedSubSteps };
      step.steps.forEach((_, subIndex) => {
        newSubSteps[`${index}-${subIndex}`] = newChecked;
      });
      setCheckedSubSteps(newSubSteps);
    }
  };

  const handleSubStepCheck = (stepIndex: number, subStepIndex: number) => {
    const key = `${stepIndex}-${subStepIndex}`;
    const newChecked = !checkedSubSteps[key];
    
    setCheckedSubSteps(prev => ({
      ...prev,
      [key]: newChecked
    }));

    // Check if all substeps are checked
    if (treatmentData) {
      const step = treatmentData.treatmentSteps[stepIndex];
      const allSubStepsChecked = step.steps.every((_, subIndex) => {
        const subKey = `${stepIndex}-${subIndex}`;
        return subKey === key ? newChecked : checkedSubSteps[subKey];
      });

      // Update main step checkbox if all substeps are checked
      if (allSubStepsChecked !== checkedSteps[stepIndex]) {
        setCheckedSteps(prev => ({
          ...prev,
          [stepIndex]: allSubStepsChecked
        }));
      }
    }
  };

  const handleMaterialCheck = (index: number) => {
    setCheckedMaterials(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSave = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId || !treatmentId) {
        setShowSavedModal(true);
        return;
      }

      // Mark treatment as saved in Firestore
      const treatmentDoc = doc(db, 'treatments', treatmentId);
      await setDoc(treatmentDoc, { saved: true }, { merge: true });

      setShowSavedModal(true);
    } catch (error) {
      console.error('Error saving treatment:', error);
      setShowSavedModal(true);
    }
  };

  const handleDone = async () => {
    setShowSavingPopup(true);
    
    try {
      const userId = auth.currentUser?.uid;
      if (!userId || !treatmentData || !treatmentId) {
        console.warn('Missing required data for saving');
        setShowSavingPopup(false);
        router.push('/dashboard');
        return;
      }

      // Calculate progress based on substeps
      const totalSubSteps = treatmentData.treatmentSteps.reduce((sum, step) => sum + step.steps.length, 0);
      const checkedSubStepsCount = Object.values(checkedSubSteps).filter(Boolean).length;
      const progress = totalSubSteps > 0 ? Math.round((checkedSubStepsCount / totalSubSteps) * 100) : 0;

      // Use OpenAI-provided schedules from treatmentData
      const notificationSchedules = generateNotificationSchedulesFromTreatment(treatmentData);

      const treatmentEntry = {
        id: treatmentId,
        userId: userId,
        title: planTitle,
        description: treatmentData.defectDescription,
        image: imageUrl,
        progress: progress,
        furnitureType: treatmentData.furnitureType,
        placement: treatmentData.placement,
        defectType: treatmentData.defectType,
        date: new Date().toISOString(),
        treatmentData: treatmentData,
        checkedSteps: checkedSteps,
        checkedSubSteps: checkedSubSteps,
        checkedMaterials: checkedMaterials,
        notificationSchedules: notificationSchedules,
      };

      // Save to Firestore
      const treatmentDoc = doc(db, 'treatments', treatmentId);
      await setDoc(treatmentDoc, treatmentEntry, { merge: true });

      // Wait for at least 1 second to show the saving indicator
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSavingPopup(false);
      
      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving treatment:', error);
      setShowSavingPopup(false);
      
      // Still navigate even if save fails
      router.push('/dashboard');
    }
  };

  const handleRename = () => {
    setIsEditingTitle(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlanTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (!planTitle.trim() && treatmentData) {
      setPlanTitle(`${treatmentData.furnitureType} Treatment Plan`);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    }
  };

  // Convert OpenAI-provided schedules to notification format
  const generateNotificationSchedulesFromTreatment = (data: TreatmentData) => {
    const schedules: any[] = [];

    // Add treatment step notifications
    data.treatmentSteps.forEach((step, index) => {
      if (step.scheduledDate) {
        schedules.push({
          type: 'treatment',
          stepIndex: index,
          title: step.title,
          message: step.description,
          scheduledTime: step.scheduledDate,
          icon: '🧴',
          read: false,
        });
      }
    });

    // Add maintenance schedule notifications
    if (data.maintenanceSchedule) {
      data.maintenanceSchedule.forEach((maintenance) => {
        schedules.push({
          type: 'maintenance',
          title: maintenance.title,
          message: maintenance.description,
          scheduledTime: maintenance.scheduledDate,
          icon: maintenance.priority === 'high' ? '🔧' : maintenance.priority === 'medium' ? '📋' : '🔍',
          read: false,
        });
      });
    }

    return schedules;
  };

  if (loading || !treatmentData) {
    return (
      <div className={styles.loadingContainer}>
        <Sidebar />
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <p>Loading treatment plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resultsContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        {/* Header Banner */}
        <div className={styles.headerBanner}>
          <div className={styles.headerTop}>
            <button className={styles.backButton} onClick={() => router.push('/scan')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back
            </button>

            <div className={styles.headerTitle}>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={planTitle}
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
                  onKeyDown={handleTitleKeyDown}
                  className={styles.titleInput}
                  autoFocus
                />
              ) : (
                <>
                  <h1 className={styles.titleText}>{planTitle}</h1>
                  <button className={styles.renameButton} onClick={handleRename} aria-label="Rename">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </>
              )}
            </div>

            <button className={styles.saveButtonHeader} onClick={handleSave}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              Save
            </button>
          </div>
        </div>

        <div className={styles.contentWrapper}>
          {/* Two Column Layout */}
          <div className={styles.twoColumnLayout}>
            {/* Left Column - Image and Details */}
            <div className={styles.leftColumn}>
              <div className={styles.imageSection}>
                {imageUrl && (
                  <img src={imageUrl} alt="Scanned furniture" className={styles.furnitureImage} />
                )}
                
                {/* ML Wood Classification */}
                {mahoganyData && (
                  <div className={styles.mlClassification}>
                    <div className={styles.mlHeader}>
                      <span className={styles.mlTitle}>Wood Type: {mahoganyData.wood_type}</span>
                    </div>
                    <div className={styles.mlConfidenceBar}>
                      <span className={styles.mlLabel}>ML Confidence:</span>
                      <div className={styles.mlBar}>
                        <div 
                          className={styles.mlFill}
                          style={{ width: `${mahoganyData.confidence}%` }}
                        />
                      </div>
                      <span className={styles.mlValue}>{mahoganyData.confidence}%</span>
                    </div>
                    <div className={styles.mlDisclaimer}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <span>Wood identification may be affected by image quality, lighting, or finish. Results are estimates.</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.damageDetails}>
                <div className={styles.detailBadgeLarge}>{treatmentData.defectType}</div>
                <div className={styles.detailRow}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                  <span>{treatmentData.placement} {treatmentData.furnitureType}</span>
                </div>
                
                {/* Severity Level Bar */}
                {treatmentData.defectDescription && (
                  <div className={styles.severitySection}>
                    <div className={styles.severityLabel}>Severity Level</div>
                    <div className={styles.severityBarContainer}>
                      <div className={styles.severityBar}>
                        <div 
                          className={`${styles.severityFill} ${
                            treatmentData.defectDescription.toLowerCase().includes('severe') || 
                            treatmentData.defectDescription.toLowerCase().includes('significant') 
                              ? styles.severityHigh 
                              : treatmentData.defectDescription.toLowerCase().includes('moderate')
                              ? styles.severityMedium
                              : styles.severityLow
                          }`}
                          style={{ 
                            width: treatmentData.defectDescription.toLowerCase().includes('severe') || 
                                   treatmentData.defectDescription.toLowerCase().includes('significant')
                              ? '85%' 
                              : treatmentData.defectDescription.toLowerCase().includes('moderate')
                              ? '60%'
                              : '35%'
                          }}
                        />
                      </div>
                      <span className={styles.severityText}>
                        {treatmentData.defectDescription.toLowerCase().includes('severe') || 
                         treatmentData.defectDescription.toLowerCase().includes('significant')
                          ? 'High' 
                          : treatmentData.defectDescription.toLowerCase().includes('moderate')
                          ? 'Medium'
                          : 'Low'}
                      </span>
                    </div>
                  </div>
                )}
                
                <p className={styles.damageDescription}>{treatmentData.defectDescription}</p>
              </div>
            </div>

            {/* Right Column - Treatment Plan */}
            <div className={styles.rightColumn}>
              {/* Materials Needed */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Materials Needed</h2>
                </div>
                <div className={styles.materialsGrid}>
                  {treatmentData.materialsNeeded.map((material, index) => (
                    <div 
                      key={index} 
                      className={`${styles.materialCard} ${checkedMaterials[index] ? styles.materialChecked : ''}`}
                      onClick={() => handleMaterialCheck(index)}
                    >
                      <label className={styles.materialCheckboxLabel} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checkedMaterials[index] || false}
                          onChange={() => handleMaterialCheck(index)}
                          className={styles.materialCheckbox}
                        />
                        <span className={styles.materialCheckboxCustom}></span>
                      </label>
                      <div className={styles.materialInfo}>
                        <span className={styles.materialName}>{material.name}</span>
                        {material.quantity && <span className={styles.materialQty}>{material.quantity}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* DIY Solutions Dropdown */}
                {treatmentData.diyRecipes.length > 0 && (
                  <div className={styles.diyDropdown}>
                    <button 
                      className={styles.diyToggle}
                      onClick={() => setIsDiyOpen(!isDiyOpen)}
                    >
                      <span>DIY Solutions</span>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        className={isDiyOpen ? styles.chevronOpen : ''}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    
                    {isDiyOpen && (
                      <div className={styles.diyContent}>
                        {treatmentData.diyRecipes.map((recipe, index) => (
                          <div key={index} className={styles.recipeCard}>
                            <h3 className={styles.recipeTitle}>{recipe.name}</h3>
                            <div className={styles.recipeGrid}>
                              <div className={styles.recipeColumn}>
                                <h4 className={styles.recipeSubtitle}>Ingredients</h4>
                                <ul className={styles.recipeList}>
                                  {recipe.ingredients.map((ingredient, i) => (
                                    <li key={i}>{ingredient}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className={styles.recipeColumn}>
                                <h4 className={styles.recipeSubtitle}>Instructions</h4>
                                <ol className={styles.recipeList}>
                                  {recipe.instructions.map((instruction, i) => (
                                    <li key={i}>{instruction}</li>
                                  ))}
                                </ol>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* Treatment Steps */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Step-by-Step Treatment</h2>
                </div>
                
                <div className={styles.progressSection}>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ 
                        width: `${(() => {
                          // Count total substeps
                          const totalSubSteps = treatmentData.treatmentSteps.reduce((sum, step) => sum + step.steps.length, 0);
                          // Count checked substeps
                          const checkedSubStepsCount = Object.values(checkedSubSteps).filter(Boolean).length;
                          // Calculate percentage
                          return totalSubSteps > 0 ? Math.round((checkedSubStepsCount / totalSubSteps) * 100) : 0;
                        })()}%` 
                      }}
                    ></div>
                  </div>
                  <p className={styles.progressText}>
                    {(() => {
                      const totalSubSteps = treatmentData.treatmentSteps.reduce((sum, step) => sum + step.steps.length, 0);
                      const checkedSubStepsCount = Object.values(checkedSubSteps).filter(Boolean).length;
                      const percentage = totalSubSteps > 0 ? Math.round((checkedSubStepsCount / totalSubSteps) * 100) : 0;
                      return `${percentage}% completed (${checkedSubStepsCount} of ${totalSubSteps} tasks)`;
                    })()}
                  </p>
                </div>

                <div className={styles.stepsContainer}>
                  {treatmentData.treatmentSteps.map((step, index) => (
                    <div key={index} className={`${styles.stepCard} ${checkedSteps[index] ? styles.stepCompleted : ''}`}>
                      <div className={styles.stepNumber}>{index + 1}</div>
                      <div className={styles.stepContent}>
                        <div className={styles.stepHeader}>
                          <h3 className={styles.stepTitle}>{step.title}</h3>
                          <label className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              checked={checkedSteps[index] || false}
                              onChange={() => handleStepCheck(index)}
                              className={styles.stepCheckbox}
                            />
                            <span className={styles.checkboxCustom}></span>
                          </label>
                        </div>
                        <p className={styles.stepDescription}>{step.description}</p>
                        <ul className={styles.stepList}>
                          {step.steps.map((substep, subIndex) => (
                            <li key={subIndex} className={styles.substepItem}>
                              <label className={styles.substepCheckboxLabel}>
                                <input
                                  type="checkbox"
                                  checked={checkedSubSteps[`${index}-${subIndex}`] || false}
                                  onChange={() => handleSubStepCheck(index, subIndex)}
                                  className={styles.substepCheckbox}
                                />
                                <span className={styles.substepCheckboxCustom}></span>
                                <span className={styles.substepText}>{substep}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <button className={styles.doneButton} onClick={handleDone}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Saving Indicator */}
      {showSavingPopup && (
        <div className={styles.savingOverlay}>
          <div className={styles.savingModal}>
            <div className={styles.savingSpinner}></div>
            <p className={styles.savingText}>Saving changes...</p>
          </div>
        </div>
      )}

      {/* Saved Success Modal */}
      <Modal
        isOpen={showSavedModal}
        onClose={() => setShowSavedModal(false)}
        title="Treatment Plan Saved!"
        message="Your treatment plan has been saved successfully."
        type="success"
        confirmText="Done"
      />
    </div>
  );
}
