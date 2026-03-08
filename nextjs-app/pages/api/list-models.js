import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  try {
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ error: 'API key not set' });
    }

    // Make direct API call to list models
    const apiKey = process.env.GOOGLE_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'Failed to list models',
        status: response.status,
        details: errorText
      });
    }
    
    const data = await response.json();
    
 const modelList = data.models.map(m => ({
      name: m.name,
      displayName: m.displayName || m.name,
      supportsContent: m.supportedGenerationMethods?.includes('generateContent')
    }));

    return res.status(200).json({
      count: modelList.length,
      models: modelList
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
