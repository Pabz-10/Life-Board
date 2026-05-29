"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Dumbbell, 
  Scale, 
  Flame, 
  CheckCircle2, 
  TrendingUp,
  ChevronRight,
  Plus,
  Terminal,
  Code2,
  LogOut
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis
} from "recharts";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// --- Sub-components ---

const AnimatedNumber = ({ value, duration = 800 }: { value: number, duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === 0) {
        setDisplayValue(0);
        return;
    }
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

const Card = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, ease: [0.165, 0.84, 0.44, 1] }}
    className={`dashboard-card p-6 ${className}`}
  >
    {children}
  </motion.div>
);

interface DashboardClientProps {
  initialData: any;
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { profile, stats, quests } = initialData;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // Mock data for charts (to be replaced with real analytics later)
  const READING_DATA = [
    { day: "Mon", pages: 12 }, { day: "Tue", pages: 45 }, { day: "Wed", pages: 30 },
    { day: "Thu", pages: 15 }, { day: "Fri", pages: 60 }, { day: "Sat", pages: 85 }, { day: "Sun", pages: 40 }
  ];

  const LIFTING_DATA = [
    { week: "W1", volume: 12500 }, { week: "W2", volume: 13200 }, { week: "W3", volume: 12800 },
    { week: "W4", volume: 14500 }, { week: "W5", volume: 15100 }, { week: "W6", volume: 14800 }
  ];

  const WEIGHT_DATA = [
    { day: 1, weight: 185.4 }, { day: 10, weight: 184.2 }, { day: 20, weight: 183.8 }, { day: 30, weight: 182.4 }
  ];

  const HABITS = [
    { name: "Hydration (3L)", color: "bg-blue-400", data: Array.from({ length: 28 }, () => Math.random() > 0.2) },
    { name: "Sleep (8hrs)", color: "bg-indigo-400", data: Array.from({ length: 28 }, () => Math.random() > 0.3) },
    { name: "No Sugar", color: "bg-teal-400", data: Array.from({ length: 28 }, () => Math.random() > 0.4) },
  ];

  const LEETCODE_DATA = [
    { name: 'Easy', solved: stats?.int > 15 ? 45 : 0, total: 100 },
    { name: 'Medium', solved: stats?.int > 20 ? 22 : 0, total: 100 },
    { name: 'Hard', solved: stats?.int > 25 ? 5 : 0, total: 100 },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      
      {/* 📊 Weekly Summary Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-primary/5 rounded-3xl p-6 border border-primary/10 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-semibold text-primary">Good morning, {profile?.username || 'Hunter'}.</h2>
          <p className="text-secondary font-body">
            You are currently Level <span className="text-primary font-bold">{profile?.level}</span> · Keep up the momentum!
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleSignOut}
            className="text-xs font-bold text-secondary hover:text-primary transition-colors flex items-center gap-2 uppercase tracking-widest"
          >
            <LogOut size={14} /> Sign Out
          </button>
          <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-3 rounded-2xl border border-white">
            <span className="text-sm font-medium text-secondary italic">"Consistency is the key to mastery."</span>
          </div>
        </div>
      </motion.div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* 1. 📚 Reading Tracker */}
        <Card delay={0.1}>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-highlight/30 rounded-2xl text-primary">
              <BookOpen size={24} />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-secondary text-xs uppercase tracking-widest font-bold">Total Pages</span>
              <span className="text-4xl font-display font-black text-primary">
                <AnimatedNumber value={stats?.int * 10 || 0} />
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-primary">Intelligence (INT)</span>
                <span className="text-secondary font-mono">LV. {stats?.int}</span>
              </div>
              <div className="h-2.5 bg-highlight/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stats?.int, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full progress-bar-fill rounded-full"
                />
              </div>
            </div>

            <div className="h-20 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={READING_DATA}>
                  <defs>
                    <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4a7fc1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4a7fc1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="pages" stroke="#4a7fc1" strokeWidth={2} fillOpacity={1} fill="url(#colorPages)" />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-center text-secondary/50 uppercase tracking-widest mt-2">Reading Momentum</p>
            </div>
          </div>
        </Card>

        {/* 2. 🏋️ Lifting Tracker */}
        <Card delay={0.2}>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-highlight/30 rounded-2xl text-primary">
              <Dumbbell size={24} />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-secondary text-xs uppercase tracking-widest font-bold">Strength (STR)</span>
              <span className="text-4xl font-display font-black text-primary">
                <AnimatedNumber value={stats?.str || 0} />
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LIFTING_DATA}>
                  <Bar dataKey="volume" fill="#7b9fd4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-center text-secondary/50 uppercase tracking-widest mt-2">Strength Progress</p>
            </div>

            <div className="flex justify-between items-center p-4 bg-highlight/10 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-secondary font-bold uppercase">Workouts Logged</span>
                <span className="text-sm font-semibold text-primary">{Math.floor(stats?.str / 2)} Total Sessions</span>
              </div>
              <ChevronRight className="text-primary" size={20} />
            </div>
          </div>
        </Card>

        {/* 3. ⚖️ Weight Progress */}
        <Card delay={0.3}>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-highlight/30 rounded-2xl text-primary">
              <Scale size={24} />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-secondary text-xs uppercase tracking-widest font-bold">Agility (AGI)</span>
              <span className="text-4xl font-display font-black text-primary">
                {stats?.agi} <span className="text-xl text-secondary">LV.</span>
              </span>
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={WEIGHT_DATA}>
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#4a7fc1" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#4a7fc1", strokeWidth: 2, stroke: "#fff" }}
                  />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-[10px] text-center text-secondary/50 uppercase tracking-widest mt-2">Weight Trend (30 Days)</p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle className="text-highlight/20" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                  <motion.circle
                    className="text-primary"
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * (stats?.agi / 100)) }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                    strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-display font-bold text-primary">{stats?.agi}%</span>
                  <span className="text-[8px] text-secondary font-bold uppercase">Goal</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 4. 💻 LeetCode Tracker */}
        <Card delay={0.4}>
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-highlight/30 rounded-2xl text-primary">
              <Terminal size={24} />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-secondary text-xs uppercase tracking-widest font-bold">Solved (INT Base)</span>
              <span className="text-4xl font-display font-black text-primary">
                <AnimatedNumber value={stats?.int * 2} />
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
              {LEETCODE_DATA.map((item) => (
                <div key={item.name} className="flex flex-col items-center p-2 bg-primary/5 rounded-xl">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{item.name}</span>
                  <span className="text-sm font-display font-bold text-primary">{item.solved}</span>
                  <div className="w-full h-1 bg-primary/10 rounded-full mt-1 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.solved / item.total) * 100}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center p-4 border border-primary/10 rounded-2xl">
              <div className="flex items-center gap-3">
                <Code2 className="text-primary" size={20} />
                <span className="text-sm font-semibold text-secondary">Active Streak</span>
              </div>
              <span className="font-display font-bold text-lg text-primary">{Math.floor(stats?.int / 5)} Days</span>
            </div>
          </div>
        </Card>

        {/* 5. 🔥 Habit Streak Board (GitHub-style) */}
        <Card delay={0.4} className="md:col-span-2 lg:col-span-3">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-2xl font-bold text-primary flex items-center gap-3">
              <Flame size={24} className="text-orange-400" /> Habit Mastery
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {HABITS.map((habit, hIdx) => (
              <div key={hIdx} className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">{habit.name}</span>
                  <span className="text-xs font-mono text-secondary">Active</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {habit.data.map((done, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + (i * 0.02) }}
                      className={`h-4 rounded-sm ${done ? habit.color : "bg-primary/5 border border-primary/5"}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </main>
  );
}
