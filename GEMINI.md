# Life Dashboard — Design & Code Instructions

You are an expert frontend engineer and UI/UX designer. Your job is to build a **visually stunning, production-grade Life Dashboard** that tracks personal progress across health, fitness, reading, and other self-improvement goals. Every design decision must feel intentional, polished, and memorable.

---

## 🎯 Project Purpose

A personal Life Dashboard that tracks:
- **Reading** (books read, pages per day, reading streaks)
- **Lifting / Strength Training** (workouts logged, PRs hit, weekly volume)
- **Weight Loss** (current weight, goal weight, trend over time)
- **Any additional personal goals** (sleep, hydration, habits, etc.)

The user should feel **motivated and inspired** when they open this dashboard — not like they're looking at a spreadsheet.

---

## 🎨 Design Philosophy

**Commit to a bold, distinctive aesthetic. Do not produce generic "app" design.**

Pick ONE of these directions and execute it with precision:

### Option A — Soft Organic / Blues
- Soft off-white or pale blue-grey base (`#f4f7fb` or `#eef2f9`)
- Steel blue and periwinkle as primary accents (`#4a7fc1`, `#7b9fd4`)
- Soft sky blue highlights for active states and progress fills (`#a8c4e8`)
- Rounded, organic card shapes with gentle box shadows — no sharp borders
- Font: Fraunces or Lora for headings, Plus Jakarta Sans for body text, DM Mono for numbers
- Progress bars with a soft blue gradient fill, pill-shaped ends
- Subtle watercolor-wash or noise texture on the background
- Cards feel airy and light — like a calm, focused morning

### Option B — Deep Ocean / Moody Blues
- Deep blue-slate background (`#0d1b2a` or `#111927`)
- Bright sky blue and soft cyan accents (`#5ba4f5`, `#8ecfff`)
- Soft periwinkle for secondary elements (`#a0b4d6`)
- Cards as slightly lighter slate panels (`#182436`) with a subtle blue-glow border on hover
- Font: Sora or DM Sans for headings, Space Mono or DM Mono for data numbers
- Progress rings and bars glow softly in accent blue
- Feels like a late-night productivity app — focused, immersive, cool-toned
- Subtle radial gradient spotlight behind the hero section

**Pick whichever feels most exciting to you and commit fully. No half-measures.**

---

## 🏗️ Layout & Components

### Overall Structure
- **Full-page dashboard** — not a multi-page app
- Sidebar or top nav with section labels
- Main content area with a **responsive grid** (3-column on desktop, 1-column on mobile)
- A prominent **"Today at a Glance"** hero section at the top

### Required Cards/Widgets

#### 1. 📚 Reading Tracker
- Books read this year (large number, animated count-up on load)
- Current book title + progress bar (% complete)
- Daily reading streak (fire icon or similar)
- Mini sparkline of pages read per day (last 14 days)

#### 2. 🏋️ Lifting Tracker
- Workouts this week vs. goal (e.g. "3 / 4")
- Recent PRs list (exercise + weight)
- Weekly volume trend (simple bar chart, last 6 weeks)
- Next planned workout label

#### 3. ⚖️ Weight Progress
- Current weight (large, prominent)
- Goal weight + lbs remaining
- Trend line chart (last 30 days) — smooth curve, not jagged
- % of goal achieved shown as a circular progress ring

#### 4. 🔥 Habit Streak Board
- Grid of habits (e.g. Hydration, Sleep 8hrs, No sugar)
- Each habit shows a compact calendar heatmap (GitHub-style) for the last 4 weeks
- Color intensity = completion

#### 5. 📊 Weekly Summary Banner
- Across the top or as a sidebar widget
- "This week you: read 120 pages · lifted 3x · lost 0.8 lbs"
- Feels like a personal coach summary

---

## ✨ Motion & Interaction

- **Page load**: staggered reveal — cards animate in one by one with subtle slide-up + fade
- **Numbers**: count-up animation on load (0 → actual value over ~800ms)
- **Progress bars**: fill animation on load (left to right, ~600ms ease-out)
- **Charts**: draw-on animation (lines draw themselves in on load)
- **Hover states**: cards lift slightly (translateY -4px + shadow deepens)
- **Streak days**: pulse glow on the current day marker

---

## 🖥️ Technical Requirements

- **Framework**: React (functional components + hooks) OR vanilla HTML/CSS/JS — whichever produces cleaner output
- **Charts**: Use Recharts (if React) or Chart.js (if vanilla) — no D3 unless you're confident
- **No external UI libraries** (no MUI, no Tailwind component kits) — write custom CSS
- **Tailwind utility classes** are fine for layout spacing
- **Use CSS custom properties** (variables) for ALL colors and typography so the theme is easy to swap
- **Hardcode realistic sample data** — make the dashboard feel like it belongs to a real person
- **Responsive**: must look good on mobile (single column) and desktop (multi-column grid)
- **Single file output** preferred (all CSS + JS in one HTML file, or one JSX file)

---

## 📐 CSS Variable System (Required)

Define at least these variables at `:root`:

```css
:root {
  --bg-primary: /* main background */;
  --bg-card: /* card surface */;
  --bg-card-hover: /* card hover state */;
  --accent-primary: /* main accent color */;
  --accent-secondary: /* secondary accent */;
  --text-primary: /* main text */;
  --text-secondary: /* muted/label text */;
  --text-data: /* numbers and stats */;
  --border-subtle: /* card borders */;
  --radius-card: 16px;
  --shadow-card: /* card shadow */;
  --font-display: /* heading font */;
  --font-body: /* body font */;
  --font-mono: /* data/number font */;
}
```

---

## 🚫 The One Style You Must NEVER Build

**Do NOT build an RPG / video game / "Solo Leveling" style dashboard.** This is the single most common AI dashboard mistake and it must be avoided entirely. That means:

- ❌ No dark charcoal/black backgrounds with cyan + purple neon accents
- ❌ No "LV. 24", "XP: 420/1000", "E-Rank", or any gamification language
- ❌ No "STATUS WINDOW", "DAILY QUESTS", "ACHIEVEMENTS" panel framing
- ❌ No monospace fonts used as the primary typeface throughout
- ❌ No glowing neon borders or CRT/scanline effects
- ❌ No stat blocks that look like a character sheet (STRENGTH: 45, AGILITY: 38)
- ❌ No quest-log UI patterns

This aesthetic is overdone, cold, and alienating for a personal life dashboard. The user wants to feel **calm, motivated, and proud** when they open this — not like they're playing a video game.

---

## ❌ What Else NOT to Do

- No generic purple gradients on white backgrounds
- No Inter or Roboto as the primary font
- No flat, shadowless cards with no depth
- No basic Bootstrap or default browser styling
- No placeholder "lorem ipsum" — use realistic fitness/reading data
- No cramped layouts — breathing room is part of the design
- Don't just build a table — this should feel like a **product**, not a spreadsheet

---

## ✅ Definition of Done

The output should look like something you'd pay $50/month to subscribe to. A designer should look at it and say "who built this?" — in a good way. The data should feel alive, the typography should feel considered, and the user should feel proud to look at their progress every morning.

Build it.