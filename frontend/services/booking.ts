const API = process.env.NEXT_PUBLIC_API_URL;

export const bookingService = {
  async create(data: unknown) {
    if (API) return fetch(`${API}/bookings`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json());
    return Promise.resolve({ id: `booking-${Date.now()}`, status: "pending" });
  },
};
