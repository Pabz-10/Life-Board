"use client";

import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.165, 0.84, 0.44, 1] }}
        className="dashboard-card p-10 w-full max-w-sm space-y-8 flex flex-col items-center text-center"
      >
        {/* Logo mark */}
        <div className="space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
            LifeBoard
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Your personal progress dashboard
          </p>
        </div>

        <div className="w-full space-y-3">
          <button onClick={handleGoogleLogin} className="btn-primary">
            <Mail size={18} />
            Sign in with Google
          </button>
        </div>

        <p
          className="text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          Secure auth via Supabase & Google OAuth
        </p>
      </motion.div>
    </div>
  );
}
