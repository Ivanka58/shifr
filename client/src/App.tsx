import React from "react";
import { Router, Route, Switch, Redirect } from "wouter";
import { SessionProvider, useSession } from "./lib/session";
import { LangProvider } from "./lib/lang";
import Login from "./pages/login";
import Chat from "./pages/chat";
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import Cybersecurity from "./pages/settings/cybersecurity";
import DoubleBottom from "./pages/settings/double-bottom";
import Panic from "./pages/settings/panic";
import Admin from "./pages/admin";

function Guard({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  if (!session) return <Redirect to="/" />;
  return <>{children}</>;
}

function Routes() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/chat">
        <Guard><Chat /></Guard>
      </Route>
      <Route path="/profile">
        <Guard><Profile /></Guard>
      </Route>
      <Route path="/settings">
        <Guard><Settings /></Guard>
      </Route>
      <Route path="/settings/cybersecurity">
        <Guard><Cybersecurity /></Guard>
      </Route>
      <Route path="/settings/double-bottom">
        <Guard><DoubleBottom /></Guard>
      </Route>
      <Route path="/settings/panic">
        <Guard><Panic /></Guard>
      </Route>
      <Route path="/admin">
        <Guard><Admin /></Guard>
      </Route>
      <Route>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="text-4xl font-bold text-neon mb-4">404</div>
            <div className="text-dim mb-6">ФАЙЛ НЕ НАЙДЕН</div>
            <a href="/" className="btn-neon">НА ГЛАВНУЮ</a>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <LangProvider>
        <div className="scanlines">
          <Router>
            <Routes />
          </Router>
        </div>
      </LangProvider>
    </SessionProvider>
  );
}
