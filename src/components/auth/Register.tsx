import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Check, X } from 'lucide-react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { toast } from 'sonner';
import { registerUser } from '../../services/authService';

interface RegisterProps {
  onNavigate: (page: string) => void;
  onRegisterSuccess: (email: string) => void;
}

// Password strength calculation
const calculatePasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength += 25;
  if (password.length >= 12) strength += 15;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
  if (/\d/.test(password)) strength += 20;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
  return Math.min(strength, 100);
};

const getStrengthColor = (strength: number) => {
  if (strength < 40) return 'bg-red-500';
  if (strength < 70) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getStrengthText = (strength: number) => {
  if (strength < 40) return 'Yếu';
  if (strength < 70) return 'Trung bình';
  return 'Mạnh';
};

export default function Register({ onNavigate, onRegisterSuccess }: RegisterProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);

  const passwordStrength = calculatePasswordStrength(formData.password);

  const passwordRequirements = [
    { label: 'Ít nhất 8 ký tự', met: formData.password.length >= 8 },
    { label: 'Chứa chữ hoa và chữ thường', met: /[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password) },
    { label: 'Chứa số', met: /\d/.test(formData.password) },
    { label: 'Chứa ký tự đặc biệt', met: /[^a-zA-Z0-9]/.test(formData.password) },
  ];

  const mapRole = (role: string) => {
    if (role === 'teacher') return 'STAFF';
    return 'USER';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setLoading(true);
    try {
      await registerUser({
        username: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: mapRole(formData.role),
      });
      sessionStorage.setItem('pending_email', formData.email.trim());
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.');
      onRegisterSuccess(formData.email.trim());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đăng ký';
      if (message.includes('409')) {
        toast.error('Email đã tồn tại');
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    alert(`Chức năng đăng ký/đăng nhập với ${provider} chưa được cài đặt.`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đăng ký tài khoản</CardTitle>
          <CardDescription>Tạo tài khoản mới để bắt đầu học tập</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Họ và tên</Label>
              <Input 
                type="text"
                placeholder="Nguyễn Văn A"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Mật khẩu</Label>
              <Input 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    <span className={`text-xs ${passwordStrength < 40 ? 'text-red-500' : passwordStrength < 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {getStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <li key={index} className={`flex items-center gap-1 text-xs ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
                        {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {req.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div>
              <Label>Xác nhận mật khẩu</Label>
              <Input 
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>
            <div>
              <Label>Vai trò</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={(value: string) => setFormData({...formData, role: value})}
                className="flex items-center space-x-2"
              >
                <RadioGroupItem value="student" className="w-4 h-4" />
                <Label className="text-sm">Học sinh</Label>
                <RadioGroupItem value="teacher" className="w-4 h-4" />
                <Label className="text-sm">Giáo viên</Label>
              </RadioGroup>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>
          </form>
          
          <div className="relative my-4 py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground py-2">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('google')}>
              <FaGoogle className="mr-2 h-4 w-4" />
              Đăng ký với Google
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleSocialLogin('facebook')}>
              <FaFacebook className="mr-2 h-4 w-4" />
              Đăng ký với Facebook
            </Button>
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">Đã có tài khoản? </span>
            <button 
              onClick={() => onNavigate('login')}
              className="text-blue-600 hover:underline text-sm"
            >
              Đăng nhập
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}