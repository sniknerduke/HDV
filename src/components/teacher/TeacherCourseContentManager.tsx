import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, ChevronLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import {
  Course,
  Section,
  Lesson,
  ensureSeedData,
} from '../../services/courseService';
import {
  fetchCourseStructure,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  SectionDto,
  LessonDto,
  LessonPayload,
} from '../../services/lessonService';

export default function TeacherCourseContentManager({ course, onNavigate }: { course: Course | null; onNavigate: (p: string) => void }) {
  const [courseId, setCourseId] = useState<number | null>(course?.id ?? null);
  const [data, setData] = useState<Course | null>(course);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const mapLesson = (l: LessonDto): Lesson => ({
    id: l.id,
    title: l.title,
    type: l.type === 'video' || l.type === 'text' || l.type === 'quiz' ? l.type : undefined,
    fileName: l.fileName,
    mimeType: l.mimeType,
    size: l.size,
    videoUrl: l.videoUrl,
  });

  const mapSections = (sections: SectionDto[]): Section[] =>
    sections.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      lessons: (s.lessons ?? []).map(mapLesson),
    }));

  useEffect(() => {
    ensureSeedData();
    const token = localStorage.getItem('auth_token');
    if (token) setAuthToken(token);
    if (course?.id) {
      setCourseId(course.id);
      localStorage.setItem('last_course_id', String(course.id));
    } else {
      const idFromLS = localStorage.getItem('last_course_id');
      if (idFromLS) setCourseId(Number(idFromLS));
    }
  }, [course]);

  useEffect(() => {
    const load = async () => {
      if (courseId == null || !authToken) return;
      try {
        const sectionsDto = await fetchCourseStructure(courseId, authToken);
        setData((prev) => ({
          ...(prev ?? course ?? { id: courseId, title: '', description: '', category: '', level: '', price: 0, duration: '', students: 0, status: 'draft' as const }),
          sections: mapSections(sectionsDto),
        }));
      } catch (err) {
        console.error('Load structure failed', err);
        const message = err instanceof Error ? err.message : 'Không tải được nội dung. Vui lòng thử lại.';
        toast.error(message);
      }
    };
    load();
  }, [courseId, authToken, course]);

  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionDesc, setSectionDesc] = useState('');
  const [sectionError, setSectionError] = useState('');

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [contextSection, setContextSection] = useState<Section | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [lessonError, setLessonError] = useState('');

  const beginAddSection = () => {
    setEditingSection(null);
    setSectionTitle('');
    setSectionDesc('');
    setSectionError('');
    setSectionDialogOpen(true);
  };

  const beginEditSection = (s: Section) => {
    setEditingSection(s);
    setSectionTitle(s.title);
    setSectionDesc(s.description || '');
    setSectionError('');
    setSectionDialogOpen(true);
  };

  const submitSection = async () => {
    if (!authToken) { toast.error('Thiếu token, vui lòng đăng nhập lại.'); return; }
    if (!data || courseId == null) { toast.error('Không xác định được khóa học.'); return; }
    if (!sectionTitle.trim()) { setSectionError('Tiêu đề chương không được để trống.'); return; }
    try {
      if (editingSection) {
        await updateSection(courseId, editingSection.id, { title: sectionTitle.trim(), description: sectionDesc.trim() || undefined }, authToken);
        toast.success('Đã cập nhật chương');
      } else {
        await createSection(courseId, { title: sectionTitle.trim(), description: sectionDesc.trim() || undefined }, authToken);
        toast.success('Đã thêm chương mới');
      }
      setSectionDialogOpen(false);
      setEditingSection(null);
      const sectionsDto = await fetchCourseStructure(courseId, authToken);
      setData((prev) => (prev ? { ...prev, sections: mapSections(sectionsDto) } : prev));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Mất kết nối. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  const confirmDeleteSection = async (s: Section) => {
    if (!authToken) { toast.error('Thiếu token, vui lòng đăng nhập lại.'); return; }
    if (courseId == null) { toast.error('Không xác định được khóa học.'); return; }
    if (!confirm(`Xóa chương “${s.title}”?`)) return;
    await deleteSection(courseId, s.id, authToken);
    const sectionsDto = await fetchCourseStructure(courseId, authToken);
    setData((prev) => (prev ? { ...prev, sections: mapSections(sectionsDto) } : prev));
    toast.success('Đã xóa chương');
  };

  const moveSection = async (index: number, dir: -1 | 1) => {
    if (!authToken) { toast.error('Thiếu token, vui lòng đăng nhập lại.'); return; }
    if (!data || courseId == null || !data.sections) { toast.error('Không xác định được khóa học.'); return; }
    const to = index + dir;
    if (to < 0 || to >= data.sections.length) return;
    await reorderSections(courseId, { fromIndex: index, toIndex: to }, authToken);
    const sectionsDto = await fetchCourseStructure(courseId, authToken);
    setData((prev) => (prev ? { ...prev, sections: mapSections(sectionsDto) } : prev));
  };

  const beginAddLesson = (s: Section) => {
    setContextSection(s);
    setEditingLesson(null);
    setLessonTitle('');
    setLessonFile(null);
    setLessonError('');
    setLessonDialogOpen(true);
  };

  const beginEditLesson = (s: Section, l: Lesson) => {
    setContextSection(s);
    setEditingLesson(l);
    setLessonTitle(l.title);
    setLessonFile(null);
    setLessonError('');
    setLessonDialogOpen(true);
  };

  const submitLesson = async () => {
    if (!authToken) { toast.error('Thiếu token, vui lòng đăng nhập lại.'); return; }
    if (courseId == null || !contextSection) { toast.error('Không xác định được khóa học/chương.'); return; }
    if (!lessonTitle.trim()) { setLessonError('Tiêu đề bài học không được để trống.'); return; }
    try {
      if (editingLesson) {
        const patch: LessonPayload = { title: lessonTitle.trim() };
        if (lessonFile) {
          patch.fileName = lessonFile.name;
          patch.mimeType = lessonFile.type;
          patch.size = lessonFile.size;
          patch.type = 'video';
        }
        await updateLesson(courseId, contextSection.id, editingLesson.id, patch, authToken);
        toast.success('Đã cập nhật bài học');
      } else {
        const payload: LessonPayload = {
          title: lessonTitle.trim(),
          type: lessonFile ? 'video' : undefined,
          fileName: lessonFile?.name,
          mimeType: lessonFile?.type,
          size: lessonFile?.size,
        };
        await createLesson(courseId, contextSection.id, payload, authToken);
        toast.success('Đã thêm bài học');
      }
      setLessonDialogOpen(false);
      setEditingLesson(null);
      setContextSection(null);
      const sectionsDto = await fetchCourseStructure(courseId, authToken);
      setData((prev) => (prev ? { ...prev, sections: mapSections(sectionsDto) } : prev));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Mất kết nối. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  const confirmDeleteLesson = async (s: Section, l: Lesson) => {
    if (!authToken) { toast.error('Thiếu token, vui lòng đăng nhập lại.'); return; }
    if (courseId == null) { toast.error('Không xác định được khóa học.'); return; }
    if (!confirm(`Xóa bài học “${l.title}”?`)) return;
    await deleteLesson(courseId, s.id, l.id, authToken);
    const sectionsDto = await fetchCourseStructure(courseId, authToken);
    setData((prev) => (prev ? { ...prev, sections: mapSections(sectionsDto) } : prev));
    toast.success('Đã xóa bài học');
  };

  // Basic HTML5 drag & drop without extra deps
  const [dragSectionIndex, setDragSectionIndex] = useState<number | null>(null);
  const [dragLessonCtx, setDragLessonCtx] = useState<{ sectionIndex: number; lessonIndex: number } | null>(null);

  const onSectionDragStart = (index: number) => setDragSectionIndex(index);
  const onSectionDrop = async (toIndex: number) => {
    if (!authToken) { toast.error('Thiếu token, vui lòng đăng nhập lại.'); return; }
    if (dragSectionIndex == null || courseId == null) { setDragSectionIndex(null); return; }
    await reorderSections(courseId, { fromIndex: dragSectionIndex, toIndex }, authToken);
    setDragSectionIndex(null);
    const sectionsDto = await fetchCourseStructure(courseId, authToken);
    setData((prev) => (prev ? { ...prev, sections: mapSections(sectionsDto) } : prev));
  };

  const onLessonDragStart = (sectionIndex: number, lessonIndex: number) => setDragLessonCtx({ sectionIndex, lessonIndex });
  const onLessonDrop = async (sectionIndex: number, toIndex: number) => {
    if (!authToken) { toast.error('Thiếu token, vui lòng đăng nhập lại.'); return; }
    if (!dragLessonCtx || courseId == null) return;
    if (dragLessonCtx.sectionIndex !== sectionIndex) { setDragLessonCtx(null); return; }
    const section = data?.sections?.[sectionIndex];
    if (!section) return;
    await reorderLessons(courseId, section.id, { fromIndex: dragLessonCtx.lessonIndex, toIndex }, authToken);
    setDragLessonCtx(null);
    const sectionsDto = await fetchCourseStructure(courseId, authToken);
    setData((prev) => (prev ? { ...prev, sections: mapSections(sectionsDto) } : prev));
  };

  if (!data) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => onNavigate('manage-courses')} className="mb-4 inline-flex items-center gap-2"><ChevronLeft className="w-4 h-4"/> Quay lại</Button>
        <Card>
          <CardContent className="p-8 text-center text-gray-600">Không tìm thấy khóa học. Hãy quay lại danh sách.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => onNavigate('manage-courses')} className="inline-flex items-center gap-2"><ChevronLeft className="w-4 h-4"/> Quay lại</Button>
          <h1 className="text-xl font-semibold">Quản lý nội dung: {data.title}</h1>
          <Badge variant="outline">{data.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}</Badge>
        </div>
        <Button onClick={beginAddSection} className="inline-flex items-center gap-2"><Plus className="w-4 h-4"/> Thêm Chương</Button>
      </div>

      {!data.sections || data.sections.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-gray-600 mb-3">Khóa học của bạn chưa có nội dung.</p>
            <Button onClick={beginAddSection} className="inline-flex items-center gap-2"><Plus className="w-4 h-4"/> Thêm Chương đầu tiên</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.sections.map((s, sIdx) => (
            <Card key={s.id} draggable onDragStart={() => onSectionDragStart(sIdx)} onDragOver={(e) => e.preventDefault()} onDrop={() => onSectionDrop(sIdx)}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle>{s.title}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => moveSection(sIdx, -1)}><ArrowUp className="w-4 h-4"/></Button>
                  <Button variant="outline" size="sm" onClick={() => moveSection(sIdx, 1)}><ArrowDown className="w-4 h-4"/></Button>
                  <Button variant="outline" size="sm" onClick={() => beginEditSection(s)}><Edit className="w-4 h-4"/> Sửa</Button>
                  <Button variant="destructive" size="sm" onClick={() => confirmDeleteSection(s)}><Trash2 className="w-4 h-4"/> Xóa</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {s.lessons.length === 0 ? (
                    <div className="text-sm text-gray-500">Chưa có bài học nào trong chương này.</div>
                  ) : (
                    s.lessons.map((l, lIdx) => (
                      <div key={l.id}
                           className="border rounded px-3 py-2 flex items-center justify-between"
                           draggable
                           onDragStart={() => onLessonDragStart(sIdx, lIdx)}
                           onDragOver={(e) => e.preventDefault()}
                           onDrop={() => onLessonDrop(sIdx, lIdx)}
                      >
                        <div>
                          <div className="font-medium">{l.title}</div>
                          <div className="text-xs text-gray-500">
                            {l.fileName ? `Video: ${l.fileName}` : l.videoUrl ? `Video URL: ${l.videoUrl}` : 'Chưa có video'}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => beginEditLesson(s, l)}><Edit className="w-4 h-4"/> Sửa</Button>
                          <Button variant="destructive" size="sm" onClick={() => confirmDeleteLesson(s, l)}><Trash2 className="w-4 h-4"/> Xóa</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-3">
                  <Button variant="outline" size="sm" onClick={() => beginAddLesson(s)} className="inline-flex items-center gap-2"><Plus className="w-4 h-4"/> Thêm bài học</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Section Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSection ? 'Sửa chương' : 'Thêm chương mới'}</DialogTitle>
            <DialogDescription>Quản lý các chương giúp học viên dễ theo dõi nội dung.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tiêu đề chương</Label>
              <Input value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="Ví dụ: Chương 1: Giới thiệu" />
              {sectionError && <div className="text-xs text-red-600 mt-1">{sectionError}</div>}
            </div>
            <div>
              <Label>Mô tả (tùy chọn)</Label>
              <Textarea value={sectionDesc} onChange={(e) => setSectionDesc(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialogOpen(false)}>Hủy</Button>
            <Button onClick={submitSection}>{editingSection ? 'Cập nhật' : 'Thêm'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Sửa bài học' : 'Thêm bài học mới'}</DialogTitle>
            <DialogDescription>Nhập thông tin bài học. Tiêu đề là bắt buộc.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tiêu đề bài học</Label>
              <Input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Ví dụ: State & Lifecycle" />
              {lessonError && <div className="text-xs text-red-600 mt-1">{lessonError}</div>}
            </div>
            <div>
              <Label>Tải lên video (tùy chọn)</Label>
              <div className="mt-2 border-2 border-dashed rounded-lg p-6 text-center">
                <input id="lesson-video" type="file" accept="video/*" className="hidden" onChange={(e) => setLessonFile(e.target.files?.[0] || null)} />
                <label htmlFor="lesson-video" className="cursor-pointer block">
                  {lessonFile ? (
                    <div>
                      <Upload className="w-10 h-10 mx-auto text-blue-600" />
                      <div className="mt-2 text-sm">{lessonFile.name}</div>
                      <div className="text-xs text-gray-500">{(lessonFile.size/1024/1024).toFixed(2)} MB</div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 mx-auto text-gray-400" />
                      <div className="mt-2 text-sm text-gray-600">Click để chọn tệp video</div>
                      <div className="text-xs text-gray-500">Video sẽ được tải lên khi tích hợp backend</div>
                    </div>
                  )}
                </label>
              </div>
              {editingLesson && (editingLesson.fileName || editingLesson.videoUrl) && !lessonFile && (
                <div className="text-xs text-gray-600 mt-2">Hiện có: {editingLesson.fileName ? editingLesson.fileName : editingLesson.videoUrl}</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>Hủy</Button>
            <Button onClick={submitLesson}>{editingLesson ? 'Cập nhật' : 'Thêm'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
