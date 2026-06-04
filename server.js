const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const VOICE_ID = 'QYrOVogqhHWUzdZFXf0E';
const DROPBOX_FOLDER = '/Omkeer Content';

// ── DROPBOX: Full pipeline with fallback chain ──
async function findDropboxFile(searchTerm) {
  const token = process.env.DROPBOX_TOKEN;

  console.log('=== DROPBOX PIPELINE START ===');
  console.log('DROPBOX TOKEN EXISTS:', !!token);
  console.log('TOKEN LENGTH:', token ? token.length : 0);
  console.log('SEARCH TERM:', searchTerm);

  if (!token) {
    return { name: null, url: null, error: 'No DROPBOX_TOKEN in environment variables' };
  }

  try {
    // ── STEP 1: List folder ──
    console.log('STEP 1: Listing folder:', DROPBOX_FOLDER);
    const listResp = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ path: DROPBOX_FOLDER, recursive: false })
    });

    const listText = await listResp.text();
    console.log('LIST FOLDER STATUS:', listResp.status);

    if (listResp.status === 401) {
      console.error('DROPBOX ERROR: Token expired or invalid — regenerate at dropbox.com/developers');
      return { name: null, url: null, error: 'Dropbox token expired. Regenerate at dropbox.com/developers and update DROPBOX_TOKEN in Render.' };
    }

    if (listResp.status !== 200) {
      console.error('LIST FOLDER ERROR:', listText.substring(0, 300));
      return { name: null, url: null, error: `Dropbox list_folder failed with status ${listResp.status}: ${listText.substring(0, 200)}` };
    }

    let listData;
    try { listData = JSON.parse(listText); }
    catch(e) {
      console.error('DROPBOX ERROR: Cannot parse list_folder response');
      return { name: null, url: null, error: 'Cannot parse Dropbox response' };
    }

    if (!listData.entries || listData.entries.length === 0) {
      console.error('DROPBOX ERROR: Folder is empty or no entries returned');
      return { name: null, url: null, error: 'Dropbox folder is empty or inaccessible' };
    }

    const fileNames = listData.entries.map(e => e.name);
    console.log('FILES IN FOLDER:', fileNames);

    // ── STEP 2: Fuzzy match ──
    console.log('STEP 2: Fuzzy matching:', searchTerm);
    const normalize = s => s.toLowerCase().replace(/[-_.\s]+/g, ' ').trim();
    // Strip file extension for matching
    const normalizeNoExt = s => normalize(s).replace(/\.(jpg|jpeg|png|gif|mp4|mov|webp|heic)$/i, '');
    const search = normalize(searchTerm);
    const entries = listData.entries;

    let match =
      // 1. Exact match (with or without extension)
      entries.find(e => normalize(e.name) === search) ||
      entries.find(e => normalizeNoExt(e.name) === search) ||
      // 2. Partial contains
      entries.find(e => normalize(e.name).includes(search)) ||
      entries.find(e => normalizeNoExt(e.name).includes(search)) ||
      // 3. All words match
      entries.find(e => {
        const words = search.split(' ').filter(w => w.length > 2);
        return words.length > 0 && words.every(w => normalizeNoExt(e.name).includes(w));
      }) ||
      // 4. Any word match
      entries.find(e => {
        const words = search.split(' ').filter(w => w.length > 2);
        return words.some(w => normalizeNoExt(e.name).includes(w));
      });

    if (!match) {
      console.error('DROPBOX ERROR: No file matched search term:', search);
      console.error('Available files:', fileNames);
      return { name: null, url: null, error: `No file matching "${searchTerm}" found in Dropbox. Available files: ${fileNames.join(', ')}` };
    }

    console.log('DROPBOX FILE MATCH:', match.name, 'path:', match.path_lower);

    // ── STEP 3: Get temporary link ──
    console.log('STEP 3: Getting temporary download link for:', match.path_lower);
    const tlResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ path: match.path_lower })
    });

    const tlText = await tlResp.text();
    console.log('TEMP LINK STATUS:', tlResp.status);
    console.log('TEMP LINK RESPONSE:', tlText.substring(0, 400));

    if (tlResp.status === 401) {
      return { name: match.name, url: null, error: 'Dropbox token expired on get_temporary_link call' };
    }

    let tlData;
    try { tlData = JSON.parse(tlText); }
    catch(e) {
      console.error('DROPBOX ERROR: Cannot parse temp link response');
      return { name: match.name, url: null, error: 'Cannot parse temp link response' };
    }

    if (tlData.link) {
      console.log('RESOLVED IMAGE URL:', tlData.link.substring(0, 80) + '...');
      console.log('=== DROPBOX PIPELINE SUCCESS ===');
      return { name: match.name, url: tlData.link, error: null };
    }

    // ── STEP 4: Fallback — try shared link ──
    console.log('STEP 4: Temp link failed, trying shared link fallback...');
    console.log('Temp link error:', JSON.stringify(tlData));

    // Try listing existing shared links first
    const existResp = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ path: match.path_lower, direct_only: true })
    });
    const existText = await existResp.text();
    console.log('LIST SHARED LINKS STATUS:', existResp.status);

    if (existResp.status === 200) {
      try {
        const existData = JSON.parse(existText);
        if (existData.links && existData.links.length > 0) {
          const sharedUrl = existData.links[0].url
            .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
            .replace('?dl=0', '').replace('dl=0', '');
          console.log('RESOLVED via existing shared link:', sharedUrl.substring(0, 80));
          return { name: match.name, url: sharedUrl, error: null };
        }
      } catch(e) {}
    }

    // Try creating a new shared link
    const createResp = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        path: match.path_lower,
        settings: { requested_visibility: 'public', audience: 'public', access: 'viewer' }
      })
    });
    const createText = await createResp.text();
    console.log('CREATE SHARED LINK STATUS:', createResp.status);

    try {
      const createData = JSON.parse(createText);
      if (createData.url) {
        const sharedUrl = createData.url
          .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
          .replace('?dl=0', '');
        console.log('RESOLVED via new shared link:', sharedUrl.substring(0, 80));
        return { name: match.name, url: sharedUrl, error: null };
      }
      // Handle already exists
      if (createData.error && createData.error['.tag'] === 'shared_link_already_exists') {
        const existing = createData.error.shared_link_already_exists;
        if (existing && existing.metadata && existing.metadata.url) {
          const sharedUrl = existing.metadata.url
            .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
            .replace('?dl=0', '');
          console.log('RESOLVED via already-exists shared link');
          return { name: match.name, url: sharedUrl, error: null };
        }
      }
    } catch(e) {}

    const finalError = `File found (${match.name}) but could not generate URL. Check Dropbox permissions: files.content.read required.`;
    console.error('DROPBOX PIPELINE FAILED:', finalError);
    return { name: match.name, url: null, error: finalError };

  } catch (error) {
    console.error('DROPBOX PIPELINE EXCEPTION:', error.message);
    return { name: null, url: null, error: `Dropbox pipeline exception: ${error.message}` };
  }
}

// ── CHAT ──
app.post('/chat', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(400).json({ error: 'No API key configured' });
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5', max_tokens: 1500,
        system: req.body.system || 'You are HALO, a helpful AI assistant.',
        messages: req.body.messages || []
      })
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { return res.status(500).json({ error: 'Parse error' }); }
    if (data.error) return res.status(400).json({ error: JSON.stringify(data.error) });
    if (data.content && Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === 'text' && block.text) return res.json({ reply: block.text });
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

// ── POST CONTENT ──
const recentPosts = new Map();

app.post('/post-content', async (req, res) => {
  console.log('=== POST CONTENT TRIGGERED ===');
  console.log('Request body:', JSON.stringify(req.body));

  // Deduplicate
  const key = (req.body.filename || req.body.description || '').toLowerCase().trim();
  const now = Date.now();
  if (recentPosts.has(key) && now - recentPosts.get(key) < 3000) {
    console.log('DUPLICATE IGNORED:', key);
    return res.json({ success: true, message: 'Duplicate ignored', filename: key });
  }
  recentPosts.set(key, now);
  setTimeout(() => recentPosts.delete(key), 5000);

  try {
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    if (!webhookUrl) return res.status(400).json({ error: 'No MAKE_WEBHOOK_URL configured' });

    const { description, filename, platforms } = req.body;

    let resolvedFilename = filename || description || '';
    let resolvedUrl = null;
    let dropboxError = null;

    // ── Search Dropbox ──
    if (filename) {
      console.log('Searching Dropbox for:', filename);
      const result = await findDropboxFile(filename);
      console.log('Dropbox Search Result:', JSON.stringify(result));

      resolvedFilename = result.name || filename;
      resolvedUrl = result.url || null;
      dropboxError = result.error || null;
    }

    console.log('Resolved Filename:', resolvedFilename);
    console.log('Resolved Image URL:', resolvedUrl);

    // ── Block posting if no image URL ──
    if (!resolvedUrl) {
      const reason = dropboxError || 'Could not generate image URL from Dropbox';
      console.error('POSTING BLOCKED — no image URL:', reason);
      return res.status(400).json({
        success: false,
        error: reason,
        filename: resolvedFilename,
        url: null
      });
    }

    // ── Validate URL ──
    try {
      new URL(resolvedUrl);
      console.log('URL VALIDATION: PASSED');
    } catch(e) {
      console.error('URL VALIDATION FAILED:', resolvedUrl);
      return res.status(400).json({ success: false, error: 'Generated URL is invalid', url: resolvedUrl });
    }

    const payload = {
      description: description || resolvedFilename || '',
      filename: resolvedFilename || '',
      image_url: resolvedUrl,
      platforms: platforms || 'Instagram, TikTok, Pinterest'
    };

    console.log('Post Payload:', JSON.stringify(payload));

    // Respond immediately
    res.json({ success: true, message: 'Content queued', filename: resolvedFilename, url: resolvedUrl });

    // Send to Make.com in background
    console.log('Sending to Make.com webhook...');
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.text()).then(t => {
      console.log('Make.com response:', t);
    }).catch(e => {
      console.error('Make.com error:', e.message);
    });

  } catch (error) {
    console.error('POST CONTENT EXCEPTION:', error.message);
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
