"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [treatmentData, setTreatmentData] = useState<TreatmentData | null>(null);
  const [checkedSteps, setCheckedSteps] = useState<{ [key: number]: boolean }>({});
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    // Read from sessionStorage instead of URL
    const storedData = sessionStorage.getItem('treatmentData');
    const storedImage = sessionStorage.getItem('furnitureImage');
    
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setTreatmentData(parsed);
        
        if (storedImage) {
          setImageUrl(storedImage);
        }
        
        // Save to localStorage for history
        const scanHistory = JSON.parse(localStorage.getItem('scanHistory') || '[]');
        const newScan = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          imageUrl: storedImage || '',
          treatmentData: parsed,
        };
        
        scanHistory.unshift(newScan);
        if (scanHistory.length > 10) {
          scanHistory.pop();
        }
        
        localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
        setLoading(false);
      } catch (error) {
        console.error('Error parsing treatment data:', error);
        router.push('/scan');
      }
    } else {
      router.push('/scan');
    }
  }, [router]);

  const handleStepCheck = (index: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSave = () => {
    // TODO: Save to user's saved recommendations
    alert('Treatment plan saved!');
    router.push('/saved');
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
        {/* Back Button */}
        <button className={styles.backButton} onClick={() => router.push('/scan')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 className={styles.headerTitle}>
            {treatmentData.placement} {treatmentData.furnitureType} – {treatmentData.defectType}
          </h1>
          <p className={styles.headerSubtitle}>{treatmentData.defectDescription}</p>
        </div>

        {/* Materials Needed */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Materials Needed</h2>
          <div className={styles.materialsList}>
            {treatmentData.materialsNeeded.map((material, index) => (
              <div key={index} className={styles.materialItem}>
                <span className={styles.bullet}>•</span>
                <span>{material.name} {material.quantity && `(${material.quantity})`}</span>
              </div>
            ))}
          </div>
        </section>

        {/* DIY Solution Recipes */}
        {treatmentData.diyRecipes.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>DIY Solution Recipes</h2>
            {treatmentData.diyRecipes.map((recipe, index) => (
              <div key={index} className={styles.recipeCard}>
                <h3 className={styles.recipeTitle}>{recipe.name}</h3>
                <div className={styles.recipeContent}>
                  <div className={styles.recipeSection}>
                    <strong>Ingredients:</strong>
                    <ul className={styles.recipeList}>
                      {recipe.ingredients.map((ingredient, i) => (
                        <li key={i}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.recipeSection}>
                    <strong>Instructions:</strong>
                    <ol className={styles.recipeList}>
                      {recipe.instructions.map((instruction, i) => (
                        <li key={i}>{instruction}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Treatment Guide */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Treatment Guide</h2>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ 
                width: `${(Object.values(checkedSteps).filter(Boolean).length / treatmentData.treatmentSteps.length) * 100}%` 
              }}
            ></div>
          </div>
          <p className={styles.progressText}>
            {Object.values(checkedSteps).filter(Boolean).length}/{treatmentData.treatmentSteps.length}
          </p>

          <div className={styles.treatmentSteps}>
            {treatmentData.treatmentSteps.map((step, index) => (
              <div key={index} className={styles.stepCard}>
                <div className={styles.stepHeader}>
                  <input
                    type="checkbox"
                    id={`step-${index}`}
                    checked={checkedSteps[index] || false}
                    onChange={() => handleStepCheck(index)}
                    className={styles.stepCheckbox}
                  />
                  <label htmlFor={`step-${index}`} className={styles.stepTitle}>
                    {step.title}
                  </label>
                </div>
                <p className={styles.stepDescription}>{step.description}</p>
                <ul className={styles.stepList}>
                  {step.steps.map((substep, i) => (
                    <li key={i}>{substep}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Save Button */}
        <div className={styles.saveSection}>
          <button className={styles.saveButton} onClick={handleSave}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Save
          </button>
        </div>
      </main>
    </div>
  );
}
