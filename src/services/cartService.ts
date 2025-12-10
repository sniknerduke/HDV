import { api } from "./axiosConfig";
import { CartItem } from "./cartTypes"; // hoặc định nghĩa ngay trong file

export interface CartItem {
  cartItemId: number;
  courseId: number;
  courseTitle: string;
  coursePrice: number;
}

// Lấy giỏ hàng
export async function getCart(): Promise<{ items: CartItem[], totalPrice: number }> {
  const res = await api.get(`/cart`);
  return res.data;
}


// Thêm vào giỏ hàng
export async function addToCart(userId: number, courseId: number): Promise<CartItem[]> {
  const res = await api.post(`/cart/add-to-cart?userId=${userId}&courseId=${courseId}`);
//    = await userApi.get(`/cart?userId=${userId}`);
//   return res.data.items;
  return res.data;
}

// Xóa khỏi giỏ hàng
export async function removeFromCart(cartItemId: number): Promise<{ items: CartItem[], totalPrice: number }> {
    await api.delete(`/cart/${cartItemId}`);
//   const res = await userApi.get(`/cart?userId=${userId}`);

  // B2: gọi lại API lấy giỏ hàng theo userId
    const res = await api.get(`/cart`);
//     return { items: res.data.items };
//   return res.data.items; // trả về array, không phải object
    return res.data;
  }

// // Xóa khỏi giỏ hàng
// export async function removeFromCart(userId: number, courseId: number): Promise<CartItem[]> {
//   await api.delete(`/cart/${courseId}?userId=${userId}`);
// //   const res = await userApi.get(`/cart?userId=${userId}`);
//   return res.data.items;
// }

// // ✅ Checkout giỏ hàng
// export interface Order  {
//     id: number;
//   orderId : string;        // hoặc orderId nếu backend trả về như vậy
//   userId: number;
//   amount: number;
//   status?: string;
//   createdAt?: string;
// }
//
// export async function checkoutCart(userId: number): Promise<Order> {
//   const token = localStorage.getItem("auth_token");
//   const res = await api.post(`/cart/checkout?userId=${userId}`, {}, {
//     headers: { Authorization: `Bearer ${token}` }
//   });
//   return res.data; // chính là object Order JSON
// }

// export async function checkoutCart(userId: number): Promise<Order> {
//   const token = localStorage.getItem("token");
//   const res = await userApi.post(`/cart/checkout?userId=${userId}`, {}, {
//     headers: {
//       Authorization: `Bearer ${token}`
//     }
//   });
//   return res.data;
// }