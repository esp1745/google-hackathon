import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { industry, product, targetAudience, goal, brandVoice } = req.body;

  if (!industry || !product || !targetAudience || !goal || !brandVoice) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check API key
    if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your_api_key_here') {
      return res.status(500).json({ 
        error: 'API Key not configured', 
        details: 'Please set GOOGLE_API_KEY in .env.local file. Get your key from https://aistudio.google.com/app/apikey' 
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Use Gemini 2.5 Flash (fastest, latest model)
    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    const prompt = `You are an expert marketing strategist. Create a complete campaign for:

Industry: ${industry}
Product: ${product}
Audience: ${targetAudience}
Goal: ${goal}
Voice: ${brandVoice}

Return ONLY valid JSON (no markdown, no code blocks):

{
  "core_narrative": {
    "positioning_statement": "1-2 sentence positioning",
    "brand_story": "2-3 paragraph compelling narrative",
    "unique_value_proposition": "Clear UVP"
  },
  "key_messages": ["Message 1", "Message 2", "Message 3", "Message 4"],
  "social_media_posts": [
    {"platform": "LinkedIn", "copy": "Professional post with hashtags", "hook": "Opening line"},
    {"platform": "Instagram", "copy": "Visual-first copy", "hook": "Scroll-stopper"},
    {"platform": "Twitter/X", "copy": "280 char tweet", "hook": "Thread starter"},
    {"platform": "Facebook", "copy": "Community post", "hook": "Engaging opener"}
  ],
  "email_sequence": [
    {"email_number": 1, "subject_line": "Subject", "preview_text": "Preview", "body": "Email body", "cta": "CTA"},
    {"email_number": 2, "subject_line": "Subject", "preview_text": "Preview", "body": "Email body", "cta": "CTA"},
    {"email_number": 3, "subject_line": "Subject", "preview_text": "Preview", "body": "Email body", "cta": "CTA"}
  ],
  "landing_page": {
    "headline": "Headline",
    "subheadline": "Subheadline",
    "hero_copy": "Opening paragraph",
    "benefits_section": ["Benefit 1", "Benefit 2", "Benefit 3"],
    "social_proof": "Testimonial",
    "cta_primary": "Primary CTA",
    "cta_secondary": "Secondary CTA"
  },
  "video_storyboard": {
    "title": "Video title",
    "duration": "60 seconds",
    "scenes": [
      {"scene_number": 1, "duration": "5-8s", "visual_description": "Visuals", "voiceover": "Script", "on_screen_text": "Text"},
      {"scene_number": 2, "duration": "8-10s", "visual_description": "Visuals", "voiceover": "Script", "on_screen_text": "Text"},
      {"scene_number": 3, "duration": "8-10s", "visual_description": "Visuals", "voiceover": "Script", "on_screen_text": "Text"},
      {"scene_number": 4, "duration": "8-10s", "visual_description": "Visuals", "voiceover": "Script", "on_screen_text": "Text"},
      {"scene_number": 5, "duration": "5-8s", "visual_description": "Visuals + CTA", "voiceover": "Final script", "on_screen_text": "CTA"}
    ],
    "full_voiceover_script": "Complete script combining all scenes"
  }
}

Rules:
- Use ${brandVoice} tone
- No placeholders like [Name] - use "our product", "Hi there", etc.
- Specific to ${industry} and ${targetAudience}
- Focus on ${goal}
- Ready-to-use content only`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();

    // Remove markdown code blocks if present
    if (text.startsWith('```json')) {
      text = text.substring(7);
    } else if (text.startsWith('```')) {
      text = text.substring(3);
    }
    
    if (text.endsWith('```')) {
      text = text.slice(0, -3);
    }
    
    text = text.trim();

    let campaignData;
    try {
      campaignData = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', text.substring(0, 500));
      return res.status(500).json({ 
        error: 'Invalid response format from AI', 
        details: 'AI returned non-JSON response. Please try again.',
        rawError: parseError.message
      });
    }
    
    res.status(200).json(campaignData);
  } catch (error) {
    console.error('Error generating campaign:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate campaign';
    let errorDetails = error.message;
    
    if (error.message?.includes('API key')) {
      errorMessage = 'Invalid API Key';
      errorDetails = 'Your Google API key appears to be invalid. Get a valid key from https://aistudio.google.com/app/apikey';
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      errorMessage = 'API Quota Exceeded';
      errorDetails = 'You have exceeded your API quota. Check your Google Cloud console.';
    } else if (error.message?.includes('not found') || error.message?.includes('404')) {
      errorMessage = 'Model Not Available';
      errorDetails = 'Please verify: 1) Your API key is valid at https://aistudio.google.com/app/apikey 2) The Generative Language API is enabled in your Google Cloud project 3) Try refreshing your API key';
    } else if (error.message?.includes('permission') || error.message?.includes('403')) {
      errorMessage = 'Permission Denied';
      errorDetails = 'Your API key does not have access to the Gemini API. Generate a new API key from Google AI Studio: https://aistudio.google.com/app/apikey';
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
