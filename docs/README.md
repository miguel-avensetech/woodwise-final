# WoodWise

**A Smart Recommendation System for Wood Treatment and Preservation**

AI-powered platform for mahogany wood treatment and preservation. Scan wood condition, receive intelligent treatment recommendations, and manage preventive maintenance schedules.

## Project Structure

```
WoodWise/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── home/             # Home page components
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── FeatureCard.tsx
│   │   └── CTASection.tsx
│   └── index.ts          # Component exports
├── docs/                 # Documentation
├── public/               # Static assets
├── next.config.ts        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies

```

## Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm start
```

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 18** - UI library

## Features

- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ AI wood scanning and diagnosis
- ✅ Personalized restoration recommendations
- ✅ Automated maintenance scheduling
- ✅ Component-based architecture
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Clean and maintainable code structure

## Image Requirements

Add the following images to `public/images/`:
- `hero-wood.jpg` - 1200x800px (Hero section mahogany wood)
- `ai-scan.jpg` - 600x400px (AI scanning feature)
- `restoration.jpg` - 600x400px (Wood restoration)
- `calendar.jpg` - 600x400px (Maintenance calendar)
