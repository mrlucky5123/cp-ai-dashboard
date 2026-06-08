# 📊 CP AI Dashboard (Competitive Programming Analytics Platform)

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.dot.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Gemini Engine](https://img.shields.io/badge/AI_Engine-Gemini_Pro-orange?style=flat-square&logo=googlegemini)](https://ai.google.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

An intelligent full-stack analytics and mentorship platform for competitive programmers. By integrating live REST APIs with Large Language Models, the platform transforms raw programmatic metrics into interactive telemetry, personalized skill-gap matrices, and custom-curated practice pipelines.

---

## 🛠️ The Core Engineering Challenges It Solves

* **Data Fragmentation:** Codeforces hosts raw submission arrays but lacks multi-dimensional performance analysis. This platform compiles tabular metrics into clear, scannable data layouts.
* **The "What to Solve Next" Dilemma:** Programmers frequently waste critical time searching for target tasks. The dashboard analyzes user rating metrics to auto-curate performance-matched practice targets.
* **Consistency Monitoring:** Uses a Git-style telemetry map to visualize problem-solving volume over long periods, making consistency tangible.
* **Static Guidance Limitation:** Replaces generic training roadmaps with real-time analytics processed directly through an active LLM inference engine.

---

## ✨ Architectural Features

### 🔄 Live Codeforces Synchronization
Establishes runtime execution loops fetching real-time user ratings, rankings, and deep submission logs directly via external platform REST endpoints.

### 🧠 LLM Coaching Engine (`@google/genai`)
Leverages the native Google Gemini SDK to execute structural context analysis over historical problem tags, submission frequencies, and trailing difficulty ratings to generate real-time training advice.

### 📊 Performance Analytics Data Visualization
Utilizes `Recharts` to deliver modular, interactive UI charts tracking:
* **GitHub-style Activity Heatmaps:** Mapping year-long problem-solving consistency matrices.
* **Algorithmic Category Breakdown:** Visualizing performance distribution scales across specific topics (Dynamic Programming, Graph Theory, Greedy Paradigms, Math).
* **Rating and Streak Aggregators:** Monitoring trailing rating developments alongside peak annual solving streaks.

---

## 💻 Tech Stack & Dependencies

* **Core Full-Stack Framework:** Next.js (App Router Layout Structure)
* **UI Engine:** React 19 & TypeScript (Strict structural typing)
* **Inference Pipeline:** `@google/genai` (Native Gemini API Client SDK)
* **Data Visualizations:** Recharts Framework
* **Styling Layer:** Tailwind CSS v4 Engine
* **Icon Assets:** Lucide React Matrix

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/mrlucky5123/cp-ai-dashboard.git
cd cp-ai-dashboard
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add:
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key
```

### 4. Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

---

## 📦 Project Structure

```
cp-ai-dashboard/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                 # Utility functions
├── public/              # Static assets
├── styles/              # Tailwind CSS
└── package.json         # Dependencies
```

---

## 🌐 API Integration

### Codeforces API
The dashboard integrates with Codeforces public API to fetch:
- User profile data (rating, rank, submission history)
- Problem metadata (difficulty, tags, categories)
- Submission records with timestamps

### Google Gemini API
Uses the Gemini Pro model for:
- Personalized coaching advice
- Problem recommendations
- Skill gap analysis

---

## 🎯 Key Features

✨ **Live Codeforces Sync** - Enter your handle and get instant data  
📊 **GitHub-style Activity Heatmap** - Track your problem-solving consistency  
🧠 **AI Mentor** - Personalized advice powered by Google Gemini  
🎯 **Smart Practice Recommendations** - Get 3 problems perfectly matched to your level  
📈 **Topic Mastery Breakdown** - See which algorithms you've mastered  
🔥 **Streak Tracking** - Monitor your longest coding streaks (all-time & yearly)

---

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Codeforces API Documentation](https://codeforces.com/apiHelp) - learn about Codeforces API endpoints.
- [Google Gemini API](https://ai.google.dev/) - explore Gemini API capabilities.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

---

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme-vercel).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## 📝 License

This project is open source and available under the MIT License.