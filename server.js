const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const VOICE_ID = 'QYrOVogqhHWUzdZFXf0E';

app.post('/chat', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'No API key configured' });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        system: req.body.system || 'You are HALO, a helpful AI assistant.',
        messages: req.body.messages || []
      })
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { return res.status(500).json({ error: 'Parse error' }); }

    if (data.error) return res.status(400).json({ error: JSON.stringify(data.error) });

    if (data.content && Array.isArray(data.content)) {
      for (let i = 0; i < data.content.length; i++) {
        if (data.content[i].type === 'text' && data.content[i].text) {
          return res.json({ reply: data.content[i].text });
        }
      }
    }
    res.status(500).json({ error: 'No text in response' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/speak', async (req, res) => {
  try {
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenKey) return res.status(400).json({ error: 'No ElevenLabs key configured' });

    const text = req.body.text || '';
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenKey
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(400).json({ error: err });
    }

    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/caption', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'No API key configured' });

    const { description, platforms, tone } = req.body;
    const platformList = platforms || 'Instagram, TikTok, Pinterest';
    const brandTone = tone || 'luxury faith-driven streetwear';

    const prompt = `You are the social media voice for OMKEER — a luxury faith-driven streetwear brand. Tagline: "Not a team. A belief." Products include the Agnus Dei Crewneck and Revenir Jersey.

Generate a social media post for: ${description}
Platforms: ${platformList}
Tone: ${brandTone}

Return ONLY a JSON object like this, no other text:
{
  "caption": "the caption text here",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3",
  "full_post": "caption + hashtags combined"
}

Caption should be 1-3 lines max. Bold, confident, faith-driven, luxury streetwear energy. Use minimal emojis — max 2. Generate 25 relevant hashtags.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });

    let text = '';
    if (data.content && Array.isArray(data.content)) {
      for (let i = 0; i < data.content.length; i++) {
        if (data.content[i].type === 'text') { text = data.content[i].text; break; }
      }
    }

    try {
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      res.json(parsed);
    } catch(e) {
      res.json({ caption: text, hashtags: '', full_post: text });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/post-content', async (req, res) => {
  try {
    const { description, image_url, platforms } = req.body;
    
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) return res.status(400).json({ error: 'No webhook configured' });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: description || '',
        image_url: image_url || '',
        platforms: platforms || 'Instagram, TikTok, Pinterest'
      })
    });

    const text = await response.text();
    res.json({ success: true, message: 'Content queued for posting', response: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.send('HALO Server Online'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HALO Server running on port ${PORT}`));
