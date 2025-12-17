import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { PlayCircle, ChevronLeft, ChevronRight, Check, Lock, Video, FileText as FileTextIcon, Link as LinkIcon, MessageSquare, NotebookPen, Tv, ChevronDown, ChevronUp } from 'lucide-react';

interface Resource { type: 'pdf' | 'link' | 'file'; name: string; url: string }
interface Lesson {
  id: number;
  title: string;
  duration?: string;
  locked?: boolean;
  completed?: boolean;
  hasLive?: boolean;
  liveLink?: string;
  resources?: Resource[];
  videoUrl?: string;
  sectionId?: number;
  sectionTitle?: string;
  type?: string;
}

interface Section {
  id: number;
  title: string;
  description?: string;
  lessons: Array<{
    id: number;
    title: string;
    duration?: string;
    locked?: boolean;
    completed?: boolean;
    videoUrl?: string;
    type?: string;
  }>;
}

interface CourseWithLessons {
  id: number;
  title: string;
  instructor?: string;
  lessons?: Lesson[];
  sections?: Section[];
  currentLessonId?: number;
}

interface CourseContentProps {
  course: CourseWithLessons | null;
}

// Helper to extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  // Handle youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  
  // Handle youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Handle youtube.com/embed/VIDEO_ID
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  
  return null;
}

export default function CourseContent({ course }: CourseContentProps) {
  const [activeLessonId, setActiveLessonId] = useState<number | null>(course?.currentLessonId ?? course?.lessons?.[0]?.id ?? null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const lessons = useMemo(() => course?.lessons ?? [], [course]);
  const sections = useMemo(() => course?.sections ?? [], [course]);
  const activeLesson = useMemo(() => lessons.find(l => l.id === activeLessonId) || null, [lessons, activeLessonId]);
  const storageKey = course ? `edu_progress_${course.id}` : '';
  const notesKey = course && activeLesson ? `edu_notes_${course.id}_${activeLesson.id}` : '';

  const [notes, setNotes] = useState<string>('');

  // Get YouTube embed URL for active lesson
  const youtubeEmbedUrl = useMemo(() => {
    if (!activeLesson?.videoUrl) return null;
    const videoId = extractYouTubeVideoId(activeLesson.videoUrl);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  }, [activeLesson]);

  // Initialize expanded sections - expand the section containing active lesson
  useEffect(() => {
    if (activeLesson?.sectionId) {
      setExpandedSections(prev => new Set(prev).add(activeLesson.sectionId!));
    }
  }, [activeLesson?.sectionId]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!course || !storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeLessonId) setActiveLessonId(parsed.activeLessonId);
      }
    } catch {}
  }, [storageKey, course]);

  useEffect(() => {
    if (!course || !storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ activeLessonId }));
    } catch {}
  }, [activeLessonId, storageKey, course]);

  useEffect(() => {
    if (!notesKey) return;
    try {
      const saved = localStorage.getItem(notesKey);
      setNotes(saved ?? '');
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notesKey]);

  useEffect(() => {
    if (!notesKey) return;
    try { localStorage.setItem(notesKey, notes); } catch {}
  }, [notes, notesKey]);

  if (!course) return <div className="p-8">Vui lòng chọn khóa học</div>;

  const goPrev = () => {
    if (!activeLesson) return;
    const idx = lessons.findIndex(l => l.id === activeLesson.id);
    if (idx > 0) setActiveLessonId(lessons[idx - 1].id);
  };
  const goNext = () => {
    if (!activeLesson) return;
    const idx = lessons.findIndex(l => l.id === activeLesson.id);
    if (idx < lessons.length - 1) setActiveLessonId(lessons[idx + 1].id);
  };

  const tryActivate = (lesson: { id: number; locked?: boolean }) => {
    if (lesson.locked) {
      toast.message('Bài học này đang khóa. Hãy hoàn thành bài trước.');
      return;
    }
    setActiveLessonId(lesson.id);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Main player and controls */}
         <div className="lg:col-span-8 order-2 lg:order-1">
          <Card className="mb-4 overflow-hidden">
            <div className="flex justify-center py-4 bg-gray-900">
              {youtubeEmbedUrl ? (
                <iframe
                  className="w-full aspect-video"
                  src={youtubeEmbedUrl}
                  title={activeLesson?.title || 'Video bài học'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="w-full max-w-xl aspect-video bg-gray-800 rounded flex items-center justify-center shadow">
                  <div className="text-center text-gray-400">
                    <PlayCircle className="w-12 h-12 mx-auto mb-2" />
                    <p>Chọn bài học để xem video</p>
                  </div>
                </div>
              )}
            </div>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="mb-1">{course.title}</h2>
                  <p className="text-sm text-gray-600">{activeLesson ? activeLesson.title : 'Chọn bài học để bắt đầu'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goPrev}><ChevronLeft className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" onClick={goNext}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {/* Zoom button removed */}
                <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
                  <Tv className="w-4 h-4" /> Chế độ tập trung
                </Button>
                <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
                  <NotebookPen className="w-4 h-4" /> Ghi chú nhanh
                </Button>
                <div className="ml-auto text-sm text-gray-500">{activeLesson?.duration}</div>
              </div>
            </CardContent>
          </Card>

          {/* Resource panel */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <Tabs defaultValue="desc">
                <TabsList>
                  <TabsTrigger value="desc">Mô tả</TabsTrigger>
                  <TabsTrigger value="materials">Tài liệu</TabsTrigger>
                  <TabsTrigger value="notes">Ghi chú của tôi</TabsTrigger>
                  <TabsTrigger value="qa">Q&A</TabsTrigger>
                </TabsList>
                <TabsContent value="desc" className="mt-3 text-sm text-gray-700">
                  {activeLesson ? (
                    <p>Bài học: {activeLesson.title}. Nội dung chi tiết sẽ được cập nhật.</p>
                  ) : (
                    <p>Hãy chọn một bài học để xem nội dung.</p>
                  )}
                </TabsContent>
                <TabsContent value="materials" className="mt-3">
                  {activeLesson?.resources && activeLesson.resources.length > 0 ? (
                    <ul className="space-y-2">
                      {activeLesson.resources.map((r, idx) => (
                        <li key={idx} className="flex items-center justify-between gap-3 p-2 rounded hover:bg-gray-50">
                          <div className="flex items-center gap-2">
                            {r.type === 'pdf' ? <FileTextIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                            <span className="text-sm">{r.name}</span>
                          </div>
                          <a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">Mở</a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-600">Chưa có tài liệu.</p>
                  )}
                </TabsContent>
                <TabsContent value="notes" className="mt-3">
                  <Textarea rows={6} placeholder="Ghi chú của bạn cho bài học này..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1">Ghi chú sẽ tự động lưu trên thiết bị.</p>
                </TabsContent>
                <TabsContent value="qa" className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Thảo luận bài học</span>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Đặt câu hỏi của bạn..." />
                    <Button>Gửi</Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Tính năng thảo luận sẽ kết nối với diễn đàn trong phiên bản sau.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar lessons */}
         <div className="lg:col-span-4 order-1 lg:order-2">
          <Card>
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b sticky top-0 bg-white z-10"><h3 className="text-base font-medium">Nội dung khóa học</h3></div>
              <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
                {sections.length > 0 ? (
                  // Group by sections
                  sections.map((section) => (
                    <div key={section.id} className="border-b last:border-b-0">
                      <button
                        className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 bg-gray-50"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{section.title}</span>
                          <span className="text-xs text-gray-500">({section.lessons?.length || 0} bài)</span>
                        </div>
                        {expandedSections.has(section.id) ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      {expandedSections.has(section.id) && (
                        <ul>
                          {section.lessons?.map((l) => {
                            const isActive = l.id === activeLessonId;
                            return (
                              <li key={l.id}>
                                <button
                                  className={`w-full text-left px-6 py-2 flex items-center justify-between gap-3 hover:bg-gray-50 ${isActive ? 'bg-blue-50' : ''}`}
                                  onClick={() => tryActivate(l)}
                                >
                                  <div className="flex items-center gap-3">
                                    {l.locked ? (
                                      <Lock className="w-4 h-4 text-gray-400" />
                                    ) : l.completed ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Video className="w-4 h-4 text-blue-600" />
                                    )}
                                    <div>
                                      <div className="text-sm">{l.title}</div>
                                      {l.duration && <div className="text-xs text-gray-500">{l.duration}</div>}
                                    </div>
                                  </div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ))
                ) : (
                  // Flat list fallback
                  <ul>
                    {lessons.map((l) => {
                      const isActive = l.id === activeLessonId;
                      return (
                        <li key={l.id}>
                          <button
                            className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 ${isActive ? 'bg-blue-50' : ''}`}
                            onClick={() => tryActivate(l)}
                          >
                            <div className="flex items-center gap-3">
                              {l.locked ? (
                                <Lock className="w-4 h-4 text-gray-400" />
                              ) : l.completed ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Video className="w-4 h-4 text-blue-600" />
                              )}
                              <div>
                                <div className="text-sm font-medium">{l.title}</div>
                                <div className="text-xs text-gray-500">{l.duration || ''}</div>
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Zoom Dialog */}
      {/* Zoom dialog removed */}
    </div>
  );
}
