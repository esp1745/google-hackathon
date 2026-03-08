import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { visualDescription, industry, sceneNumber } = req.body;

  if (!visualDescription) {
    return res.status(400).json({ error: 'Visual description required' });
  }

  try {
    // Generate an image using Gemini's imagen capability
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Create an enhanced prompt for text-to-image generation
    const imagePrompt = `Create a cinematic, professional marketing scene image: ${visualDescription}. 
Style: modern, clean, professional ${industry || 'business'} aesthetic. 
Camera: medium shot, well-lit, high quality. 
Mood: engaging, professional, polished brand imagery.`;

    // For now, we'll generate a data URL with SVG (multimodal placeholder)
    // In production, you'd use Vertex AI Imagen or similar
    const svgImage = generateSceneSVG(sceneNumber, visualDescription, industry);
    
    res.status(200).json({ 
      imageUrl: svgImage,
      prompt: imagePrompt,
      format: 'svg'
    });
  } catch (error) {
    console.error('Error generating scene image:', error);
    
    // Fallback: return a gradient-based placeholder
    const fallbackSvg = generateSceneSVG(req.body.sceneNumber || 1, visualDescription, industry);
    res.status(200).json({ 
      imageUrl: fallbackSvg,
      prompt: visualDescription,
      format: 'svg',
      fallback: true
    });
  }
}

function generateSceneSVG(sceneNumber, description, industry) {
  // Generate unique gradient colors based on scene number
  const gradients = [
    { from: '#6366F1', to: '#3B82F6' }, // Electric Indigo to Blue
    { from: '#8B5CF6', to: '#6366F1' }, // Purple to Indigo
    { from: '#3B82F6', to: '#8B5CF6' }, // Blue to Purple
    { from: '#6366F1', to: '#8B5CF6' }, // Indigo to Purple
    { from: '#3B82F6', to: '#6366F1' }, // Blue to Indigo
  ];
  
  const gradient = gradients[(sceneNumber - 1) % gradients.length];
  
  // Extract key words from description for visual elements
  const words = description.toLowerCase().split(' ');
  const hasProduct = words.some(w => ['product', 'device', 'app', 'platform', 'solution'].includes(w));
  const hasPeople = words.some(w => ['person', 'people', 'user', 'customer', 'team'].includes(w));
  const hasData = words.some(w => ['data', 'analytics', 'chart', 'graph', 'metrics'].includes(w));
  
  // Create SVG with scene-specific elements
  const svg = `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad${sceneNumber}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${gradient.from};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${gradient.to};stop-opacity:1" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Background -->
    <rect width="1280" height="720" fill="url(#grad${sceneNumber})"/>
    
    <!-- Noise texture overlay -->
    <rect width="1280" height="720" fill="url(#noise)" opacity="0.03"/>
    
    <!-- Scene-specific elements -->
    ${hasProduct ? `
      <rect x="440" y="220" width="400" height="280" rx="20" fill="rgba(255,255,255,0.1)" filter="url(#glow)"/>
      <rect x="480" y="260" width="320" height="200" rx="12" fill="rgba(255,255,255,0.15)"/>
    ` : ''}
    
    ${hasPeople ? `
      <circle cx="500" cy="360" r="60" fill="rgba(255,255,255,0.15)" filter="url(#glow)"/>
      <circle cx="700" cy="360" r="60" fill="rgba(255,255,255,0.12)" filter="url(#glow)"/>
    ` : ''}
    
    ${hasData ? `
      <rect x="400" y="450" width="80" height="150" rx="8" fill="rgba(255,255,255,0.2)"/>
      <rect x="510" y="380" width="80" height="220" rx="8" fill="rgba(255,255,255,0.25)"/>
      <rect x="620" y="420" width="80" height="180" rx="8" fill="rgba(255,255,255,0.2)"/>
      <rect x="730" y="350" width="80" height="250" rx="8" fill="rgba(255,255,255,0.3)"/>
    ` : ''}
    
    <!-- Ambient shapes -->
    <circle cx="200" cy="150" r="100" fill="rgba(255,255,255,0.08)" filter="url(#glow)"/>
    <circle cx="1080" cy="570" r="120" fill="rgba(255,255,255,0.08)" filter="url(#glow)"/>
    
    <!-- Scene number indicator -->
    <circle cx="100" cy="100" r="40" fill="rgba(255,255,255,0.2)" filter="url(#glow)"/>
    <text x="100" y="115" font-family="Inter, system-ui, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">${sceneNumber}</text>
    
    <!-- Industry/context label -->
    <text x="640" y="680" font-family="Inter, system-ui, sans-serif" font-size="18" font-weight="500" fill="rgba(255,255,255,0.7)" text-anchor="middle">${industry || 'Marketing Campaign'} • Scene ${sceneNumber}</text>
  </svg>`;

  // Convert to data URL
  const base64Svg = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}
