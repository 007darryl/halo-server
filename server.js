const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'No API key configured on server' });
    }

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
    console.log('Anthropic raw response:', text.substring(0, 500));
    
    let data;
    try {
      data = JSON.parse(text);
    } catch(e) {
      return res.status(500).json({ error: 'Could not parse Anthropic response', raw: text.substring(0, 200) });
    }

    if (data.error) {
      console.log('Anthropic error:', JSON.stringify(data.error));
      return res.status(400).json({ error: JSON.stringify(data.error) });
    }

    if (data.content && Array.isArray(data.content)) {
      for (let i = 0; i < data.content.length; i++) {
        if (data.content[i].type === 'text' && data.content[i].text) {
          return res.json({ reply: data.content[i].text });
        }
      }
    }

    res.status(500).json({ error: 'No text in response', full: JSON.stringify(data).substring(0, 300) });

  } catch (error) {
    console.log('Server error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.send('HALO Server Online'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HALO Server running on port ${PORT}`));
