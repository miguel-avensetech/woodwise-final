import FeatureCard from "./FeatureCard";
import styles from "@/styles/home/FeaturesSection.module.css";

const features = [
  {
    image: "https://img.freepik.com/free-photo/carpenter-worker-creating-home-decoration-from-wood-his-workshop_23-2148640327.jpg",
    title: "AI Damage Detection",
    description: "Upload photos of your mahogany wood and let our AI analyze mold, scratches, cracks, and damage with precision diagnostics.",
  },
  {
    image: "https://img.freepik.com/free-photo/front-view-artisans-doing-woodcutting_23-2150104727.jpg",
    title: "Smart Treatment Recommendations",
    description: "Get personalized treatment plans based on wood condition, age, environment (indoor/outdoor), and damage severity analysis.",
  },
  {
    image: "https://img.freepik.com/free-photo/person-varnishing-wood_23-2148748820.jpg",
    title: "Preservation Scheduling",
    description: "Automated maintenance calendar with reminders for treatments, inspections, and preventive care to extend wood lifespan.",
  },
  {
    image: "https://img.freepik.com/free-photo/carpenter-cutting-mdf-board-inside-workshop_23-2149451064.jpg",
    title: "Progress Tracking",
    description: "Monitor wood condition over time with photo comparisons and detailed reports showing treatment effectiveness and improvements.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>
            Smart Recommendation Features
          </h2>
          <p className={styles.description}>
            Intelligent system for Mahogany wood treatment and preservation management
          </p>
        </div>
        <div className={styles.grid}>
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              image={feature.image}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
