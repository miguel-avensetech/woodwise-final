"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/layout/Navbar.module.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.logoContainer}>
          <img 
            src="/assets/images/woodwise-logo.png" 
            alt="WoodWise Logo" 
            className={styles.logo}
          />
        </div>
        
        {/* Desktop Menu */}
        <div className={styles.desktopMenu}>
          <button 
            onClick={() => scrollToSection('features')}
            className={styles.navButton}
          >
            Features
          </button>
          <button 
            onClick={() => scrollToSection('how-it-works')}
            className={styles.navButton}
          >
            How It Works
          </button>
          <Link href="/signin" className={styles.navLink}>
            Sign In
          </Link>
          <Link href="/signup">
            <button className={styles.signUpButton}>
              Sign Up
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className={styles.mobileMenuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuItems}>
            <button 
              onClick={() => scrollToSection('features')}
              className={styles.mobileNavButton}
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')}
              className={styles.mobileNavButton}
            >
              How It Works
            </button>
            <Link 
              href="/signin" 
              className={styles.mobileNavLink}
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
              <button className={styles.mobileSignUpButton}>
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
