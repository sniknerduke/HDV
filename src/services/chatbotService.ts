/**
 * AI Chatbot Service
 * Primary: Google Gemini  |  Fallback: OpenAI  |  Last-resort: mock
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ---- System prompt (Vietnamese education assistant) ----
const SYSTEM_PROMPT =
  'Bạn là trợ lý AI của nền tảng học trực tuyến EduSmart. ' +
  'Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt. ' +
  'Giúp học sinh tìm khóa học, giải đáp thắc mắc về nền tảng, và hỗ trợ việc học tập.';

// ---- Gemini ----
async function callGemini(messages: ChatMessage[]): Promise<string> {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error('NO_GEMINI_KEY');

  // Build Gemini contents array (system instruction is separate)
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }),
    },
  );

  if (!res.ok) {
    const errBody = await res.text();
    console.warn('[Gemini] error', res.status, errBody);
    throw new Error(`GEMINI_${res.status}`);
  }

  const data = await res.json();
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    'Xin lỗi, mình không hiểu câu hỏi. Bạn thử hỏi lại nhé!'
  );
}

// ---- OpenAI fallback ----
async function callOpenAI(messages: ChatMessage[]): Promise<string> {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) throw new Error('NO_OPENAI_KEY');

  const body = {
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...messages],
    max_tokens: 512,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.warn('[OpenAI] error', res.status, errBody);
    throw new Error(`OPENAI_${res.status}`);
  }

  const data = await res.json();
  return (
    data?.choices?.[0]?.message?.content ??
    'Xin lỗi, mình không hiểu câu hỏi. Bạn thử hỏi lại nhé!'
  );
}

// ---- Ollama (local) fallback ----
async function callOllama(messages: ChatMessage[]): Promise<string> {
  const baseUrl = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
  const model = import.meta.env.VITE_OLLAMA_MODEL || 'gemma3:4b';

  // Use Ollama's OpenAI-compatible endpoint
  const body = {
    model,
    messages: [{ role: 'system' as const, content: SYSTEM_PROMPT }, ...messages],
    stream: false,
  };

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.warn('[Ollama] error', res.status, errBody);
    throw new Error(`OLLAMA_${res.status}`);
  }

  const data = await res.json();
  return (
    data?.choices?.[0]?.message?.content ??
    'Xin lỗi, mình không hiểu câu hỏi. Bạn thử hỏi lại nhé!'
  );
}

// ---- Mock fallback (always works) ----
const MOCK_RESPONSES = [
  'Chào bạn! Mình là trợ lý ảo EduSmart. Hiện tại mình chưa được kết nối AI, nhưng bạn có thể duyệt khóa học ở trang "Khóa học" nhé! 📚',
  'Để tìm khóa học phù hợp, bạn hãy vào mục "Khóa học" và dùng bộ lọc theo chủ đề nhé!',
  'Nếu cần hỗ trợ kỹ thuật, bạn hãy liên hệ qua trang "Liên hệ" hoặc email support@edusmart.vn nhé!',
  'Mình khuyên bạn nên xem các khóa học đang được giảm giá trên trang chủ nhé! 🎉',
  'Bạn có thể xem lịch sử giao dịch trong mục "Giao dịch" trên sidebar khi đã đăng nhập.',
];

function mockReply(): string {
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
}

// ---- Public API ----
export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  // 1. Try Gemini
  try {
    return await callGemini(messages);
  } catch (e) {
    console.warn('[Chatbot] Gemini unavailable, trying OpenAI…', e);
  }

  // 2. Try OpenAI
  try {
    return await callOpenAI(messages);
  } catch (e) {
    console.warn('[Chatbot] OpenAI unavailable, trying Ollama…', e);
  }

  // 3. Try Ollama (local)
  try {
    return await callOllama(messages);
  } catch (e) {
    console.warn('[Chatbot] Ollama unavailable, using mock…', e);
  }

  // 4. Mock
  return mockReply();
}
