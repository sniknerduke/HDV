import { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { PlayCircle, Star, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { getMyCourses, UserCourseDto } from '../../services/userCourseService';
import { fetchCourseStructure, SectionDto } from '../../services/lessonService';

const COURSE_API_BASE = import.meta.env.VITE_COURSE_SERVICE_URL ?? 'http://localhost:9090';

interface CourseDetails {
  id: number;
  code: string;
  title: string;
  description?: string;
  price?: number;
  createdBy?: string;
}

interface EnrolledCourseDisplay {
  id: number;
  courseId: number;
  title: string;
  instructor: string;
  progress: number;
  image: string;
  description?: string;
  sections?: SectionDto[];
}

interface MyCoursesProps {
  onCourseSelect: (course: any) => void;
}

export default function MyCourses({ onCourseSelect }: MyCoursesProps) {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForCourse, setOpenForCourse] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [criteria, setCriteria] = useState<{content: boolean; instructor: boolean; materials: boolean; experience: boolean}>({ content: false, instructor: false, materials: false, experience: false });

  const currentStudentId = (() => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.id || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  })();

  // Fetch enrolled courses on mount
  useEffect(() => {
    const loadEnrolledCourses = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          toast.error('Vui lòng đăng nhập');
          setLoading(false);
          return;
        }

        const userCourses: UserCourseDto[] = await getMyCourses();
        
        if (userCourses.length === 0) {
          setEnrolledCourses([]);
          setLoading(false);
          return;
        }

        const courseIds = userCourses.map(uc => uc.courseId);
        const authToken = localStorage.getItem('auth_token');
        const coursesResponse = await fetch(`${COURSE_API_BASE}/api/courses/by-ids?ids=${courseIds.join(',')}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!coursesResponse.ok) {
          throw new Error('Failed to fetch course details');
        }

        const courseDetails: CourseDetails[] = await coursesResponse.json();

        const displayCourses: EnrolledCourseDisplay[] = courseDetails.map(course => ({
          id: course.id,
          courseId: course.id,
          title: course.title,
          instructor: course.createdBy || 'Giảng viên',
          progress: 0,
          image: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop`,
          description: course.description,
        }));

        setEnrolledCourses(displayCourses);
      } catch (error) {
        console.error('Error loading enrolled courses:', error);
        toast.error('Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };

    loadEnrolledCourses();
  }, []);

  // Handle course selection - fetch sections/lessons
  const handleCourseSelect = async (course: EnrolledCourseDisplay) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Vui lòng đăng nhập');
        return;
      }

      const sections = await fetchCourseStructure(course.courseId, token);
      
      const allLessons = sections.flatMap((section) => 
        section.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          duration: '',
          locked: false,
          completed: false,
          hasLive: false,
          videoUrl: lesson.videoUrl,
          sectionId: section.id,
          sectionTitle: section.title,
          type: lesson.type,
        }))
      );

      const firstLesson = allLessons.length > 0 ? allLessons[0] : null;

      onCourseSelect({
        ...course,
        sections: sections,
        lessons: allLessons,
        currentLessonId: firstLesson?.id ?? null,
      });
    } catch (error) {
      console.error('Error fetching course structure:', error);
      toast.error('Không thể tải nội dung khóa học');
    }
  };

  type StoredReview = {
    reviewId: number;
    studentId: number;
    courseId: number;
    score: number; // 1-5
    comment?: string;
    criteria: Array<'content' | 'instructor' | 'materials' | 'experience'>;
    date: string; // ISO date
  }

  const storageKey = 'edu_reviews_v1';
  const loadReviews = (): Record<string, StoredReview> => {
    try {
      const val = localStorage.getItem(storageKey);
      return val ? JSON.parse(val) : {};
    } catch {
      return {};
    }
  };

  const saveReviews = (data: Record<string, StoredReview>) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const getKey = (courseId: number) => `${currentStudentId}-${courseId}`;

  const getReviewFor = (courseId: number): StoredReview | undefined => {
    const all = loadReviews();
    return all[getKey(courseId)];
  };

  const openReview = (courseId: number) => {
    setOpenForCourse(courseId);
    const existing = getReviewFor(courseId);
    if (existing) {
      setRating(existing.score);
      setComment(existing.comment || '');
      setCriteria({
        content: existing.criteria.includes('content'),
        instructor: existing.criteria.includes('instructor'),
        materials: existing.criteria.includes('materials'),
        experience: existing.criteria.includes('experience'),
      });
    } else {
      setRating(0);
      setComment('');
      setCriteria({ content: false, instructor: false, materials: false, experience: false });
    }
  };

  const submitReview = () => {
    if (!openForCourse) return;
    if (rating < 1 || rating > 5) {
      toast.error('Vui lòng chọn điểm số 1–5 sao');
      return;
    }
    const all = loadReviews();
    const key = getKey(openForCourse);
    const now = new Date().toISOString();
    const selectedCriteria: Array<'content' | 'instructor' | 'materials' | 'experience'> = [];
    if (criteria.content) selectedCriteria.push('content');
    if (criteria.instructor) selectedCriteria.push('instructor');
    if (criteria.materials) selectedCriteria.push('materials');
    if (criteria.experience) selectedCriteria.push('experience');

    const existing = all[key];
    const review: StoredReview = {
      reviewId: existing?.reviewId ?? Math.floor(Math.random() * 1_000_000),
      studentId: currentStudentId,
      courseId: openForCourse,
      score: rating,
      comment: comment?.trim() || undefined,
      criteria: selectedCriteria,
      date: now,
    };
    all[key] = review;
    saveReviews(all);
    toast.success(existing ? 'Cập nhật đánh giá thành công' : 'Đánh giá thành công');
    setOpenForCourse(null);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Đang tải khóa học...</span>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-6">Khóa học của tôi</h1>
      {enrolledCourses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Bạn chưa đăng ký khóa học nào.</p>
          <Button onClick={() => window.location.href = '/courses'}>
            Khám phá khóa học
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map(course => (
            <Card key={course.id} className="overflow-hidden">
              <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <h3 className="mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{course.instructor}</p>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleCourseSelect(course)}
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Tiếp tục học
                  </Button>
                <Dialog open={openForCourse === course.id} onOpenChange={(open) => !open ? setOpenForCourse(null) : openReview(course.id)}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Đánh giá</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Đánh giá khóa học</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-600">Điểm số</Label>
                        <div className="flex items-center gap-1 mt-1">
                          {[1,2,3,4,5].map((i) => (
                            <button
                              key={i}
                              type="button"
                              onMouseEnter={() => setHoverRating(i)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setRating(i)}
                            >
                              <Star className={(hoverRating || rating) >= i ? 'w-6 h-6 fill-yellow-400 text-yellow-400' : 'w-6 h-6 text-gray-300'} />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">{rating > 0 ? `${rating}/5` : ''}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Tiêu chí</Label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <label className="flex items-center gap-2 text-sm"><Checkbox checked={criteria.content} onCheckedChange={(v) => setCriteria(s => ({...s, content: Boolean(v)}))} /> Nội dung</label>
                          <label className="flex items-center gap-2 text-sm"><Checkbox checked={criteria.instructor} onCheckedChange={(v) => setCriteria(s => ({...s, instructor: Boolean(v)}))} /> Giảng viên</label>
                          <label className="flex items-center gap-2 text-sm"><Checkbox checked={criteria.materials} onCheckedChange={(v) => setCriteria(s => ({...s, materials: Boolean(v)}))} /> Tài liệu</label>
                          <label className="flex items-center gap-2 text-sm"><Checkbox checked={criteria.experience} onCheckedChange={(v) => setCriteria(s => ({...s, experience: Boolean(v)}))} /> Trải nghiệm</label>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Nhận xét (tùy chọn)</Label>
                        <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Chia sẻ cảm nhận của bạn..." rows={4} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={submitReview}>Gửi đánh giá</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              {getReviewFor(course.id) && (
                <div className="mt-3 flex items-center gap-1 text-sm text-gray-600">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>Đánh giá của bạn: {getReviewFor(course.id)?.score}/5</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
