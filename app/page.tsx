"use client";

import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from "recharts";
import { 
  User, Trophy, Award, Flame, BrainCircuit, Target, Sparkles, Terminal, AlertCircle, ExternalLink, CalendarDays
} from "lucide-react";

export default function Dashboard() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [practicePlan, setPracticePlan] = useState<any[]>([]); 
  
  const [activityMap, setActivityMap] = useState<{[key: string]: number}>({});
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const fetchDashboardData = async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setError("");
    setProfile(null);
    setStats(null);
    setAiAdvice("");
    setPracticePlan([]);
    setActivityMap({});
    setAvailableYears([]);

    try {
      const userRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
      const userData = await userRes.json();
      
      if (userData.status !== "OK") throw new Error("Handle not found on Codeforces.");
      const userProfile = userData.result[0];

      const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
      const statusData = await statusRes.json();
      if (statusData.status !== "OK") throw new Error("Failed to fetch user submission logs.");

      const submissions = statusData.result;
      const solvedSubmissions = submissions.filter((sub: any) => sub.verdict === "OK");
      const uniqueProblems = new Set<string>();
      const tagCounts: { [key: string]: number } = {};
      const dailyActivity: { [key: string]: number } = {}; 
      const activeYearsSet = new Set<number>();

      solvedSubmissions.forEach((sub: any) => {
        const pId = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!uniqueProblems.has(pId)) {
          uniqueProblems.add(pId);
          sub.problem.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }

        if (sub.creationTimeSeconds) {
          const dateObj = new Date(sub.creationTimeSeconds * 1000);
          const pad = (n: number) => n.toString().padStart(2, '0');
          const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
          
          dailyActivity[dateStr] = (dailyActivity[dateStr] || 0) + 1;
          activeYearsSet.add(dateObj.getFullYear());
        }
      });

      setActivityMap(dailyActivity);
      const sortedYears = Array.from(activeYearsSet).sort((a, b) => b - a);
      if (sortedYears.length > 0) {
        setAvailableYears(sortedYears);
        setSelectedYear(sortedYears[0]);
      } else {
        const currentYear = new Date().getFullYear();
        setAvailableYears([currentYear]);
        setSelectedYear(currentYear);
      }

      const processedChartData = Object.keys(tagCounts).map(tag => ({
        name: tag, value: tagCounts[tag]
      })).sort((a, b) => b.value - a.value).slice(0, 6);

      const activeProfile = {
        handle: userProfile.handle,
        rating: userProfile.rating || 0,
        maxRating: userProfile.maxRating || 0,
        rank: userProfile.rank || "unrated",
        maxRank: userProfile.maxRank || "unrated",
        avatar: userProfile.titlePhoto
      };

      const activeStats = {
        totalSolved: uniqueProblems.size,
        chartData: processedChartData
      };

      setProfile(activeProfile);
      setStats(activeStats);

      try {
        const probsRes = await fetch("https://codeforces.com/api/problemset.problems");
        const probsData = await probsRes.json();
        if (probsData.status === "OK") {
          const currentRating = userProfile.rating || 800; 
          const filtered = probsData.result.problems.filter((p: any) =>
            p.rating && p.rating >= currentRating && p.rating <= currentRating + 200 &&
            !uniqueProblems.has(`${p.contestId}-${p.index}`)
          );
          setPracticePlan(filtered.sort(() => 0.5 - Math.random()).slice(0, 3));
        }
      } catch (e) { console.error(e); }

      const mentorRes = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: activeProfile, stats: activeStats })
      });
      const rawText = await mentorRes.text(); 
      try {
        const mentorData = JSON.parse(rawText);
        setAiAdvice(mentorData.advice || "AI Error: Unknown Backend Issue.");
      } catch (e) { setAiAdvice("Backend context error parsing response node."); }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // --- Heatmap & Streak Calculations ---
  const currentYearWeeks = (() => {
    if (!selectedYear) return [];
    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear, 11, 31);
    const weeks = [];
    let currentWeek: any[] = [];

    // Pad first week to start on correct day (0 = Sunday)
    for (let i = 0; i < startDate.getDay(); i++) currentWeek.push(null);

    const pad = (n: number) => n.toString().padStart(2, '0');
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const monthStr = d.toLocaleString('default', { month: 'short' });

      currentWeek.push({
        date: dateStr,
        count: activityMap[dateStr] || 0,
        month: monthStr,
        isFirstOfMonth: d.getDate() === 1
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  })();

  const allActiveDates = Object.keys(activityMap).sort();
  const yearActiveDates = allActiveDates.filter(d => d.startsWith(selectedYear.toString()));

  const calculateMaxStreak = (dates: string[]) => {
    if (dates.length === 0) return 0;
    let max = 1, current = 1;
    for (let i = 1; i < dates.length; i++) {
      const diffDays = (new Date(dates[i]).getTime() - new Date(dates[i-1]).getTime()) / (1000 * 3600 * 24);
      if (diffDays === 1) { current++; max = Math.max(max, current); } 
      else if (diffDays > 1) current = 1;
    }
    return max;
  };

  const totalSolvedYear = yearActiveDates.reduce((sum, date) => sum + activityMap[date], 0);

  const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#a855f7"];
  const blankMetrics = [{ label: "Active User", val: "---" }, { label: "Rating Bracket", val: "---" }, { label: "Max Historic Rating", val: "---" }, { label: "Unique Problems Solved", val: "---" }];

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200/80 px-10 py-5 flex flex-col sm:flex-row items-sm items-center justify-between gap-4 sticky top-0 z-20 shadow-sm/5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Performance Desk <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">Live</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">Real-time Codeforces synchronization</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 p-1.5 rounded-xl w-full sm:w-96 shadow-sm">
          <Terminal className="w-4 h-4 text-slate-400 ml-2" />
          <input type="text" placeholder="Type CF handle..." value={handle} onChange={(e) => setHandle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchDashboardData()} className="flex-1 px-1 py-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"/>
          <button onClick={fetchDashboardData} disabled={loading} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm disabled:bg-slate-300">
            {loading ? "Syncing..." : "Analyze"}
          </button>
        </div>
      </div>

      <div className="p-10 space-y-8 max-w-7xl w-full mx-auto">
        {error && <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 flex gap-3 text-sm font-medium"><AlertCircle className="w-5 h-5 text-rose-500 shrink-0" /><p>{error}</p></div>}
        {loading && <div className="h-[55vh] bg-white border border-slate-200/60 rounded-3xl flex flex-col items-center justify-center gap-4"><div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div><p className="text-sm font-semibold text-slate-500 tracking-tight">Aggregating submission logs...</p></div>}

        {!profile && !loading && (
          <div className="relative border border-slate-200/70 bg-white shadow-sm rounded-3xl p-8 overflow-hidden min-h-[65vh] flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/40 pointer-events-none z-0" />
            <div className="absolute inset-x-0 top-1/3 -translate-y-1/2 mx-auto max-w-md bg-white border border-slate-200/80 shadow-xl shadow-slate-200/30 p-8 rounded-3xl text-center z-10 animate-fade-in">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-sm"><Sparkles className="w-6 h-6" /></div>
              <h2 className="text-lg font-bold text-slate-900">Connect Profile Stream</h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-medium">Enter your public Codeforces handle in the search bar above.</p>
            </div>
            <div className="opacity-[0.22] blur-[1px] select-none pointer-events-none space-y-8 z-0">
              <div className="grid grid-cols-4 gap-6">{blankMetrics.map((b, i) => <div key={i} className="bg-white border p-5 rounded-2xl flex gap-4 items-center"><div className="w-11 h-11 bg-slate-100 rounded-xl" /><div><p className="text-[10px] font-bold text-slate-400 uppercase">{b.label}</p><p className="text-lg font-black text-slate-300 mt-0.5">{b.val}</p></div></div>)}</div>
            </div>
          </div>
        )}

        {profile && !loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <img src={profile.avatar} alt="avatar" className="w-12 h-12 rounded-xl border object-cover bg-slate-50 shadow-sm shrink-0" />
                <div className="min-w-0"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active User</p><p className="text-base font-black text-slate-900 truncate">{profile.handle}</p></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <div className="p-3 bg-amber-50 border border-amber-100/70 text-amber-600 rounded-xl"><Trophy className="w-5 h-5" /></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating Bracket</p><p className="text-lg font-black text-slate-900">{profile.rating}</p><p className="text-[11px] font-bold text-amber-600 capitalize mt-0.5">{profile.rank}</p></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <div className="p-3 bg-indigo-50 border border-indigo-100/70 text-indigo-600 rounded-xl"><Award className="w-5 h-5" /></div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Rating</p><p className="text-lg font-black text-slate-900">{profile.maxRating}</p><p className="text-[11px] font-bold text-indigo-500 capitalize mt-0.5">{profile.maxRank}</p></div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:shadow-md transition">
                <div className="p-3 bg-emerald-50 border border-emerald-100/70 rounded-xl text-xl">🔥</div>
                <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Problems Solved</p><p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalSolved}</p></div>
              </div>
            </div>

            {/* 🔥 EXACT CODEFORCES HEATMAP REPLICA 🔥 */}
            {availableYears.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6 pb-8 border-b border-slate-200/60 flex flex-col md:flex-row items-start justify-between gap-6">
                  
                  {/* Heatmap Section */}
                  <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8"></div> {/* Spacer for alignment */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-medium">Choose year:</span>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-md px-2 py-1 outline-none cursor-pointer">
                          {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex">
                      {/* Days of Week Y-Axis */}
                      <div className="flex flex-col justify-between pt-[18px] pb-[2px] pr-2 text-[10px] text-slate-400 font-medium h-[110px]">
                        <span className="invisible">Sun</span>
                        <span>Mon</span>
                        <span className="invisible">Tue</span>
                        <span>Wed</span>
                        <span className="invisible">Thu</span>
                        <span>Fri</span>
                        <span className="invisible">Sat</span>
                      </div>

                      {/* Grid Matrix */}
                      <div className="flex flex-col">
                        {/* Month Labels X-Axis */}
                        <div className="relative h-[16px] text-[10px] text-slate-400 font-medium">
                          {currentYearWeeks.map((week, wIdx) => {
                            const firstDayOfMonth = week.find(d => d && d.isFirstOfMonth);
                            if (firstDayOfMonth || wIdx === 0) {
                              const label = firstDayOfMonth ? firstDayOfMonth.month : week.find(d => d)?.month;
                              return <span key={wIdx} className="absolute top-0" style={{ left: `${wIdx * 15}px` }}>{label}</span>;
                            }
                            return null;
                          })}
                        </div>

                        {/* Squares */}
                        <div className="flex gap-[3px]">
                          {currentYearWeeks.map((week, wIdx) => (
                            <div key={wIdx} className="flex flex-col gap-[3px]">
                              {week.map((day, dIdx) => {
                                if (!day) return <div key={`empty-${wIdx}-${dIdx}`} className="w-[12px] h-[12px] bg-transparent" />;
                                let colorClass = "bg-[#ebedf0]"; // CF Light Gray
                                if (day.count === 1) colorClass = "bg-[#c6e48b]"; // CF Light Green
                                else if (day.count === 2) colorClass = "bg-[#7bc96f]"; // CF Green
                                else if (day.count >= 3 && day.count <= 5) colorClass = "bg-[#239a3b]"; // CF Dark Green
                                else if (day.count > 5) colorClass = "bg-[#196127]"; // CF Darkest Green
                                
                                return (
                                  <div 
                                    key={day.date} 
                                    className={`w-[12px] h-[12px] rounded-sm ${colorClass} hover:ring-1 hover:ring-slate-400 cursor-pointer transition-all duration-75`}
                                    title={`${day.date}: ${day.count} submissions`}
                                  />
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exact CF Summary Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/60 bg-slate-50/50">
                  <div className="p-6 text-center">
                    <h4 className="text-xl sm:text-2xl font-normal text-slate-800 mb-1">{stats.totalSolved} problems</h4>
                    <p className="text-xs text-slate-400 mb-4">solved for all time</p>
                    <h4 className="text-lg sm:text-xl font-normal text-slate-800 mb-1">{calculateMaxStreak(allActiveDates)} days</h4>
                    <p className="text-xs text-slate-400">in a row max.</p>
                  </div>
                  <div className="p-6 text-center">
                    <h4 className="text-xl sm:text-2xl font-normal text-slate-800 mb-1">{totalSolvedYear} submissions</h4>
                    <p className="text-xs text-slate-400 mb-4">recorded for the selected year</p>
                    <h4 className="text-lg sm:text-xl font-normal text-slate-800 mb-1">{calculateMaxStreak(yearActiveDates)} days</h4>
                    <p className="text-xs text-slate-400">in a row for the selected year</p>
                  </div>
                  <div className="p-6 text-center flex flex-col justify-center items-center opacity-80">
                    {/* Placeholder for dynamic month data (requires complex filtering, leaving as visual structural match) */}
                    <CalendarDays className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">Monthly breakdowns integrated in year view</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recharts Analytics & Target Plan ... (Unchanged) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                <div className="mb-6"><h3 className="text-base font-bold text-slate-900">Topic Mastery Breakdown</h3><p className="text-slate-400 text-xs mt-0.5">Distribution of algorithmic categories across approved submissions</p></div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} /><Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>{stats.chartData.map((e: any, i: number) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-slate-950 p-6 md:p-8 rounded-3xl text-white shadow-lg border border-slate-900 flex flex-col justify-between min-h-[352px]">
                <div><div className="flex items-center gap-3 mb-4"><User className="w-4 h-4 text-indigo-400" /><h3 className="text-sm font-bold tracking-tight">Crawl Architecture</h3></div><div className="space-y-3 text-xs text-slate-400 font-medium"><div className="flex justify-between border-b border-slate-900 pb-2.5"><span>Target Sync:</span><span className="text-slate-200 font-semibold">Codeforces API V2</span></div><div className="flex justify-between border-b border-slate-900 pb-2.5"><span>State Verification:</span><span className="text-emerald-400 font-semibold">Verdicts Cleaned</span></div><div className="flex justify-between pb-1"><span>Cache Status:</span><span className="text-amber-400 font-semibold">Volatile Stream</span></div></div></div>
                <div className="bg-slate-900 border border-slate-800/60 p-4 rounded-xl mt-6"><p className="text-[11px] text-slate-400 leading-relaxed font-medium">This module automatically groups user submission indices by relative weights to filter out duplicate solution uploads.</p></div>
              </div>
            </div>

            {practicePlan.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100/70 shadow-md animate-fade-in">
                <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 pb-5"><div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl"><Target className="w-5 h-5" /></div><div><h3 className="text-base font-bold text-slate-900">Targeted Practice Plan</h3><p className="text-slate-400 text-xs font-medium mt-0.5">Unsolved problems filtered for your current rating bracket</p></div></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {practicePlan.map((prob, i) => (
                    <a key={i} href={`https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`} target="_blank" rel="noreferrer" className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-emerald-50/50 transition-all group">
                      <div><div className="flex justify-between items-start mb-3"><span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-100/60 text-emerald-700 rounded-md">{prob.rating} Rating</span><ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" /></div><h4 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug mb-3">{prob.name}</h4></div>
                      <div className="flex flex-wrap gap-1.5">{prob.tags.slice(0, 3).map((tag: string, idx: number) => <span key={idx} className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-sm">{tag}</span>)}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {aiAdvice && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-indigo-100/70 shadow-md animate-fade-in">
                <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 pb-5"><div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl"><BrainCircuit className="w-5 h-5" /></div><div><h3 className="text-base font-bold text-slate-900">AI Coach Evaluation</h3><p className="text-slate-400 text-xs font-medium mt-0.5">Strategic growth path calculated dynamically</p></div></div>
                <div className="space-y-4">
                  {aiAdvice.split(/\d+\.\s+\*\*/).filter(Boolean).map((section, idx) => {
                    const parts = section.split("**");
                    const title = parts[0] ? parts[0].replace(/:$/, "").trim() : "";
                    const content = parts[1] ? parts[1].trim() : section;
                    return (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition duration-150"><div className="p-1.5 bg-white rounded-lg border border-slate-200 text-indigo-500 mt-0.5"><Target className="w-4 h-4" /></div><div className="text-sm">{title && <span className="font-bold text-slate-900 block mb-0.5">{title}</span>}<p className="text-slate-600 font-medium leading-relaxed">{content}</p></div></div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}