import { GoogleAuth } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, duration = 5, cameraMotion = 'dynamic', style = 'cinematic' } = req.body;

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

    // Veo 3.1 API endpoint
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/veo-3.1:predict`;

    const requestBody = {
      instances: [
        {
          prompt: prompt,
          parameters: {
            duration: duration,
            aspectRatio: '16:9',
            resolution: '1080p',
            frameRate: 24,
            outputFormat: 'mp4',
            // Enhanced creative parameters for more interactive videos
            cameraMotion: cameraMotion, // 'static', 'dynamic', 'follow', 'orbit'
            style: style, // 'cinematic', 'documentary', 'commercial', 'dramatic'
            quality: 'highest',
            creativity: 0.8, // Higher creativity for more engaging videos
            motionAmount: 'medium-high', // More dynamic movement
            colorGrading: 'professional', // Enhanced color grading
            stabilization: true
          }
        }
      ]
    };

    const response = await client.request({
      url: endpoint,
      method: 'POST',
      data: requestBody,
    });

    if (response.data && response.data.predictions && response.data.predictions[0]) {
      const videoData = response.data.predictions[0];
      
      return res.status(200).json({
        success: true,
        videoUrl: videoData.videoUrl || videoData.gcsUri,
        thumbnail: videoData.thumbnailUrl,
        duration: videoData.duration,
        format: 'mp4',
        model: 'veo-3.1'
      });
    } else {
      throw new Error('No video generated');
    }

  } catch (error) {
    console.error('Veo video generation error:', error);
    
    // Fallback to SVG preview if Veo fails
    return res.status(200).json({
      success: false,
      error: error.message,
      fallback: true,
      message: 'Veo 3.1 unavailable. Using SVG preview. Please check Vertex AI setup.',
      setupInstructions: 'Set GOOGLE_CLOUD_PROJECT_ID in .env.local and enable Vertex AI API'
    });
  }
}
