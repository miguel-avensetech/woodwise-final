import { Navbar, Footer, HeroSection, FeaturesSection, ProcessSection, TestimonialsSection } from "@/components";
import styles from "@/styles/page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.heroContainer}>
        <Navbar />
        <HeroSection />
      </div>
      <FeaturesSection />
      <ProcessSection />
      <TestimonialsSection />
      <div className={styles.footerContainer}>
        <Footer />
      </div>
    </main>
  );
}
