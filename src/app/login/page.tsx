"use client";

import { createClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Shield, Mail } from "lucide-react";

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
        className="system-panel system-panel-glow p-8 w-full max-w-md space-y-8 flex flex-col items-center text-center"
      >
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-full">
          <Shield className="text-primary" size={48} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-orbitron font-black text-white tracking-widest">
            SYSTEM ACCESS
          </h1>
          <p className="text-white/50 font-rajdhani uppercase tracking-widest text-sm">
            Authenticate to begin your awakening
          </p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full py-4 bg-white/5 border border-primary/30 hover:bg-primary/20 hover:border-primary transition-all flex items-center justify-center gap-4 text-white font-orbitron font-bold tracking-widest group"
        >
          <Mail className="group-hover:scale-110 transition-transform" />
          SIGN IN WITH GOOGLE
        </button>

        <div className="pt-4 border-t border-white/10 w-full">
          <p className="text-[10px] text-white/20 font-rajdhani uppercase tracking-[0.2em]">
            Warning: Only registered Hunters may access the system.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
