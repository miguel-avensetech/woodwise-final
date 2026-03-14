"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/lib/imageUtils";
import Sidebar from "@/components/layout/Sidebar";
import styles from "@/styles/scan/scan.module.css";

export default function Scan() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Form state
  const [furnitureType, setFurnitureType] = useState<string>("");
  const [placement, setPlacement] = useState<string>("");
  
  // AI Analysis results
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Auto-close error toast after 7 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError(null);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('fileInput')?.click();
  };

  const handleCaptureClick = () => {
    document.getElementById('captureInput')?.click();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        // Compress image before sending to API
        const compressedImage = await compressImage(base64Image, 800, 0.8);

        // Step 1: AI analyzes the image for wood detection and defects
        const response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: compressedImage,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('API Error:', data);
          
          // If not wood, show error and reset
          if (data.isWood === false) {
            setIsAnalyzing(false);
            setError(data.message || 'This is not wooden furniture. Please upload an image of wooden furniture.');
            
            setTimeout(() => {
              handleChangeImage();
            }, 3000);
            return;
          }
          
          throw new Error(data.error || 'Failed to analyze image');
        }
        
        // Store AI analysis and show details form
        setAiAnalysis(data);
        setIsAnalyzing(false);
        setShowDetailsForm(true);
      };
      
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError("Failed to analyze image. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const handleSubmitDetails = async () => {
    if (!furnitureType || !placement) {
      setError("Please select furniture type and placement");
      return;
    }

    setIsAnalyzing(true);
    setShowDetailsForm(false);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile!);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        // Compress image before sending to API and saving
        const compressedImage = await compressImage(base64Image, 800, 0.8);

        // Step 3: Generate treatment plan with user inputs
        const response = await fetch('/api/generate-treatment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: compressedImage,
            furnitureType,
            placement,
            aiAnalysis: aiAnalysis, // Include AI's defect analysis
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('API Error:', data);
          throw new Error(data.error || 'Failed to generate treatment');
        }
        
        // Generate a new unique treatment ID for this scan
        const newTreatmentId = `treatment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Save to sessionStorage with new ID (using compressed image)
        sessionStorage.setItem('treatmentData', JSON.stringify(data));
        sessionStorage.setItem('furnitureImage', compressedImage);
        sessionStorage.setItem('treatmentId', newTreatmentId);
        
        // Navigate to results page
        router.push('/scan/results');
      };
      
    } catch (err) {
      console.error('Error generating treatment:', err);
      setError("Failed to generate treatment. Please try again.");
      setIsAnalyzing(false);
    }
  };

  const handleCancelAnalysis = () => {
    setIsAnalyzing(false);
    setError(null);
  };

  const handleChangeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <div className={styles.scanContainer}>
      <Sidebar />

      <main className={styles.mainContent}>
        <div className={styles.headerBanner}>
          <h1 className={styles.bannerTitle}>Scan</h1>
          <p className={styles.bannerSubtitle}>
            Upload a photo of your wooden furniture to detect defects like mold, cracks, and scratches using AI technology
          </p>
        </div>

        <div className={styles.scanCard}>
          <h1 className={styles.title}>Scan Your Furniture</h1>
          <p className={styles.description}>
            Upload a clear photo of your wooden chair or table to detect<br />
            defects like mold, cracks, and scratches.
          </p>

          <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
          />

          <input
            type="file"
            id="captureInput"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className={styles.fileInput}
          />

          {previewUrl && (
            <div className={styles.previewContainer}>
              <img src={previewUrl} alt="Preview" className={styles.preview} />
            </div>
          )}

          {!previewUrl && (
            <div className={styles.buttonGroup}>
              <button className={styles.uploadButton} onClick={handleUploadClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Photo
              </button>
              
              <button className={styles.captureButton} onClick={handleCaptureClick}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Capture Photo
              </button>
            </div>
          )}

          {previewUrl && (
            <div className={styles.actionButtons}>
              <button className={styles.changeImageButton} onClick={handleChangeImage}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"/>
                  <polyline points="23 20 23 14 17 14"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                Change Image
              </button>
              <button className={styles.analyzeButton} onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Analyze Image"}
              </button>
            </div>
          )}

          {error && (
            <div className={styles.errorToast}>
              <div className={styles.errorContent}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{error}</span>
              </div>
              <button className={styles.errorCloseButton} onClick={() => setError(null)} aria-label="Close error">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </main>

      {showDetailsForm && (
        <div className={styles.modalOverlay} onClick={() => setShowDetailsForm(false)}>
          <div className={styles.detailsModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowDetailsForm(false)} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <div className={styles.detailsHeader}>
              <div className={styles.detailsIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h3 className={styles.detailsTitle}>Analysis Results</h3>
            </div>

            {aiAnalysis && (
              <div className={styles.defectInfo}>
                <h4 className={styles.defectTitle}>{aiAnalysis.defectType}</h4>
                <p className={styles.defectDescription}>{aiAnalysis.defectDescription}</p>
                {aiAnalysis.severity && (
                  <div className={styles.severityBadge}>
                    <span className={`${styles.severity} ${styles[`severity${aiAnalysis.severity}`]}`}>
                      {aiAnalysis.severity} Severity
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className={styles.formSection}>
              <label className={styles.formLabel}>Type of furniture:</label>
              <div className={styles.optionGrid}>
                <button
                  className={`${styles.optionButton} ${furnitureType === 'Table' ? styles.optionSelected : ''}`}
                  onClick={() => setFurnitureType('Table')}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="2"/>
                    <line x1="5" y1="6" x2="5" y2="20"/>
                    <line x1="19" y1="6" x2="19" y2="20"/>
                  </svg>
                  <span>Table</span>
                </button>
                <button
                  className={`${styles.optionButton} ${furnitureType === 'Chair' ? styles.optionSelected : ''}`}
                  onClick={() => setFurnitureType('Chair')}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 18v-4h16v4M4 14V6h16v8M8 6V4h8v2M8 18v4M16 18v4"/>
                  </svg>
                  <span>Chair</span>
                </button>
              </div>
            </div>

            <div className={styles.formSection}>
              <label className={styles.formLabel}>Where is this furniture usually placed?</label>
              <div className={styles.optionGrid}>
                <button
                  className={`${styles.optionButton} ${placement === 'Indoor' ? styles.optionSelected : ''}`}
                  onClick={() => setPlacement('Indoor')}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  <span>Indoor</span>
                </button>
                <button
                  className={`${styles.optionButton} ${placement === 'Outdoor' ? styles.optionSelected : ''}`}
                  onClick={() => setPlacement('Outdoor')}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  <span>Outdoor</span>
                </button>
              </div>
            </div>

            <button className={styles.continueButton} onClick={handleSubmitDetails} disabled={!furnitureType || !placement}>
              Continue
            </button>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className={styles.analyzingOverlay}>
          <div className={styles.analyzingModal}>
            <button className={styles.closeButton} onClick={handleCancelAnalysis} aria-label="Close">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            
            <div className={styles.analyzingIcon}>
              <svg className={styles.spinner} width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#5D4E37" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
              </svg>
            </div>
            
            <h3 className={styles.analyzingTitle}>AI is analyzing your image</h3>
            <p className={styles.analyzingText}>Please wait while we process your furniture image...</p>
          </div>
        </div>
      )}
    </div>
  );
}
