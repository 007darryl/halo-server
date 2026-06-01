const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const body = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: req.body.system,
      messages: req.body.messages
    };
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (data.content && Array.isArray(data.content)) {
      const textBlock = data.content.find(b => b.type === 'text');
      if (textBlock && textBlock.text) {
        res.json({ reply: textBlock.text });
        return;
      }
    }
    if (data.error) {
      res.status(400).json({ error: data.error.message });
      return;
    }
    res.json({ reply: 'Systems nominal.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => res.send('HALO Server Online'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HALO Server running on port ${PORT}`));
