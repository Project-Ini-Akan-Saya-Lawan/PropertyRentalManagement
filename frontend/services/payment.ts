// services/payment.ts
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type BankCode = "bca" | "bni" | "bri" | "permata" | "mandiri";

export interface ChargeBankTransferResponse {
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
    bank: BankCode;
    va_number: string | null;
    biller_code: string | null;
    bill_key: string | null;
    expiry_time: string | null;
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
   * Create a Midtrans Core API bank transfer charge for a booking. Returns
   * either a Virtual Account number (BCA/BNI/BRI/Permata) or a Mandiri
   * biller_code/bill_key pair for the customer to pay into from their own
   * banking app - no card or account credentials are ever collected here.
   */
  async chargeBankTransfer(
    bookingId: number,
    bank: BankCode,
  ): Promise<ChargeBankTransferResponse> {
    const res = await fetch(`${API}/api/payments/bank-transfer/charge`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        booking_id: bookingId,
        bank,
      }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Failed to create bank transfer payment.");
    }
    return result;
  },

  /**
   * Re-check a transaction's latest status directly from the backend (which
   * itself re-verifies with Midtrans). Used to poll while waiting for the
   * customer to complete the transfer, since that's the source of truth
   * rather than trusting the async webhook to have already arrived.
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
