# Life Board — Personal Progress Dashboard

A visually stunning, production-grade dashboard to track your reading, fitness, and life goals. Designed with a professional, "Soft Organic" aesthetic to keep you motivated and focused.

## 🎨 Design & Aesthetic
This project follows the **Option A — Soft Organic / Blues** design direction from the project instructions.

- **Primary Palette:** Off-whites and soft blue-greys with steel blue and periwinkle accents.
- **Typography:** 
  - **Fraunces:** Elegant serif for headings.
  - **Plus Jakarta Sans:** Clean sans-serif for body text.
  - **DM Mono:** Monospace for data and numbers.
- **Visual Style:** Rounded organic cards (24px radius), soft shadows, and subtle background gradients with a noise texture.

### Where is the Design Defined?
If you want to tweak the colors, fonts, or card styles, look here:
1.  **`src/app/globals.css`**: Contains all CSS variables (`--bg-primary`, `--accent-primary`, etc.) and the `.dashboard-card` class definitions.
2.  **`src/app/layout.tsx`**: Where the Google Fonts are imported and assigned to CSS variables.
3.  **`src/components/DashboardClient.tsx`**: Contains the layout grid, Framer Motion animations, and Recharts chart configurations.

---

## 🚀 Tech Stack
- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Database/Auth:** Supabase (PostgreSQL + Google OAuth)
- **Charts:** Recharts
- **Icons:** Lucide React

---

## 🛠️ Setup & Deployment

### 1. Environment Variables
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
Run the SQL found in `supabase/schema.sql` in your Supabase SQL Editor to create the necessary tables (`profiles`, `stats`, `quests`) and Row Level Security (RLS) policies.

### 3. Authentication
Enable **Google Auth** in your Supabase dashboard and provide your Google Cloud Client ID and Secret.

### 4. Local Development
```bash
npm install
npm run dev
```

### 5. Deployment
The project is ready for deployment on **Netlify** or **Vercel**. 
- Ensure you set the Environment Variables in your deployment dashboard.
- The project uses the new `src/proxy.ts` convention for route protection and session management.

---

## 📈 Current Features
- **Route Protection:** Unauthenticated users are automatically redirected to `/login`.
- **Automatic Provisioning:** New users get a profile and starting stats automatically upon first login.
- **Reading Tracker:** Track pages read and momentum.
- **Fitness Tracker:** Track strength (STR) and weekly volume.
- **Weight Progress:** Monitor agility (AGI) and weight trends with circular progress rings.
- **LeetCode Tracker:** Monitor coding streaks and problem difficulty breakdown.
- **Habit Mastery:** GitHub-style heatmap for daily consistency.
