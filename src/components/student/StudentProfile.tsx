import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { getUserProfile } from '../../services/authService';

interface ClientUser {
  id: number;
  email: string;
  username: string;
  role?: string;
}

const emptyProfile = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  bio: '',
  avatar: '',
};

export default function StudentProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({ ...emptyProfile });
  const [loading, setLoading] = useState(true);

  const storedUser = useMemo(() => {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ClientUser;
    } catch (error) {
      console.warn('Không thể parse auth_user', error);
      return null;
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!storedUser) {
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }
      try {
        const data = await getUserProfile(storedUser.id, token);
        setProfileData({
          fullName: data.username ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          dateOfBirth: data.dateOfBirth ?? '',
          bio: data.bio ?? '',
          avatar: '',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải thông tin người dùng';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [storedUser]);

  const enrolledCourses = [
    { id: 1, name: 'React từ cơ bản đến nâng cao', progress: 75, grade: 8.5 },
    { id: 2, name: 'TypeScript cho người mới', progress: 60, grade: 9.0 },
    { id: 3, name: 'UI/UX Design cơ bản', progress: 40, grade: 7.8 },
  ];

  const achievements = [
    { id: 1, name: 'Hoàn thành khóa học đầu tiên', icon: '🎯', date: '2024-01-15' },
    { id: 2, name: 'Học viên xuất sắc', icon: '⭐', date: '2024-02-20' },
    { id: 3, name: '10 bài tập hoàn thành', icon: '📝', date: '2024-03-10' },
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Cập nhật hồ sơ thành công!');
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <p className="text-center text-gray-600">Đang tải thông tin hồ sơ...</p>
      </div>
    );
  }

  if (!storedUser) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-4">
        <h1>Hồ sơ cá nhân</h1>
        <p className="text-gray-600">Bạn cần đăng nhập để xem thông tin hồ sơ.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1>Hồ sơ cá nhân</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Hủy
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-32 h-32 mb-4">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="text-3xl">{profileData.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
                {isEditing ? (
                  <Button variant="outline" size="sm" className="mb-4">
                    Đổi ảnh đại diện
                  </Button>
                ) : null}
                <h2 className="mb-2">{profileData.fullName}</h2>
                <Badge className="mb-4">Học sinh</Badge>
                <p className="text-gray-600 text-sm">{profileData.bio}</p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profileData.address}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{new Date(profileData.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thống kê học tập</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Khóa học đã đăng ký</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Khóa học hoàn thành</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Điểm trung bình</span>
                <span className="font-semibold">8.5/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Giờ học</span>
                <span className="font-semibold">240h</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="info">
            <TabsList className="mb-6">
              <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="courses">Khóa học</TabsTrigger>
              <TabsTrigger value="achievements">Thành tích</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin chi tiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Họ và tên</Label>
                      <Input 
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input 
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Số điện thoại</Label>
                      <Input 
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label>Ngày sinh</Label>
                      <Input 
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Địa chỉ</Label>
                      <Input 
                        value={profileData.address}
                        onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Giới thiệu bản thân</Label>
                      <Textarea 
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>Khóa học đang theo học</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {enrolledCourses.map((course) => (
                      <div key={course.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{course.name}</h3>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-sm text-gray-600">Điểm: {course.grade}/10</span>
                                <Badge variant="outline">{course.progress}% hoàn thành</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card>
                <CardHeader>
                  <CardTitle>Thành tích & Chứng chỉ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <div key={achievement.id} className="border rounded-lg p-4 flex items-center gap-4">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div>
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-gray-600">{new Date(achievement.date).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
