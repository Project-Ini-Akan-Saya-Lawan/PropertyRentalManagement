// services/payment.ts
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ChargeCardResponse {
  message: string;
  data: {
    payment: {
      payment_id: number;
      booking_id: number;
      order_id: string;
      status: string;
      [key: string]: unknown;
    };
    transaction_status: string;
    fraud_status: string | null;
    redirect_url: string | null;
  };
}

export interface PaymentStatusResponse {
  data: {
    payment_id: number;
    booking_id: number;
    order_id: string;
    status: string;
    [key: string]: unknown;
  };
}

function authHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const paymentService = {
  /**
   * Charge a booking using a Midtrans card `token_id` obtained client-side
   * via MidtransNew3ds.getCardToken(). Never send raw card data here -
   * only the token.
   */
  async chargeCard(
    bookingId: number,
    tokenId: string,
    saveCard = false,
  ): Promise<ChargeCardResponse> {
    const res = await fetch(`${API}/api/payments/card/charge`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        booking_id: bookingId,
        token_id: tokenId,
        save_card: saveCard,
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Failed to process card payment.");
    }
    return result;
  },

  /**
   * Re-check a transaction's latest status directly from the backend
   * (which itself re-verifies with Midtrans). Used right after the 3DS
   * authentication popup closes, since that's the source of truth rather
   * than trusting the client-side callback response alone.
   */
  async getStatus(orderId: string): Promise<PaymentStatusResponse> {
    const res = await fetch(`${API}/api/payments/status/${orderId}`, {
      method: "GET",
      headers: authHeaders(),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Failed to fetch payment status.");
    }
    return result;
  },
};
