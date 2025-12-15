/**
 * YouTube Service for fetching playlist data and converting to courses
 * Uses YouTube Data API v3
 */

// Get API key from environment variable or use empty string
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY ?? '';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  position: number;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  videoCount: number;
  videos: YouTubeVideo[];
}

export interface PlaylistImportResult {
  success: boolean;
  playlist?: YouTubePlaylist;
  error?: string;
}

/**
 * Extract playlist ID from YouTube URL or return as-is if already an ID
 */
export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  
  // If it's already just an ID (no URL characters)
  if (/^[A-Za-z0-9_-]+$/.test(trimmed) && trimmed.length > 10) {
    return trimmed;
  }
  
  // Try to extract from URL
  try {
    const url = new URL(trimmed);
    const listParam = url.searchParams.get('list');
    if (listParam) return listParam;
  } catch {
    // Not a valid URL
  }
  
  // Try regex for various YouTube URL formats
  const patterns = [
    /[?&]list=([A-Za-z0-9_-]+)/,
    /playlist\?list=([A-Za-z0-9_-]+)/,
    /youtube\.com\/playlist\/([A-Za-z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }
  
  return null;
}

/**
 * Parse ISO 8601 duration to readable format (e.g., PT1H2M30S -> "1:02:30")
 */
function parseISO8601Duration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';
  
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate total duration in hours from videos
 */
export function calculateTotalHours(videos: YouTubeVideo[]): number {
  let totalSeconds = 0;
  
  for (const video of videos) {
    const parts = video.duration.split(':').map(Number);
    if (parts.length === 3) {
      totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      totalSeconds += parts[0] * 60 + parts[1];
    }
  }
  
  return Math.ceil(totalSeconds / 3600);
}

/**
 * Parse YouTube API error response
 */
async function parseYouTubeError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data.error?.message) {
      return data.error.message;
    }
    if (data.error?.errors?.[0]?.reason) {
      const reason = data.error.errors[0].reason;
      // Map common error reasons to user-friendly messages
      const reasonMap: Record<string, string> = {
        'keyInvalid': 'API key không hợp lệ. Kiểm tra lại VITE_YOUTUBE_API_KEY.',
        'accessNotConfigured': 'YouTube Data API v3 chưa được bật. Vào Google Cloud Console để kích hoạt.',
        'dailyLimitExceeded': 'Đã vượt quá giới hạn quota hàng ngày.',
        'quotaExceeded': 'Đã vượt quá quota API.',
        'playlistNotFound': 'Không tìm thấy playlist. Kiểm tra playlist có công khai không.',
        'forbidden': 'Không có quyền truy cập. Kiểm tra API key và quyền truy cập.',
      };
      return reasonMap[reason] || `Lỗi YouTube: ${reason}`;
    }
  } catch {
    // Ignore JSON parse errors
  }
  return `HTTP ${response.status}`;
}

/**
 * Fetch playlist details from YouTube API
 */
async function fetchPlaylistDetails(playlistId: string): Promise<{
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  videoCount: number;
} | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return null;
  }
  
  const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${YOUTUBE_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorMsg = await parseYouTubeError(response);
    throw new Error(`Không thể tải playlist: ${errorMsg}`);
  }
  
  const data = await response.json();
  if (!data.items?.length) {
    return null;
  }
  
  const item = data.items[0];
  return {
    title: item.snippet.title,
    description: item.snippet.description || '',
    thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
    channelTitle: item.snippet.channelTitle,
    videoCount: item.contentDetails.itemCount,
  };
}

/**
 * Fetch all videos in a playlist
 */
async function fetchPlaylistVideos(playlistId: string): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not configured');
    return [];
  }
  
  const videos: YouTubeVideo[] = [];
  let nextPageToken: string | undefined;
  
  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet,contentDetails');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', YOUTUBE_API_KEY);
    if (nextPageToken) {
      url.searchParams.set('pageToken', nextPageToken);
    }
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      const errorMsg = await parseYouTubeError(response);
      throw new Error(`Không thể tải video: ${errorMsg}`);
    }
    
    const data = await response.json();
    
    // Get video IDs for duration lookup
    const videoIds = data.items
      ?.map((item: any) => item.contentDetails?.videoId)
      .filter(Boolean) || [];
    
    // Fetch video durations
    const durations = await fetchVideoDurations(videoIds);
    
    for (const item of data.items || []) {
      const videoId = item.contentDetails?.videoId;
      if (!videoId) continue;
      
      videos.push({
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description || '',
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
        duration: durations[videoId] || '0:00',
        position: item.snippet.position,
      });
    }
    
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);
  
  return videos.sort((a, b) => a.position - b.position);
}

/**
 * Fetch video durations by ID
 */
async function fetchVideoDurations(videoIds: string[]): Promise<Record<string, string>> {
  if (!YOUTUBE_API_KEY || videoIds.length === 0) {
    return {};
  }
  
  const url = new URL('https://www.googleapis.com/youtube/v3/videos');
  url.searchParams.set('part', 'contentDetails');
  url.searchParams.set('id', videoIds.join(','));
  url.searchParams.set('key', YOUTUBE_API_KEY);
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    return {};
  }
  
  const data = await response.json();
  const durations: Record<string, string> = {};
  
  for (const item of data.items || []) {
    if (item.id && item.contentDetails?.duration) {
      durations[item.id] = parseISO8601Duration(item.contentDetails.duration);
    }
  }
  
  return durations;
}

/**
 * Fetch complete playlist data including all videos
 */
export async function fetchPlaylist(playlistIdOrUrl: string): Promise<PlaylistImportResult> {
  const playlistId = extractPlaylistId(playlistIdOrUrl);
  
  if (!playlistId) {
    return {
      success: false,
      error: 'Invalid playlist URL or ID',
    };
  }
  
  if (!YOUTUBE_API_KEY) {
    return {
      success: false,
      error: 'YouTube API key not configured. Add VITE_YOUTUBE_API_KEY to your .env file.',
    };
  }
  
  try {
    const [details, videos] = await Promise.all([
      fetchPlaylistDetails(playlistId),
      fetchPlaylistVideos(playlistId),
    ]);
    
    if (!details) {
      return {
        success: false,
        error: 'Playlist not found or is private',
      };
    }
    
    return {
      success: true,
      playlist: {
        id: playlistId,
        ...details,
        videos,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch playlist',
    };
  }
}

/**
 * Fetch multiple playlists
 */
export async function fetchMultiplePlaylists(inputs: string[]): Promise<PlaylistImportResult[]> {
  const results: PlaylistImportResult[] = [];
  
  for (const input of inputs) {
    const result = await fetchPlaylist(input);
    results.push(result);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

/**
 * Generate a course code from playlist title
 */
export function generateCourseCode(title: string): string {
  const cleaned = title
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .join('-');
  
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  return `${cleaned || 'YT'}-${timestamp}`;
}

/**
 * Truncate text to fit database column limits
 * Style: substring(0, maxLength) + "..." if exceeds
 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return text;
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}

// MySQL column limits (adjust based on your schema)
const MAX_DESCRIPTION_LENGTH = 250;
const MAX_TITLE_LENGTH = 255;

/**
 * Convert YouTube playlist to course data structure for creation
 */
export function playlistToCourseData(playlist: YouTubePlaylist, category = 'Programming', level = 'Intermediate') {
  const totalHours = calculateTotalHours(playlist.videos);
  
  const defaultDesc = `Khóa học được import từ playlist YouTube của ${playlist.channelTitle}`;
  const description = truncateText(playlist.description || defaultDesc, MAX_DESCRIPTION_LENGTH);
  
  return {
    code: generateCourseCode(playlist.title),
    title: truncateText(playlist.title, MAX_TITLE_LENGTH),
    description,
    category,
    level,
    price: 0, // Free by default
    duration: totalHours || 1,
    status: 'draft' as const,
    // Section data for creating lessons
    sections: [{
      title: truncateText('Nội dung khóa học', MAX_TITLE_LENGTH),
      description: truncateText(`${playlist.videos.length} bài học từ playlist YouTube`, MAX_DESCRIPTION_LENGTH),
      lessons: playlist.videos.map(video => ({
        title: truncateText(video.title, MAX_TITLE_LENGTH),
        type: 'video' as const,
        videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
        duration: video.duration,
        description: truncateText(video.description, MAX_DESCRIPTION_LENGTH),
      })),
    }],
  };
}
