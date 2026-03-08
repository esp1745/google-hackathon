export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { storyboard, product, industry } = req.body;

  if (!storyboard || !storyboard.scenes) {
    return res.status(400).json({ error: 'Storyboard with scenes is required' });
  }

  try {
    // Generate animated video preview (SVG with animations)
    const videoPreview = generateAnimatedVideoPreview(storyboard, product, industry);
    
    // Generate video frames as individual images
    const frames = storyboard.scenes.map((scene, index) => ({
      sceneNumber: scene.scene_number,
      frame: generateVideoFrame(scene, index, product, industry),
      duration: scene.duration
    }));
    
    return res.status(200).json({
      success: true,
      preview: videoPreview,
      frames: frames,
      totalDuration: storyboard.duration,
      format: 'svg-animated'
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate video',
      details: error.message 
    });
  }
}

function generateAnimatedVideoPreview(storyboard, product, industry) {
  const scenes = storyboard.scenes || [];
  const totalScenes = scenes.length;
  
  // Create a 16:9 animated SVG
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" style="background: #000;">
      <defs>
        <linearGradient id="videoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
        </linearGradient>
        <filter id="videoGlow">
          <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Video Frame -->
      <rect width="1920" height="1080" fill="#000"/>
      
      <!-- Animated Background -->
      <rect x="0" y="0" width="1920" height="1080" fill="url(#videoGrad)" opacity="0.3">
        <animate attributeName="opacity" values="0.2;0.4;0.2" dur="3s" repeatCount="indefinite"/>
      </rect>
      
      <!-- Play Button Center -->
      <g transform="translate(960, 540)" filter="url(#videoGlow)">
        <circle r="80" fill="#6366F1" opacity="0.9">
          <animate attributeName="r" values="75;85;75" dur="2s" repeatCount="indefinite"/>
        </circle>
        <polygon points="0,-30 40,0 0,30" fill="#ffffff" transform="translate(10, 0)"/>
      </g>
      
      <!-- Scene Count Badge -->
      <rect x="50" y="50" width="200" height="60" rx="30" fill="#000" opacity="0.8"/>
      <text x="150" y="88" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" font-weight="600" fill="#ffffff">
        ${totalScenes} Scenes
      </text>
      
      <!-- Duration Badge -->
      <rect x="1670" y="50" width="200" height="60" rx="30" fill="#000" opacity="0.8"/>
      <text x="1770" y="88" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" font-weight="600" fill="#ffffff">
        ${storyboard.duration}
      </text>
      
      <!-- Title -->
      <rect x="560" y="900" width="800" height="120" rx="10" fill="#000" opacity="0.9"/>
      <text x="960" y="955" text-anchor="middle" font-family="Inter, sans-serif" font-size="36" font-weight="700" fill="#ffffff">
        ${escapeXml(storyboard.title || 'Video Preview')}
      </text>
      <text x="960" y="995" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" fill="#ffffff" opacity="0.7">
        ${escapeXml(product || 'Campaign Video')}
      </text>
      
      <!-- Progress Bar Animation -->
      <rect x="460" y="1030" width="1000" height="8" rx="4" fill="#ffffff" opacity="0.2"/>
      <rect x="460" y="1030" width="0" height="8" rx="4" fill="#6366F1">
        <animate attributeName="width" from="0" to="1000" dur="10s" repeatCount="indefinite"/>
      </rect>
    </svg>
  `.trim();
}

function generateVideoFrame(scene, index, product, industry) {
  const sceneColors = [
    { bg: '#1a1a2e', primary: '#6366F1', secondary: '#8B5CF6' },
    { bg: '#16213e', primary: '#3B82F6', secondary: '#06B6D4' },
    { bg: '#0f3460', primary: '#8B5CF6', secondary: '#EC4899' },
    { bg: '#1c1c1c', primary: '#10B981', secondary: '#14B8A6' },
    { bg: '#2d1b00', primary: '#F59E0B', secondary: '#EF4444' }
  ];
  
  const colors = sceneColors[index % sceneColors.length];
  
  // Create a video frame for this scene
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" style="background: ${colors.bg};">
      <defs>
        <linearGradient id="frameGrad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.6" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:0.6" />
        </linearGradient>
        <filter id="frameShadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.4"/>
        </filter>
      </defs>
      
      <!-- Background Gradient -->
      <rect width="1920" height="1080" fill="url(#frameGrad${index})"/>
      
      <!-- Scene Number Badge -->
      <circle cx="100" cy="100" r="50" fill="${colors.primary}" filter="url(#frameShadow)"/>
      <text x="100" y="115" text-anchor="middle" font-family="Inter, sans-serif" font-size="36" font-weight="700" fill="#ffffff">
        ${scene.scene_number}
      </text>
      
      <!-- Visual Description Area -->
      ${generateSceneVisuals(scene, colors)}
      
      <!-- On-Screen Text -->
      ${scene.on_screen_text ? `
      <rect x="360" y="850" width="1200" height="140" rx="20" fill="#000" opacity="0.85" filter="url(#frameShadow)"/>
      <text x="960" y="920" text-anchor="middle" font-family="Inter, sans-serif" font-size="44" font-weight="700" fill="#ffffff">
        ${escapeXml(truncate(scene.on_screen_text, 60))}
      </text>
      ` : ''}
      
      <!-- Voiceover Text (Subtitle Style) -->
      ${scene.voiceover ? `
      <rect x="260" y="950" width="1400" height="80" rx="10" fill="#000" opacity="0.75"/>
      <text x="960" y="1000" text-anchor="middle" font-family="Inter, sans-serif" font-size="26" fill="#ffffff" opacity="0.9">
        ${escapeXml(truncate(scene.voiceover, 120))}
      </text>
      ` : ''}
      
      <!-- Duration Badge -->
      <rect x="1770" y="50" width="100" height="50" rx="25" fill="#000" opacity="0.8"/>
      <text x="1820" y="83" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" fill="#ffffff">
        ${scene.duration}
      </text>
    </svg>
  `.trim();
}

function generateSceneVisuals(scene, colors) {
  // Generate abstract visuals based on scene description
  const description = scene.visual_description?.toLowerCase() || '';
  
  // Detect scene themes and generate appropriate visuals
  if (description.includes('product') || description.includes('showcase')) {
    return `
      <!-- Product Showcase -->
      <rect x="660" y="340" width="600" height="400" rx="30" fill="#ffffff" opacity="0.1" filter="url(#frameShadow)"/>
      <rect x="710" y="390" width="500" height="300" rx="20" fill="${colors.primary}" opacity="0.3"/>
      <circle cx="960" cy="540" r="80" fill="${colors.secondary}" opacity="0.6"/>
    `;
  } else if (description.includes('action') || description.includes('dynamic')) {
    return `
      <!-- Dynamic Action -->
      <polygon points="600,400 800,300 1000,450 900,600" fill="${colors.primary}" opacity="0.4" filter="url(#frameShadow)"/>
      <polygon points="900,350 1150,400 1000,600 850,550" fill="${colors.secondary}" opacity="0.4" filter="url(#frameShadow)"/>
      <circle cx="960" cy="480" r="120" fill="#ffffff" opacity="0.15"/>
    `;
  } else if (description.includes('text') || description.includes('message')) {
    return `
      <!-- Text Focus -->
      <rect x="460" y="340" width="1000" height="400" rx="20" fill="#000" opacity="0.3" filter="url(#frameShadow)"/>
      <rect x="560" y="420" width="800" height="60" rx="10" fill="${colors.primary}" opacity="0.5"/>
      <rect x="560" y="520" width="600" height="60" rx="10" fill="${colors.secondary}" opacity="0.4"/>
      <rect x="560" y="620" width="700" height="60" rx="10" fill="${colors.primary}" opacity="0.3"/>
    `;
  } else {
    return `
      <!-- Generic Scene -->
      <rect x="560" y="290" width="800" height="500" rx="25" fill="${colors.primary}" opacity="0.2" filter="url(#frameShadow)"/>
      <circle cx="700" cy="450" r="100" fill="${colors.secondary}" opacity="0.4"/>
      <circle cx="1220" cy="600" r="120" fill="${colors.primary}" opacity="0.3"/>
      <rect x="750" y="400" width="400" height="300" rx="15" fill="#ffffff" opacity="0.1"/>
    `;
  }
}

function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(text, maxLength) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
