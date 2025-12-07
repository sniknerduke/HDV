import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Search, Star, Users, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchCoursesForCatalog, fetchPublicCourses, Course } from '../../services/courseService';

const fallbackImages = [
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop'
];

const fallbackInstructors = [
  'Đội ngũ EduPlatform',
  'Chuyên gia EduPlatform',
  'Giảng viên EduPlatform'
];

const formatPrice = (value: number | string): string => {
  if (typeof value === 'string') return value;
  if (!Number.isFinite(value) || value <= 0) return 'Miễn phí';
  return `${value.toLocaleString('vi-VN')}đ`;
};

interface GuestHomeProps {
  onNavigate: (page: string) => void;
  onCourseSelect: (course: any) => void;
}

export default function GuestHome({ onNavigate, onCourseSelect }: GuestHomeProps) {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data: Course[] = await fetchCoursesForCatalog(undefined).catch(() => fetchPublicCourses());
        const decorated = data.map((c, idx) => ({
          ...c,
          instructor: fallbackInstructors[idx % fallbackInstructors.length],
          price: formatPrice(c.price),
          rating: 4.7 + (idx % 3) * 0.05,
          students: c.students ?? 0,
          image: fallbackImages[idx % fallbackImages.length],
        }));
        setCourses(decorated);
      } catch (err) {
        console.warn('Không tải được khóa học public, dùng danh sách tĩnh', err);
        setCourses([]);
      }
    })();
  }, []);
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center text-center">
          <h1 className="mb-4 text-4xl font-bold">Học tập không giới hạn</h1>
          <p className="text-xl mb-8 opacity-90 max-w-3xl">
            Khám phá hàng nghìn khóa học chất lượng cao từ các giảng viên hàng đầu
          </p>
          <div className="flex gap-4 max-w-2xl w-full mx-auto flex-col sm:flex-row items-stretch sm:items-center justify-center">
            {/* <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/95 text-gray-900 placeholder:text-gray-500 border border-white/30 focus:border-white focus:ring-2 focus:ring-white/40 outline-none shadow-sm"
              />
            </div> */}
            <Button onClick={() => onNavigate('courses')} size="lg" className="w-full sm:w-auto sm:mt-0 mt-2">
              Khám phá
            </Button>
          </div>
        </div>
      </div>

      

      {/* Featured Courses */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2>Khóa học nổi bật</h2>
          <Button variant="outline" onClick={() => onNavigate('courses')}>
            Xem tất cả
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(courses.length > 0 ? courses : []).map(course => (
            <Card key={course.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onCourseSelect(course)}>
              <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <h3 className="mb-2">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{course.instructor}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{course.rating?.toFixed ? course.rating.toFixed(1) : course.rating}</span>
                    <span className="text-gray-400 text-sm">({course.students ?? 0})</span>
                  </div>
                  <span className="font-semibold">{course.price}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {courses.length === 0 && (
            <div className="col-span-3 text-center text-gray-500">Chưa có khóa học nào.</div>
          )}
        </div>
      </div>
          {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <div className="text-3xl mb-2">500+</div>
              <div className="text-gray-600">Khóa học</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <div className="text-3xl mb-2">10,000+</div>
              <div className="text-gray-600">Học sinh</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Star className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <div className="text-3xl mb-2">4.8/5</div>
              <div className="text-gray-600">Đánh giá</div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-3">EduPlatform</h3>
            <p className="text-sm text-gray-400">
              Nền tảng học tập trực tuyến giúp bạn phát triển kỹ năng và sự nghiệp.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Về chúng tôi</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-white">Liên hệ</a></li>
              <li><a href="#" className="hover:text-white">Tuyển dụng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-white">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-white">Góp ý</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-3">Pháp lý</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white">Điều khoản dịch vụ</a></li>
              <li><a href="#" className="hover:text-white">Bản quyền</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between text-sm">
            <p>© {new Date().getFullYear()} EduPlatform. Bảo lưu mọi quyền.</p>
            <div className="flex gap-4 mt-2 sm:mt-0">
              <a href="#" className="hover:text-white">Chính sách bảo mật</a>
              <a href="#" className="hover:text-white">Điều khoản</a>
              <a href="#" className="hover:text-white">Liên hệ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
