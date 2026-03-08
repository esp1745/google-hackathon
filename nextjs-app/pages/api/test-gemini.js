import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  try {
    // Check if API key exists
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        status: 'error',
        message: 'GOOGLE_API_KEY not configured in .env.local',
        apiKey: 'NOT_SET'
      });
    }

    const apiKeyPreview = process.env.GOOGLE_API_KEY.substring(0, 10) + '...' + process.env.GOOGLE_API_KEY.substring(process.env.GOOGLE_API_KEY.length - 4);

    // Try to initialize the API
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Try to get a model
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    
    // Try a simple test
    const result = await model.generateContent('Say "Hello, API is working!" in one sentence.');
    const response = result.response;
    const text = response.text();

    return res.status(200).json({
      status: 'success',
      message: 'API connection successful!',
      apiKey: apiKeyPreview,
      model: 'gemini-pro',
      testResponse: text,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
      errorType: error.constructor.name,
      apiKey: process.env.GOOGLE_API_KEY ? 
        process.env.GOOGLE_API_KEY.substring(0, 10) + '...' : 'NOT_SET',
      stack: error.stack
    });
  }
}
