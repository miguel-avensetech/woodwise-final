import styles from "@/styles/home/HeroSection.module.css";

export default function HeroSection() {
  return (
    <div className={styles.heroSection}>
      <div className={styles.textContent}>
        <h2 className={styles.heading}>
          Smart Wood Treatment & Preservation System
        </h2>
        <p className={styles.description}>
          AI-powered recommendations for mahogany wood treatment and preservation. 
          Scan for damage, get intelligent treatment plans, and schedule preventive maintenance automatically.
        </p>
        <div className={styles.buttonContainer}>
          <button className={styles.primaryButton}>
            Start Now
          </button>
          <button className={styles.secondaryButton}>
            Learn More
          </button>
        </div>
      </div>
      <div className={styles.imageContainer}>
        <div className={styles.imageWrapper}>
          <img 
            src="https://img.freepik.com/free-photo/carpenter-working-wood-front-view_23-2148643189.jpg" 
            alt="Mahogany wood restoration" 
            className={styles.image}
          />
        </div>
      </div>
    </div>
  );
}
