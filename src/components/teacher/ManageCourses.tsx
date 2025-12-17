import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, BookOpen, Clock, DollarSign, Eye, Save, X, PlusCircle, Users, Youtube, Search } from 'lucide-react';
import { getCourses, createCourse, deleteCourseRemote, updateCourseRemote, Course as SvcCourse, persistCoursesSnapshot, importPlaylistsRemote } from '../../services/courseService';
import { toast } from 'sonner';
import YouTubeImportDialog from '../ui/YouTubeImportDialog';

type Course = SvcCourse;

export default function ManageCourses({ onOpenCourse }: { onOpenCourse?: (course: Course) => void }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isYouTubeImportOpen, setIsYouTubeImportOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const refreshCourses = async () => {
    if (!authToken) return;
    try {
      const data = await getCourses(authToken);
      setCourses(data);
    } catch (error) {
      console.error('Failed to refresh courses:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoadError('Bạn cần đăng nhập để quản lý khóa học.');
      setLoading(false);
      toast.error('Bạn cần đăng nhập để quản lý khóa học.');
      return;
    }
    setAuthToken(token);
    (async () => {
      try {
        const data = await getCourses(token);
        setCourses(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể tải danh sách khóa học';
        setLoadError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    category: 'Programming',
    level: 'Beginner',
    price: '',
    duration: '',
  });
  const [playlistInput, setPlaylistInput] = useState('');

  // Inline lesson editor removed in favor of dedicated page

  const handleCreateCourse = () => {
    setEditingCourse(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      category: 'Programming',
      level: 'Beginner',
      price: '',
      duration: '',
    });
    setPlaylistInput('');
    setIsDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      code: course.code ?? '',
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      price: course.price.toString(),
      duration: (course.duration.match(/\d+/)?.[0] ?? '').toString(),
    });
    setPlaylistInput('');
    setIsDialogOpen(true);
  };

  const handleImportPlaylists = async () => {
    const ids = playlistInput
      .split(/\r?\n|,/)
      .map(id => id.trim())
      .filter(Boolean);

    if (!ids.length) {
      toast.error('Nhập ít nhất 1 playlist ID (mỗi dòng hoặc cách nhau bởi dấu phẩy).');
      return;
    }

    if (!editingCourse) {
      toast.error('Chỉ import được khi đang chỉnh sửa khóa học đã tồn tại.');
      return;
    }
    if (!authToken) {
      toast.error('Thiếu token xác thực. Vui lòng đăng nhập lại.');
      return;
    }

    setIsImporting(true);
    try {
      const result = await importPlaylistsRemote(editingCourse.id, ids, authToken);
      toast.success(`Đã import ${result.imported} bài học từ playlist`);
      setPlaylistInput('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể import playlist';
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!formData.code.trim()) {
      toast.error('Vui lòng nhập mã khóa học');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên khóa học');
      return;
    }
    const priceValue = Number(formData.price);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast.error('Giá khóa học phải lớn hơn 0');
      return;
    }
    const durationValue = Number(formData.duration);
    if (!Number.isFinite(durationValue) || durationValue <= 0) {
      toast.error('Thời lượng khóa học phải lớn hơn 0');
      return;
    }

    if (!authToken) {
      toast.error('Thiếu token xác thực. Vui lòng đăng nhập lại.');
      return;
    }

    setIsSaving(true);
    if (editingCourse) {
      try {
        const updated = await updateCourseRemote(
          editingCourse.id,
          {
            code: formData.code.trim(),
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: Math.round(priceValue),
            duration: Math.round(durationValue),
          },
          authToken,
          {
            category: formData.category,
            level: formData.level,
            students: editingCourse.students,
            duration: `${Math.round(durationValue)} giờ`,
          }
        );
        setCourses(prev => {
          const next = prev.map((c): Course => (
            c.id === updated.id
              ? { ...updated, sections: updated.sections ?? c.sections }
              : c
          ));
          persistCoursesSnapshot(next);
          return next;
        });
        setEditingCourse(null);
        toast.success('Cập nhật khóa học thành công!');
        setIsDialogOpen(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Không thể cập nhật khóa học';
        toast.error(message);
      } finally {
        setIsSaving(false);
      }
      return;
    }
    try {
      const created = await createCourse(
        {
          code: formData.code.trim(),
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: Math.round(priceValue),
          duration: Math.round(durationValue),
          category: formData.category,
          level: formData.level,
        },
        authToken
      );
      setCourses(prev => {
        const next = [...prev, created];
        persistCoursesSnapshot(next);
        return next;
      });
      toast.success('Tạo khóa học thành công!');
      setIsDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể tạo khóa học';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!authToken) {
      toast.error('Thiếu token xác thực. Vui lòng đăng nhập lại.');
      return;
    }
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteCourseRemote(id, authToken);
      const next = courses.filter(c => c.id !== id);
      setCourses(next);
      persistCoursesSnapshot(next);
      toast.success('Xóa khóa học thành công!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể xóa khóa học';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublishCourse = (id: number) => {
    const updated: Course[] = courses.map((c): Course => (
      c.id === id
        ? { ...c, status: (c.status === 'published' ? 'draft' : 'published') as 'published' | 'draft' }
        : c
    ));
    setCourses(updated);
    persistCoursesSnapshot(updated);
    toast.success('Cập nhật trạng thái khóa học thành công!');
  };

  // Lesson CRUD moved to TeacherCourseContentManager

  if (loading) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-10 text-center text-gray-600">Đang tải danh sách khóa học...</CardContent>
        </Card>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-10 text-center text-red-600">{loadError}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="mb-2">Quản lý khóa học</h1>
          <p className="text-gray-600">Tạo và quản lý các khóa học của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsYouTubeImportOpen(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Youtube className="w-4 h-4 mr-2" />
            Import từ YouTube
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateCourse}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo khóa học mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCourse ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}</DialogTitle>
                <DialogDescription>
                  Điền thông tin chi tiết về khóa học của bạn
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                  <div>
                    <Label>Mã khóa học</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ví dụ: REACT-2024"
                    disabled={isSaving}
                  />
                </div>
              <div>
                <Label>Tên khóa học</Label>
                <Input
                  value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ví dụ: React từ cơ bản đến nâng cao"
                    disabled={isSaving}
                />
              </div>
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Mô tả chi tiết về khóa học..."
                    disabled={isSaving}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Danh mục</Label>
                  <Select value={formData.category} onValueChange={(value: string) => setFormData({...formData, category: value})} disabled={isSaving}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Programming">Lập trình</SelectItem>
                      <SelectItem value="Design">Thiết kế</SelectItem>
                      <SelectItem value="Business">Kinh doanh</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cấp độ</Label>
                  <Select value={formData.level} onValueChange={(value: string) => setFormData({...formData, level: value})} disabled={isSaving}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Cơ bản</SelectItem>
                      <SelectItem value="Intermediate">Trung cấp</SelectItem>
                      <SelectItem value="Advanced">Nâng cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Giá (VNĐ)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value })}
                    placeholder="1500000"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <Label>Thời lượng</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="40"
                    type="number"
                    min={1}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Import từ playlist YouTube</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleImportPlaylists}
                    disabled={isSaving || isImporting || !editingCourse}
                  >
                    {isImporting ? 'Đang import...' : 'Import from playlist'}
                  </Button>
                </div>
                <Textarea
                  rows={3}
                  placeholder="Nhập nhiều playlist ID, mỗi dòng hoặc cách nhau bởi dấu phẩy"
                  value={playlistInput}
                  onChange={(e) => setPlaylistInput(e.target.value)}
                  disabled={isSaving}
                />
                <p className="text-xs text-gray-500">
                  Dán playlist ID (mỗi dòng hoặc cách nhau bởi dấu phẩy). Cần lưu khóa học trước khi import.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Hủy
              </Button>
              <Button onClick={handleSaveCourse} disabled={isSaving}>
                {isSaving ? 'Đang lưu...' : editingCourse ? 'Cập nhật' : 'Tạo khóa học'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng khóa học</p>
                <p className="text-2xl font-semibold">{courses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Đã xuất bản</p>
                <p className="text-2xl font-semibold">{courses.filter(c => c.status === 'published').length}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng học sinh</p>
                <p className="text-2xl font-semibold">{courses.reduce((acc, c) => acc + c.students, 0)}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Doanh thu ước tính</p>
                <p className="text-2xl font-semibold">
                  {(courses.reduce((acc, c) => acc + (c.price * c.students), 0) / 1000000).toFixed(1)}M
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Tìm kiếm khóa học theo tên hoặc mã..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Course List */}
      <div className="grid grid-cols-1 gap-6">
        {courses
          .filter(course => {
            const query = search.trim().toLowerCase();
            if (!query) return true;
            return course.title.toLowerCase().includes(query) || (course.code?.toLowerCase().includes(query) ?? false);
          })
          .map((course) => (
          <Card key={course.id} className="cursor-pointer" onClick={() => onOpenCourse ? onOpenCourse(course) : undefined}>
            <CardContent className="p-6" onClick={(e) => { e.stopPropagation(); /* allow buttons inside to handle own click */ }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold" onClick={() => onOpenCourse ? onOpenCourse(course) : undefined}>{course.title}</h3>
                        <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                          {course.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                        </Badge>
                        {course.code ? (
                          <Badge variant="outline">{course.code}</Badge>
                        ) : null}
                      </div>
                      <p className="text-gray-600 mb-3">{course.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.students} học sinh
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration ? course.duration : 'Chưa đặt' }
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {course.price.toLocaleString('vi-VN')} VNĐ
                        </div>
                        <Badge variant="outline">{course.level}</Badge>
                        <Badge variant="outline">{course.category}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); onOpenCourse ? onOpenCourse(course) : undefined; }}
                  >
                    <PlusCircle className="w-4 h-4 mr-1" /> Bài học
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublishCourse(course.id)}
                  >
                    {course.status === 'published' ? 'Ẩn' : 'Xuất bản'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCourse(course)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCourse(course.id)}
                    disabled={deletingId === course.id || isSaving}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    {deletingId === course.id ? <span className="ml-1 text-xs">Đang xóa...</span> : null}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.filter(course => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return course.title.toLowerCase().includes(query) || (course.code?.toLowerCase().includes(query) ?? false);
      }).length === 0 && courses.length > 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy khóa học</h3>
            <p className="text-gray-600">Thử tìm kiếm với từ khóa khác</p>
          </CardContent>
        </Card>
      )}

      {courses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có khóa học nào</h3>
            <p className="text-gray-600 mb-4">Tạo khóa học đầu tiên của bạn để bắt đầu giảng dạy</p>
            <Button onClick={handleCreateCourse}>
              <Plus className="w-4 h-4 mr-2" />
              Tạo khóa học mới
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Inline lesson panel removed; use dedicated Course Content Manager page */}

      {/* YouTube Import Dialog */}
      {authToken && (
        <YouTubeImportDialog
          open={isYouTubeImportOpen}
          onOpenChange={setIsYouTubeImportOpen}
          onImportComplete={refreshCourses}
          authToken={authToken}
        />
      )}
    </div>
  );
}

// Helper functions
// (Không còn sub-component học viên hay bài tập; chỉ quản lý bài học.)

