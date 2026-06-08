# CP AI Dashboard

## Project Overview

**CP AI Dashboard** is an intelligent analytics platform for competitive programmers that connects to **Codeforces** to provide real-time performance insights, AI-powered mentorship, and personalized practice recommendations.

### What It Does

This dashboard aggregates your Codeforces profile data and transforms it into actionable insights through:

- **Real-time Profile Analytics**: Fetches your current rating, ranking, and submission history
- **Activity Heatmap**: Visualizes your coding streak and problem-solving patterns (GitHub-style activity calendar)
- **Problem Category Breakdown**: Analyzes your performance across algorithmic topics (graphs, DP, greedy, etc.)
- **AI-Powered Coaching**: Uses Google Gemini AI to generate personalized improvement advice based on your profile
- **Smart Practice Plan**: Recommends 3 problems tailored to your current skill level

### Problems It Solves

1. **Lack of Insights**: Codeforces shows raw stats, but this dashboard provides deep analytics about your growth patterns
2. **No Personalized Guidance**: Competitive programmers struggle to know what to practice next—AI generates custom recommendations
3. **Motivation Tracking**: The activity heatmap gamifies your coding journey, showing consistency and streaks
4. **Time Wasting**: Instead of searching for relevant problems, get auto-curated practice targets based on your rating
5. **Skill Gap Analysis**: Identifies which topics you're weak at so you can focus your practice

### Key Features

✨ **Live Codeforces Sync** - Enter your handle and get instant data  
📊 **GitHub-style Activity Heatmap** - Track your problem-solving consistency  
🧠 **AI Mentor** - Personalized advice powered by Google Gemini  
🎯 **Smart Practice Recommendations** - Get 3 problems perfectly matched to your level  
📈 **Topic Mastery Breakdown** - See which algorithms you've mastered  
🔥 **Streak Tracking** - Monitor your longest coding streaks (all-time & yearly)

---

## Getting Started

First, run the development server:

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
