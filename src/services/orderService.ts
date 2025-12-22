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

export async function exportOrders(): Promise<void> {
  const res = await api.get("/orders/export", {
    responseType: "blob", // quan trọng: để nhận file binary
  });

  // Tạo URL từ blob
  const url = window.URL.createObjectURL(new Blob([res.data]));

  // Tạo thẻ <a> để tải file
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "orders.xlsx"); // tên file tải về
  document.body.appendChild(link);
  link.click();
  link.remove();
}


export async function getOrderById(id: number): Promise<Order> {
  const res = await api.get(`/orders/id/${id}`);
  return res.data;
}

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
  const res = await api.post(`/orders/checkout`);
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
