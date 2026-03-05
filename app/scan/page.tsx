"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import styles from "@/styles/scan/scan.module.css";
import { analyzeMahoganyImage, MLPrediction } from "@/lib/mlApi";

export default function Scan() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MLPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      // Revoke old URL if exists
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setResult(null);
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
      const prediction = await analyzeMahoganyImage(selectedFile);
      
      // After successful analysis, reset to scan screen
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setSelectedFile(null);
      setPreviewUrl(null);
      setResult(null);
      setIsAnalyzing(false);
      
    } catch (err) {
      setError("Failed to analyze image. Please make sure the ML API is running.");
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  const handleCancelAnalysis = () => {
    setIsAnalyzing(false);
    setError(null);
  };

  const handleCloseError = () => {
    setError(null);
  };

  const handleChangeImage = () => {
    // Revoke old URL before clearing
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className={styles.scanContainer}>
      <Sidebar />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header Banner */}
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
              <button 
                className={styles.uploadButton}
                onClick={handleUploadClick}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Upload Photo
              </button>
              
              <button 
                className={styles.captureButton}
                onClick={handleCaptureClick}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Capture Photo
              </button>
            </div>
          )}

          {previewUrl && !result && (
            <div className={styles.actionButtons}>
              <button 
                className={styles.changeImageButton}
                onClick={handleChangeImage}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="1 4 1 10 7 10"/>
                  <polyline points="23 20 23 14 17 14"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                </svg>
                Change Image
              </button>
              <button 
                className={styles.analyzeButton}
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Image"}
              </button>
            </div>
          )}

          {result && (
            <div className={styles.resultContainer}>
              <div className={styles.resultHeader}>
                <h3 className={styles.resultTitle}>Analysis Results</h3>
                <span className={`${styles.resultBadge} ${result.is_mahogany ? styles.success : styles.warning}`}>
                  {result.wood_type}
                </span>
              </div>
              
              <div className={styles.resultItem}>
                <strong>Confidence:</strong> {(result.confidence * 100).toFixed(1)}%
              </div>
              
              <div className={styles.resultItem}>
                <strong>Status:</strong> {result.status}
              </div>

              {result.defects.length > 0 && (
                <div className={styles.defectsSection}>
                  <h4>Detected Issues:</h4>
                  <ul className={styles.defectsList}>
                    {result.defects.map((defect, index) => (
                      <li key={index}>
                        {defect.type.replace('_', ' ')} - {defect.severity} 
                        ({(defect.confidence * 100).toFixed(0)}% confidence)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div className={styles.recommendationsSection}>
                  <h4>Recommendations:</h4>
                  {result.recommendations.map((rec, index) => (
                    <div key={index} className={styles.recommendation}>
                      <strong>{rec.title}</strong>
                      <p>{rec.description}</p>
                      <span className={styles.priority}>Priority: {rec.priority}</span>
                    </div>
                  ))}
                </div>
              )}

              <button 
                className={styles.newScanButton}
                onClick={() => {
                  // Revoke old URL before clearing
                  if (previewUrl) {
                    URL.revokeObjectURL(previewUrl);
                  }
                  
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setResult(null);
                  setError(null);
                }}
              >
                Scan Another Image
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Analyzing Modal */}
      {isAnalyzing && (
        <div className={styles.analyzingOverlay}>
          <div className={styles.analyzingModal}>
            <button 
              className={styles.closeButton}
              onClick={handleCancelAnalysis}
              aria-label="Close"
            >
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

      {/* Error Toast */}
      {error && (
        <div className={styles.errorToast}>
          <div className={styles.errorContent}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC3545" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className={styles.errorText}>{error}</span>
          </div>
          <button 
            className={styles.errorCloseButton}
            onClick={handleCloseError}
            aria-label="Close error"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
