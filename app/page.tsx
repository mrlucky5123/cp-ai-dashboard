"use client";

import { useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from "recharts";
import { 
  User, Trophy, Award, Flame, BrainCircuit, Target, Sparkles, Terminal, AlertCircle, ExternalLink
} from "lucide-react";

export default function Dashboard() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [practicePlan, setPracticePlan] = useState<any[]>([]); // New State for Recommended Problems

  const fetchDashboardData = async () => {
    if (!handle.trim()) return;
    setLoading(true);
    setError("");
    setProfile(null);
    setStats(null);
    setAiAdvice("");
    setPracticePlan([]);

    try {
      // 1. Fetch User Profile
      const userRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
      const userData = await userRes.json();
      
      if (userData.status !== "OK") {
        throw new Error("Handle not found on Codeforces.");
      }
      
      const userProfile = userData.result[0];

      // 2. Fetch User Submissions
      const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
      const statusData = await statusRes.json();
      
      if (statusData.status !== "OK") {
        throw new Error("Failed to fetch user submission logs.");
      }

      const submissions = statusData.result;
      const solvedSubmissions = submissions.filter((sub: any) => sub.verdict === "OK");
      const uniqueProblems = new Set<string>();
      const tagCounts: { [key: string]: number } = {};

      solvedSubmissions.forEach((sub: any) => {
        const pId = `${sub.problem.contestId}-${sub.problem.index}`;
        if (!uniqueProblems.has(pId)) {
          uniqueProblems.add(pId);
          sub.problem.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      const processedChartData = Object.keys(tagCounts).map(tag => ({
        name: tag,
        value: tagCounts[tag]
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

      // 3. NEW FEATURE: Fetch Targeted Practice Problems
      try {
        const probsRes = await fetch("https://codeforces.com/api/problemset.problems");
        const probsData = await probsRes.json();
        
        if (probsData.status === "OK") {
          const currentRating = userProfile.rating || 800; 
          const targetMin = currentRating;
          const targetMax = currentRating + 200; // Pushing slightly above current rating

          const filtered = probsData.result.problems.filter((p: any) =>
            p.rating && p.rating >= targetMin && p.rating <= targetMax &&
            !uniqueProblems.has(`${p.contestId}-${p.index}`) // Ensure it's unsolved
          );

          // Shuffle the array to get 3 random fresh problems
          const selected = filtered.sort(() => 0.5 - Math.random()).slice(0, 3);
          setPracticePlan(selected);
        }
      } catch (probError) {
        console.error("Non-fatal: Could not load practice plan.", probError);
      }

      // 4. Fetch AI Advice
      const mentorRes = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: activeProfile, stats: activeStats })
      });
      
      const rawText = await mentorRes.text(); 
      
      try {
        const mentorData = JSON.parse(rawText);
        if (mentorData.advice) {
          setAiAdvice(mentorData.advice);
        } else {
          setAiAdvice("AI Error: " + (mentorData.error || "Unknown backend error."));
        }
      } catch (parseError) {
        console.error("Server crashed. Raw response:", rawText);
        setAiAdvice(`Backend crashed! The server said: ${rawText.substring(0, 100)}... Check your VS Code terminal for the full red error log.`);
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e", "#a855f7"];

  const blankMetrics = [
    { label: "Active User", val: "---" },
    { label: "Rating Bracket", val: "---" },
    { label: "Max Historic Rating", val: "---" },
    { label: "Unique Problems Solved", val: "---" }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200/80 px-10 py-5 flex flex-col sm:flex-row items-sm items-center justify-between gap-4 sticky top-0 z-20 shadow-sm/5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Performance Desk <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">Live</span>
          </h1>
          <p className="text-slate-400 text-xs mt-0.5 font-medium">Real-time Codeforces synchronization & automated structural analysis</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 p-1.5 rounded-xl w-full sm:w-96 shadow-sm">
          <Terminal className="w-4 h-4 text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder="Type CF handle..." 
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchDashboardData()}
            className="flex-1 px-1 py-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-600/10 transition duration-150 disabled:bg-slate-300"
          >
            {loading ? "Syncing..." : "Analyze"}
          </button>
        </div>
      </div>

      <div className="p-10 space-y-8 max-w-7xl w-full mx-auto">
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl p-4 flex gap-3 items-center text-sm font-medium animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="h-[55vh] bg-white border border-slate-200/60 rounded-3xl shadow-sm flex flex-col items-center justify-center gap-4">
            <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500 tracking-tight">Aggregating submission logs & compiling metrics...</p>
          </div>
        )}

        {!profile && !loading && (
          <div className="relative border border-slate-200/70 bg-white shadow-sm rounded-3xl p-8 overflow-hidden min-h-[65vh] flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/40 pointer-events-none z-0" />
            
            <div className="absolute inset-x-0 top-1/3 -translate-y-1/2 mx-auto max-w-md bg-white border border-slate-200/80 shadow-xl shadow-slate-200/30 p-8 rounded-3xl text-center z-10 animate-fade-in">
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mx-auto mb-4 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Connect Profile Stream</h2>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-medium">
                Enter your public Codeforces handle in the search bar above to generate interactive tag chart distributions and structural AI diagnostic advice.
              </p>
            </div>

            <div className="opacity-[0.22] blur-[1px] select-none pointer-events-none space-y-8 z-0">
              <div className="grid grid-cols-4 gap-6">
                {blankMetrics.map((b, i) => (
                  <div key={i} className="bg-white border p-5 rounded-2xl flex gap-4 items-center">
                    <div className="w-11 h-11 bg-slate-100 rounded-xl" />
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">{b.label}</p><p className="text-lg font-black text-slate-300 mt-0.5">{b.val}</p></div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 bg-white border p-6 rounded-3xl h-64"><div className="w-full h-full bg-slate-50 border border-dashed rounded-xl" /></div>
                <div className="bg-slate-950 p-6 rounded-3xl h-64" />
              </div>
            </div>
          </div>
        )}

        {profile && !loading && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 transition hover:shadow-md">
                <img src={profile.avatar} alt="avatar" className="w-12 h-12 rounded-xl border object-cover bg-slate-50 shadow-sm shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active User</p>
                  <p className="text-base font-black text-slate-900 truncate">{profile.handle}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 transition hover:shadow-md">
                <div className="p-3 bg-amber-50 border border-amber-100/70 text-amber-600 rounded-xl"><Trophy className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating Bracket</p>
                  <p className="text-lg font-black text-slate-900">{profile.rating}</p>
                  <p className="text-[11px] font-bold text-amber-600 capitalize mt-0.5">{profile.rank}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 transition hover:shadow-md">
                <div className="p-3 bg-indigo-50 border border-indigo-100/70 text-indigo-600 rounded-xl"><Award className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Rating</p>
                  <p className="text-lg font-black text-slate-900">{profile.maxRating}</p>
                  <p className="text-[11px] font-bold text-indigo-500 capitalize mt-0.5">{profile.maxRank}</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 transition hover:shadow-md">
                <div className="p-3 bg-emerald-50 border border-emerald-100/70 text-emerald-600 rounded-xl"><Flame className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Problems Solved</p>
                  <p className="text-xl font-black text-slate-900 mt-0.5">{stats.totalSolved}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-slate-900">Topic Mastery Breakdown</h3>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">Distribution of algorithmic categories across approved submissions</p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'inherit', fontSize: '12px' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
                        {stats.chartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-950 p-6 md:p-8 rounded-3xl text-white shadow-lg border border-slate-900 flex flex-col justify-between min-h-[352px]">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <User className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold tracking-tight">Crawl Architecture</h3>
                  </div>
                  <div className="space-y-3 text-xs text-slate-400 font-medium">
                    <div className="flex justify-between border-b border-slate-900 pb-2.5"><span>Target Sync:</span><span className="text-slate-200 font-semibold">Codeforces API V2</span></div>
                    <div className="flex justify-between border-b border-slate-900 pb-2.5"><span>State Verification:</span><span className="text-emerald-400 font-semibold">Verdicts Cleaned</span></div>
                    <div className="flex justify-between pb-1"><span>Cache Status:</span><span className="text-amber-400 font-semibold">Volatile Stream</span></div>
                  </div>
                </div>
                <div className="bg-slate-900 border border-slate-800/60 p-4 rounded-xl mt-6">
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    This module automatically groups user submission indices by relative weights to filter out duplicate solution uploads before feeding profiles into the LLM context node.
                  </p>
                </div>
              </div>
            </div>

            {/* Targeted Practice Plan Section */}
            {practicePlan.length > 0 && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-100/70 shadow-md shadow-emerald-100/10 animate-fade-in">
                <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 pb-5">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Targeted Practice Plan</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Unsolved problems mathematically filtered for your current rating bracket (+0 to +200)</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {practicePlan.map((prob, i) => (
                    <a
                      key={i}
                      href={`https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-200 transition-all group shadow-sm hover:shadow-md"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-100/60 text-emerald-700 rounded-md">
                            {prob.rating} Rating
                          </span>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug mb-3">{prob.name}</h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {prob.tags.slice(0, 3).map((tag: string, idx: number) => (
                          <span key={idx} className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* AI Evaluation Block */}
            {aiAdvice && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-indigo-100/70 shadow-md shadow-indigo-100/10 animate-fade-in">
                <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 pb-5">
                  <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">AI Coach Evaluation</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Strategic growth path calculated dynamically via Gemini 2.5 Flash</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {aiAdvice.split(/\d+\.\s+\*\*/).filter(Boolean).map((section, idx) => {
                    const parts = section.split("**");
                    const title = parts[0] ? parts[0].replace(/:$/, "").trim() : "";
                    const content = parts[1] ? parts[1].trim() : section;
                    return (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition duration-150">
                        <div className="p-1.5 bg-white rounded-lg border border-slate-200 text-indigo-500 mt-0.5 shadow-sm">
                          <Target className="w-4 h-4" />
                        </div>
                        <div className="text-sm">
                          {title && <span className="font-bold text-slate-900 block mb-0.5">{title}</span>}
                          <p className="text-slate-600 font-medium leading-relaxed">{content}</p>
                        </div>
                      </div>
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