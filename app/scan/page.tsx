"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/styles/scan/scan.module.css";
import { analyzeMahoganyImage, MLPrediction } from "@/lib/mlApi";

export default function Scan() {
  const [activeTab, setActiveTab] = useState("Scan");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MLPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const prediction = await analyzeMahoganyImage(selectedFile);
      setResult(prediction);
    } catch (err) {
      setError("Failed to analyze image. Please make sure the ML API is running.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={styles.scanContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img 
            src="/assets/images/woodwise-logo.png" 
            alt="WoodWise Logo" 
            className={styles.logo}
          />
        </div>
        
        <nav className={styles.nav}>
          <Link href="/dashboard">
            <button 
              className={`${styles.navButton} ${activeTab === "Home" ? styles.active : ""}`}
            >
              Home
            </button>
          </Link>
          <button 
            className={`${styles.navButton} ${activeTab === "Scan" ? styles.active : ""}`}
            onClick={() => setActiveTab("Scan")}
          >
            Scan
          </button>
          <Link href="/notification">
            <button 
              className={`${styles.navButton} ${activeTab === "Notification" ? styles.active : ""}`}
            >
              Notification
            </button>
          </Link>
          <Link href="/profile">
            <button 
              className={`${styles.navButton} ${activeTab === "Profile" ? styles.active : ""}`}
            >
              Profile
            </button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
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

          {previewUrl && (
            <div className={styles.previewContainer}>
              <img src={previewUrl} alt="Preview" className={styles.preview} />
            </div>
          )}

          {!previewUrl && (
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
                className={styles.uploadIcon}
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Photo
            </button>
          )}

          {previewUrl && !result && (
            <button 
              className={styles.analyzeButton}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze Image"}
            </button>
          )}

          {error && (
            <div className={styles.errorMessage}>
              {error}
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
    </div>
  );
}
