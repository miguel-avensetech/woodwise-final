import styles from "@/styles/home/ProcessSection.module.css";

export default function ProcessSection() {
  const steps = [
    {
      number: "01",
      title: "Scan Wood Condition",
      description: "Upload photos of your mahogany wood for AI-powered damage detection and analysis",
    },
    {
      number: "02",
      title: "Input Wood Details",
      description: "Provide wood age, environment (indoor/outdoor), and current condition information",
    },
    {
      number: "03",
      title: "Receive Treatment Plan",
      description: "Get smart recommendations for mold removal, scratch repair, and preservation treatments",
    },
    {
      number: "04",
      title: "Schedule Maintenance",
      description: "Follow automated calendar reminders for treatments and preventive care schedules",
    },
  ];

  return (
    <section id="how-it-works" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>
            Simple 4-Step Process
          </h2>
          <p className={styles.description}>
            From diagnosis to restoration, we guide you every step of the way
          </p>
        </div>
        <div className={styles.grid}>
          {steps.map((step) => (
            <div key={step.number} className={styles.card}>
              <div className={styles.numberCircle}>
                {step.number}
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDescription}>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
