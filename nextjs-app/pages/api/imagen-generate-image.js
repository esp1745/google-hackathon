import { GoogleAuth } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, aspectRatio = '16:9', numberOfImages = 1 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Initialize Vertex AI authentication
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id';
    const location = 'us-central1';

    // Nano Banana 2 API endpoint (Google's latest image generation model)
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`;

    const requestBody = {
      instances: [
        {
          prompt: prompt,
        }
      ],
      parameters: {
        sampleCount: numberOfImages,
        aspectRatio: aspectRatio,
        safetySetting: 'block_some',
        personGeneration: 'allow_adult',
        language: 'en',
        addWatermark: false,
        // Enhanced creative parameters for more interactive, engaging images
        guidanceScale: 12, // Higher guidance for prompt adherence
        seed: Math.floor(Math.random() * 1000000), // Random seed for variety
        numberOfImages: numberOfImages,
        outputMimeType: 'image/png',
        compressionQuality: 100, // Maximum quality
        // Additional style enhancements\n        negativePrompt: 'blurry, low quality, distorted, ugly, amateur, stock photo, generic, boring, static, flat lighting, poor composition',\n        stylePreset: 'photographic' // Photorealistic style for commercial use
      }
    };

    const response = await client.request({
      url: endpoint,
      method: 'POST',
      data: requestBody,
    });

    if (response.data && response.data.predictions) {
      const images = response.data.predictions.map((pred, idx) => ({
        imageUrl: pred.bytesBase64Encoded 
          ? `data:image/png;base64,${pred.bytesBase64Encoded}`
          : pred.gcsUri,
        index: idx
      }));

      return res.status(200).json({
        success: true,
        images: images,
        model: 'nano-banana-2',
        prompt: prompt
      });
    } else {
      throw new Error('No images generated');
    }

  } catch (error) {
    console.error('Nano Banana 2 generation error:', error);
    
    // Fallback to SVG if Nano Banana 2 fails
    return res.status(200).json({
      success: false,
      error: error.message,
      fallback: true,
      message: 'Nano Banana 2 unavailable. Using SVG fallback. Please check Vertex AI setup.',
      setupInstructions: 'Set GOOGLE_CLOUD_PROJECT_ID in .env.local and enable Vertex AI API'
    });
  }
}