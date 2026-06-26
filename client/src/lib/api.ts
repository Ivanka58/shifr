const BASE = import.meta.env.VITE_API_URL || "";

function getSession() {
  const raw = localStorage.getItem("shifr_session");
  return raw ? JSON.parse(raw) : null;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const session = getSession();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (session?.sessionId) {
    headers["x-session-id"] = session.sessionId;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  login: (phone: string) =>
    request("POST", "/api/auth/login", { phone }),
  verify: (phone: string, code: string) =>
    request("POST", "/api/auth/verify", { phone, code }),

  getMe: () => request("GET", "/api/users/me"),
  updateMe: (data: { name?: string; avatarColor?: string }) =>
    request("PATCH", "/api/users/me", data),
  getUsers: () => request<any[]>("GET", "/api/users"),
  getUser: (id: number) => request("GET", `/api/users/${id}`),

  getMessages: (userId: number) =>
    request<any[]>("GET", `/api/messages/${userId}`),
  sendMessage: (toUserId: number, text: string) =>
    request("POST", "/api/messages", { toUserId, text }),
  deleteMessage: (id: number, scope: "self" | "all") =>
    request("DELETE", `/api/messages/${id}?scope=${scope}`),
  editMessage: (id: number, text: string) =>
    request("PATCH", `/api/messages/${id}`, { text }),
  getUnread: () => request<any[]>("GET", "/api/messages/unread"),
  getStats: () => request("GET", "/api/messages/stats"),

  getVapidKey: () => request<{ key: string }>("GET", "/api/push/vapid-public-key"),
  subscribePush: (sub: PushSubscriptionJSON) =>
    request("POST", "/api/push/subscribe", sub),
  unsubscribePush: (endpoint: string) =>
    request("DELETE", "/api/push/subscribe", { endpoint }),

  adminUsers: () => request<any[]>("GET", "/api/admin/users"),
  adminMessages: () => request<any[]>("GET", "/api/admin/messages"),
  adminPurge: () => request("GET", "/api/admin/purge?key=shifr-purge-2025"),
};
