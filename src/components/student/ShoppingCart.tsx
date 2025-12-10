import { useEffect, useState } from 'react';
import { formatCurrency } from '../ui/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Trash2, ShoppingCart as CartIcon } from 'lucide-react';
import { Badge } from '../ui/badge';

import { getCart, removeFromCart, clearCart, CartItem } from '../../services/cartService';
import { checkout } from '../../services/orderService';

interface ShoppingCartProps { onNavigate: (page: string) => void; }

// export interface CartItem {
//   id: string | number;
//   title: string;
//   instructor?: string;
//   price: number;
//   image?: string;
// }

export default function ShoppingCart({ onNavigate }: ShoppingCartProps) {
  const [items, setItems] = useState<CartItem[]>([]);
const [total, setTotal] = useState(0);

useEffect(() => {
  getCart().then((res) => {
    setItems(res.items);
    setTotal(res.totalPrice);
  }).catch(() => {
    setItems([]);
    setTotal(0);
  });
}, []);

// useEffect(() => {
//   getCart().then(setItems).catch(() => setItems([]));
// }, []);

//   useEffect(() => {
//     try {
//         setItems(getCart());
//     } catch {}
//   }, []);

//   const total = items.reduce((sum, item) => sum + (item.coursePrice || 0), 0);

  const handleRemove = async (id: number) => {
      const next = await removeFromCart(id);
setItems(next.items);       // cập nhật lại mảng
  setTotal(next.totalPrice);  // cập nhật lại tổng
    };

  const handleCheckout = async () => {
    try {
      const order = await checkout();   // ✅ hợp lệ
      console.log("Order created:", order);

    // Lưu order vào localStorage để Checkout đọc lại
    localStorage.setItem("current_order", JSON.stringify(order));
      // Sau khi checkout thành công, điều hướng sang trang checkout
      onNavigate('checkout');
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  };


  if (items.length === 0) {
    return (
      <div className="p-8">
        <h1 className="mb-6">Giỏ hàng</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <CartIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
            <Button onClick={() => onNavigate('courses')}>
              Khám phá khóa học
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-6">Giỏ hàng ({items.length} khóa học)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.cartItemId}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <img
                    src={`https://picsum.photos/200/120?random=${item.courseId}`}
                    alt={item.courseTitle}
                    className="w-32 h-20 object-cover rounded"
                  />

                  <div className="flex-1">
                    <h3 className="mb-1">{item.courseTitle}</h3>
                    {item.instructor && <p className="text-sm text-gray-600 mb-2">Giảng viên: {item.instructor}</p>}
                    <Badge variant="secondary">Bestseller</Badge>
                  </div>
                  <div className="text-right">
                    <p className="mb-2">{formatCurrency(item.coursePrice)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(item.cartItemId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Tổng cộng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tạm tính:</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giảm giá:</span>
                <span className="text-green-600">-0đ</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-4">
                  <span>Tổng:</span>
                  <span className="text-xl">{formatCurrency(total)}</span>
                </div>
                <Button className="w-full" onClick={handleCheckout}>
                  Thanh toán
                </Button>
              </div>
              <div className="text-xs text-gray-500 text-center">
                Hoàn tiền trong 30 ngày nếu không hài lòng
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
