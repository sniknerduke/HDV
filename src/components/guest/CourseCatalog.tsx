import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Star, Users, Clock } from 'lucide-react';
import { Course as SvcCourse, fetchCoursesForCatalog, fetchPublicCourses, getCachedCourses } from '../../services/courseService';
import { addToCart, CartItem } from '../../services/cartService';


const fallbackImages = [
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop'
];

const fallbackRatings = [4.9, 4.8, 4.7, 4.95, 4.85, 4.75];

const fallbackInstructors = [
  'Đội ngũ EduPlatform',
  'Chuyên gia EduPlatform',
  'Giảng viên EduPlatform',
  'Mentor EduPlatform'
];

type CatalogCourse = SvcCourse & {
  instructor: string;
  image: string;
  rating: number;
  displayPrice: string;
};

const formatPrice = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return 'Miễn phí';
  }
  return `${value.toLocaleString('vi-VN')} VNĐ`;
};

const decorateCourse = (course: SvcCourse, index: number): CatalogCourse => ({
  ...course,
  instructor: fallbackInstructors[index % fallbackInstructors.length],
  image: fallbackImages[index % fallbackImages.length],
  rating: fallbackRatings[index % fallbackRatings.length],
  displayPrice: formatPrice(course.price),
});

interface CourseCatalogProps {
  onCourseSelect: (course: any) => void;
  userRole?: 'student' | 'teacher' | 'admin' | null;
  onAddToCart?: (course: any) => void;
  onRequestLogin?: () => void;
}

export default function CourseCatalog({ onCourseSelect, userRole = null, onAddToCart, onRequestLogin }: CourseCatalogProps) {
  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('auth_token') ?? undefined;
        const raw = token ? await fetchCoursesForCatalog(token) : await fetchPublicCourses();
        const source = raw.length > 0 ? raw : await fetchPublicCourses();
        setCourses(source.map((course, index) => decorateCourse(course, index)));
        if (source.length === 0) {
          setError('Hiện chưa có khóa học nào.');
        }
      } catch (err) {
        console.error('Không thể tải danh sách khóa học', err);
        setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
        const cached = getCachedCourses();
        if (cached.length > 0) {
          setCourses(cached.map((course, index) => decorateCourse(course, index)));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    courses.forEach(course => {
      if (course.category) {
        unique.add(course.category);
      }
    });
    return Array.from(unique);
  }, [courses]);

  const levels = useMemo(() => {
    const unique = new Set<string>();
    courses.forEach(course => {
      if (course.level) {
        unique.add(course.level);
      }
    });
    return Array.from(unique);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return courses.filter(course => {
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        (course.code ? course.code.toLowerCase().includes(query) : false);
      const matchesCategory = category === 'all' || course.category === category;
      const matchesLevel = level === 'all' || course.level === level;
      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [courses, searchTerm, category, level]);

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="mb-6">Danh mục khóa học</h1>

      {error ? (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded border border-red-100">
          {error}
        </div>
      ) : null}
      
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            type="text"
            placeholder="Tìm kiếm khóa học..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn cấp độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả cấp độ</SelectItem>
                {levels.map(lv => (
                  <SelectItem key={lv} value={lv}>{lv}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">{loading ? 'Đang tải khóa học...' : `Tìm thấy ${filteredCourses.length} khóa học`}</p>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <Card className="p-6 flex items-center justify-center text-gray-500 col-span-full">
            Đang tải danh sách khóa học...
          </Card>
        ) : (
          filteredCourses.map(course => (
          <Card 
            key={course.id} 
            className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onCourseSelect(course)}
          >
            <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
            <CardContent className="p-4">
              <div className="flex gap-2 mb-2">
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{course.category}</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">{course.level}</span>
              </div>
              <h3 className="mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description || 'Khóa học đang cập nhật mô tả.'}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{course.rating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({course.students} học viên)</span>
                </div>
                <span className="font-semibold">{course.displayPrice}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.students} học viên</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration || 'Đang cập nhật'}</span>
                </div>
              </div>

              {/* Action button */}
              <div className="mt-4">
                {userRole === 'student' ? (
                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) addToCart(course.id); else toast.success('Đã thêm vào giỏ hàng');
                    }}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                ) : userRole === 'teacher' ? (
                  <Button
                    className="w-full opacity-60 cursor-not-allowed"
                    disabled
                    onClick={(e) => e.stopPropagation()}
                    title="Chỉ học sinh mới có thể thêm vào giỏ hàng"
                  >
                    Thêm vào giỏ hàng
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRequestLogin) onRequestLogin(); else toast.message('Vui lòng đăng nhập để mua');
                    }}
                  >
                    Đăng nhập để mua
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
        )}
      </div>
    </div>
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white text-lg font-semibold mb-3">EduPlatform</h3>
          <p className="text-sm text-gray-400">Nền tảng học tập trực tuyến giúp bạn phát triển kỹ năng và sự nghiệp.</p>
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
    </>
  );
}
