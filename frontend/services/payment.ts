const API = process.env.NEXT_PUBLIC_API_URL;

export const paymentService = {
  async pay(data: unknown) {
    if (API) return fetch(`${API}/payments`, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } }).then(r => r.json());
    return Promise.resolve({ success: true, transactionId: `TXN-${Date.now()}` });
  },
};
