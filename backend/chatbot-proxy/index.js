const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const SYSTEM_PROMPT =
  'Bạn là trợ lý AI của nền tảng học trực tuyến EduSmart. ' +
  'Hãy trả lời ngắn gọn, thân thiện bằng tiếng Việt. ' +
  'Giúp học sinh tìm khóa học, giải đáp thắc mắc về nền tảng, và hỗ trợ việc học tập.';

// Endpoint to proxy Gemini
app.post('/api/chat/gemini', async (req, res) => {
  try {
    const { messages } = req.body;
    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ error: 'NO_GEMINI_KEY' });

    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`,
      {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[Gemini Proxy Error]', error.response?.data || error.message);
    res.status(500).json({ error: 'Gemini request failed' });
  }
});

// Endpoint to proxy OpenAI
app.post('/api/chat/openai', async (req, res) => {
  try {
    const { messages } = req.body;
    const key = process.env.OPENAI_API_KEY;
    if (!key) return res.status(500).json({ error: 'NO_OPENAI_KEY' });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 512,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('[OpenAI Proxy Error]', error.response?.data || error.message);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Chatbot proxy running on port ${PORT}`);
});
