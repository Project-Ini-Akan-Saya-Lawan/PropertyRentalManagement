// types/midtrans.d.ts
// Type declarations for the `MidtransNew3ds` global injected by
// https://api.(sandbox.)midtrans.com/v2/assets/js/midtrans-new-3ds.min.js
// (loaded via <Script data-client-key=... /> in the payment page)

export interface MidtransCardData {
  card_number: string;
  card_exp_month: string;
  card_exp_year: string;
  card_cvv: string;
}

export interface MidtransCardTokenSuccess {
  status_code: string;
  token_id: string;
  hash?: string;
}

export interface MidtransCardTokenFailure {
  status_code: string;
  status_message: string;
  validation_messages?: string[];
}

export interface MidtransAuthenticateOptions {
  performAuthentication: (redirectUrl: string) => void;
  onSuccess: (response: unknown) => void;
  onFailure: (response: unknown) => void;
  onPending: (response: unknown) => void;
}

export interface MidtransNew3dsClient {
  getCardToken: (
    card: MidtransCardData,
    callbacks: {
      onSuccess: (response: MidtransCardTokenSuccess) => void;
      onFailure: (response: MidtransCardTokenFailure) => void;
    },
  ) => void;
  authenticate: (
    redirectUrl: string,
    options: MidtransAuthenticateOptions,
  ) => void;
}

declare global {
  interface Window {
    MidtransNew3ds?: MidtransNew3dsClient;
  }
}
