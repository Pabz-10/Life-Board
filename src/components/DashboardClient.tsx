"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Dumbbell, Scale, Droplets, Code2,
  LogOut, Flame, TrendingDown, Trophy, Plus, X, Check, Trash2, History,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  Tooltip, ResponsiveContainer, YAxis,
} from "recharts";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// ─── Animated number ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 900;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      setDisplay((1 - Math.pow(1 - p, 3)) * value);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <span>{display.toFixed(decimals)}{suffix}</span>;
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
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

// ─── Card ─────────────────────────────────────────────────────────────────────
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

// ─── Chart tooltip ────────────────────────────────────────────────────────────
function ChartTip({ active, payload, label, unit = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-card)", borderRadius: 10, padding: "6px 10px", fontSize: 12, color: "var(--text-secondary)", boxShadow: "var(--shadow-card)" }}>
      <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{payload[0].value}{unit}</span>
      {label ? <span style={{ marginLeft: 6 }}>{label}</span> : null}
    </div>
  );
}

// ─── Log button ───────────────────────────────────────────────────────────────
function LogButton({ onClick, label = "Log", icon = <Plus size={12} /> }: { onClick: () => void; label?: string; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", fontFamily: "var(--font-dm-mono), monospace", color: "var(--accent-primary)", background: "rgba(61,116,184,0.08)", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer", transition: "background 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(61,116,184,0.15)")}
      onMouseLeave={e => (e.currentTarget.style.background = "rgba(61,116,184,0.08)")}
    >
      {icon} {label}
    </button>
  );
}

// ─── Log + History Modal ──────────────────────────────────────────────────────
interface Field { key: string; label: string; type?: string; placeholder?: string; step?: string; min?: string; }
interface HistoryEntry { id: string; label: string; sub: string; }

function LogModal({ title, fields, onSave, onClose, saving, history, onDelete }: {
  title: string; fields: Field[];
  onSave: (v: Record<string, string>) => Promise<void>;
  onClose: () => void; saving: boolean;
  history: HistoryEntry[]; onDelete: (id: string) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>(Object.fromEntries(fields.map(f => [f.key, ""])));
  const [tab, setTab] = useState<"log" | "history">("log");
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await onDelete(id);
    setDeleting(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(10,20,40,0.45)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.25, ease: [0.165, 0.84, 0.44, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: "var(--bg-card)", borderRadius: 20, border: "1px solid var(--border-card)", boxShadow: "0 24px 64px -12px rgba(61,116,184,0.18)", padding: "24px 24px 20px", width: "100%", maxWidth: 400 }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "var(--font-fraunces), serif", fontWeight: 700, fontSize: 18, color: "var(--text-primary)", margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: 8, display: "flex" }}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "var(--bg-primary)", borderRadius: 10, padding: 4 }}>
          {(["log", "history"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", fontFamily: "var(--font-dm-mono), monospace", transition: "all 0.2s", background: tab === t ? "var(--bg-card)" : "transparent", color: tab === t ? "var(--accent-primary)" : "var(--text-muted)", boxShadow: tab === t ? "0 1px 4px rgba(61,116,184,0.12)" : "none" }}
            >
              {t === "log" ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Plus size={12} /> Log</span>
                           : <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><History size={12} /> History</span>}
            </button>
          ))}
        </div>

        {/* Log tab */}
        {tab === "log" && (
          <form onSubmit={async e => { e.preventDefault(); await onSave(values); }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {fields.map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "var(--text-muted)", fontFamily: "var(--font-dm-mono), monospace", marginBottom: 6 }}>{f.label}</label>
                <input type={f.type ?? "number"} step={f.step ?? "1"} min={f.min ?? "0"} placeholder={f.placeholder ?? "0"}
                  value={values[f.key]}
                  onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 12, fontSize: 15, border: "1px solid var(--border-card)", background: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "var(--font-jakarta), sans-serif", outline: "none" }}
                  onFocus={e => (e.target.style.borderColor = "var(--accent-primary)")}
                  onBlur={e => (e.target.style.borderColor = "var(--border-card)")}
                />
              </div>
            ))}
            <button type="submit" disabled={saving}
              style={{ marginTop: 4, padding: "12px 20px", borderRadius: 12, background: "var(--accent-primary)", color: "white", fontWeight: 700, fontSize: 14, border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-jakarta), sans-serif" }}
            >
              {saving ? "Saving…" : <><Check size={15} /> Save</>}
            </button>
          </form>
        )}

        {/* History tab */}
        {tab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {history.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, padding: "20px 0", fontFamily: "var(--font-jakarta), sans-serif" }}>No entries yet</p>
            ) : history.map(entry => (
              <motion.div key={entry.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 12, background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-jakarta), sans-serif" }}>{entry.label}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-dm-mono), monospace", marginTop: 2 }}>{entry.sub}</p>
                </div>
                <button onClick={() => handleDelete(entry.id)} disabled={deleting === entry.id}
                  style={{ background: "none", border: "none", cursor: "pointer", color: deleting === entry.id ? "var(--text-muted)" : "#ef4444", padding: 6, borderRadius: 8, display: "flex", opacity: deleting === entry.id ? 0.5 : 1, transition: "opacity 0.2s" }}
                >
                  <Trash2 size={15} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Placeholders ─────────────────────────────────────────────────────────────
const PLACEHOLDER_READING = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({ day: d, pages: 0 }));
const PLACEHOLDER_LIFTING = ["W1","W2","W3","W4","W5","W6"].map(w => ({ week: w, volume: 0 }));
const PLACEHOLDER_WEIGHT  = [{ day: "Today", weight: 0 }];

type Modal = "reading" | "lifting" | "weight" | "water" | "leetcode" | null;

interface DashboardClientProps {
  initialData: {
    profile: any; stats: any;
    readingLog: { id?: string; date: string; pages: number }[];
    liftingLog: { id?: string; week_label: string; volume_kg: number; created_at?: string }[];
    weightLog:  { id?: string; logged_at: string; weight: number }[];
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter();
  const supabase = createClient();
  const { profile } = initialData;

  const [stats,      setStats]      = useState(initialData.stats);
  const [readingLog, setReadingLog] = useState(initialData.readingLog);
  const [liftingLog, setLiftingLog] = useState(initialData.liftingLog);
  const [weightLog,  setWeightLog]  = useState(initialData.weightLog);
  const [modal,      setModal]      = useState<Modal>(null);
  const [saving,     setSaving]     = useState(false);
  const [toast,      setToast]      = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const refreshAll = useCallback(async () => {
    const [s, r, l, w] = await Promise.all([
      supabase.from("stats").select("*").eq("user_id", profile.id).single(),
      supabase.from("reading_log").select("id, date, pages").eq("user_id", profile.id).order("date", { ascending: false }).limit(14),
      supabase.from("lifting_log").select("id, week_label, volume_kg, created_at").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("weight_log").select("id, logged_at, weight").eq("user_id", profile.id).order("logged_at", { ascending: true }).limit(30),
    ]);
    if (s.data) setStats(s.data);
    if (r.data) setReadingLog(r.data);
    if (l.data) setLiftingLog(l.data);
    if (w.data) setWeightLog(w.data);
  }, [profile.id, supabase]);

  const handleSignOut = async () => { await supabase.auth.signOut(); router.push("/login"); };

  // ── Save handlers ─────────────────────────────────────────────────────────
  const saveReading = async (v: Record<string, string>) => {
    setSaving(true);
    const pages = parseInt(v.pages) || 0;
    const books = parseInt(v.books) || 0;
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("reading_log").upsert({ user_id: profile.id, date: today, pages }, { onConflict: "user_id,date" });
    await supabase.from("stats").update({ pages_today: pages, books_read: (stats.books_read ?? 0) + books, reading_streak: (stats.reading_streak ?? 0) + (pages > 0 ? 1 : 0) }).eq("user_id", profile.id);
    await refreshAll(); setSaving(false); setModal(null); showToast("Reading logged ✓");
  };

  const saveLifting = async (v: Record<string, string>) => {
    setSaving(true);
    const volume = parseFloat(v.volume) || 0;
    const weekLabel = `W${Math.ceil(new Date().getDate() / 7)}`;
    await supabase.from("lifting_log").insert({ user_id: profile.id, week_label: weekLabel, volume_kg: volume });
    await supabase.from("stats").update({ total_workouts: (stats.total_workouts ?? 0) + 1, workouts_this_week: (stats.workouts_this_week ?? 0) + 1, lift_streak: (stats.lift_streak ?? 0) + 1 }).eq("user_id", profile.id);
    await refreshAll(); setSaving(false); setModal(null); showToast("Workout logged ✓");
  };

  const saveWeight = async (v: Record<string, string>) => {
    setSaving(true);
    const weight = parseFloat(v.weight);
    const goalWeight = parseFloat(v.goal) || stats.goal_weight;
    if (!isNaN(weight)) {
      await supabase.from("weight_log").insert({ user_id: profile.id, weight });
      await supabase.from("stats").update({ current_weight: weight, ...(goalWeight ? { goal_weight: goalWeight } : {}) }).eq("user_id", profile.id);
    }
    await refreshAll(); setSaving(false); setModal(null); showToast("Weight logged ✓");
  };

  const saveWater = async (v: Record<string, string>) => {
    setSaving(true);
    const ml = parseInt(v.ml) || 0;
    const newTotal = (stats.water_ml_today ?? 0) + ml;
    await supabase.from("stats").update({ water_ml_today: newTotal, water_streak: newTotal >= (stats.water_goal_ml ?? 3000) ? (stats.water_streak ?? 0) + 1 : stats.water_streak }).eq("user_id", profile.id);
    await refreshAll(); setSaving(false); setModal(null); showToast("Water logged ✓");
  };

  const saveLeetcode = async (v: Record<string, string>) => {
    setSaving(true);
    await supabase.from("stats").update({ leetcode_easy: (stats.leetcode_easy ?? 0) + (parseInt(v.easy) || 0), leetcode_medium: (stats.leetcode_medium ?? 0) + (parseInt(v.medium) || 0), leetcode_hard: (stats.leetcode_hard ?? 0) + (parseInt(v.hard) || 0), leetcode_streak: (stats.leetcode_streak ?? 0) + 1 }).eq("user_id", profile.id);
    await refreshAll(); setSaving(false); setModal(null); showToast("LeetCode logged ✓");
  };

  // ── Delete handlers ───────────────────────────────────────────────────────
  const deleteReading = async (id: string) => {
    const entry = readingLog.find(r => r.id === id);
    await supabase.from("reading_log").delete().eq("id", id);
    if (entry) await supabase.from("stats").update({ pages_today: 0, reading_streak: Math.max(0, (stats.reading_streak ?? 1) - 1) }).eq("user_id", profile.id);
    await refreshAll(); showToast("Entry removed");
  };

  const deleteLifting = async (id: string) => {
    await supabase.from("lifting_log").delete().eq("id", id);
    await supabase.from("stats").update({ total_workouts: Math.max(0, (stats.total_workouts ?? 1) - 1), workouts_this_week: Math.max(0, (stats.workouts_this_week ?? 1) - 1), lift_streak: Math.max(0, (stats.lift_streak ?? 1) - 1) }).eq("user_id", profile.id);
    await refreshAll(); showToast("Workout removed");
  };

  const deleteWeight = async (id: string) => {
    await supabase.from("weight_log").delete().eq("id", id);
    await refreshAll(); showToast("Entry removed");
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const readingData   = readingLog.length ? [...readingLog].reverse().map(r => ({ day: r.date.slice(5), pages: r.pages })) : PLACEHOLDER_READING;
  const liftingData   = liftingLog.length ? [...liftingLog].reverse().map(l => ({ week: l.week_label, volume: l.volume_kg })) : PLACEHOLDER_LIFTING;
  const weightData    = weightLog.length  ? weightLog.map(w => ({ day: w.logged_at.slice(5,10), weight: Number(w.weight) })) : PLACEHOLDER_WEIGHT;
  const currentWeight = weightLog.length  ? Number(weightLog[weightLog.length - 1].weight) : 0;
  const goalWeight    = stats.goal_weight ?? 0;
  const weightLost    = weightLog.length > 1 ? Number(weightLog[0].weight) - currentWeight : 0;
  const weightGoalPct = goalWeight && currentWeight && weightLog.length > 1
    ? Math.max(0, Math.min(100, Math.round(((Number(weightLog[0].weight) - currentWeight) / (Number(weightLog[0].weight) - goalWeight)) * 100))) : 0;
  const waterPct     = stats.water_goal_ml ? Math.round((stats.water_ml_today / stats.water_goal_ml) * 100) : 0;
  const workoutPct   = stats.workout_goal  ? Math.round((stats.workouts_this_week / stats.workout_goal)  * 100) : 0;
  const totalLeetcode = (stats.leetcode_easy ?? 0) + (stats.leetcode_medium ?? 0) + (stats.leetcode_hard ?? 0);

  const HABITS = [
    { name: "Hydration", colorOn: "#38bdf8", data: Array.from({ length: 28 }, (_, i) => i < (stats.water_streak   ?? 0)) },
    { name: "Lifting",   colorOn: "#6366f1", data: Array.from({ length: 28 }, (_, i) => i < (stats.lift_streak    ?? 0)) },
    { name: "Reading",   colorOn: "#3d74b8", data: Array.from({ length: 28 }, (_, i) => i < (stats.reading_streak ?? 0)) },
  ];

  // ── History entries ───────────────────────────────────────────────────────
  const readingHistory: HistoryEntry[] = readingLog.map(r => ({ id: r.id!, label: `${r.pages} pages`, sub: r.date }));
  const liftingHistory: HistoryEntry[] = liftingLog.map(l => ({ id: l.id!, label: `${l.volume_kg} kg volume`, sub: l.created_at ? new Date(l.created_at).toLocaleDateString() : l.week_label }));
  const weightHistory:  HistoryEntry[] = [...weightLog].reverse().map(w => ({ id: w.id!, label: `${w.weight} lbs`, sub: new Date(w.logged_at).toLocaleDateString() }));

  const firstName = profile?.username ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // ── Modal config ──────────────────────────────────────────────────────────
  type ModalConfig = { title: string; fields: Field[]; onSave: (v: Record<string,string>) => Promise<void>; history: HistoryEntry[]; onDelete: (id: string) => Promise<void>; };
  const MODALS: Record<NonNullable<Modal>, ModalConfig> = {
    reading:  { title: "Reading",  fields: [{ key: "pages", label: "Pages read today", placeholder: "e.g. 30" }, { key: "books", label: "Books completed (optional)", placeholder: "0" }], onSave: saveReading,  history: readingHistory, onDelete: deleteReading },
    lifting:  { title: "Workout",  fields: [{ key: "volume", label: "Total volume (kg)", placeholder: "e.g. 2500", step: "0.5" }],                                                          onSave: saveLifting,  history: liftingHistory, onDelete: deleteLifting },
    weight:   { title: "Weight",   fields: [{ key: "weight", label: "Current weight (lbs)", placeholder: "e.g. 185.5", step: "0.1" }, { key: "goal", label: "Goal weight (optional)", placeholder: String(stats.goal_weight ?? "e.g. 170"), step: "0.1" }], onSave: saveWeight, history: weightHistory, onDelete: deleteWeight },
    water:    { title: "Water",    fields: [{ key: "ml", label: "Amount to add (ml)", placeholder: "e.g. 500" }],                                                                           onSave: saveWater,    history: [], onDelete: async () => {} },
    leetcode: { title: "LeetCode", fields: [{ key: "easy", label: "Easy solved", placeholder: "0" }, { key: "medium", label: "Medium solved", placeholder: "0" }, { key: "hard", label: "Hard solved", placeholder: "0" }], onSave: saveLeetcode, history: [], onDelete: async () => {} },
  };

  const activeModal = modal ? MODALS[modal] : null;

  return (
    <>
      <main className="max-w-7xl mx-auto px-5 py-10 space-y-8">

        {/* Banner */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
          className="dashboard-card px-7 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <p className="stat-label mb-0.5">LifeBoard</p>
            <h1 className="font-display text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{greeting}, {firstName}.</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Here's your progress at a glance.</p>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-widest px-4 py-2 rounded-xl" style={{ color: "var(--text-muted)" }}>
            <LogOut size={13} /> Sign out
          </button>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 1. Reading */}
          <Card delay={0.08}>
            <div className="flex items-start justify-between mb-5">
              <div className="icon-badge icon-badge-read"><BookOpen size={20} /></div>
              <div className="text-right">
                <p className="stat-label">Books read this year</p>
                <p className="stat-value" style={{ fontSize: "2rem" }}><AnimatedNumber value={stats.books_read ?? 0} /></p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Reading streak</span>
                  <span className="stat-label flex items-center gap-1"><Flame size={11} style={{ color: "#f97316" }} /> {stats.reading_streak ?? 0} days</span>
                </div>
                <ProgressBar pct={(stats.reading_streak ?? 0) / 30 * 100} colorClass="progress-fill-read" />
              </div>
              <div>
                <p className="stat-label mb-2">Pages — last 7 days</p>
                <div style={{ height: 64 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={readingData}>
                      <defs><linearGradient id="gRead" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3d74b8" stopOpacity={0.25}/><stop offset="95%" stopColor="#3d74b8" stopOpacity={0}/></linearGradient></defs>
                      <Area type="monotone" dataKey="pages" stroke="#3d74b8" strokeWidth={2} fill="url(#gRead)" dot={false}/>
                      <Tooltip content={<ChartTip unit=" pages"/>}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>Pages today: <strong>{stats.pages_today ?? 0}</strong></span>
                <LogButton onClick={() => setModal("reading")} />
              </div>
            </div>
          </Card>

          {/* 2. Lifting */}
          <Card delay={0.14}>
            <div className="flex items-start justify-between mb-5">
              <div className="icon-badge icon-badge-lift"><Dumbbell size={20} /></div>
              <div className="text-right">
                <p className="stat-label">Total workouts</p>
                <p className="stat-value" style={{ fontSize: "2rem" }}><AnimatedNumber value={stats.total_workouts ?? 0} /></p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>This week</span>
                  <span className="stat-label">{stats.workouts_this_week ?? 0} / {stats.workout_goal ?? 4} sessions</span>
                </div>
                <ProgressBar pct={workoutPct} colorClass="progress-fill-lift" delay={100}/>
              </div>
              <div>
                <p className="stat-label mb-2">Volume — last 6 weeks (kg)</p>
                <div style={{ height: 72 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={liftingData} barSize={18}>
                      <Bar dataKey="volume" fill="#818cf8" radius={[4,4,0,0]}/>
                      <Tooltip content={<ChartTip unit=" kg"/>}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <LogButton onClick={() => setModal("lifting")} label="Log workout"/>
              </div>
            </div>
          </Card>

          {/* 3. Weight */}
          <Card delay={0.2}>
            <div className="flex items-start justify-between mb-5">
              <div className="icon-badge icon-badge-weight"><Scale size={20} /></div>
              <div className="text-right">
                <p className="stat-label">Current weight (lbs)</p>
                <p className="stat-value" style={{ fontSize: "2rem" }}><AnimatedNumber value={currentWeight} decimals={1}/></p>
              </div>
            </div>
            <div className="space-y-4">
              {goalWeight > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Goal: {goalWeight} lbs</span>
                    <span className="stat-label flex items-center gap-1"><TrendingDown size={11}/> {weightLost > 0 ? `−${weightLost.toFixed(1)} lost` : "tracking"}</span>
                  </div>
                  <ProgressBar pct={weightGoalPct} colorClass="progress-fill-weight" delay={200}/>
                </div>
              )}
              <div>
                <p className="stat-label mb-2">Trend — last 30 days</p>
                <div style={{ height: 80 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                      <Line type="monotone" dataKey="weight" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: "#06b6d4", strokeWidth: 0 }}/>
                      <YAxis domain={["dataMin - 2","dataMax + 2"]} hide/>
                      <Tooltip content={<ChartTip unit=" lbs"/>}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="38" fill="none" stroke="var(--border-subtle)" strokeWidth="8"/>
                    <motion.circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={238.76} initial={{ strokeDashoffset: 238.76 }}
                      animate={{ strokeDashoffset: 238.76 - (238.76 * weightGoalPct / 100) }}
                      transition={{ duration: 1.4, delay: 0.6, ease: [0.165, 0.84, 0.44, 1] }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span style={{ fontFamily: "var(--font-fraunces)", fontWeight: 700, fontSize: 13, color: "var(--text-primary)" }}>{weightGoalPct}%</span>
                    <span className="stat-label" style={{ fontSize: 7 }}>of goal</span>
                  </div>
                </div>
                <LogButton onClick={() => setModal("weight")} label="Log weight"/>
              </div>
            </div>
          </Card>

          {/* 4. Water */}
          <Card delay={0.26}>
            <div className="flex items-start justify-between mb-5">
              <div className="icon-badge icon-badge-water"><Droplets size={20} /></div>
              <div className="text-right">
                <p className="stat-label">Water today (ml)</p>
                <p className="stat-value" style={{ fontSize: "2rem" }}><AnimatedNumber value={stats.water_ml_today ?? 0}/></p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Daily goal</span>
                  <span className="stat-label">{stats.water_ml_today ?? 0} / {stats.water_goal_ml ?? 3000} ml</span>
                </div>
                <ProgressBar pct={waterPct} colorClass="progress-fill-water" delay={300}/>
              </div>
              <div className="flex items-end justify-center gap-1.5 pt-2" style={{ height: 56 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
                    style={{ width: 22, height: 8 + i * 5, borderRadius: 4, background: waterPct >= ((i+1)/8)*100 ? "#38bdf8" : "rgba(56,189,248,0.12)", transformOrigin: "bottom" }}
                  />
                ))}
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{waterPct}% of goal</span>
                <LogButton onClick={() => setModal("water")} label="Add water"/>
              </div>
            </div>
          </Card>

          {/* 5. LeetCode */}
          <Card delay={0.32}>
            <div className="flex items-start justify-between mb-5">
              <div className="icon-badge icon-badge-leet"><Code2 size={20} /></div>
              <div className="text-right">
                <p className="stat-label">Problems solved</p>
                <p className="stat-value" style={{ fontSize: "2rem" }}><AnimatedNumber value={totalLeetcode}/></p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Easy",   value: stats.leetcode_easy   ?? 0, color: "#22c55e", max: 200 },
                { label: "Medium", value: stats.leetcode_medium ?? 0, color: "#f59e0b", max: 150 },
                { label: "Hard",   value: stats.leetcode_hard   ?? 0, color: "#ef4444", max: 100 },
              ].map(({ label, value, color, max }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</span>
                    <span className="font-mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value}</span>
                  </div>
                  <div className="progress-track">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((value/max)*100,100)}%` }} transition={{ duration: 1, delay: 0.5 }}
                      style={{ height: "100%", borderRadius: 999, background: color }}/>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                <span className="stat-label flex items-center gap-1"><Flame size={11} style={{ color: "#f97316" }}/> {stats.leetcode_streak ?? 0} day streak</span>
                <LogButton onClick={() => setModal("leetcode")}/>
              </div>
            </div>
          </Card>

          {/* 6. Habits */}
          <Card delay={0.38} className="md:col-span-2 lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Trophy size={20} style={{ color: "var(--accent-primary)" }}/> Habit consistency — last 28 days
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {HABITS.map((habit, hIdx) => (
                <div key={hIdx} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{habit.name}</span>
                    <span className="stat-label">{habit.data.filter(Boolean).length} / 28 days</span>
                  </div>
                  <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(7, 1fr)" }}>
                    {habit.data.map((done, i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.018, duration: 0.25 }}
                        className="habit-cell" style={{ background: done ? habit.colorOn : "rgba(61,116,184,0.07)" }} title={`Day ${i + 1}`}/>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {modal && activeModal && (
          <LogModal title={activeModal.title} fields={activeModal.fields} onSave={activeModal.onSave} onClose={() => setModal(null)}
            saving={saving} history={activeModal.history} onDelete={activeModal.onDelete}/>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--text-primary)", color: "white", padding: "10px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", zIndex: 100, fontFamily: "var(--font-jakarta), sans-serif", whiteSpace: "nowrap" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
