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

export async function getOrderItems(orderId: number): Promise<OrderItemDTO[]> {
  const res = await api.get(`/orders/${orderId}/items`);
  return res.data;
}

export interface OrderItemDTO {
  id: number;
  orderId: number;
  courseId: number;
  courseTitle: string;
  price: number;
}

export async function filterOrders(startDate: string, endDate: string, status?: string) {
  const params = new URLSearchParams();
  params.append("start", `${startDate}T00:00:00`);   // thêm giờ để parse được LocalDateTime
  params.append("end", `${endDate}T23:59:59`);
  if (status && status !== "all") {
    params.append("status", status);
  }

  const res = await api.get(`/orders/filter?${params.toString()}`);
  return res.data;
}

export async function search(type: "orderId" | "userId", value: number): Promise<OrderItemDTO[]> {
  const res = await api.get(`/orders/search`, { params: { type, value } });
  return res.data;
}

// export async function search(orderId?: number, userId?: number): Promise<OrderItemDTO[]> {
//     const params: any = {};
//   if (orderId) params.id = orderId;
//   if (userId) params.userId = userId;
//
//   const res = await api.get(`/orders/search` , { params }); // truyền params vào
//   return res.data;
// }

export async function getOrdersPage(page: number, size: number): Promise<{content: Order[], totalPages: number, totalElements: number}> {
  const res = await api.get(`/orders?page=${page}&size=${size}`);
  return res.data;
}

export async function getOrdersDetail(orderId: number): Promise<OrderItemDTO[]> {
  const res = await api.get(`/orders/order-items/${orderId}/items`);
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
