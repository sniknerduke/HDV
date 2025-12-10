import { api } from "./axiosConfig"

export interface CreateVnpayRequest {
  orderId: string;
  amount: number; // VND
  // Frontend should not set this; service enforces backend return URL
  returnUrl?: string;
  ipAddress?: string;
}

export interface CreateVnpayResponse {
  paymentUrl: string;
}

// const BASE = 'http://localhost:9090/api/payment/vnpay';

export interface PaymentTransaction {
  id?: number;
  orderId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | string;
  vnpTransactionNo?: string;
  vnpResponseCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function createVnpayPayment(
  payload: CreateVnpayRequest
): Promise<CreateVnpayResponse> {
  // Luôn enforce returnUrl từ FE origin, không dùng input trực tiếp
  const origin = window.location.origin;
  const enforcedReturnUrl = `${origin}/payment/vnpay/return`;

  const body = {
    orderId: payload.orderId,
    amount: Math.round(payload.amount),
    returnUrl: enforcedReturnUrl,
    ipAddress: payload.ipAddress || "127.0.0.1",
  };

  const res = await api.post("/payment/vnpay/create", body);
  return res.data;
}
// export async function createVnpayPayment(payload: CreateVnpayRequest): Promise<CreateVnpayResponse> {
//   let res: Response;
//   // Always use backend return endpoint regardless of caller input
//   const origin = new URL(BASE).origin;
//   const enforcedReturnUrl = `${origin}/payment/vnpay/return`;
//   const body = {
//     orderId: payload.orderId,
//     amount: Math.round(payload.amount),
//     returnUrl: enforcedReturnUrl,
//     ipAddress: payload.ipAddress || '127.0.0.1'
//   };
//   const res = await api.post(`/payment/vnpay/create`, body);
//     return res.data;
// }

export async function getPaymentStatus(orderId: string): Promise<PaymentTransaction | null> {
  const res = await fetch(`${BASE}/status/${encodeURIComponent(orderId)}`);
  if (!res.ok) return null;
  return res.json();
}
