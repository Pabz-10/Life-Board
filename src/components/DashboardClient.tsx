"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Dumbbell,
  Scale,
  Droplets,
  Code2,
  LogOut,
  Flame,
  TrendingDown,
  Trophy,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  Tooltip,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// ─── Animated number counter ───────────────────────────────────────────────

function AnimatedNumber({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const duration = 900;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = eased * value;
      setDisplay(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// ─── Animated progress bar ─────────────────────────────────────────────────

function ProgressBar({ pct, colorClass, delay = 0 }: { pct: number; colorClass: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(Math.min(pct, 100)), 200 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="progress-track">
      <div className={`progress-fill ${colorClass}`} style={{ width: `${width}%` }} />
    </div>
  );
}

// ─── Card wrapper ──────────────────────────────────────────────────────────

function Card({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.165, 0.84, 0.44, 1] }}
      className={`dashboard-card p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── Card header ───────────────────────────────────────────────────────────

function CardHeader({
  icon,
  badgeClass,
  label,
  value,
  valueSuffix = "",
  valueDecimals = 0,
}: {
  icon: React.ReactNode;
  badgeClass: string;
  label: string;
  value: number;
  valueSuffix?: string;
  valueDecimals?: number;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className={`icon-badge ${badgeClass}`}>{icon}</div>
      <div className="text-right">
        <p className="stat-label">{label}</p>
        <p className="stat-value" style={{ fontSize: "2rem" }}>
          <AnimatedNumber value={value} decimals={valueDecimals} suffix={valueSuffix} />
        </p>
      </div>
    </div>
  );
}

// ─── Custom chart tooltip ──────────────────────────────────────────────────

function ChartTip({ active, payload, label, unit = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-card)",
      borderRadius: 10,
      padding: "6px 10px",
      fontSize: 12,
      color: "var(--text-secondary)",
      boxShadow: "var(--shadow-card)",
    }}>
      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
        {payload[0].value}{unit}
      </span>
      {label ? <span style={{ marginLeft: 6 }}>{label}</span> : null}
    </div>
  );
}

// ─── Fallback placeholder data (shown when no real logs yet) ───────────────

const PLACEHOLDER_READING = [
  { day: "Mon", pages: 0 }, { day: "Tue", pages: 0 }, { day: "Wed", pages: 0 },
  { day: "Thu", pages: 0 }, { day: "Fri", pages: 0 }, { day: "Sat", pages: 0 }, { day: "Sun", pages: 0 },
];

const PLACEHOLDER_LIFTING = [
  { week: "W1", volume: 0 }, { week: "W2", volume: 0 }, { week: "W3", volume: 0 },
  { week: "W4", volume: 0 }, { week: "W5", volume: 0 }, { week: "W6", volume: 0 },
];

const PLACEHOLDER_WEIGHT = [{ day: "Today", weight: 0 }];

// ─── Main dashboard ────────────────────────────────────────────────────────

interface DashboardClientProps {
  initialData: {
    profile: any;
    stats: any;
    readingLog: { date: string; pages: number }[];
    liftingLog: { week_label: string; volume_kg: number }[];
    weightLog: { logged_at: string; weight: number }[];
  };
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { profile, stats, readingLog, liftingLog, weightLog } = initialData;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Shape chart data — use real logs or placeholders
  const readingData = readingLog.length
    ? [...readingLog].reverse().map((r) => ({ day: r.date.slice(5), pages: r.pages }))
    : PLACEHOLDER_READING;

  const liftingData = liftingLog.length
    ? [...liftingLog].reverse().map((l) => ({ week: l.week_label, volume: l.volume_kg }))
    : PLACEHOLDER_LIFTING;

  const weightData = weightLog.length
    ? weightLog.map((w) => ({ day: w.logged_at.slice(5, 10), weight: Number(w.weight) }))
    : PLACEHOLDER_WEIGHT;

  // Derived values
  const currentWeight = weightLog.length ? Number(weightLog[weightLog.length - 1].weight) : 0;
  const goalWeight = stats.goal_weight ?? 0;
  const weightLost = weightLog.length > 1
    ? Number(weightLog[0].weight) - currentWeight
    : 0;
  const weightGoalPct = goalWeight && currentWeight
    ? Math.min(100, Math.round(((Number(weightLog[0]?.weight ?? currentWeight) - currentWeight) /
        (Number(weightLog[0]?.weight ?? currentWeight) - goalWeight)) * 100))
    : 0;

  const waterPct = stats.water_goal_ml
    ? Math.round((stats.water_ml_today / stats.water_goal_ml) * 100)
    : 0;

  const workoutPct = stats.workout_goal
    ? Math.round((stats.workouts_this_week / stats.workout_goal) * 100)
    : 0;

  const totalLeetcode = (stats.leetcode_easy ?? 0) + (stats.leetcode_medium ?? 0) + (stats.leetcode_hard ?? 0);

  // Habit grid (28 days — pulled from stats booleans, stubbed for now)
  const HABITS = [
    {
      name: "Hydration",
      colorOn: "#38bdf8",
      data: Array.from({ length: 28 }, (_, i) => i < (stats.water_streak ?? 0)),
    },
    {
      name: "Lifting",
      colorOn: "#6366f1",
      data: Array.from({ length: 28 }, (_, i) => i < (stats.lift_streak ?? 0)),
    },
    {
      name: "Reading",
      colorOn: "#3d74b8",
      data: Array.from({ length: 28 }, (_, i) => i < (stats.reading_streak ?? 0)),
    },
  ];

  const username = profile?.username ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <main className="max-w-7xl mx-auto px-5 py-10 space-y-8">

      {/* ── Top banner ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
        className="dashboard-card px-7 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <p className="stat-label mb-0.5">LifeBoard</p>
          <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {greeting}, {username}.
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Here's your progress at a glance.
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest px-4 py-2 rounded-xl transition-all hover:bg-primary/5"
          style={{ color: "var(--text-muted)" }}
        >
          <LogOut size={13} /> Sign out
        </button>
      </motion.div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. Reading */}
        <Card delay={0.08}>
          <CardHeader
            icon={<BookOpen size={20} />}
            badgeClass="icon-badge-read"
            label="Books read this year"
            value={stats.books_read ?? 0}
          />
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Reading streak
                </span>
                <span className="stat-label flex items-center gap-1">
                  <Flame size={11} style={{ color: "#f97316" }} />
                  {stats.reading_streak ?? 0} days
                </span>
              </div>
              <ProgressBar pct={(stats.reading_streak ?? 0) / 30 * 100} colorClass="progress-fill-read" />
            </div>
            <div>
              <p className="stat-label mb-2">Pages — last 7 days</p>
              <div style={{ height: 72 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={readingData}>
                    <defs>
                      <linearGradient id="gRead" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3d74b8" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3d74b8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="pages" stroke="#3d74b8" strokeWidth={2} fill="url(#gRead)" dot={false} />
                    <Tooltip content={<ChartTip unit=" pages" />} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex justify-between text-sm pt-1">
              <span style={{ color: "var(--text-secondary)" }}>Pages today</span>
              <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>
                {stats.pages_today ?? 0}
              </span>
            </div>
          </div>
        </Card>

        {/* 2. Lifting */}
        <Card delay={0.14}>
          <CardHeader
            icon={<Dumbbell size={20} />}
            badgeClass="icon-badge-lift"
            label="Total workouts"
            value={stats.total_workouts ?? 0}
          />
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  This week
                </span>
                <span className="stat-label">
                  {stats.workouts_this_week ?? 0} / {stats.workout_goal ?? 4} sessions
                </span>
              </div>
              <ProgressBar pct={workoutPct} colorClass="progress-fill-lift" delay={100} />
            </div>
            <div>
              <p className="stat-label mb-2">Volume — last 6 weeks (kg)</p>
              <div style={{ height: 80 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liftingData} barSize={20}>
                    <Bar dataKey="volume" fill="#818cf8" radius={[4, 4, 0, 0]} />
                    <Tooltip content={<ChartTip unit=" kg" />} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Weight */}
        <Card delay={0.2}>
          <CardHeader
            icon={<Scale size={20} />}
            badgeClass="icon-badge-weight"
            label="Current weight (lbs)"
            value={currentWeight}
            valueDecimals={1}
          />
          <div className="space-y-4">
            {goalWeight > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Goal: {goalWeight} lbs
                  </span>
                  <span className="stat-label flex items-center gap-1">
                    <TrendingDown size={11} />
                    {weightLost > 0 ? `−${weightLost.toFixed(1)} lost` : "tracking"}
                  </span>
                </div>
                <ProgressBar pct={weightGoalPct} colorClass="progress-fill-weight" delay={200} />
              </div>
            )}
            <div>
              <p className="stat-label mb-2">Trend — last 30 days</p>
              <div style={{ height: 88 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightData}>
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#06b6d4"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#06b6d4", strokeWidth: 0 }}
                    />
                    <YAxis domain={["dataMin - 2", "dataMax + 2"]} hide />
                    <Tooltip content={<ChartTip unit=" lbs" />} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Circular ring */}
            <div className="flex justify-center">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="38" fill="none"
                    stroke="#06b6d4" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={238.76}
                    initial={{ strokeDashoffset: 238.76 }}
                    animate={{ strokeDashoffset: 238.76 - (238.76 * weightGoalPct / 100) }}
                    transition={{ duration: 1.4, delay: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                    {weightGoalPct}%
                  </span>
                  <span className="stat-label" style={{ fontSize: 8 }}>of goal</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 4. Water */}
        <Card delay={0.26}>
          <CardHeader
            icon={<Droplets size={20} />}
            badgeClass="icon-badge-water"
            label="Water today (ml)"
            value={stats.water_ml_today ?? 0}
          />
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Daily goal
                </span>
                <span className="stat-label">{stats.water_ml_today ?? 0} / {stats.water_goal_ml ?? 3000} ml</span>
              </div>
              <ProgressBar pct={waterPct} colorClass="progress-fill-water" delay={300} />
            </div>
            {/* Water visual */}
            <div className="flex items-end justify-center gap-1.5 pt-2" style={{ height: 64 }}>
              {Array.from({ length: 8 }).map((_, i) => {
                const filled = waterPct >= ((i + 1) / 8) * 100;
                return (
                  <motion.div
                    key={i}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
                    style={{
                      width: 22,
                      height: 8 + i * 6,
                      borderRadius: 4,
                      background: filled ? "#38bdf8" : "rgba(56, 189, 248, 0.12)",
                      transformOrigin: "bottom",
                    }}
                  />
                );
              })}
            </div>
            <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
              {waterPct}% of daily goal reached
            </p>
          </div>
        </Card>

        {/* 5. LeetCode */}
        <Card delay={0.32}>
          <CardHeader
            icon={<Code2 size={20} />}
            badgeClass="icon-badge-leet"
            label="Problems solved"
            value={totalLeetcode}
          />
          <div className="space-y-3">
            {[
              { label: "Easy", value: stats.leetcode_easy ?? 0, color: "#22c55e", max: 200 },
              { label: "Medium", value: stats.leetcode_medium ?? 0, color: "#f59e0b", max: 150 },
              { label: "Hard", value: stats.leetcode_hard ?? 0, color: "#ef4444", max: 100 },
            ].map(({ label, value, color, max }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</span>
                  <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</span>
                </div>
                <div className="progress-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ height: "100%", borderRadius: 999, background: color }}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Active streak</span>
              <span className="font-mono font-bold text-sm flex items-center gap-1" style={{ color: "var(--accent-leet)" }}>
                <Flame size={13} />
                {stats.leetcode_streak ?? 0} days
              </span>
            </div>
          </div>
        </Card>

        {/* 6. Habit heatmap — full width */}
        <Card delay={0.38} className="md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <Trophy size={20} style={{ color: "var(--accent-primary)" }} />
              Habit consistency — last 28 days
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {HABITS.map((habit, hIdx) => (
              <div key={hIdx} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{habit.name}</span>
                  <span className="stat-label">
                    {habit.data.filter(Boolean).length} / 28 days
                  </span>
                </div>
                <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                  {habit.data.map((done, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.018, duration: 0.25 }}
                      className="habit-cell"
                      style={{
                        background: done
                          ? habit.colorOn
                          : "rgba(61, 116, 184, 0.07)",
                        opacity: done ? 0.85 + (i / 28) * 0.15 : 1,
                      }}
                      title={`Day ${i + 1}`}
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
