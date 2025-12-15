import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Textarea } from './textarea';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';
import { toast } from 'sonner';
import { Youtube, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import {
  fetchPlaylist,
  playlistToCourseData,
  extractPlaylistId,
  YouTubePlaylist,
  PlaylistImportResult,
} from '../../services/youtubeService';
import { createCourse, CreateCoursePayload } from '../../services/courseService';
import { createSection, createLesson } from '../../services/lessonService';

interface YouTubeImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
  authToken: string;
}

interface ImportStatus {
  playlistId: string;
  playlistTitle?: string;
  status: 'pending' | 'fetching' | 'creating' | 'success' | 'error';
  message?: string;
  courseId?: number;
}

export default function YouTubeImportDialog({
  open,
  onOpenChange,
  onImportComplete,
  authToken,
}: YouTubeImportDialogProps) {
  const [playlistInput, setPlaylistInput] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('Programming');
  const [defaultLevel, setDefaultLevel] = useState('Intermediate');
  const [defaultPrice, setDefaultPrice] = useState('100000'); // Minimum price > 0 required by backend
  const [isImporting, setIsImporting] = useState(false);
  const [importStatuses, setImportStatuses] = useState<ImportStatus[]>([]);
  const [step, setStep] = useState<'input' | 'progress' | 'complete'>('input');

  const resetDialog = () => {
    setPlaylistInput('');
    setImportStatuses([]);
    setStep('input');
    setIsImporting(false);
  };

  const handleClose = () => {
    if (!isImporting) {
      resetDialog();
      onOpenChange(false);
    }
  };

  const parsePlaylistInputs = (): string[] => {
    return playlistInput
      .split(/[\n,]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => extractPlaylistId(line) || line);
  };

  const updateStatus = (playlistId: string, updates: Partial<ImportStatus>) => {
    setImportStatuses(prev =>
      prev.map(s => (s.playlistId === playlistId ? { ...s, ...updates } : s))
    );
  };

  const importSinglePlaylist = async (playlistIdOrUrl: string): Promise<boolean> => {
    const playlistId = extractPlaylistId(playlistIdOrUrl) || playlistIdOrUrl;
    
    updateStatus(playlistId, { status: 'fetching', message: 'Đang tải thông tin playlist...' });

    // Fetch playlist from YouTube
    const result: PlaylistImportResult = await fetchPlaylist(playlistIdOrUrl);

    if (!result.success || !result.playlist) {
      updateStatus(playlistId, {
        status: 'error',
        message: result.error || 'Không thể tải playlist',
      });
      return false;
    }

    const playlist = result.playlist;
    updateStatus(playlistId, {
      playlistTitle: playlist.title,
      status: 'creating',
      message: `Đang tạo khóa học "${playlist.title}"...`,
    });

    try {
      // Create course data from playlist
      const courseData = playlistToCourseData(playlist, defaultCategory, defaultLevel);
      const priceValue = Math.max(1, parseInt(defaultPrice, 10) || 1); // Ensure price > 0

      // Create the course
      const coursePayload: CreateCoursePayload = {
        code: courseData.code,
        title: courseData.title,
        description: courseData.description,
        price: priceValue,
        duration: courseData.duration,
        category: courseData.category,
        level: courseData.level,
        status: 'draft',
      };

      const createdCourse = await createCourse(coursePayload, authToken);

      updateStatus(playlistId, {
        message: `Đang tạo ${playlist.videos.length} bài học...`,
      });

      // Create section and lessons
      if (courseData.sections.length > 0 && playlist.videos.length > 0) {
        const section = courseData.sections[0];
        
        try {
          const createdSection = await createSection(
            createdCourse.id,
            { title: section.title, description: section.description },
            authToken
          );

          // Create lessons
          for (let i = 0; i < section.lessons.length; i++) {
            const lesson = section.lessons[i];
            try {
              await createLesson(
                createdCourse.id,
                createdSection.id,
                {
                  title: lesson.title,
                  type: lesson.type,
                  videoUrl: lesson.videoUrl,
                },
                authToken
              );
            } catch (lessonError) {
              console.warn(`Failed to create lesson ${i + 1}:`, lessonError);
            }

            // Update progress
            updateStatus(playlistId, {
              message: `Đang tạo bài học ${i + 1}/${section.lessons.length}...`,
            });
          }
        } catch (sectionError) {
          console.warn('Failed to create section/lessons:', sectionError);
        }
      }

      updateStatus(playlistId, {
        status: 'success',
        message: `Đã tạo khóa học với ${playlist.videos.length} bài học`,
        courseId: createdCourse.id,
      });

      return true;
    } catch (error) {
      updateStatus(playlistId, {
        status: 'error',
        message: error instanceof Error ? error.message : 'Lỗi tạo khóa học',
      });
      return false;
    }
  };

  const handleStartImport = async () => {
    const playlistIds = parsePlaylistInputs();

    if (playlistIds.length === 0) {
      toast.error('Vui lòng nhập ít nhất một playlist URL hoặc ID');
      return;
    }

    const priceNum = parseInt(defaultPrice, 10);
    if (!priceNum || priceNum < 1) {
      toast.error('Giá khóa học phải lớn hơn 0');
      return;
    }

    // Initialize statuses
    const initialStatuses: ImportStatus[] = playlistIds.map(id => ({
      playlistId: id,
      status: 'pending',
    }));
    setImportStatuses(initialStatuses);
    setStep('progress');
    setIsImporting(true);

    let successCount = 0;
    let errorCount = 0;

    // Import playlists sequentially to avoid rate limiting
    for (const playlistId of playlistIds) {
      const success = await importSinglePlaylist(playlistId);
      if (success) {
        successCount++;
      } else {
        errorCount++;
      }
      // Small delay between imports
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsImporting(false);
    setStep('complete');

    if (successCount > 0) {
      toast.success(`Đã import thành công ${successCount} khóa học`);
      onImportComplete();
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} playlist không thể import`);
    }
  };

  const getStatusIcon = (status: ImportStatus['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'fetching':
      case 'creating':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            Import khóa học từ YouTube Playlist
          </DialogTitle>
          <DialogDescription>
            Tự động tạo khóa học từ các playlist YouTube. Tên playlist sẽ thành tên khóa học, mỗi video là một bài học.
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <>
            <div className="space-y-4 py-4">
              <div>
                <Label>Playlist URLs hoặc IDs (mỗi dòng một playlist)</Label>
                <Textarea
                  rows={6}
                  value={playlistInput}
                  onChange={e => setPlaylistInput(e.target.value)}
                  placeholder={`https://www.youtube.com/playlist?list=PLxxxxxx
PLyyyyyyyy
https://youtube.com/playlist?list=PLzzzzzz`}
                  className="mt-1.5 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hỗ trợ URL đầy đủ hoặc chỉ playlist ID. Có thể nhập nhiều playlist cách nhau bằng dòng mới hoặc dấu phẩy.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Danh mục mặc định</Label>
                  <Select value={defaultCategory} onValueChange={setDefaultCategory}>
                    <SelectTrigger className="mt-1.5">
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
                  <Label>Cấp độ mặc định</Label>
                  <Select value={defaultLevel} onValueChange={setDefaultLevel}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Cơ bản</SelectItem>
                      <SelectItem value="Intermediate">Trung cấp</SelectItem>
                      <SelectItem value="Advanced">Nâng cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Giá mặc định (VNĐ)</Label>
                  <Input
                    type="number"
                    value={defaultPrice}
                    onChange={e => setDefaultPrice(e.target.value)}
                    placeholder="100000"
                    min={1}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tối thiểu: 1 VNĐ</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Lưu ý:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    <li>Cần có YouTube API Key được cấu hình (VITE_YOUTUBE_API_KEY)</li>
                    <li>Chỉ import được playlist công khai hoặc không liệt kê</li>
                    <li>Khóa học sẽ được tạo ở trạng thái "Bản nháp"</li>
                  </ul>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button onClick={handleStartImport} disabled={!playlistInput.trim()}>
                <Youtube className="w-4 h-4 mr-2" />
                Bắt đầu Import
              </Button>
            </DialogFooter>
          </>
        )}

        {(step === 'progress' || step === 'complete') && (
          <>
            <div className="py-4">
              <div className="space-y-3">
                {importStatuses.map((status, index) => (
                  <div
                    key={status.playlistId}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="mt-0.5">{getStatusIcon(status.status)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {status.playlistTitle || `Playlist ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        ID: {status.playlistId}
                      </p>
                      {status.message && (
                        <p
                          className={`text-xs mt-1 ${
                            status.status === 'error' ? 'text-red-600' : 'text-gray-600'
                          }`}
                        >
                          {status.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {step === 'complete' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>Hoàn tất!</strong> Đã xử lý{' '}
                    {importStatuses.filter(s => s.status === 'success').length}/
                    {importStatuses.length} playlist thành công.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              {step === 'progress' && (
                <Button disabled>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang import...
                </Button>
              )}
              {step === 'complete' && (
                <>
                  <Button variant="outline" onClick={resetDialog}>
                    Import thêm
                  </Button>
                  <Button onClick={handleClose}>Đóng</Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
