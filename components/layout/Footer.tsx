import styles from "@/styles/layout/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGrid}>
        <div>
          <img 
            src="/assets/images/woodwise-logo.png" 
            alt="WoodWise Logo" 
            className={styles.logo}
          />
          <p className={styles.description}>
            Smart recommendation system for wood treatment and preservation
          </p>
        </div>
        <div>
          <h4 className={styles.heading}>Product</h4>
          <ul className={styles.linkList}>
            <li><a href="#features" className={styles.link}>Features</a></li>
            <li><a href="#pricing" className={styles.link}>Pricing</a></li>
            <li><a href="#how-it-works" className={styles.link}>How It Works</a></li>
          </ul>
        </div>
        <div>
          <h4 className={styles.heading}>Company</h4>
          <ul className={styles.linkList}>
            <li><a href="#about" className={styles.link}>About Us</a></li>
            <li><a href="#contact" className={styles.link}>Contact</a></li>
            <li><a href="#blog" className={styles.link}>Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className={styles.heading}>Legal</h4>
          <ul className={styles.linkList}>
            <li><a href="#privacy" className={styles.link}>Privacy Policy</a></li>
            <li><a href="#terms" className={styles.link}>Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>&copy; 2026 WoodWise. All rights reserved.</p>
      </div>
    </footer>
  );
}
