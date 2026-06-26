import React, { createContext, useContext, useState } from "react";

interface Session {
  sessionId: string;
  userId: number;
  name: string;
  phone: string;
  avatarColor: string;
}

interface SessionCtx {
  session: Session | null;
  setSession: (s: Session | null) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionCtx>(null!);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => {
    const raw = localStorage.getItem("shifr_session");
    return raw ? JSON.parse(raw) : null;
  });

  const setSession = (s: Session | null) => {
    if (s) localStorage.setItem("shifr_session", JSON.stringify(s));
    else localStorage.removeItem("shifr_session");
    setSessionState(s);
  };

  const logout = () => setSession(null);

  return (
    <SessionContext.Provider value={{ session, setSession, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
