import { useEffect, useState } from 'react';
import { formatCurrency } from '../ui/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { CreditCard, Wallet, Building2, CheckCircle2 } from 'lucide-react';
import { createVnpayPayment } from '../../services/paymentService';

interface CheckoutProps { onNavigate: (page: string) => void; }

interface PurchaseRecord {
  id: string; // uuid-like or timestamp
  time: string; // ISO
  items: Array<{ id: string | number; title: string; price: number }>;
  total: number;
  method: string;
}

export default function Checkout({ onNavigate }: CheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

    const [cartItems, setCartItems] = useState<Array<{ id: string | number; title: string; price: number }>>([]);
    const [cartTotal, setCartTotal] = useState(0);
//     const cartTotal = cartItems.reduce((sum, i) => sum + (i.price || 0), 0);

  useEffect(() => {
    try {
      const rawOrder = localStorage.getItem('current_order');
      if (rawOrder) {
        const order = JSON.parse(rawOrder);
        setCartItems(order.items.map((c: any) => ({
          id: c.id,
          title: c.courseName, // backend trả về courseName
          price: c.price
        })));
            setCartTotal(order.amount); // ✅ lấy tổng tiền từ backend
        }

    } catch {}

    // Detect VNPay redirect result via query params
    try {
      const params = new URLSearchParams(window.location.search);
      const payment = params.get('payment');
      if (payment === 'success' || payment === 'failed') {
        const orderId = params.get('orderId') || Date.now().toString();
        const amountParam = params.get('amount');
        const responseCode = params.get('code');
        const isSuccess = payment === 'success';

        // Retrieve pending info (saved before redirect)
        let pending: any = null;
        try {
          const p = localStorage.getItem('pending_payment');
          if (p) pending = JSON.parse(p);
        } catch {}

        if (isSuccess) {
          // Build transaction record
          const items = pending?.items || cartItems.map(i => ({ id: i.id, title: i.title, price: i.price }));
          const total = Number(amountParam) || pending?.total || 0;
          const rawTx = localStorage.getItem('transactions');
          const existing: PurchaseRecord[] = rawTx ? JSON.parse(rawTx) : [];
          const record: PurchaseRecord = {
            id: orderId,
            time: new Date().toISOString(),
            items,
            total,
            method: 'vnpay'
          };
          existing.unshift(record);
          try { localStorage.setItem('transactions', JSON.stringify(existing)); } catch {}
          try { localStorage.removeItem('cart'); } catch {}
          try { localStorage.removeItem('pending_payment'); } catch {}
          setIsPaid(true);
        } else {
          // Failed flow: cleanup pending and notify user
          try { localStorage.removeItem('pending_payment'); } catch {}
          if (responseCode) {
            alert('Thanh toán thất bại (VNPay code ' + responseCode + ').');
          } else {
            alert('Thanh toán thất bại.');
          }
          setIsProcessing(false);
        }
      }
    } catch {}
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    if (paymentMethod === 'ewallet') {

      const rawOrder = localStorage.getItem('current_order');
      if (!rawOrder) {
        alert("Không tìm thấy đơn hàng để thanh toán");
        setIsProcessing(false);
        return;
      }
      const order = JSON.parse(rawOrder);

      const pending = {
        orderId: order.orderId,
        items: order.items,
        total: order.amount,
        method: 'vnpay'
      };
//       const pending = {
//         orderId,
//         items: cartItems.map(i => ({ id: i.id, title: i.title, price: i.price })),
//         total: cartTotal,
//         method: 'vnpay'
//       };
      try { localStorage.setItem('pending_payment', JSON.stringify(pending)); } catch {}
//       try {
//         console.debug('[VNPay] Creating payment', { orderId, amount: cartTotal });
//         const resp = await createVnpayPayment({
//           orderId,
//           amount: cartTotal,
//           ipAddress: '127.0.0.1'
//         });
//         console.debug('[VNPay] Redirecting to', resp.paymentUrl);
//         window.location.href = resp.paymentUrl; // redirect to VNPay
//         return; // stop further simulation
//       } catch (err) {
//         console.error('[VNPay] create error', err);
//         setIsProcessing(false);
//         const msg = err instanceof Error ? err.message : 'Không thể tạo giao dịch VNPay';
//         alert(msg);
//         return;
//       }
        const resp = await createVnpayPayment({
          orderId: order.orderId,
          amount: order.amount,
          ipAddress: '127.0.0.1'
        });
        window.location.href = resp.paymentUrl;
    }

    // Non-VNPay methods keep local simulation
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      try {
        const rawTx = localStorage.getItem('transactions');
        const existing: PurchaseRecord[] = rawTx ? JSON.parse(rawTx) : [];
        const record: PurchaseRecord = {
          id: Date.now().toString(),
          time: new Date().toISOString(),
          items: cartItems.map(i => ({ id: i.id, title: i.title, price: i.price })),
          total: cartTotal,
          method: paymentMethod,
        };
        existing.unshift(record);
        localStorage.setItem('transactions', JSON.stringify(existing));
        localStorage.removeItem('cart');
      } catch {}
      setTimeout(() => { onNavigate('transaction-history'); }, 2000);
    }, 2000);
  };

  if (isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-4">
              Cảm ơn bạn đã mua khóa học. Bạn có thể bắt đầu học ngay bây giờ.
            </p>
            <Button onClick={() => onNavigate('my-courses')} className="w-full">
              Đến khóa học của tôi
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="mb-6">Thanh toán</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="ewallet" id="ewallet" />
                    <Label htmlFor="ewallet" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="w-5 h-5" />
                      <span>Ví điện tử (VNPay)</span>
                    </Label>
                  </div>
              
                </RadioGroup>
                {paymentMethod === 'ewallet' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Sau khi nhấn "Thanh toán", bạn sẽ được chuyển đến trang ví điện tử để hoàn tất giao dịch.
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{cartItems.length} khóa học</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giảm giá:</span>
                  <span className="text-green-600">-0đ</span>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Tổng cộng:</span>
                  <span className="text-xl">{formatCurrency(cartTotal)}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Bằng cách hoàn tất giao dịch, bạn đồng ý với Điều khoản dịch vụ và Chính sách hoàn tiền của chúng tôi.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
