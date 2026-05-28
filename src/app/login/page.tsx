"use client";

import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { LogIn, Mail } from "lucide-react";

export default function Login() {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    if (!supabase?.auth) {
      alert("Supabase is not configured. Please add your keys to .env.local");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.165, 0.84, 0.44, 1] }}
        className="dashboard-card p-10 w-full max-w-md space-y-8 flex flex-col items-center text-center shadow-2xl"
      >
        <div className="p-4 bg-highlight/30 rounded-3xl text-primary">
          <LogIn size={40} />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-display font-bold text-primary tracking-tight">
            Welcome Back
          </h1>
          <p className="text-secondary font-body text-sm leading-relaxed">
            Sign in to access your personal dashboard and continue your progress.
          </p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full py-4 bg-primary text-white rounded-2xl font-body font-bold shadow-lg hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
        >
          <Mail className="group-hover:scale-110 transition-transform" size={20} />
          Sign in with Google
        </button>

        <div className="pt-6 border-t border-primary/5 w-full">
          <p className="text-[10px] text-secondary/40 font-mono uppercase tracking-widest">
            Secure authentication via Supabase & Google OAuth
          </p>
        </div>
      </motion.div>
    </div>
  );
}
