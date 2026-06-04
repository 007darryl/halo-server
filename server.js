const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const VOICE_ID = 'QYrOVogqhHWUzdZFXf0E';
const DROPBOX_FOLDER = '/Omkeer Content';

// ── DROPBOX AUTO-REFRESH TOKEN SYSTEM ──
let cachedAccessToken = null;
let tokenExpiry = 0;

async function getDropboxToken() {
  const now = Date.now();

  // Return cached token if still valid (with 5 min buffer)
  if (cachedAccessToken && now < tokenExpiry - 300000) {
    return cachedAccessToken;
  }

  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET;
  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
  const staticToken = process.env.DROPBOX_TOKEN;

  // If we have refresh token credentials, use auto-refresh
  if (appKey && appSecret && refreshToken) {
    console.log('Refreshing Dropbox access token...');
    try {
      const resp = await fetch('https://api.dropbox.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: appKey,
          client_secret: appSecret
        })
      });
      const data = await resp.json();
      if (data.access_token) {
        cachedAccessToken = data.access_token;
        tokenExpiry = now + (data.expires_in || 14400) * 1000;
        console.log('Dropbox token refreshed successfully. Expires in:', data.expires_in, 'seconds');
        return cachedAccessToken;
      }
      console.error('Token refresh failed:', JSON.stringify(data));
    } catch(e) {
      console.error('Token refresh exception:', e.message);
    }
  }

  // Fallback to static token
  if (staticToken) {
    console.log('Using static DROPBOX_TOKEN');
    return staticToken;
  }

  return null;
}

// ── ONE-TIME: Exchange auth code for refresh token ──
app.get('/dropbox-setup', async (req, res) => {
  const code = req.query.code;
  const appKey = process.env.DROPBOX_APP_KEY;
  const appSecret = process.env.DROPBOX_APP_SECRET;

  if (!code) {
    const authUrl = `https://www.dropbox.com/oauth2/authorize?client_id=${appKey}&response_type=code&token_access_type=offline`;
    return res.send(`
      <h2>HALO Dropbox Setup</h2>
      <p>Step 1: <a href="${authUrl}" target="_blank">Click here to authorize Dropbox</a></p>
      <p>Step 2: Copy the code from Dropbox and visit:<br>
      <code>${req.protocol}://${req.get('host')}/dropbox-setup?code=YOUR_CODE_HERE</code></p>
    `);
  }

  try {
    const resp = await fetch('https://api.dropbox.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: appKey,
        client_secret: appSecret
      })
    });
    const data = await resp.json();
    if (data.refresh_token) {
      res.send(`
        <h2>✅ Success!</h2>
        <p>Add this to Render Environment Variables:</p>
        <p><strong>DROPBOX_REFRESH_TOKEN</strong> = <code>${data.refresh_token}</code></p>
        <p>Access token (temporary): <code>${data.access_token}</code></p>
        <p>After adding to Render, Dropbox tokens will auto-refresh forever!</p>
      `);
    } else {
      res.send(`<h2>❌ Failed</h2><pre>${JSON.stringify(data, null, 2)}</pre>`);
    }
  } catch(e) {
    res.send(`<h2>❌ Error</h2><p>${e.message}</p>`);
  }
});

// ── DROPBOX: Search for file and get direct image URL ──
async function findDropboxFile(searchTerm) {
  const token = await getDropboxToken();

  console.log('=== DROPBOX PIPELINE START ===');
  console.log('TOKEN EXISTS:', !!token);
  console.log('SEARCH TERM:', searchTerm);

  if (!token) {
    return { name: null, url: null, error: 'No Dropbox token. Visit /dropbox-setup to configure.' };
  }

  try {
    // List folder
    const listResp = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ path: DROPBOX_FOLDER, recursive: false })
    });

    const listText = await listResp.text();
    console.log('LIST FOLDER STATUS:', listResp.status);

    if (listResp.status === 401) {
      // Token expired — force refresh on next call
      cachedAccessToken = null;
      tokenExpiry = 0;
      console.error('Token expired — will refresh on next request');
      return { name: null, url: null, error: 'Dropbox token expired. If using refresh token, retry in a moment.' };
    }

    if (listResp.status !== 200) {
      console.error('LIST FOLDER ERROR:', listText.substring(0, 300));
      return { name: null, url: null, error: `Dropbox list_folder failed: ${listText.substring(0, 200)}` };
    }

    let listData;
    try { listData = JSON.parse(listText); }
    catch(e) { return { name: null, url: null, error: 'Cannot parse Dropbox response' }; }

    if (!listData.entries || listData.entries.length === 0) {
      return { name: null, url: null, error: 'Dropbox folder is empty or inaccessible' };
    }

    const fileNames = listData.entries.map(e => e.name);
    console.log('FILES IN FOLDER:', fileNames);

    // Fuzzy match
    const normalize = s => s.toLowerCase().replace(/[-_.\s]+/g, ' ').trim();
    const normalizeNoExt = s => normalize(s).replace(/\.(jpg|jpeg|png|gif|mp4|mov|webp|heic)$/i, '');
    const search = normalize(searchTerm);
    const entries = listData.entries;

    let match =
      entries.find(e => normalize(e.name) === search) ||
      entries.find(e => normalizeNoExt(e.name) === search) ||
      entries.find(e => normalize(e.name).includes(search)) ||
      entries.find(e => normalizeNoExt(e.name).includes(search)) ||
      entries.find(e => {
        const words = search.split(' ').filter(w => w.length > 2);
        return words.length > 0 && words.every(w => normalizeNoExt(e.name).includes(w));
      }) ||
      entries.find(e => {
        const words = search.split(' ').filter(w => w.length > 2);
        return words.some(w => normalizeNoExt(e.name).includes(w));
      });

    if (!match) {
      console.error('NO MATCH. Available:', fileNames);
      return { name: null, url: null, error: `No file matching "${searchTerm}". Available: ${fileNames.join(', ')}` };
    }

    console.log('MATCHED:', match.name, 'at', match.path_lower);

    // Get temporary link
    const tlResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ path: match.path_lower })
    });

    const tlText = await tlResp.text();
    console.log('TEMP LINK STATUS:', tlResp.status);
    console.log('TEMP LINK RESPONSE:', tlText.substring(0, 300));

    if (tlResp.status === 401) {
      cachedAccessToken = null; tokenExpiry = 0;
      return { name: match.name, url: null, error: 'Token expired on temp link — will auto-refresh' };
    }

    let tlData;
    try { tlData = JSON.parse(tlText); } catch(e) { return { name: match.name, url: null, error: 'Cannot parse temp link response' }; }

    if (tlData.link) {
      console.log('RESOLVED URL:', tlData.link.substring(0, 80));
      return { name: match.name, url: tlData.link, error: null };
    }

    // Fallback: try shared link
    console.log('Temp link failed, trying shared link...');
    const existResp = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ path: match.path_lower, direct_only: true })
    });
    if (existResp.status === 200) {
      const existData = await existResp.json();
      if (existData.links && existData.links.length > 0) {
        const url = existData.links[0].url.replace('www.dropbox.com','dl.dropboxusercontent.com').replace('?dl=0','');
        console.log('RESOLVED via shared link');
        return { name: match.name, url, error: null };
      }
    }

    const createResp = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ path: match.path_lower, settings: { requested_visibility: 'public', audience: 'public', access: 'viewer' } })
    });
    const createText = await createResp.text();
    try {
      const createData = JSON.parse(createText);
      if (createData.url) {
        const url = createData.url.replace('www.dropbox.com','dl.dropboxusercontent.com').replace('?dl=0','');
        return { name: match.name, url, error: null };
      }
      if (createData.error?.['.tag'] === 'shared_link_already_exists') {
        const url = createData.error.shared_link_already_exists?.metadata?.url
          ?.replace('www.dropbox.com','dl.dropboxusercontent.com').replace('?dl=0','');
        if (url) return { name: match.name, url, error: null };
      }
    } catch(e) {}

    return { name: match.name, url: null, error: `File found (${match.name}) but URL generation failed. Error: ${tlText.substring(0,200)}` };

  } catch (error) {
    console.error('DROPBOX EXCEPTION:', error.message);
    return { name: null, url: null, error: `Dropbox exception: ${error.message}` };
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
      body: JSON.stringify({ model: 'claude-sonnet-4-5', max_tokens: 1500, system: req.body.system || 'You are HALO.', messages: req.body.messages || [] })
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { return res.status(500).json({ error: 'Parse error' }); }
    if (data.error) return res.status(400).json({ error: JSON.stringify(data.error) });
    if (data.content) for (const b of data.content) if (b.type === 'text' && b.text) return res.json({ reply: b.text });
    res.status(500).json({ error: 'No text in response' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── SPEAK ──
app.post('/speak', async (req, res) => {
  try {
    const elevenKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenKey) return res.status(400).json({ error: 'No ElevenLabs key configured' });
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': elevenKey },
      body: JSON.stringify({ text: req.body.text || '', model_id: 'eleven_turbo_v2_5', voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
    });
    if (!response.ok) { const err = await response.text(); return res.status(400).json({ error: err }); }
    const buf = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(buf));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ── TIME PARSER ──
function parseScheduledTime(text) {
  if (!text) return null;
  const now = new Date();
  const la = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

  // Match patterns like "at 8pm", "at 8:30pm", "at 20:00", "tomorrow at 6pm", "friday at noon"
  const timeMatch = text.match(/(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  const tomorrowMatch = text.match(/tomorrow/i);
  const dayMatch = text.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  const noonMatch = text.match(/noon/i);
  const midnightMatch = text.match(/midnight/i);

  if (!timeMatch && !noonMatch && !midnightMatch) return null;

  let hours = noonMatch ? 12 : midnightMatch ? 0 : parseInt(timeMatch[1]);
  let minutes = timeMatch && timeMatch[2] ? parseInt(timeMatch[2]) : 0;
  const meridiem = timeMatch && timeMatch[3] ? timeMatch[3].toLowerCase() : null;

  // Convert to 24hr
  if (meridiem === 'pm' && hours !== 12) hours += 12;
  if (meridiem === 'am' && hours === 12) hours = 0;
  // If no am/pm and hour < 8, assume pm (nobody posts at 3am)
  if (!meridiem && hours > 0 && hours < 8) hours += 12;

  // Build target date in LA timezone
  let target = new Date(la);
  target.setHours(hours, minutes, 0, 0);

  // Handle tomorrow
  if (tomorrowMatch) {
    target.setDate(target.getDate() + 1);
  }

  // Handle day of week
  if (dayMatch) {
    const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const targetDay = days.indexOf(dayMatch[1].toLowerCase());
    const currentDay = la.getDay();
    let daysAhead = targetDay - currentDay;
    if (daysAhead <= 0) daysAhead += 7;
    target.setDate(target.getDate() + daysAhead);
  }

  // If time has already passed today, schedule for tomorrow
  if (!tomorrowMatch && !dayMatch && target <= la) {
    target.setDate(target.getDate() + 1);
  }

  // Return ISO string
  console.log('Scheduled time parsed:', target.toISOString(), 'LA time:', target.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  return target.toISOString();
}

// ── POST CONTENT ──
const recentPosts = new Map();

app.post('/post-content', async (req, res) => {
  console.log('=== POST CONTENT TRIGGERED ===');

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

    const { description, filename, platforms, scheduled_at, command_text } = req.body;
    let resolvedFilename = filename || description || '';
    let resolvedUrl = null;
    let dropboxError = null;

    if (filename) {
      const result = await findDropboxFile(filename);
      console.log('Dropbox Search Result:', JSON.stringify(result));
      resolvedFilename = result.name || filename;
      resolvedUrl = result.url || null;
      dropboxError = result.error || null;
    }

    console.log('Resolved Filename:', resolvedFilename);
    console.log('Resolved Image URL:', resolvedUrl);

    if (!resolvedUrl) {
      const reason = dropboxError || 'Could not generate image URL';
      console.error('POSTING BLOCKED:', reason);
      return res.status(400).json({ success: false, error: reason, filename: resolvedFilename });
    }

    // Parse scheduled time from command
    // If command contains "now" or no time — leave scheduled_at empty
    // If command contains "at [time]" — parse and include scheduled_at
    let scheduledAt = null;
    const cmdText = (command_text || '').toLowerCase();
    const hasNow = /\bnow\b/.test(cmdText);
    const hasTime = /\bat\s+\d/.test(cmdText) || /\bat\s+(noon|midnight)/.test(cmdText);

    if (!hasNow && hasTime) {
      scheduledAt = parseScheduledTime(cmdText);
      if (scheduledAt) {
        const laTime = new Date(scheduledAt).toLocaleString('en-US', { timeZone: 'America/Los_Angeles', dateStyle: 'medium', timeStyle: 'short' });
        console.log('POST SCHEDULED FOR:', laTime, '| ISO:', scheduledAt);
      }
    } else {
      console.log('POST IMMEDIATE — no scheduled_at sent');
    }

    const payload = {
      description: description || resolvedFilename || '',
      filename: resolvedFilename || '',
      image_url: resolvedUrl,
      platforms: platforms || 'Instagram, TikTok, Pinterest'
    };

    // Only add scheduled_at if a time was specified
    if (scheduledAt) {
      payload.scheduled_at = scheduledAt;
    }

    console.log('Post Payload:', JSON.stringify(payload));

    res.json({ success: true, message: scheduledAt ? `Scheduled for ${new Date(scheduledAt).toLocaleString('en-US',{timeZone:'America/Los_Angeles',dateStyle:'medium',timeStyle:'short'})}` : 'Content queued — posting now', filename: resolvedFilename, url: resolvedUrl, scheduled_at: scheduledAt || null });

    // ── SEND TO MAKE.COM with full debugging ──
    console.log('=== SENDING TO MAKE.COM ===');
    console.log('Webhook URL:', webhookUrl.substring(0, 50) + '...');
    console.log('Payload keys:', Object.keys(payload));
    console.log('image_url present:', !!payload.image_url);
    console.log('scheduled_at value:', payload.scheduled_at);

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(async r => {
      const status = r.status;
      const text = await r.text();
      console.log('=== MAKE.COM RESPONSE ===');
      console.log('Status:', status);
      console.log('Response:', text);
      if (status !== 200) {
        console.error('Make.com returned non-200 status:', status, text);
      }
    }).catch(e => {
      console.error('=== MAKE.COM FETCH ERROR ===');
      console.error('Error:', e.message);
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
Return ONLY a JSON object: {"caption":"...","hashtags":"#tag1 #tag2","full_post":"caption + hashtags"}
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
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/', (req, res) => res.send('HALO Server Online'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HALO Server running on port ${PORT}`));
