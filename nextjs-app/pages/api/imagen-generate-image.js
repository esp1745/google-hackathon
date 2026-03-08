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

    // Imagen 3 API endpoint
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;

    const requestBody = {
      instances: [
        {
          prompt: prompt,
        }
      ],
      parameters: {
        sampleCount: numberOfImages,
        aspectRatio: aspectRatio,
        safetyFilterLevel: 'block_some',
        personGeneration: 'allow_adult',
        negativePrompt: 'blurry, low quality, distorted, ugly'
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
        model: 'imagen-3.0',
        prompt: prompt
      });
    } else {
      throw new Error('No images generated');
    }

  } catch (error) {
    console.error('Imagen generation error:', error);
    
    // Fallback to SVG if Imagen fails
    return res.status(200).json({
      success: false,
      error: error.message,
      fallback: true,
      message: 'Imagen 3 unavailable. Using SVG fallback. Please check Vertex AI setup.',
      setupInstructions: 'Set GOOGLE_CLOUD_PROJECT_ID in .env.local and enable Vertex AI API'
    });
  }
}
