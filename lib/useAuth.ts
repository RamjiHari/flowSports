import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return {
    session,
    loading,
    isAdmin: !!session,
    signInWithOtp: (email: string) => supabase.auth.signInWithOtp({ email }),
    verifyOtp: (email: string, token: string) => supabase.auth.verifyOtp({ email, token, type: "email" }),
    signOut: () => supabase.auth.signOut(),
  };
}
