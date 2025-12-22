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
import { User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Edit, Save, X, Star, Users, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getUserProfile, updateUserProfile } from '../../services/authService';

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
  specialization: '',
  education: '',
  experience: '',
  avatar: '',
};

export default function TeacherProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({ ...emptyProfile });
  const [originalData, setOriginalData] = useState({ ...emptyProfile });
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
        const data = await getUserProfile(token);
        const profileInfo = {
          fullName: data.username ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          dateOfBirth: data.dateOfBirth ?? '',
          bio: data.bio ?? '',
          specialization: data.specialization ?? '',
          education: data.education ?? '',
          experience: data.experience ?? '',
          avatar: data.avatar ?? '',
        };
        setProfileData(profileInfo);
        setOriginalData(profileInfo);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải thông tin người dùng';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [storedUser]);

  const teachingCourses = [
    { id: 1, name: 'React từ cơ bản đến nâng cao', students: 245, rating: 4.8 },
    { id: 2, name: 'TypeScript cho người mới', students: 180, rating: 4.9 },
    { id: 3, name: 'Node.js Backend Development', students: 156, rating: 4.7 },
  ];

  const reviews = [
    { id: 1, student: 'Phạm Văn C', rating: 5, comment: 'Giáo viên dạy rất dễ hiểu và nhiệt tình!', date: '2024-03-15' },
    { id: 2, student: 'Lê Thị D', rating: 5, comment: 'Khóa học tuyệt vời, học được nhiều kiến thức thực tế.', date: '2024-03-10' },
    { id: 3, student: 'Trần Văn E', rating: 4, comment: 'Nội dung chi tiết, cần thêm nhiều bài tập hơn.', date: '2024-03-05' },
  ];

  const certificates = [
    { id: 1, name: 'AWS Certified Solutions Architect', issuer: 'Amazon', year: '2023' },
    { id: 2, name: 'Google Cloud Professional', issuer: 'Google', year: '2022' },
    { id: 3, name: 'Microsoft Certified Developer', issuer: 'Microsoft', year: '2021' },
  ];

  const handleSave = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedData = await updateUserProfile(token, {
        username: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        dateOfBirth: profileData.dateOfBirth,
        bio: profileData.bio,
        specialization: profileData.specialization,
        education: profileData.education,
        experience: profileData.experience,
        avatar: profileData.avatar,
      });
      
      const newProfileData = {
        fullName: updatedData.username ?? '',
        email: updatedData.email ?? '',
        phone: updatedData.phone ?? '',
        address: updatedData.address ?? '',
        dateOfBirth: updatedData.dateOfBirth ?? '',
        bio: updatedData.bio ?? '',
        specialization: updatedData.specialization ?? '',
        education: updatedData.education ?? '',
        experience: updatedData.experience ?? '',
        avatar: updatedData.avatar ?? '',
      };
      setProfileData(newProfileData);
      setOriginalData(newProfileData);
      setIsEditing(false);
      toast.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData({ ...originalData });
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
        <h1>Hồ sơ giảng viên</h1>
        <p className="text-gray-600">Bạn cần đăng nhập để xem thông tin hồ sơ.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1>Hồ sơ giảng viên</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
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
                  <AvatarFallback className="text-3xl">{profileData.fullName.charAt(0) || 'T'}</AvatarFallback>
                </Avatar>
                {isEditing ? (
                  <Button variant="outline" size="sm" className="mb-4">
                    Đổi ảnh đại diện
                  </Button>
                ) : null}
                <h2 className="mb-2">{profileData.fullName || 'Giảng viên'}</h2>
                <Badge className="mb-2">Giảng viên</Badge>
                <Badge variant="outline" className="mb-4">{profileData.specialization || 'Chưa cập nhật'}</Badge>
                <p className="text-gray-600 text-sm">{profileData.bio || 'Chưa có mô tả'}</p>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profileData.email || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profileData.phone || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profileData.address || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{profileData.experience ? `${profileData.experience} kinh nghiệm` : 'Chưa cập nhật'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thống kê giảng dạy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng khóa học</span>
                <span className="font-semibold">15</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng học sinh</span>
                <span className="font-semibold">1,250+</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Đánh giá trung bình</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">4.8/5</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Giờ giảng dạy</span>
                <span className="font-semibold">800h+</span>
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
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
              <TabsTrigger value="certificates">Chứng chỉ</TabsTrigger>
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
                      <Label>Chuyên môn</Label>
                      <Input 
                        value={profileData.specialization}
                        onChange={(e) => setProfileData({...profileData, specialization: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Học vấn</Label>
                      <Input 
                        value={profileData.education}
                        onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Kinh nghiệm</Label>
                      <Input 
                        value={profileData.experience}
                        onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
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
                  <CardTitle>Khóa học đang giảng dạy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teachingCourses.map((course) => (
                      <div key={course.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{course.name}</h3>
                              <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Users className="w-4 h-4" />
                                  {course.students} học sinh
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  {course.rating}/5
                                </div>
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Đánh giá từ học sinh</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{review.student}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="certificates">
              <Card>
                <CardHeader>
                  <CardTitle>Chứng chỉ & Bằng cấp</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {certificates.map((cert) => (
                      <div key={cert.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Award className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{cert.name}</h4>
                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                            <p className="text-sm text-gray-500 mt-1">{cert.year}</p>
                          </div>
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
