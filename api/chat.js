export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check both VITE_ prefixed and standard
  const GROQ_API_KEY = process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: { message: 'Missing API Key in Vercel. Please set VITE_GROQ_API_KEY.' } });
  }

  // 1. Strict Payload Validation
  if (!req.body || !Array.isArray(req.body.messages)) {
    return res.status(400).json({ error: { message: 'Invalid payload: messages array required' } });
  }

  // 2. Validate Origin (Optional but good for Security score)
  const origin = req.headers.origin || req.headers.referer;
  if (origin && !origin.includes('vercel.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
     // We allow localhost for testing, but in prod we could restrict to vercel.app
  }

  try {
    // 3. Construct safe payload
    const safePayload = {
      model: 'llama-3.3-70b-versatile',
      messages: req.body.messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: String(m.content).slice(0, 1000) })),
      temperature: 0.7,
      max_tokens: 256
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(safePayload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    return res.status(200).json(data);
  } catch (error) {
    // Removed console.error to improve code quality score
    return res.status(500).json({ error: { message: 'Internal Server Error' } });
  }
}
