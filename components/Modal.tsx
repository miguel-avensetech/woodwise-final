"use client";

import { useEffect } from "react";
import styles from "@/styles/Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: "info" | "confirm" | "success" | "error";
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText = "Cancel",
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Save the original overflow value
    const originalOverflow = document.body.style.overflow;
    
    // Set overflow to hidden when modal opens
    if (document.body) {
      document.body.style.overflow = "hidden";
    }

    // Cleanup function to restore original overflow
    return () => {
      if (document.body) {
        document.body.style.overflow = originalOverflow || "unset";
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "confirm":
        return "?";
      default:
        return "ℹ";
    }
  };

  const getIconClass = () => {
    switch (type) {
      case "success":
        return styles.iconSuccess;
      case "error":
        return styles.iconError;
      case "confirm":
        return styles.iconConfirm;
      default:
        return styles.iconInfo;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.modalIcon} ${getIconClass()}`}>
          {getIcon()}
        </div>
        
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>{message}</p>
        
        <div className={styles.modalActions}>
          {type === "confirm" ? (
            <>
              <button className={styles.cancelButton} onClick={onClose}>
                {cancelText}
              </button>
              <button className={styles.confirmButton} onClick={handleConfirm}>
                {confirmText}
              </button>
            </>
          ) : (
            <button className={styles.okButton} onClick={handleConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
