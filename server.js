const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const VOICE_ID = 'QYrOVogqhHWUzdZFXf0E';
const DROPBOX_FOLDER = '/Omkeer Content';

// ── DROPBOX: Search for file and get direct image URL ──
async function findDropboxFile(searchTerm) {
  // Check token
  const token = process.env.DROPBOX_TOKEN;
  console.log('DROPBOX TOKEN EXISTS:', !!token);
  if (!token) {
    console.error('DROPBOX ERROR: No token found in environment variables');
    return { name: null, url: null };
  }

  const FOLDER = '/Omkeer Content';
  console.log('SEARCHING DROPBOX FOLDER:', FOLDER);
  console.log('SEARCHING FILENAME:', searchTerm);

  try {
    // List folder
    const listResp = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ path: FOLDER, recursive: false })
    });
    const listText = await listResp.text();
    console.log('LIST FOLDER STATUS:', listResp.status);
    console.log('LIST FOLDER RAW:', listText.substring(0, 500));

    let listData;
    try { listData = JSON.parse(listText); }
    catch(e) { console.error('DROPBOX ERROR: Could not parse list_folder response'); return { name: null, url: null }; }

    if (!listData.entries) {
      console.error('DROPBOX ERROR: No entries in folder response:', JSON.stringify(listData));
      return { name: null, url: null };
    }

    console.log('FILES IN FOLDER:', listData.entries.map(e => e.name));

    // Fuzzy match
    const normalize = s => s.toLowerCase().replace(/[-_.\s]+/g, ' ').trim();
    const search = normalize(searchTerm);
    const entries = listData.entries;

    let match = entries.find(e => normalize(e.name) === search)
      || entries.find(e => normalize(e.name).includes(search))
      || entries.find(e => {
          const words = search.split(' ').filter(w => w.length > 2);
          return words.length > 0 && words.every(w => normalize(e.name).includes(w));
        })
      || entries.find(e => {
          const words = search.split(' ').filter(w => w.length > 2);
          return words.some(w => normalize(e.name).includes(w));
        });

    console.log('DROPBOX FILE MATCH:', match ? match.name : 'NO MATCH FOUND');
    if (!match) return { name: null, url: null };

    // Get temporary link
    console.log('Requesting temp link for path:', match.path_lower);
    const tlResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ path: match.path_lower })
    });
    const tlText = await tlResp.text();
    console.log('DROPBOX TEMP LINK STATUS:', tlResp.status);
    console.log('DROPBOX TEMP LINK RESPONSE:', tlText.substring(0, 400));

    let tlData;
    try { tlData = JSON.parse(tlText); }
    catch(e) { console.error('DROPBOX ERROR: Could not parse temp link response'); return { name: match.name, url: null }; }

    if (tlData.link) {
      console.log('RESOLVED IMAGE URL:', tlData.link.substring(0, 80));
      return { name: match.name, url: tlData.link };
    }

    console.error('DROPBOX ERROR: No link in response:', JSON.stringify(tlData));
    return { name: match.name, url: null };

  } catch (error) {
    console.error('DROPBOX ERROR:', error.message);
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
// Simple deduplication map
const recentPosts = new Map();

app.post('/post-content', async (req, res) => {
  console.log('POST COMMAND TRIGGERED');
  
  // Deduplicate — ignore same filename within 3 seconds
  const key = (req.body.filename||req.body.description||'').toLowerCase().trim();
  const now = Date.now();
  if(recentPosts.has(key) && now - recentPosts.get(key) < 3000){
    console.log('DUPLICATE IGNORED:', key);
    return res.json({ success: true, message: 'Duplicate ignored', filename: key });
  }
  recentPosts.set(key, now);
  setTimeout(()=>recentPosts.delete(key), 5000);
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

    // Respond to HALO immediately — don't wait for Make.com
    res.json({ success: true, message: 'Content queued', filename: resolvedFilename, url: resolvedUrl });

    // Send to Make.com in background — no timeout issues
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.text()).then(t => {
      console.log('Make.com response:', t);
    }).catch(e => {
      console.log('Make.com error:', e.message);
    });
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
