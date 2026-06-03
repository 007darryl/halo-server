const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const VOICE_ID = 'QYrOVogqhHWUzdZFXf0E';

// Saved HALO places.
// Update these later with exact addresses if you want more precision.
const SAVED_PLACES = {
  home: 'Sylmar, CA',
  work: 'Santa Clarita, CA',
  gym: 'Planet Fitness, Sylmar, CA',
  planetfitness: 'Planet Fitness, Sylmar, CA',
  lax: 'Los Angeles International Airport',
  beach: 'Santa Monica Pier',
  santamonica: 'Santa Monica Pier',
  dodgers: 'Dodger Stadium',
  dodgerstadium: 'Dodger Stadium'
};

function resolvePlaceName(value) {
  if (!value) return value;
  const raw = String(value).trim();
  const key = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
  return SAVED_PLACES[key] || raw;
}

function parseGoogleSeconds(value) {
  return parseInt(String(value || '0s').replace('s', ''), 10) || 0;
}

function trafficLevelFromDelay(delaySeconds) {
  if (delaySeconds >= 1200) return 'Heavy';
  if (delaySeconds >= 600) return 'Moderate';
  if (delaySeconds >= 180) return 'Light';
  return 'Clear';
}

// ── DROPBOX: Search for file and get direct image URL ──
async function findDropboxFile(searchTerm) {
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
    const listResp = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ path: FOLDER, recursive: false })
    });

    const listText = await listResp.text();
    console.log('LIST FOLDER STATUS:', listResp.status);
    console.log('LIST FOLDER RAW:', listText.substring(0, 500));

    let listData;
    try {
      listData = JSON.parse(listText);
    } catch (e) {
      console.error('DROPBOX ERROR: Could not parse list_folder response');
      return { name: null, url: null };
    }

    if (!listData.entries) {
      console.error('DROPBOX ERROR: No entries in folder response:', JSON.stringify(listData));
      return { name: null, url: null };
    }

    console.log('FILES IN FOLDER:', listData.entries.map(e => e.name));

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

    const tlResp = await fetch('https://api.dropboxapi.com/2/files/get_temporary_link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ path: match.path_lower })
    });

    const tlText = await tlResp.text();
    console.log('DROPBOX TEMP LINK STATUS:', tlResp.status);
    console.log('DROPBOX TEMP LINK RESPONSE:', tlText.substring(0, 400));

    let tlData;
    try {
      tlData = JSON.parse(tlText);
    } catch (e) {
      console.error('DROPBOX ERROR: Could not parse temp link response');
      return { name: match.name, url: null };
    }

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
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({ error: 'Parse error' });
    }

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
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': elevenKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
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

// ── POST CONTENT ──
const recentPosts = new Map();

app.post('/post-content', async (req, res) => {
  console.log('POST COMMAND TRIGGERED');

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
    if (!webhookUrl) return res.status(400).json({ error: 'No webhook configured' });

    const { description, filename, platforms } = req.body;

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

    res.json({
      success: true,
      message: 'Content queued',
      filename: resolvedFilename,
      url: resolvedUrl
    });

    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => r.text())
      .then(t => console.log('Make.com response:', t))
      .catch(e => console.log('Make.com error:', e.message));

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
    if (data.content) {
      for (const b of data.content) {
        if (b.type === 'text') {
          text = b.text;
          break;
        }
      }
    }

    try {
      res.json(JSON.parse(text.replace(/```json|```/g, '').trim()));
    } catch (e) {
      res.json({
        caption: text,
        hashtags: '',
        full_post: text
      });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── GOOGLE GEOCODING HELPER ──
async function geocodeAddress(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const resolved = resolvePlaceName(address);

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', resolved);
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK' || !data.results?.[0]) {
    throw new Error(`Geocoding failed for ${resolved}: ${data.status || 'UNKNOWN'}`);
  }

  const result = data.results[0];

  return {
    query: address,
    resolved,
    formatted_address: result.formatted_address,
    location: result.geometry.location
  };
}

// ── ROUTE INTEL — Google Routes API ──
app.post('/route-intel', async (req, res) => {
  try {
    const { origin = 'Sylmar, CA', destination, alternatives = true } = req.body;

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({
        error: 'Missing GOOGLE_MAPS_API_KEY in Render environment variables'
      });
    }

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    const resolvedOrigin = resolvePlaceName(origin);
    const resolvedDestination = resolvePlaceName(destination);

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': [
          'routes.duration',
          'routes.staticDuration',
          'routes.distanceMeters',
          'routes.description',
          'routes.polyline.encodedPolyline',
          'routes.legs.startLocation',
          'routes.legs.endLocation',
          'routes.routeLabels'
        ].join(',')
      },
      body: JSON.stringify({
        origin: { address: resolvedOrigin },
        destination: { address: resolvedDestination },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
        computeAlternativeRoutes: Boolean(alternatives)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GOOGLE ROUTES ERROR:', JSON.stringify(data));
      return res.status(response.status).json(data);
    }

    const routes = data.routes || [];

    if (!routes.length) {
      return res.status(404).json({ error: 'No route found' });
    }

    const formattedRoutes = routes.map((route, index) => {
      const trafficSeconds = parseGoogleSeconds(route.duration);
      const normalSeconds = parseGoogleSeconds(route.staticDuration);
      const delaySeconds = Math.max(trafficSeconds - normalSeconds, 0);
      const endLocation = route.legs?.[0]?.endLocation?.latLng || null;
      const startLocation = route.legs?.[0]?.startLocation?.latLng || null;

      return {
        route_index: index,
        label: index === 0 ? 'Recommended' : `Option ${index + 1}`,
        description: route.description || (index === 0 ? 'Best available route' : `Alternative route ${index + 1}`),
        eta_minutes: Math.round(trafficSeconds / 60),
        normal_minutes: Math.round(normalSeconds / 60),
        delay_minutes: Math.round(delaySeconds / 60),
        distance_miles: Number((route.distanceMeters / 1609.34).toFixed(1)),
        traffic_level: trafficLevelFromDelay(delaySeconds),
        polyline: route.polyline?.encodedPolyline || null,
        start_location: startLocation,
        end_location: endLocation,
        route_labels: route.routeLabels || []
      };
    });

    const primary = formattedRoutes[0];

    res.json({
      success: true,
      origin: resolvedOrigin,
      destination: resolvedDestination,
      requested_origin: origin,
      requested_destination: destination,
      ...primary,
      routes: formattedRoutes
    });

  } catch (error) {
    console.error('ROUTE INTEL ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── PLACES NEARBY — Gas / Parking / Useful Stops ──
app.post('/places-nearby', async (req, res) => {
  try {
    const { destination, location, type = 'gas', radius = 2500, max_results = 8 } = req.body;

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({
        error: 'Missing GOOGLE_MAPS_API_KEY in Render environment variables'
      });
    }

    let center = location;

    if (!center && destination) {
      const geo = await geocodeAddress(destination);
      center = {
        latitude: geo.location.lat,
        longitude: geo.location.lng
      };
    }

    if (!center?.latitude || !center?.longitude) {
      return res.status(400).json({
        error: 'Provide destination or location {latitude, longitude}'
      });
    }

    const includedType =
      String(type).toLowerCase().includes('park') ? 'parking' :
      String(type).toLowerCase().includes('gas') ? 'gas_station' :
      'gas_station';

    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.location',
          'places.rating',
          'places.googleMapsUri',
          'places.types'
        ].join(',')
      },
      body: JSON.stringify({
        includedTypes: [includedType],
        maxResultCount: Math.min(Number(max_results) || 8, 20),
        locationRestriction: {
          circle: {
            center,
            radius: Math.min(Number(radius) || 2500, 50000)
          }
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GOOGLE PLACES ERROR:', JSON.stringify(data));
      return res.status(response.status).json(data);
    }

    const places = (data.places || []).map(place => ({
      id: place.id,
      name: place.displayName?.text || 'Unknown place',
      address: place.formattedAddress || '',
      rating: place.rating || null,
      location: place.location || null,
      google_maps_url: place.googleMapsUri || null,
      types: place.types || []
    }));

    res.json({
      success: true,
      type: includedType,
      center,
      count: places.length,
      places
    });

  } catch (error) {
    console.error('PLACES NEARBY ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── ROUTE PLUS — Route + Gas + Parking in one call ──
app.post('/route-plus', async (req, res) => {
  try {
    const { origin = 'Sylmar, CA', destination } = req.body;

    if (!destination) {
      return res.status(400).json({ error: 'Destination is required' });
    }

    const routeResp = await fetch(`${req.protocol}://${req.get('host')}/route-intel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, alternatives: true })
    });

    const routeData = await routeResp.json();

    if (!routeResp.ok || !routeData.success) {
      return res.status(routeResp.status).json(routeData);
    }

    const end = routeData.end_location;
    const center = end ? {
      latitude: end.latitude,
      longitude: end.longitude
    } : null;

    let gas = [];
    let parking = [];

    if (center) {
      const [gasResp, parkingResp] = await Promise.all([
        fetch(`${req.protocol}://${req.get('host')}/places-nearby`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: center, type: 'gas', radius: 3500, max_results: 5 })
        }),
        fetch(`${req.protocol}://${req.get('host')}/places-nearby`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ location: center, type: 'parking', radius: 2500, max_results: 5 })
        })
      ]);

      const gasData = await gasResp.json();
      const parkingData = await parkingResp.json();

      gas = gasData.places || [];
      parking = parkingData.places || [];
    }

    res.json({
      success: true,
      route: routeData,
      gas,
      parking
    });

  } catch (error) {
    console.error('ROUTE PLUS ERROR:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── SAVED PLACES ──
app.get('/saved-places', (req, res) => {
  res.json({
    success: true,
    saved_places: SAVED_PLACES
  });
});

app.get('/', (req, res) => res.send('HALO Server Online'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HALO Server running on port ${PORT}`));
