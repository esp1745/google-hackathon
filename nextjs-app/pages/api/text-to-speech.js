export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voice, languageCode, speakingRate, pitch } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Try Google Cloud API key first, fallback to regular API key
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API key not configured',
      fallback: true 
    });
  }

  try {
    // Use Google Cloud Text-to-Speech REST API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: languageCode || 'en-US',
            name: voice || 'en-US-Neural2-F',
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: speakingRate || 1.0,
            pitch: pitch || 0,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Google TTS API Error:', error);
      
      const errorMessage = error.error?.message || 'Failed to generate speech';
      
      return res.status(response.status).json({
        error: errorMessage,
        details: errorMessage,
        fallback: true
      });
    }

    const data = await response.json();

    // Return the audio content as base64
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      audio: data.audioContent,
      contentType: 'audio/mp3'
    });

  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: error.message,
      fallback: true
    });
  }
}
