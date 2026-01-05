const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

export function getToken() {
  return localStorage.getItem("token");
}

export const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export function setAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw { status: res.status, data };
  }
  return data;
}

export const api = {
  register: (payload) =>
    apiFetch("/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    apiFetch("/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => apiFetch("/logout", { method: "POST" }),

  getSeasons: (page = 1, perPage = 50) =>
    apiFetch(`/seasons?page=${page}&per_page=${perPage}`),
  getActiveSeason: () => apiFetch("/seasons/active"),
  getSeasonEvents: (seasonId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/seasons/${seasonId}/events?${query}`);
  },
  seasonLeaderboard: (seasonId) => apiFetch(`/seasons/${seasonId}/leaderboard`),
  eventLeaderboard: (eventId) => apiFetch(`/events/${eventId}/leaderboard`),

  createTeam: (payload) =>
    apiFetch("/teams", { method: "POST", body: JSON.stringify(payload) }),
  myTeamResults: () => apiFetch("/my-results"),
  publicTrivia: async (amount = 3) => {
    const res = await fetch(
      `https://opentdb.com/api.php?amount=${amount}&type=multiple`
    );
    const data = await res.json();
    return data.results || [];
  },
};

export { API_URL };
