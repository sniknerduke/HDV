import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { verifyOtp } from '../../services/authService';

interface VerifyAccountProps {
  onNavigate: (page: string) => void;
}

export default function VerifyAccount({ onNavigate }: VerifyAccountProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pending = sessionStorage.getItem('pending_email');
    if (pending) {
      setEmail(pending);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !code.trim()) {
      toast.error('Vui lòng nhập đầy đủ email và mã xác thực');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email.trim(), code.trim());
      toast.success('Xác thực thành công! Vui lòng đăng nhập.');
      sessionStorage.removeItem('pending_email');
      onNavigate('login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xác thực';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Xác thực tài khoản</CardTitle>
          <CardDescription>Nhập email và mã xác thực đã được gửi tới hộp thư.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <Label>Mã xác thực</Label>
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Nhập mã OTP"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang kiểm tra...' : 'Xác thực tài khoản'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button onClick={() => onNavigate('register')} className="text-blue-600 hover:underline">
              Đăng ký mới
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
