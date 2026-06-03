const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const VOICE_ID = 'QYrOVogqhHWUzdZFXf0E';
const DROPBOX_FOLDER = '/Omkeer Content';

// ── DROPBOX: Search for file and get direct image URL ──
async function findDropboxFile(searchTerm) {
  const token = process.env.DROPBOX_TOKEN;
  if (!token) return { name: null, url: null };

  try {
    // List all files in the Omkeer Content folder
    const listResp = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ path: DROPBOX_FOLDER, recursive: false })
    });

    const listData = await listResp.json();
    if (!listData.entries) return { name: null, url: null };

    const normalize = s => s.toLowerCase().replace(/[-_.\s]+/g, ' ').trim();
    const search = normalize(searchTerm);
    const entries = listData.entries;

    let match = entries.find(e => normalize(e.name) === search)
      || entries.find(e => normalize(e.name).includes(search))
      || entries.find(e => {
          const words = search.split(' ').filter(w => w.length > 2);
          return words.every(w => normalize(e.name).includes(w));
        })
      || entries.find(e => {
          const words = search.split(' ').filter(w => w.length > 2);
          return words.some(w => normalize(e.name).includes(w));
        });

    if (!match) return { name: null, url: null };

    console.log('Found file:', match.name, 'path:', match.path_lower);

    // Use Dropbox temporary download link - works with files.content.read permission
    try {
      const dlResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ path: match.path_lower })
      });
      const dlData = await dlResp.json();
      if (dlData.link) {
        console.log('Got temporary download link');
        return { name: match.name, url: dlData.link };
      }
      console.log('get_temporary_link response:', JSON.stringify(dlData).substring(0, 200));
    } catch(e) { console.log('get_temporary_link error:', e.message); }

    // Fallback — return just the name without URL
    return { name: match.name, url: null };

  } catch (error) {
    console.log('Dropbox search error:', error.message);
    return { name: null, url: null };
  }
}

// ── CHAT ──
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

// ── SPEAK ──
app.post('/speak', async (req, res) => {
  try {
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenKey) return res.status(400).json({ error: 'No ElevenLabs key configured' });
    const text = req.body.text || '';
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenKey },
      body: JSON.stringify({ text, model_id: 'eleven_turbo_v2_5', voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
    });
    if (!response.ok) { const err = await response.text(); return res.status(400).json({ error: err }); }
    const audioBuffer = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── POST CONTENT — with Dropbox file search ──
app.post('/post-content', async (req, res) => {
  console.log('POST COMMAND TRIGGERED');
  try {
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) return res.status(400).json({ error: 'No webhook configured' });

    const { description, filename, platforms } = req.body;

    // If filename provided, search Dropbox for it
    let resolvedFilename = filename || null;
    let resolvedUrl = null;

    if (filename) {
      console.log('Searching Dropbox for:', filename);
      const result = await findDropboxFile(filename);
      if (result.name) {
        resolvedFilename = result.name;
        resolvedUrl = result.url;
        console.log('Found:', resolvedFilename, 'URL:', resolvedUrl);
      } else {
        console.log('No match found for:', filename);
        resolvedFilename = filename;
      }
    }

    const payload = {
      description: description || resolvedFilename || '',
      filename: resolvedFilename || '',
      image_url: resolvedUrl || '',
      platforms: platforms || 'Instagram, TikTok, Pinterest'
    };

    console.log('Sending to Make.com:', payload);

    console.log('Sending to Make.com:', payload);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    res.json({ success: true, message: 'Content queued', filename: resolvedFilename, url: resolvedUrl, response: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── CAPTION ──
app.post('/caption', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'No API key configured' });
    const { description, platforms } = req.body;
    const prompt = `You are the social media voice for OMKEER — a luxury faith-driven streetwear brand. Tagline: "Not a team. A belief."

Generate a social media post for: ${description}
Platforms: ${platforms || 'Instagram, TikTok, Pinterest'}

Return ONLY a JSON object, no other text:
{"caption":"the caption","hashtags":"#tag1 #tag2","full_post":"caption + hashtags combined"}

Caption: 1-3 lines, bold, faith-driven, luxury streetwear. Max 2 emojis. 25 hashtags.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error.message });
    let text = '';
    if (data.content) for (const b of data.content) if (b.type === 'text') { text = b.text; break; }
    try { res.json(JSON.parse(text.replace(/```json|```/g, '').trim())); }
    catch(e) { res.json({ caption: text, hashtags: '', full_post: text }); }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.send('HALO Server Online'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HALO Server running on port ${PORT}`));
