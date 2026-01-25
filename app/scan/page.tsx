"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/scan/scan.module.css";

export default function Scan() {
  const [activeTab, setActiveTab] = useState("Scan");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('fileInput')?.click();
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
        </div>
      </main>
    </div>
  );
}
