import axios from "axios";
import { api } from "./axiosConfig";


const API_BASE = "http://localhost:9090/api/orders";

export interface Order {
    id: number;
  orderId: string;
  userId: number;
  amount: number;
  status?: string;
  createdAt?: string;
}

// export async function getAllOrders(): Promise<Order[]> {
//   const res = await api.get(`/orders`);
//   return res.data;
// }

export async function getOrdersPage(page: number, size: number): Promise<{content: Order[], totalPages: number, totalElements: number}> {
  const res = await api.get(`/orders?page=${page}&size=${size}`);
  return res.data;
}

export async function getOrdersDetail(page: number, size: number): Promise<{content: Order[], totalPages: number, totalElements: number}> {
  const res = await api.get(`/orders?page=${page}&size=${size}`);
  return res.data;
}

// Tạo đơn hàng (checkout)
export async function checkout(): Promise<Order> {
//   const token = localStorage.getItem("token");
//   const res = await axios.post(`${API_BASE}/checkout`, {}, {
//     headers: {
//       Authorization: `Bearer ${token}`
//     }
//   });
  const res = await api.post(`/orders/checkout`);
  return res.data;
}

// Đánh dấu đơn hàng đã thanh toán
export async function markPaid(orderId: number): Promise<string> {
  const token = localStorage.getItem("token");
  const res = await axios.post(`${API_BASE}/${orderId}/paid`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}

// Lấy danh sách đơn hàng của user
export async function getOrders(userId: number): Promise<Order[]> {
  const token = localStorage.getItem("token");
  const res = await axios.get(`${API_BASE}?userId=${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}
