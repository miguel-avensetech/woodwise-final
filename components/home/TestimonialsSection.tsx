import styles from "@/styles/home/TestimonialsSection.module.css";

export default function TestimonialsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.imageColumn}>
            <div className={styles.imageWrapper}>
              <img 
                src="https://img.freepik.com/free-photo/woman-inspecting-chair-medium-shot_23-2148966889.jpg" 
                alt="Woman inspecting chair" 
                className={styles.image}
              />
            </div>
          </div>
          
          <div className={styles.contentColumn}>
            <h2 className={styles.heading}>
              About WoodWise
            </h2>
            <div className={styles.textContent}>
              <p className={styles.paragraph}>
                WoodWise is an innovative AI-powered platform dedicated to preserving and protecting mahogany wood. 
                Our mission is to make professional wood care accessible to everyone through intelligent technology.
              </p>
              <p className={styles.paragraph}>
                Developed by wood care experts and AI specialists, our system combines decades of restoration 
                knowledge with cutting-edge machine learning to provide accurate damage detection and personalized 
                treatment recommendations.
              </p>
              <p className={styles.paragraph}>
                Whether you're a homeowner, furniture restorer, or interior designer, WoodWise helps you maintain 
                the beauty and longevity of your mahogany wood with smart, data-driven insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
