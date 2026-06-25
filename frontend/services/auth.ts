const API = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
  async login(email: string, password: string) {
    if (API) return fetch(`${API}/auth/login`, { method: "POST", body: JSON.stringify({ email, password }), headers: { "Content-Type": "application/json" } }).then(r => r.json());
    return Promise.resolve({ token: "mock-token", user: { email } });
  },
  async register(data: { username: string; email: string; password: string }) {
    if (API) return fetch(`${API}/auth/register`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json());
    return Promise.resolve({ success: true });
  },
};
