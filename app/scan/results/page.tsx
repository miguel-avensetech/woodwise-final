"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, doc, setDoc, getDocs, query, orderBy } from "firebase/firestore";
import Sidebar from "@/components/layout/Sidebar";
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
  checked: boolean;
}

interface TreatmentData {
  furnitureType: string;
  placement: string;
  defectType: string;
  defectDescription: string;
  materialsNeeded: Material[];
  diyRecipes: Recipe[];
  treatmentSteps: TreatmentStep[];
}

export default function ScanResults() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [treatmentData, setTreatmentData] = useState<TreatmentData | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<{ [key: number]: boolean }>({});
  const [checkedMaterials, setCheckedMaterials] = useState<{ [key: number]: boolean }>({});
  const [imageUrl, setImageUrl] = useState<string>("");
  const [planTitle, setPlanTitle] = useState<string>("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isDiyOpen, setIsDiyOpen] = useState(false);
  const [treatmentId, setTreatmentId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSavingPopup, setShowSavingPopup] = useState(false);

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
            if (!userId) return;

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
                if (existingTreatment.checkedMaterials) {
                  setCheckedMaterials(existingTreatment.checkedMaterials);
                }
                if (existingTreatment.title) {
                  setPlanTitle(existingTreatment.title);
                }
              }
            }
          } catch (error) {
            console.warn('Could not load existing treatment:', error);
          }
        };

        loadExistingTreatment();
        
        setLoading(false);
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

        const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
        const totalSteps = treatmentData.treatmentSteps.length;
        const progress = Math.round((completedSteps / totalSteps) * 100);

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
          checkedMaterials: checkedMaterials,
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
  }, [checkedSteps, checkedMaterials, planTitle, treatmentData, treatmentId, imageUrl, loading]);

  const handleStepCheck = (index: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleMaterialCheck = (index: number) => {
    setCheckedMaterials(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSave = () => {
    alert('Treatment plan saved!');
    router.push('/saved');
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

      const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
      const totalSteps = treatmentData.treatmentSteps.length;
      const progress = Math.round((completedSteps / totalSteps) * 100);

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
        checkedMaterials: checkedMaterials,
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
              {imageUrl && (
                <div className={styles.imageSection}>
                  <img src={imageUrl} alt="Scanned furniture" className={styles.furnitureImage} />
                </div>
              )}

              <div className={styles.damageDetails}>
                <div className={styles.detailBadgeLarge}>{treatmentData.defectType}</div>
                <div className={styles.detailRow}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  </svg>
                  <span>{treatmentData.placement} {treatmentData.furnitureType}</span>
                </div>
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
                        width: `${(Object.values(checkedSteps).filter(Boolean).length / treatmentData.treatmentSteps.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <p className={styles.progressText}>
                    {Object.values(checkedSteps).filter(Boolean).length} of {treatmentData.treatmentSteps.length} steps completed
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
                          {step.steps.map((substep, i) => (
                            <li key={i}>{substep}</li>
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
    </div>
  );
}
